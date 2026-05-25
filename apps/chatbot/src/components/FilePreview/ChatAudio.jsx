import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";


export default function ChatAudio({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const [progress, setProgress] = useState(0);

  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const mm = Math.floor(sec / 60);
    const ss = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(formatTime(audio.duration));
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(formatTime(audio.currentTime));
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const onEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    const val = e.target.value;
    audio.currentTime = (val / 100) * audio.duration;
    setProgress(val);
  };

  return (
    <div className="chat-audio-wrapper">
      {/* PLAY BUTTON */}
      <button onClick={togglePlay} className="chat-audio-btn">
        {isPlaying ? (
          <FontAwesomeIcon icon={faPause} />
          // <i className="fa-solid fa-pause"></i>
        ) : (
          <FontAwesomeIcon icon={faPlay} className="play-icon" />
          // <i className="fa-solid fa-play play-icon"></i>
        )}
      </button>

      {/* SLIDER */}
      <div className="chat-audio-slider-wrap">
        <input
          type="range"
          value={progress}
          onChange={seek}
          className="chat-audio-slider"
        />
      </div>

      {/* TIME */}
      <div className="chat-audio-time">
        <span>{currentTime}</span>/<span>{duration}</span>
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  );
}
