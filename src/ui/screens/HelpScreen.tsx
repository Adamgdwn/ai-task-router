import { ScreenHeader } from "./SetupScreens";
import type { ScreenDefinition } from "./screenDefinitions";

/**
 * The one screen a confused user clicks. It has to answer the questions the rest of the app
 * assumes are already settled: what this is, what it will never do, what the three routes mean,
 * what the dollar and energy figures are, and where the saved records live.
 *
 * Deliberately a single static page. No search, no linked reference pages, no version-gate
 * diagrams - those were the placeholder's promise, and promising them again is the same defect.
 */
export function HelpScreen({ definition }: { definition: ScreenDefinition }) {
  return (
    <article className="screenPanel">
      <ScreenHeader definition={definition} />

      <p className="setupBoundaryNote">
        This app recommends; you decide and you do the work. It never sends your task anywhere, so nothing here can
        happen without you copying it into a tool yourself.
      </p>

      <section className="plainPromise" aria-labelledby="help-what-heading">
        <h3 id="help-what-heading">What this app does</h3>
        <ul>
          <li>Takes the job you describe and breaks it into stages.</li>
          <li>Suggests how much AI help each stage actually needs, from none at all up to the strongest option.</li>
          <li>Shows what each way of working would cost and roughly what energy it would use, so the comparison is concrete.</li>
          <li>Gives you a Decision Card and copy-ready prompts to carry into the AI tools you already have.</li>
          <li>Builds the habit of asking whether a smaller route would have been enough.</li>
        </ul>
      </section>

      <section className="plainPromise" aria-labelledby="help-never-heading">
        <h3 id="help-never-heading">What it will never do</h3>
        <ul>
          <li>Sign in to an AI provider, connect an account, or check whether you really have a paid plan.</li>
          <li>Call an AI model, send your prompts, or run the task for you.</li>
          <li>Read, scan, or upload your files.</li>
          <li>Fetch live prices or live model lists. Every number here comes from reviewed figures stored in the app.</li>
          <li>Track you. There are no analytics, no telemetry, and no tracking cookies.</li>
        </ul>
      </section>

      <section className="plainPromise" aria-labelledby="help-routes-heading">
        <h3 id="help-routes-heading">What the three routes mean</h3>
        <ul>
          <li>
            <strong>Lean route</strong> - start small. The smallest helper that can plausibly do the job, leaning on
            your own review for anything risky. It costs the least energy and money, and it costs you the most time.
          </li>
          <li>
            <strong>Balanced route</strong> - an everyday AI helper for a clearer first draft, without jumping to the
            heaviest option.
          </li>
          <li>
            <strong>Premium route</strong> - the strongest helper you have, for work where uncertainty, quality, or the
            cost of redoing it matters.
          </li>
        </ul>
        <p>
          A route can be unavailable. If your task is too sensitive for the tools you saved, or you have not saved a
          tool strong enough for a stage, the app says so instead of recommending something it has ruled out. The
          Recommendation audit on the Best Options screen shows which check removed it.
        </p>
      </section>

      <section className="plainPromise" aria-labelledby="help-styles-heading">
        <h3 id="help-styles-heading">What "How To Choose" changes</h3>
        <ul>
          <li>
            <strong>Lower energy and cost</strong> - prefer the simplest good-enough option and expect to spend more of
            your own time checking the result.
          </li>
          <li>
            <strong>Balanced for everyday work</strong> - weigh quality, speed, caution, and effort against each other
            for normal work.
          </li>
          <li>
            <strong>Best quality when it matters</strong> - use stronger help and more review when mistakes would be
            expensive.
          </li>
        </ul>
        <p>
          The style does not pick the route for you. All three routes are still shown; the style decides which one is
          recommended first.
        </p>
      </section>

      <section className="plainPromise" aria-labelledby="help-numbers-heading">
        <h3 id="help-numbers-heading">What the numbers mean</h3>
        <ul>
          <li>
            <strong>If you paid per token</strong> - what the same steps would come to if every one of them were metered
            at public API list prices, including steps a plan you already pay for would cover. Each step is priced
            against the model that step tells you to open, so a thinking pass and a fast execution pass are not charged
            alike. This is not your bill and not money you saved. It exists because a monthly subscription hides the
            cost of the choice you just made.
          </li>
          <li>
            <strong>Added to your bill</strong> - the narrower figure: only what a metered account would actually charge
            you. A flat monthly plan or a free tier is already paid for, so it adds nothing here.
          </li>
          <li>
            <strong>Estimated energy</strong> - a per-use compute-energy estimate built from representative public
            inference figures, with a small nonzero floor for manual and local work, because real device use is not
            zero. It is an order-of-magnitude comparison between routes, not a measurement of your run.
          </li>
          <li>
            <strong>Followed choices</strong> - how many recommendations you accepted or edited on this device, with
            their totals. It counts what you told the app you followed; it cannot see what you actually did.
          </li>
        </ul>
        <p>
          Every figure is an estimate. Taxes, caching, free tiers, search add-ons, provider limits, retries, and how
          long your prompt really is all move the real number.
        </p>
      </section>

      <section className="plainPromise" aria-labelledby="help-storage-heading">
        <h3 id="help-storage-heading">Where your data lives</h3>
        <ul>
          <li>Your tools, choosing style, saved plans, ratings, and Past Choices are stored in this browser, on this device.</li>
          <li>Nothing is uploaded, and there is no account to sign in to.</li>
          <li>Another browser, another device, or a private window will not see any of it.</li>
          <li>Clearing your site data deletes it, and there is no copy anywhere else. Export a Decision Card first if you want to keep it.</li>
        </ul>
      </section>

      <section className="plainPromise" aria-labelledby="help-stuck-heading">
        <h3 id="help-stuck-heading">If something looks wrong</h3>
        <ul>
          <li>
            No options at all usually means no tool is saved yet, or every route was ruled out as too sensitive for the
            tools you saved. Add a tool in My AI Tools, or say less about the sensitive material in the task.
          </li>
          <li>
            A premium route marked as a comparison benchmark means you have not saved a premium-capacity tool. It is
            shown so you can see what you would be trading, not as something you can run today.
          </li>
          <li>
            A model or price that looks out of date probably is. Nothing here is fetched live, and the catalog is
            refreshed by hand in a deliberate review pass.
          </li>
        </ul>
      </section>
    </article>
  );
}
