// Build embed URLs from validated IDs, never from user-supplied iframe markup.
const hosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
export function parseYouTubeUrl(value) {
  try {
    const url = new URL(value);
    if (
      !hosts.has(url.hostname) ||
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    const parts = url.pathname.split("/").filter(Boolean);
    let videoId = url.hostname.endsWith("youtu.be")
      ? parts[0]
      : url.searchParams.get("v");
    if (
      ["embed", "shorts", "live"].includes(parts[0]) &&
      parts[1] !== "videoseries"
    )
      videoId = parts[1];
    const playlistId = url.searchParams.get("list");
    if (videoId && !/^[\w-]{11}$/.test(videoId)) return null;
    if (playlistId && !/^[\w-]{10,100}$/.test(playlistId)) return null;
    if (!videoId && !playlistId) return null;
    const timestamp =
      url.searchParams.get("t") || url.searchParams.get("start") || "";
    let startSeconds = 0;
    if (/^\d+$/.test(timestamp)) startSeconds = Number(timestamp);
    else {
      const match = timestamp.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
      if (match)
        startSeconds =
          Number(match[1] || 0) * 3600 +
          Number(match[2] || 0) * 60 +
          Number(match[3] || 0);
    }
    startSeconds = Math.min(startSeconds, 86400);
    const embed = new URL(
      "https://www.youtube-nocookie.com/embed/" + (videoId || "videoseries"),
    );
    if (playlistId) {
      embed.searchParams.set("list", playlistId);
      embed.searchParams.set("listType", "playlist");
    }
    if (startSeconds) embed.searchParams.set("start", String(startSeconds));
    embed.searchParams.set("rel", "0");
    const canonical = new URL(
      videoId
        ? "https://www.youtube.com/watch"
        : "https://www.youtube.com/playlist",
    );
    if (videoId) canonical.searchParams.set("v", videoId);
    if (playlistId) canonical.searchParams.set("list", playlistId);
    if (startSeconds) canonical.searchParams.set("t", String(startSeconds));
    return {
      videoId: videoId || null,
      playlistId: playlistId || null,
      startSeconds,
      embedUrl: embed.href,
      url: canonical.href,
    };
  } catch {
    return null;
  }
}
export function isYouTubeHost(value) {
  try {
    return hosts.has(new URL(value).hostname);
  } catch {
    return false;
  }
}
