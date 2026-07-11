/*
Client for the Kenku FM Remote API (Kenku FM > Settings > Remote, default port 3333).
Endpoint reference: https://github.com/owlbear-rodeo/kenku-fm (src/main/remote).
The API only plays tracks/playlists that already exist in Kenku's library, by id.
*/

const config = require("../config.json");

const DEFAULT_REMOTE = "http://127.0.0.1:3333/v1";

function baseUrl() {
  const remote = config.remote;
  if (typeof remote === "string" && remote.startsWith("http")) {
    return remote.replace(/\/$/, "");
  }
  return DEFAULT_REMOTE;
}

class KenkuError extends Error {}

async function request(method, route, body) {
  let response;
  try {
    response = await fetch(baseUrl() + route, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new KenkuError(
      "Could not reach Kenku FM. Make sure Kenku FM is running on the host computer and " +
        "'Remote' is enabled in Kenku FM's settings (default http://127.0.0.1:3333)."
    );
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new KenkuError(
      data.message || `Kenku FM returned ${response.status} for ${route}.`
    );
  }
  return data;
}

// --- Playlists ---
const getPlaylists = () => request("GET", "/playlist");
const playTrack = (id) => request("PUT", "/playlist/play", { id });
const getPlayback = () => request("GET", "/playlist/playback");
const resume = () => request("PUT", "/playlist/playback/play");
const pause = () => request("PUT", "/playlist/playback/pause");
const next = () => request("POST", "/playlist/playback/next");
const previous = () => request("POST", "/playlist/playback/previous");
const setVolume = (volume) => request("PUT", "/playlist/playback/volume", { volume });
const setMute = (mute) => request("PUT", "/playlist/playback/mute", { mute });
const seek = (to) => request("PUT", "/playlist/playback/seek", { to });
const setShuffle = (shuffle) => request("PUT", "/playlist/playback/shuffle", { shuffle });
const setRepeat = (repeat) => request("PUT", "/playlist/playback/repeat", { repeat });

// --- Soundboards ---
const getSoundboards = () => request("GET", "/soundboard");
const playSound = (id) => request("PUT", "/soundboard/play", { id });
const stopSound = (id) => request("PUT", "/soundboard/stop", { id });

/*
Fuzzy-search the Kenku library for a track or playlist by name.
Returns { id, title, type: "track" | "playlist", playlist } or null.
*/
async function findInLibrary(query) {
  const { playlists = [], tracks = {} } = await getPlaylists();
  const q = query.trim().toLowerCase();

  const candidates = [];
  for (const playlist of playlists) {
    candidates.push({
      id: playlist.id,
      title: playlist.title || "",
      type: "playlist",
      playlist: null,
    });
    for (const trackId of playlist.tracks || []) {
      const track = tracks[trackId];
      if (track) {
        candidates.push({
          id: track.id,
          title: track.title || "",
          type: "track",
          playlist: playlist.title || null,
        });
      }
    }
  }

  let best = null;
  let bestScore = 0;
  for (const candidate of candidates) {
    const title = candidate.title.toLowerCase();
    let score = 0;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 75;
    else if (title.includes(q)) score = 50;
    else {
      const words = q.split(/\s+/).filter(Boolean);
      const hits = words.filter((word) => title.includes(word)).length;
      if (hits > 0) score = (25 * hits) / words.length;
    }
    // Prefer tracks over playlists on ties so "/play song" plays the song
    if (score > bestScore || (score === bestScore && best && best.type === "playlist" && candidate.type === "track" && score > 0)) {
      best = candidate;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

module.exports = {
  KenkuError,
  getPlaylists,
  playTrack,
  getPlayback,
  resume,
  pause,
  next,
  previous,
  setVolume,
  setMute,
  seek,
  setShuffle,
  setRepeat,
  getSoundboards,
  playSound,
  stopSound,
  findInLibrary,
};
