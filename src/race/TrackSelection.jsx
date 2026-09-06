import "./RaceMode.css";
import monzaImg from "../assets/tracks/Monza.png";
import melbourneImg from "../assets/tracks/melbourne.jpg";
import singaporeImg from "../assets/tracks/singapore.jpg";
import miamiImg from "../assets/tracks/miami.jpg";
import britishImg from "../assets/tracks/british.jpg";
import belgianImg from "../assets/tracks/belgian.png";
import austriaImg from "../assets/tracks/austria.png";
import monacoImg from "../assets/tracks/monaco.jpg";
import hungaryImg from "../assets/tracks/hungary.jpg";
import lasvegasImg from "../assets/tracks/lasvegas.png";
import qatarImg from "../assets/tracks/qatar.jpg";
import abudhabiImg from "../assets/tracks/abudhabi.jpg";
import { useEffect, useRef, useState } from "react";
import dragSoundFile from "../assets/sounds/drag.wav";

export default function TrackSelection({
  selectedTrack,
  setSelectedTrack,
  setShowLapSelection,
}) {
  const tracks = [
    {
      id: "monza",
      name: "Monza",
      image: monzaImg,
    },
    {
      id: "melbourne",
      name: "Melbourne",
      image: melbourneImg,
    },
    {
      id: "singapore",
      name: "Singapore",
      image: singaporeImg,
    },
    {
      id: "miami",
      name: "Miami",
      image: miamiImg,
    },
    {
      id: "british",
      name: "British",
      image: britishImg,
    },
    {
      id: "belgian",
      name: "Belgian",
      image: belgianImg,
    },
    {
      id: "austria",
      name: "Austria",
      image: austriaImg,
    },
    {
      id: "monaco",
      name: "Monaco",
      image: monacoImg,
    },
    {
      id: "hungary",
      name: "Hungary",
      image: hungaryImg,
    },
    {
      id: "lasvegas",
      name: "Las Vegas",
      image: lasvegasImg,
    },
    {
      id: "qatar",
      name: "Qatar",
      image: qatarImg,
    },
    {
      id: "abudhabi",
      name: "Abu Dhabi",
      image: abudhabiImg,
    },
  ];
  const trackImages = {
    monza: monzaImg,
    melbourne: melbourneImg,
    singapore: singaporeImg,
    miami: miamiImg,
    british: britishImg,
    belgian: belgianImg,
    austria: austriaImg,
    monaco: monacoImg,
    hungary: hungaryImg,
    lasvegas: lasvegasImg,
    qatar: qatarImg,
    abudhabi: abudhabiImg,
  };
  const dragSoundRef = useRef(null);
  const [showResults, setShowResults] = useState(false);
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
  const results = JSON.parse(localStorage.getItem("raceResults")) || [];
  return (
    <div className="track-selection-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Select Track</h2>
        <button
          onClick={() => setShowResults(true)}
          style={{
            background: "#111111",
            color: "#ffffff",
            border: "3px solid #ff3b30",
            borderRadius: "14px",
            padding: "12px 28px",
            fontSize: "20px",
            fontWeight: "700",
            letterSpacing: "1px",
            cursor: "pointer",
            boxShadow: "0 0 15px rgba(255,59,48,0.45)",
          }}
        >
          🏆 RESULTS
        </button>
      </div>
      <div className="track-grid">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`track-card ${
              selectedTrack === track.id ? "selected" : ""
            }`}
            onClick={() => {
              playDragSound();
              setSelectedTrack(track.id);
              setTimeout(() => {
                setShowLapSelection(true);
              }, 100);
            }}
          >
            <div
              className="track-image"
              style={{
                backgroundImage: `url(${track.image})`,
              }}
            />
            <div className="track-info">
              <h3>{track.name}</h3>
            </div>
          </div>
        ))}
      </div>
      {showResults && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div classname="results-modal">
            <button
              onClick={() => setShowResults(false)}
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "2px solid #fbf9f9",
                background: "#111",
                color: "#f5f2f4",
                fontSize: "20px",
                ffontWeight: "bold",
                fcursor: "pointer",
                fdisplay: "flex",
                falignItems: "center",
                fjustifyContent: "center",
                ftransition: "0.2s",
              }}
            >
              ✕
            </button>
            <h2>🏆 Race Results</h2>
            {results.length === 0 ? (
              <p>No races completed yet.</p>
            ) : (
              results
                .slice()
                .reverse()
                .map((result, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      background: "#181818",
                      border: "2px solid #ff3b30",
                      borderRadius: "18px",
                      overflow: "hidden",
                      marginBottom: "20px",
                      boxShadow: "0 0 20px rgba(255,215,0,0.25)",
                    }}
                  >
                    <div
                      style={{
                        width: "180px",
                        height: "230px",
                        backgroundImage: `url(${trackImages[result.track]})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <h2
                        style={{
                          color: "#dba1a1",
                          marginBottom: "15px",
                        }}
                      >
                        {result.track.toUpperCase()}
                      </h2>
                      <div
                        style={{
                          fontSize: "20px",
                          marginBottom: "10px",
                        }}
                      >
                        <b>Winner:</b> {result.winner}
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          marginBottom: "10px",
                        }}
                      >
                        <b>Loser:</b>{" "}
                        {result.loser ||
                          (result.player1 === result.winner
                            ? result.player2
                            : result.player1)}
                      </div>
                      <div
                        style={{
                          color: "#cccccc",
                          marginTop: "10px",
                        }}
                      >
                        Date: {result.date || "N/A"}
                      </div>
                      <div
                        style={{
                          color: "#cccccc",
                        }}
                      >
                        Time: {result.time || "N/A"}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}