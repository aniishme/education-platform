const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseYouTubeUrl } = require("../../shared/youtube.mjs");
test("YouTube links build safe embeds with videos, timestamps and playlists", () => {
  const short = parseYouTubeUrl("https://youtu.be/rfscVS0vtbw?t=1h2m3s");
  assert.equal(short.videoId, "rfscVS0vtbw");
  assert.equal(short.startSeconds, 3723);
  assert.equal(new URL(short.embedUrl).hostname, "www.youtube-nocookie.com");
  const playlist = parseYouTubeUrl(
    "https://www.youtube.com/playlist?list=PLC77007E23FF423C6",
  );
  assert.equal(playlist.videoId, null);
  assert.equal(
    new URL(playlist.embedUrl).searchParams.get("listType"),
    "playlist",
  );
  assert.equal(new URL(playlist.embedUrl).pathname, "/embed/videoseries");
  assert.equal(
    parseYouTubeUrl("https://www.youtube.com/shorts/rfscVS0vtbw").videoId,
    "rfscVS0vtbw",
  );
  assert.equal(
    parseYouTubeUrl(
      "https://www.youtube.com/watch?v=rfscVS0vtbw&list=PLC77007E23FF423C6",
    ).playlistId,
    "PLC77007E23FF423C6",
  );
  for (const url of [
    "javascript:alert(1)",
    "https://youtube.com.evil.test/watch?v=rfscVS0vtbw",
    "https://evil.test/embed/rfscVS0vtbw",
    "https://user:pass@youtube.com/watch?v=rfscVS0vtbw",
    "https://youtube.com/watch?v=bad",
    "https://youtube.com/playlist?list=<script>",
  ])
    assert.equal(parseYouTubeUrl(url), null);
});
