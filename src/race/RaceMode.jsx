import { useState, useEffect, useRef } from "react";
import "./RaceMode.css";
import CarSelection from "./CarSelection";
import TrackSelection from "./TrackSelection";
import RaceGame from "./RaceGame";
import LapSelectionModal from "./LapSelectionModel";
import closeClickFile from "../assets/sounds/close-click.wav";
import popSoundFile from "../assets/sounds/popup.wav";

export default function RaceMode({ cars, onClose }) {
  const [selectedP1, setSelectedP1] = useState(null);
  const [selectedP2, setSelectedP2] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [stage, setStage] = useState("cars");
  const [showLapSelection, setShowLapSelection] = useState(false);
  const [totalLaps, setTotalLaps] = useState(3);
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const closeSoundRef = useRef(null);
  const popSoundRef = useRef(null);

  useEffect(() => {
    closeSoundRef.current = new Audio(closeClickFile);
    popSoundRef.current = new Audio(popSoundFile);
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
  const playPopSound = () => {
    if (!popSoundRef.current) return;
    popSoundRef.current.pause();
    popSoundRef.current.currentTime = 0;
    popSoundRef.current.volume = 0.8;
    popSoundRef.current.play().catch((err) => {
      console.log(err);
    });
  };
  return (
    <div className="race-overlay">
      <div className="race-modal">
        {stage === "tracks" && !showLapSelection && (
          <button
            className="race-back-btn"
            onClick={() => {
              playCloseSound();
              setStage("cars");
            }}
          >
            ←
          </button>
        )}
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
        {stage !== "race" && <h1>🏎 F1 Race Mode</h1>}
        {stage === "cars" && (
          <>
            <CarSelection
              cars={cars}
              selectedP1={selectedP1}
              selectedP2={selectedP2}
              setSelectedP1={setSelectedP1}
              setSelectedP2={setSelectedP2}
              setPlayer1Name={setPlayer1Name}
              setPlayer2Name={setPlayer2Name}
            />
            {selectedP1 && selectedP2 && (
              <button
                className="continue-btn"
                onClick={() => {
                  playPopSound();

                  setTimeout(() => {
                    setStage("tracks");
                  }, 120);
                }}
              >
                CONTINUE TO TRACK SELECTION →
              </button>
            )}
          </>
        )}
        {stage === "tracks" && (
          <TrackSelection
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            setShowLapSelection={setShowLapSelection}
          />
        )}
        {showLapSelection && (
          <LapSelectionModal
            onClose={() => setShowLapSelection(false)}
            onStartRace={(laps) => {
              playPopSound();
              setTimeout(() => {
                setTotalLaps(laps);
                setShowLapSelection(false);
                setStage("race");
              }, 120);
            }}
          />
        )}
        {stage === "race" && (
          <RaceGame
            player1Car={selectedP1}
            player2Car={selectedP2}
            player1Name={player1Name}
            player2Name={player2Name}
            totalLaps={totalLaps}
            selectedTrack={selectedTrack}
            onQuit={() => {
              setStage("cars");
              setShowLapSelection(false);
            }}
          />
        )}
      </div>
    </div>
  );
}