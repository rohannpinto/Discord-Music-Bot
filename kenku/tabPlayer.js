/*
EXPERIMENTAL: plays an arbitrary URL through Kenku FM by driving one of Kenku's
browser tabs over the Chrome DevTools Protocol.

Kenku FM's official Remote API cannot open URLs (playlists only hold local audio
files), but Kenku is an Electron app: when launched with
  "Kenku FM.exe" --remote-debugging-port=9222
its tabs become controllable via CDP. Audio from Kenku tabs is already captured
and streamed to Discord by Kenku itself, so navigating a tab to a YouTube URL
plays it through the official web player (ads and all — the TOS-compliance
story stays intact).

Requires an existing tab in Kenku FM (the tab's audio capture is wired up by
Kenku when the tab is opened; tabs created from outside are not captured).
Uses Node's global fetch + WebSocket — no dependencies.
*/

const config = require("../config.json");

const DEBUG_PORT = Number(config.kenkuDebugPort) || 9222;
const DEBUG_HOST = `http://127.0.0.1:${DEBUG_PORT}`;

class TabPlayerError extends Error {}

const NOT_IN_DEBUG_MODE =
  "Kenku FM is not reachable in debug mode. URL playback requires launching Kenku FM with " +
  `\`--remote-debugging-port=${DEBUG_PORT}\` (see kenku-debug.bat). ` +
  "You can still /play tracks from the Kenku library.";

async function listTargets() {
  let response;
  try {
    response = await fetch(`${DEBUG_HOST}/json/list`);
  } catch {
    throw new TabPlayerError(NOT_IN_DEBUG_MODE);
  }
  if (!response.ok) throw new TabPlayerError(NOT_IN_DEBUG_MODE);
  return response.json();
}

/*
Pick the Kenku browser tab to hijack. Kenku's own player UI and devtools pages
must be excluded; among real tabs prefer one already on the same site, then any
http(s) tab, then a blank tab.
*/
function chooseTab(targets, url) {
  const tabs = targets.filter(
    (t) =>
      t.type === "page" &&
      t.webSocketDebuggerUrl &&
      !/^(devtools|chrome-extension):/.test(t.url) &&
      !t.url.includes("kenku.fm") &&
      !/^file:/.test(t.url)
  );
  const site = new URL(url).hostname.replace(/^www\./, "");
  return (
    tabs.find((t) => t.url.includes(site)) ||
    tabs.find((t) => /^https?:/.test(t.url)) ||
    tabs.find((t) => t.url === "about:blank" || t.url === "") ||
    null
  );
}

/* Minimal CDP session over Node's global WebSocket. */
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();

    ws.addEventListener("open", () => {
      resolve({
        call(method, params = {}) {
          return new Promise((res, rej) => {
            const id = nextId++;
            pending.set(id, { res, rej });
            ws.send(JSON.stringify({ id, method, params }));
            setTimeout(() => {
              if (pending.delete(id)) rej(new TabPlayerError(`CDP timeout on ${method}`));
            }, 15000);
          });
        },
        close() {
          ws.close();
        },
      });
    });
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const waiter = message.id && pending.get(message.id);
      if (waiter) {
        pending.delete(message.id);
        if (message.error) waiter.rej(new TabPlayerError(message.error.message));
        else waiter.res(message.result);
      }
    });
    ws.addEventListener("error", () => reject(new TabPlayerError(NOT_IN_DEBUG_MODE)));
  });
}

async function evaluate(session, expression) {
  const { result } = await session.call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    userGesture: true, // satisfies media autoplay policies
  });
  return result ? result.value : undefined;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/*
Navigate a Kenku tab to `url` and start media playback.
Returns { title, tab } on success; throws TabPlayerError with a user-facing
message otherwise.
*/
async function playUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    throw new TabPlayerError("Only http(s) URLs can be played.");
  }
  const targets = await listTargets();
  const tab = chooseTab(targets, url);
  if (!tab) {
    throw new TabPlayerError(
      "No usable browser tab found in Kenku FM. Open a tab in Kenku FM (e.g. youtube.com) and try again — " +
        "the tab must be created inside Kenku so its audio is captured."
    );
  }

  const session = await connect(tab.webSocketDebuggerUrl);
  try {
    await session.call("Page.navigate", { url });

    // Wait for the page to load, then poke media elements until one is playing.
    let title = "";
    let playing = false;
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      await sleep(1000);
      const state = await evaluate(
        session,
        `(() => {
          const media = document.querySelector("video, audio");
          if (!media) return { status: "nomedia", title: document.title };
          if (media.paused) {
            media.play().catch(() => {});
            const button = document.querySelector(".ytp-play-button, [data-testid='control-button-playpause']");
            if (button) button.click();
            return { status: "paused", title: document.title };
          }
          return { status: "playing", title: document.title };
        })()`
      ).catch(() => null);
      if (state && state.title) title = state.title;
      if (state && state.status === "playing") {
        playing = true;
        break;
      }
    }

    return { title: title || url, confirmed: playing };
  } finally {
    session.close();
  }
}

/* True when Kenku is running with the debug port open (used for status checks). */
async function isAvailable() {
  try {
    await listTargets();
    return true;
  } catch {
    return false;
  }
}

module.exports = { playUrl, isAvailable, TabPlayerError };
