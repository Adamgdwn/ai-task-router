use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashSet,
    env, fs,
    io::Read,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    thread,
    time::{Duration, Instant},
};

const SCHEMA_VERSION: u8 = 1;
const COMMAND_TIMEOUT: Duration = Duration::from_secs(5);
const MAX_MODEL_COUNT: usize = 500;
const MAX_MODEL_NAMES: usize = 30;
const MAX_MODEL_NAME_LENGTH: usize = 160;
const TOOL_IDS: [&str; 4] = ["ollama", "lm-studio", "jan", "gpt4all"];

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopDiscoveryOptionsResponse {
    schema_version: u8,
    platform: String,
    options: Vec<DesktopDiscoveryOption>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopDiscoveryOption {
    tool_id: String,
    label: String,
    summary: String,
    check_kinds: Vec<String>,
    default_selected: bool,
    details_available: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopDiscoveryRequest {
    request_id: String,
    selected_tool_ids: Vec<String>,
    detail_level: Option<String>,
    include_path_details: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopDiscoveryResponse {
    schema_version: u8,
    request_id: String,
    checked_at: String,
    platform: String,
    summary: DesktopDiscoverySummary,
    results: Vec<DesktopDiscoveryToolResult>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopDiscoverySummary {
    tools_checked: usize,
    tools_detected: usize,
    models_found: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopDiscoveryToolResult {
    tool_id: String,
    label: String,
    status: String,
    detected: bool,
    model_count: usize,
    model_names: Vec<String>,
    checked_location_count: usize,
    shown_path_details: bool,
    note: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopDiscoveryError {
    schema_version: u8,
    request_id: Option<String>,
    code: String,
    message: String,
    safe_detail: Option<String>,
    retryable: bool,
}

#[derive(Debug)]
struct ValidatedDiscoveryRequest {
    request_id: String,
    selected_tool_ids: Vec<String>,
    include_model_names: bool,
}

#[derive(Debug)]
struct CommandOutput {
    success: bool,
    stdout: String,
}

#[derive(Debug, PartialEq, Eq)]
enum CommandRunError {
    NotFound,
    PermissionDenied,
    TimedOut,
    Failed,
}

#[tauri::command]
pub fn get_desktop_discovery_options(
) -> Result<DesktopDiscoveryOptionsResponse, DesktopDiscoveryError> {
    let platform = current_platform();

    if platform == "unknown" {
        return Err(discovery_error(
            None,
            "unsupported-platform",
            "This computer type is not supported for local checks yet.",
            Some("Local discovery currently supports Windows, macOS, and Linux desktop builds."),
            false,
        ));
    }

    Ok(DesktopDiscoveryOptionsResponse {
        schema_version: SCHEMA_VERSION,
        platform,
        options: TOOL_IDS
            .iter()
            .map(|tool_id| discovery_option(tool_id))
            .collect(),
    })
}

#[tauri::command]
pub fn run_desktop_discovery(
    request: DesktopDiscoveryRequest,
) -> Result<DesktopDiscoveryResponse, DesktopDiscoveryError> {
    let validated_request = validate_request(request)?;
    let platform = current_platform();

    if platform == "unknown" {
        return Err(discovery_error(
            Some(validated_request.request_id),
            "unsupported-platform",
            "This computer type is not supported for local checks yet.",
            Some("No local discovery checks were run."),
            false,
        ));
    }

    let home = home_dir();
    let results: Vec<DesktopDiscoveryToolResult> = validated_request
        .selected_tool_ids
        .iter()
        .map(|tool_id| {
            detect_tool(
                tool_id,
                home.as_deref(),
                validated_request.include_model_names,
            )
        })
        .collect();

    let summary = DesktopDiscoverySummary {
        tools_checked: results.len(),
        tools_detected: results.iter().filter(|result| result.detected).count(),
        models_found: results.iter().map(|result| result.model_count).sum(),
    };

    Ok(DesktopDiscoveryResponse {
        schema_version: SCHEMA_VERSION,
        request_id: validated_request.request_id,
        checked_at: Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true),
        platform,
        summary,
        results,
    })
}

fn validate_request(
    request: DesktopDiscoveryRequest,
) -> Result<ValidatedDiscoveryRequest, DesktopDiscoveryError> {
    let request_id = request.request_id.trim().to_string();

    if request_id.is_empty() {
        return Err(discovery_error(
            None,
            "invalid-request",
            "The local check request was missing its request ID.",
            None,
            false,
        ));
    }

    if request.include_path_details.unwrap_or(false) {
        return Err(discovery_error(
            Some(request_id),
            "invalid-request",
            "This local check cannot show file paths.",
            Some("Path details are intentionally disabled for this desktop prototype."),
            false,
        ));
    }

    let detail_level = request
        .detail_level
        .unwrap_or_else(|| "summary".to_string());
    if detail_level != "summary" && detail_level != "details" {
        return Err(discovery_error(
            Some(request_id),
            "invalid-request",
            "Choose either summary or details for the local check.",
            None,
            false,
        ));
    }

    if request.selected_tool_ids.is_empty() || request.selected_tool_ids.len() > TOOL_IDS.len() {
        return Err(discovery_error(
            Some(request_id),
            "invalid-request",
            "Choose at least one local AI tool to check.",
            None,
            false,
        ));
    }

    let allowed_tool_ids: HashSet<&str> = TOOL_IDS.into_iter().collect();
    let mut seen_tool_ids = HashSet::new();
    let mut selected_tool_ids = Vec::with_capacity(request.selected_tool_ids.len());

    for tool_id in request.selected_tool_ids {
        if !allowed_tool_ids.contains(tool_id.as_str()) {
            return Err(discovery_error(
                Some(request_id),
                "invalid-request",
                "That local AI tool is not approved for checking yet.",
                Some("Only Ollama, LM Studio, Jan, and GPT4All are allowlisted in this prototype."),
                false,
            ));
        }

        if !seen_tool_ids.insert(tool_id.clone()) {
            return Err(discovery_error(
                Some(request_id),
                "invalid-request",
                "Choose each local AI tool only once.",
                None,
                false,
            ));
        }

        selected_tool_ids.push(tool_id);
    }

    Ok(ValidatedDiscoveryRequest {
        request_id,
        selected_tool_ids,
        include_model_names: detail_level == "details",
    })
}

fn detect_tool(
    tool_id: &str,
    home: Option<&Path>,
    include_model_names: bool,
) -> DesktopDiscoveryToolResult {
    if tool_id == "ollama" {
        return detect_ollama(home, include_model_names);
    }

    detect_known_folder_tool(
        tool_id,
        &known_folder_candidates(tool_id, home),
        include_model_names,
        None,
    )
}

fn detect_ollama(home: Option<&Path>, include_model_names: bool) -> DesktopDiscoveryToolResult {
    let folder_candidates = known_folder_candidates("ollama", home);
    let folder_result = detect_known_folder_tool(
        "ollama",
        &folder_candidates,
        include_model_names,
        Some("Ollama was found from its local model folder."),
    );

    match run_fixed_command("ollama", &["list"], COMMAND_TIMEOUT) {
        Ok(command_output) if command_output.success => {
            let model_names = parse_model_names(command_output.stdout.lines().skip(1));
            let model_count = model_names.len().min(MAX_MODEL_COUNT);
            let shown_model_names = shown_model_names(model_names, include_model_names);
            let status = if model_count > 0 {
                "models-found"
            } else {
                "installed-no-models-found"
            };

            DesktopDiscoveryToolResult {
                tool_id: "ollama".to_string(),
                label: label_for_tool("ollama").to_string(),
                status: status.to_string(),
                detected: true,
                model_count,
                model_names: shown_model_names,
                checked_location_count: folder_candidates.len() + 1,
                shown_path_details: false,
                note: Some(if model_count > 0 {
                    "Ollama answered the read-only model list check.".to_string()
                } else {
                    "Ollama answered, but no local models were listed.".to_string()
                }),
            }
        }
        Ok(_) => prefer_folder_result(
            folder_result,
            "Ollama did not answer the read-only list check, but its local folder was found.",
            "Ollama did not answer the read-only list check.",
            "error",
            true,
        ),
        Err(CommandRunError::NotFound) => prefer_folder_result(
            folder_result,
            "The Ollama command was not on PATH, but its local folder was found.",
            "The Ollama command was not on PATH.",
            "not-found",
            false,
        ),
        Err(CommandRunError::PermissionDenied) => prefer_folder_result(
            folder_result,
            "The Ollama command was blocked, but its local folder was found.",
            "The Ollama command was blocked by the operating system.",
            "blocked",
            true,
        ),
        Err(CommandRunError::TimedOut) => prefer_folder_result(
            folder_result,
            "The Ollama command timed out, but its local folder was found.",
            "The Ollama command timed out before it answered.",
            "timed-out",
            true,
        ),
        Err(CommandRunError::Failed) => prefer_folder_result(
            folder_result,
            "The Ollama command could not complete, but its local folder was found.",
            "The Ollama command could not complete.",
            "error",
            true,
        ),
    }
}

fn prefer_folder_result(
    mut folder_result: DesktopDiscoveryToolResult,
    found_note: &str,
    missing_note: &str,
    missing_status: &str,
    retryable: bool,
) -> DesktopDiscoveryToolResult {
    if folder_result.detected {
        folder_result.note = Some(found_note.to_string());
        return folder_result;
    }

    folder_result.status = missing_status.to_string();
    folder_result.note = Some(missing_note.to_string());

    if retryable && folder_result.status == "blocked" {
        folder_result.status = "blocked".to_string();
    }

    folder_result
}

fn detect_known_folder_tool(
    tool_id: &str,
    candidate_paths: &[PathBuf],
    include_model_names: bool,
    found_note: Option<&str>,
) -> DesktopDiscoveryToolResult {
    let mut model_names = Vec::new();
    let found_folder_count = candidate_paths
        .iter()
        .filter(|candidate| candidate.is_dir())
        .count();

    for candidate_path in candidate_paths
        .iter()
        .filter(|candidate| candidate.is_dir())
    {
        model_names.extend(list_likely_model_names(candidate_path));
        if model_names.len() >= MAX_MODEL_COUNT {
            model_names.truncate(MAX_MODEL_COUNT);
            break;
        }
    }

    let model_count = model_names.len().min(MAX_MODEL_COUNT);
    let detected = found_folder_count > 0;
    let status = if model_count > 0 {
        "models-found"
    } else if detected {
        "folder-found"
    } else {
        "not-found"
    };

    DesktopDiscoveryToolResult {
        tool_id: tool_id.to_string(),
        label: label_for_tool(tool_id).to_string(),
        status: status.to_string(),
        detected,
        model_count,
        model_names: shown_model_names(model_names, include_model_names),
        checked_location_count: candidate_paths.len(),
        shown_path_details: false,
        note: Some(
            found_note
                .filter(|_| detected)
                .unwrap_or_else(|| {
                    if detected {
                        "Found a common local model folder. No paths are shown."
                    } else {
                        "No common local model folder was found."
                    }
                })
                .to_string(),
        ),
    }
}

fn run_fixed_command(
    executable: &str,
    args: &[&str],
    timeout: Duration,
) -> Result<CommandOutput, CommandRunError> {
    let mut child = Command::new(executable)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| match error.kind() {
            std::io::ErrorKind::NotFound => CommandRunError::NotFound,
            std::io::ErrorKind::PermissionDenied => CommandRunError::PermissionDenied,
            _ => CommandRunError::Failed,
        })?;

    let started_at = Instant::now();

    loop {
        match child.try_wait() {
            Ok(Some(status)) => {
                let mut stdout = String::new();

                if let Some(mut output) = child.stdout.take() {
                    let _ = output.read_to_string(&mut stdout);
                }

                return Ok(CommandOutput {
                    success: status.success(),
                    stdout,
                });
            }
            Ok(None) => {
                if started_at.elapsed() >= timeout {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err(CommandRunError::TimedOut);
                }

                thread::sleep(Duration::from_millis(25));
            }
            Err(_) => return Err(CommandRunError::Failed),
        }
    }
}

fn list_likely_model_names(folder_path: &Path) -> Vec<String> {
    let Ok(entries) = fs::read_dir(folder_path) else {
        return Vec::new();
    };

    entries
        .filter_map(Result::ok)
        .filter(|entry| {
            let file_name = entry.file_name();
            let file_name = file_name.to_string_lossy();

            !file_name.starts_with('.')
                && (entry
                    .file_type()
                    .map(|file_type| file_type.is_dir())
                    .unwrap_or(false)
                    || file_name.ends_with(".gguf")
                    || file_name.ends_with(".bin")
                    || file_name.ends_with(".safetensors"))
        })
        .filter_map(|entry| sanitize_model_name(&entry.file_name().to_string_lossy()))
        .take(MAX_MODEL_COUNT)
        .collect()
}

fn parse_model_names<'a>(lines: impl Iterator<Item = &'a str>) -> Vec<String> {
    lines
        .filter_map(|line| line.split_whitespace().next())
        .filter(|name| !name.eq_ignore_ascii_case("NAME"))
        .filter_map(sanitize_model_name)
        .take(MAX_MODEL_COUNT)
        .collect()
}

fn sanitize_model_name(raw_name: &str) -> Option<String> {
    let safe_name = raw_name
        .rsplit(['/', '\\'])
        .next()
        .unwrap_or(raw_name)
        .chars()
        .filter(|character| !character.is_control())
        .collect::<String>()
        .trim()
        .to_string();

    if safe_name.is_empty() {
        return None;
    }

    Some(truncate_chars(&safe_name, MAX_MODEL_NAME_LENGTH))
}

fn shown_model_names(model_names: Vec<String>, include_model_names: bool) -> Vec<String> {
    if include_model_names {
        model_names.into_iter().take(MAX_MODEL_NAMES).collect()
    } else {
        Vec::new()
    }
}

fn known_folder_candidates(tool_id: &str, home: Option<&Path>) -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    let Some(home) = home else {
        return candidates;
    };

    match tool_id {
        "ollama" => {
            candidates.push(home.join(".ollama").join("models"));
        }
        "lm-studio" => {
            candidates.push(home.join(".lmstudio").join("models"));
            candidates.push(home.join(".cache").join("lm-studio").join("models"));
            if let Some(local_app_data) = env_path("LOCALAPPDATA") {
                candidates.push(local_app_data.join("LM Studio").join("models"));
            }
        }
        "jan" => {
            candidates.push(home.join(".jan").join("models"));
            candidates.push(home.join("jan").join("models"));
            if let Some(app_data) = env_path("APPDATA") {
                candidates.push(app_data.join("Jan").join("models"));
            }
            candidates.push(
                home.join("Library")
                    .join("Application Support")
                    .join("Jan")
                    .join("models"),
            );
        }
        "gpt4all" => {
            if let Some(local_app_data) = env_path("LOCALAPPDATA") {
                candidates.push(local_app_data.join("nomic.ai").join("GPT4All"));
            }
            candidates.push(
                home.join("Library")
                    .join("Application Support")
                    .join("nomic.ai")
                    .join("GPT4All"),
            );
            candidates.push(
                home.join(".local")
                    .join("share")
                    .join("nomic.ai")
                    .join("GPT4All"),
            );
        }
        _ => {}
    }

    candidates
}

fn env_path(name: &str) -> Option<PathBuf> {
    env::var_os(name).map(PathBuf::from)
}

fn home_dir() -> Option<PathBuf> {
    env_path("USERPROFILE").or_else(|| env_path("HOME"))
}

fn current_platform() -> String {
    if cfg!(target_os = "windows") {
        "windows".to_string()
    } else if cfg!(target_os = "macos") {
        "macos".to_string()
    } else if cfg!(target_os = "linux") {
        "linux".to_string()
    } else {
        "unknown".to_string()
    }
}

fn discovery_option(tool_id: &str) -> DesktopDiscoveryOption {
    DesktopDiscoveryOption {
        tool_id: tool_id.to_string(),
        label: label_for_tool(tool_id).to_string(),
        summary: summary_for_tool(tool_id).to_string(),
        check_kinds: check_kinds_for_tool(tool_id)
            .iter()
            .map(|check_kind| check_kind.to_string())
            .collect(),
        default_selected: true,
        details_available: true,
    }
}

fn label_for_tool(tool_id: &str) -> &'static str {
    match tool_id {
        "ollama" => "Ollama",
        "lm-studio" => "LM Studio",
        "jan" => "Jan",
        "gpt4all" => "GPT4All",
        _ => "Local AI tool",
    }
}

fn summary_for_tool(tool_id: &str) -> &'static str {
    match tool_id {
        "ollama" => "Checks the Ollama app and its common local model folder.",
        "lm-studio" => "Checks common LM Studio model folders.",
        "jan" => "Checks common Jan model folders.",
        "gpt4all" => "Checks common GPT4All model folders.",
        _ => "Checks a known local AI tool.",
    }
}

fn check_kinds_for_tool(tool_id: &str) -> &'static [&'static str] {
    match tool_id {
        "ollama" => &["fixed-cli", "known-folder"],
        _ => &["known-folder"],
    }
}

fn discovery_error(
    request_id: Option<String>,
    code: &str,
    message: &str,
    safe_detail: Option<&str>,
    retryable: bool,
) -> DesktopDiscoveryError {
    DesktopDiscoveryError {
        schema_version: SCHEMA_VERSION,
        request_id,
        code: code.to_string(),
        message: message.to_string(),
        safe_detail: safe_detail.map(String::from),
        retryable,
    }
}

fn truncate_chars(value: &str, max_chars: usize) -> String {
    value.chars().take(max_chars).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn validates_allowlisted_unique_requests_without_path_details() {
        let valid_request = DesktopDiscoveryRequest {
            request_id: "desktop-check-1".to_string(),
            selected_tool_ids: vec!["ollama".to_string(), "lm-studio".to_string()],
            detail_level: Some("summary".to_string()),
            include_path_details: Some(false),
        };

        let validated_request = validate_request(valid_request).expect("request should validate");

        assert_eq!(
            validated_request.selected_tool_ids,
            vec!["ollama", "lm-studio"]
        );
        assert!(!validated_request.include_model_names);
    }

    #[test]
    fn rejects_duplicate_tools_and_path_details() {
        let duplicate_request = DesktopDiscoveryRequest {
            request_id: "desktop-check-2".to_string(),
            selected_tool_ids: vec!["ollama".to_string(), "ollama".to_string()],
            detail_level: Some("summary".to_string()),
            include_path_details: Some(false),
        };
        let path_details_request = DesktopDiscoveryRequest {
            request_id: "desktop-check-3".to_string(),
            selected_tool_ids: vec!["ollama".to_string()],
            detail_level: Some("summary".to_string()),
            include_path_details: Some(true),
        };

        assert_eq!(
            validate_request(duplicate_request).unwrap_err().code,
            "invalid-request"
        );
        assert_eq!(
            validate_request(path_details_request).unwrap_err().code,
            "invalid-request"
        );
    }

    #[test]
    fn known_folder_detection_hides_model_names_in_summary() {
        let root = create_temp_model_folder("summary");
        let model_folder = root.join("models");
        fs::create_dir_all(&model_folder).expect("model folder should be created");
        fs::write(model_folder.join("sample.gguf"), b"not model content")
            .expect("model file should be created");
        fs::create_dir_all(model_folder.join("nested-model"))
            .expect("model directory should be created");

        let result = detect_known_folder_tool("lm-studio", &[model_folder], false, None);

        assert!(result.detected);
        assert_eq!(result.status, "models-found");
        assert_eq!(result.model_count, 2);
        assert!(result.model_names.is_empty());
        assert!(!result.shown_path_details);

        fs::remove_dir_all(root).expect("temporary model folder should be removed");
    }

    #[test]
    fn known_folder_detection_can_show_capped_safe_model_names_without_paths() {
        let root = create_temp_model_folder("details");
        let model_folder = root.join("models");
        fs::create_dir_all(&model_folder).expect("model folder should be created");
        fs::write(model_folder.join("sample.gguf"), b"not model content")
            .expect("model file should be created");
        fs::write(model_folder.join("notes.txt"), b"ignored")
            .expect("ignored file should be created");

        let result = detect_known_folder_tool("gpt4all", &[model_folder], true, None);
        let root_text = root.to_string_lossy();

        assert_eq!(result.model_names, vec!["sample.gguf"]);
        assert!(!result
            .model_names
            .iter()
            .any(|model_name| model_name.contains(root_text.as_ref())));
        assert!(!result.shown_path_details);

        fs::remove_dir_all(root).expect("temporary model folder should be removed");
    }

    fn create_temp_model_folder(label: &str) -> PathBuf {
        let unique_suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be after unix epoch")
            .as_nanos();

        env::temp_dir().join(format!("ai-task-router-{}-{}", label, unique_suffix))
    }
}
