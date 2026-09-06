import { useEffect, useRef } from "react";
import "./RaceMode.css";
import dragSoundFile from "../assets/sounds/drag.wav";

export default function CarSelection({
  cars,
  selectedP1,
  selectedP2,
  setSelectedP1,
  setSelectedP2,
  player1Name,
  player2Name,
  setPlayer1Name,
  setPlayer2Name,
}) {
  const dragSoundRef = useRef(null);

  useEffect(() => {
    dragSoundRef.current = new Audio(dragSoundFile);
  }, []);

  const playDragSound = () => {
    if (!dragSoundRef.current) return;
    dragSoundRef.current.pause();
    dragSoundRef.current.currentTime = 0;
    dragSoundRef.current.volume = 0.5;
    dragSoundRef.current.play().catch((err) => {
      console.log(err);
    });
  };
  return (
    <div className="car-selection-container">
      <div className="player-section">
        <h2>PLAYER 1</h2>
        <p>Controls: W A S D</p>
        <input
          type="text"
          className="player-name-input"
          placeholder="Enter Player 1 Name"
          value={player1Name}
          onChange={(e) => setPlayer1Name(e.target.value)}
          onFocus={playDragSound}
          maxLength={12}
        />
        <div className="car-grid">
          {cars.map((car) => (
            <div
              key={`p1-${car.name}`}
              className={`car-card ${
                selectedP1?.name === car.name
                  ? "selected"
                  : selectedP2?.name === car.name
                    ? "disabled"
                    : ""
              }`}
              onClick={() => {
                if (selectedP2?.name === car.name) return;
                playDragSound();
                setSelectedP1(car);
              }}
            >
              <img src={car.car} alt={car.name} />
              <span>{car.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="player-section">
        <h2>PLAYER 2</h2>
        <p>Controls: Arrow Keys</p>
        <input
          type="text"
          className="player-name-input"
          placeholder="Enter Player 2 Name"
          value={player2Name}
          onChange={(e) => setPlayer2Name(e.target.value)}
          onFocus={playDragSound}
          maxLength={12}
        />
        <div className="car-grid">
          {cars.map((car) => (
            <div
              key={`p2-${car.name}`}
              className={`car-card ${
                selectedP2?.name === car.name
                  ? "selected"
                  : selectedP1?.name === car.name
                    ? "disabled"
                    : ""
              }`}
              onClick={() => {
                if (selectedP1?.name === car.name) return;
                playDragSound();
                setSelectedP2(car);
              }}
            >
              <img src={car.car} alt={car.name} />
              <span>{car.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}