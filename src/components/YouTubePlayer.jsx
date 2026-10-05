import { parseYouTubeUrl } from "../../shared/youtube.mjs";
export default function YouTubePlayer({ url, title = "Course video" }) {
  if (!url) return null;
  const video = parseYouTubeUrl(url);
  return (
    <div className="video-resource">
      {video && (
        <div className="video-frame">
          <iframe
            src={video.embedUrl}
            title={title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
      <div className="video-caption">
        <span>
          {video?.playlistId
            ? "YouTube playlist · use the player menu to choose a video"
            : video
              ? "YouTube companion video"
              : "External lesson resource"}
        </span>
        <a href={video?.url || url} target="_blank" rel="noopener noreferrer">
          {video ? "Open on YouTube" : "Open resource"} ↗
        </a>
      </div>
      {video && (
        <p className="helper-text">
          Playback is provided by YouTube. If embedding is unavailable, open the
          original video. Complete the lesson after reviewing the notes and
          exercise.
        </p>
      )}
    </div>
  );
}
