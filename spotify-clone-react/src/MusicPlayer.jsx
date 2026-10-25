
import { useRef, useState } from "react";

// Import MP3 files from the project's music folder
import song52 from "../music/52 Bars.mp3";
import songMexico from "../music/Mexico Full Song.mp3";

const songs = [
  {
    title: "52 Bars",
    artist: "Punjabi Music",
    src: song52,
  },
  {
    title: "Mexico Full Song",
    artist: "Punjabi Music",
    src: songMexico,
  },
];

export default function MusicPlayer() {
  const audioRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentSong = songs[currentIndex];

  async function playSong(index) {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (index !== currentIndex) {
        setCurrentIndex(index);
        setCurrentTime(0);
        setDuration(0);

        audio.src = songs[index].src;
        audio.load();
      } else if (!audio.src || audio.getAttribute("src") === null) {
        audio.src = songs[index].src;
        audio.load();
      }

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
    }
  }

  async function togglePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await playSong(currentIndex);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  function changeSong(direction) {
    const nextIndex =
      (currentIndex + direction + songs.length) % songs.length;

    playSong(nextIndex);
  }

  function handleSongEnd() {
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(nextIndex);
  }

  function formatTime(time) {
    if (!Number.isFinite(time) || time < 0) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function seekSong(event) {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    audio.currentTime = Number(event.target.value);
    setCurrentTime(audio.currentTime);
  }

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={currentSong.src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onDurationChange={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onEnded={handleSongEnd}
        onError={() => {
          console.error("Unable to load audio:", currentSong.src);
          setIsPlaying(false);
        }}
      />

      <div className="track-info">
        <strong>{currentSong.title}</strong>
        <span>{currentSong.artist}</span>
      </div>

      <div className="player-controls">
        <button onClick={() => changeSong(-1)} aria-label="Previous song">
          ⏮
        </button>

        <button
          onClick={togglePlayPause}
          className="play-button"
          aria-label={isPlaying ? "Pause song" : "Play song"}
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <button onClick={() => changeSong(1)} aria-label="Next song">
          ⏭
        </button>
      </div>

      <div className="progress-container">
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={seekSong}
          aria-label="Song progress"
        />

        <span>{formatTime(duration)}</span>
      </div>

      <div className="track-list">
        {songs.map((song, index) => (
          <button
            key={song.src}
            onClick={() => playSong(index)}
            className={index === currentIndex ? "active-track" : ""}
          >
            {index === currentIndex && isPlaying ? "⏸" : "▶"}{" "}
            {song.title}
          </button>
        ))}
      </div>
    </div>
  );
}
