mod discovery;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            discovery::get_desktop_discovery_options,
            discovery::run_desktop_discovery,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
