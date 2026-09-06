import { useState } from "react";
import { useEffect, useRef } from "react";
import closeClickFile from "../assets/sounds/close-click.wav";
import "./RaceMode.css";

export default function LapSelectionModal({ onClose, onStartRace }) {
  const closeSoundRef = useRef(null);

  useEffect(() => {
    closeSoundRef.current = new Audio(closeClickFile);
  }, []);

  const playCloseSound = () => {
    if (!closeSoundRef.current) return;
    closeSoundRef.current.pause();
    closeSoundRef.current.currentTime = 0;
    closeSoundRef.current.volume = 0.5;
    closeSoundRef.current.play().catch((err) => {
      console.log(err);
    });
  };
  const [customLaps, setCustomLaps] = useState("");
  const handleStart = () => {
    if (!customLaps || Number(customLaps) < 1) return;
    onStartRace(Number(customLaps));
  };
  return (
    <div className="lap-modal-overlay">
      <div className="lap-modal">
        <button
          className="race-close-btn"
          onClick={() => {
            playCloseSound();
            setTimeout(() => {
              onClose();
            }, 120);
          }}
        >
          ✕
        </button>
        <h2>Choose Race Length</h2>
        <input
          type="number"
          min="1"
          placeholder="Custom laps"
          value={customLaps}
          onChange={(e) => setCustomLaps(e.target.value)}
        />
        <button className="start-race-btn" onClick={handleStart}>
          START RACE
        </button>
      </div>
    </div>
  );
}