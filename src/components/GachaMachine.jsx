import { useEffect, useRef, useState, useMemo } from "react";
import Matter from "matter-js";
import confetti from "canvas-confetti";
import { commonCars, rareCars } from "../data/cars";
import SpinRing from "./SpinRing";
import PrizePopup from "./PrizePopup";
import OutputTray from "./OutputTray";
import CollectionButton from "./CollectionButton";
import CollectionModal from "./CollectionModal";
import EmptyMachinePopup from "./EmptyMachinePopup";
import RaceMode from "../race/RaceMode";

import spinRingSoundFile from "../assets/sounds/spin-ring.mp3";
import trayDropSoundFile from "../assets/sounds/tray-drop.mp3";
import popupSoundFile from "../assets/sounds/popup.wav";
import collectionClickSoundFile from "../assets/sounds/collection-click.wav";
import closeClickSoundFile from "../assets/sounds/close-click.wav";

import "./GachaMachine.css";

const { Engine, World, Bodies, Runner, Body } = Matter;

export default function GachaMachine() {
  const allCars = useMemo(() => [...commonCars, ...rareCars], []);
  const [loaded, setLoaded] = useState(false);

  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const wrapperRef = useRef(null);

  const spinRingSound = useRef(null);
  const trayDropSound = useRef(null);
  const popupSound = useRef(null);
  const collectionClickSound = useRef(null);
  const closeClickSound = useRef(null);

  const [renderCars, setRenderCars] = useState([]);
  const [droppedCars, setDroppedCars] = useState([]);
  const [collectionCars, setCollectionCars] = useState([]);
  const [popupPrizes, setPopupPrizes] = useState([]);
  const [fallingPrizes, setFallingPrizes] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showRaceMode, setShowRaceMode] = useState(false);
  const [showEmptyPopup, setShowEmptyPopup] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    spinRingSound.current = new Audio(spinRingSoundFile);
    trayDropSound.current = new Audio(trayDropSoundFile);
    popupSound.current = new Audio(popupSoundFile);
    collectionClickSound.current = new Audio(collectionClickSoundFile);
    closeClickSound.current = new Audio(closeClickSoundFile);
  }, []);

  const playSound = (soundRef, volume = 1) => {
    if (!soundRef.current) return;

    soundRef.current.pause();
    soundRef.current.currentTime = 0;
    soundRef.current.volume = volume;

    soundRef.current.play().catch((err) => {
      console.log(err);
    });
  };

  const getCarsFromNames = (names) =>
    names
      .map((name) => allCars.find((car) => car.name === name))
      .filter(Boolean);

  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return;

      const { clientWidth, clientHeight } = wrapperRef.current;

      const BASE_WIDTH = 560;
      const BASE_HEIGHT = 820;

      const scaleW = clientWidth / BASE_WIDTH;
      const scaleH = clientHeight / BASE_HEIGHT;

      setScale(Math.min(scaleW, scaleH, 1));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedCollectionNames = JSON.parse(
      localStorage.getItem("gachaCollectionNames") || "[]"
    );

    const savedTrayNames = JSON.parse(
      localStorage.getItem("gachaTrayNames") || "[]"
    );

    const savedMachineNames = JSON.parse(
      localStorage.getItem("gachaMachineNames") || "null"
    );

    const savedCollection = Array.isArray(savedCollectionNames)
      ? getCarsFromNames(savedCollectionNames)
      : [];

    const savedTray = Array.isArray(savedTrayNames)
      ? getCarsFromNames(savedTrayNames)
      : [];

    let remainingCars;

    if (Array.isArray(savedMachineNames)) {
      remainingCars = getCarsFromNames(savedMachineNames);
    } else {
      const collectedNames = new Set([
        ...savedCollection.map((c) => c.name),
        ...savedTray.map((c) => c.name),
      ]);

      remainingCars = allCars.filter(
        (car) => !collectedNames.has(car.name)
      );
    }

    setCollectionCars(savedCollection);
    setDroppedCars(savedTray);
    setLoaded(true);

    const width = 430;
    const height = 520;

    const engine = Engine.create({
      enableSleeping: true,
    });

    engine.gravity.x = 0;
    engine.gravity.y = 0.8;
    engineRef.current = engine;

    const floor = Bodies.rectangle(width / 2, height - 12, width, 40, {
      isStatic: true,
    });

    const leftWall = Bodies.rectangle(-10, height / 2, 40, height, {
      isStatic: true,
    });

    const rightWall = Bodies.rectangle(width + 50, height / 2, 40, height, {
      isStatic: true,
    });

    const ceiling = Bodies.rectangle(width / 2, -10, width, 40, {
      isStatic: true,
    });

    World.add(engine.world, [floor, leftWall, rightWall, ceiling]);

    const productBodies = remainingCars.map((car, index) => {
      const body = Bodies.rectangle(
        80 + (index % 6) * 55,
        40 + Math.floor(index / 6) * 45,
        80,
        40,
        {
          restitution: 0.02,
          friction: 0.95,
          frictionAir: 0.012,
          sleepThreshold: 60,
        }
      );

      body.carData = car;
      return body;
    });

    bodiesRef.current = productBodies;
    World.add(engine.world, productBodies);

    const runner = Runner.create();
    Runner.run(runner, engine);

    let animationFrame;

    const sync = () => {
      setRenderCars(
        bodiesRef.current.map((body) => ({
          id: body.id,
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
          car: body.carData,
        }))
      );

      animationFrame = requestAnimationFrame(sync);
    };

    sync();

    return () => {
      cancelAnimationFrame(animationFrame);
      Runner.stop(runner);
      World.clear(engine.world);
      Engine.clear(engine);
    };
  }, [allCars]);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        "gachaCollectionNames",
        JSON.stringify(collectionCars.map((car) => car.name))
      );

      localStorage.setItem(
        "gachaTrayNames",
        JSON.stringify(droppedCars.map((car) => car.name))
      );
    } catch (err) {
      console.log(err);
    }
  }, [collectionCars, droppedCars, loaded]);

  const spinMachine = () => {
    if (spinning) return;

    if (bodiesRef.current.length === 0) {
      setShowEmptyPopup(true);

      confetti({
        particleCount: 250,
        spread: 140,
        origin: { x: 0.5, y: 0.5 },
      });

      return;
    }

    playSound(spinRingSound, 0.7);
    setSpinning(true);

    bodiesRef.current.forEach((body) => {
      Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.03,
        y: (Math.random() - 0.5) * 0.03,
      });
    });

    const dropRoll = Math.random();
    let dropCount = 1;

    if (dropRoll > 0.95) dropCount = 3;
    else if (dropRoll > 0.7) dropCount = 2;

    const selected = [...bodiesRef.current]
      .sort(() => Math.random() - 0.5)
      .slice(0, dropCount);

    setTimeout(() => {
      playSound(trayDropSound, 0.8);

      selected.forEach((body) => {
        World.remove(engineRef.current.world, body);
      });

      bodiesRef.current = bodiesRef.current.filter(
        (b) => !selected.includes(b)
      );

      localStorage.setItem(
        "gachaMachineNames",
        JSON.stringify(
          bodiesRef.current.map((body) => body.carData.name)
        )
      );

      setFallingPrizes(
        selected.map((body) => ({
          car: body.carData,
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
        }))
      );

      setTimeout(() => {
        const prizes = selected.map((b) => b.carData);

        setDroppedCars((prev) => [...prev, ...prizes]);
        setFallingPrizes([]);
        setSpinning(false);
      }, 900);
    }, 2200);
  };

  const handleTrayClick = (clickedCar) => {
    playSound(popupSound, 0.8);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { x: 0.5, y: 0.7 },
    });

    setDroppedCars((prev) => {
      const index = prev.findIndex(
        (car) => car.name === clickedCar.name
      );

      if (index === -1) return prev;

      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    setCollectionCars((prev) => [...prev, clickedCar]);
    setPopupPrizes([clickedCar]);
  };

  const handleCollectionClick = (car) => {
    setPopupPrizes([car]);
  };

  const openCollection = () => {
    playSound(collectionClickSound, 0.7);
    setShowCollection(true);
  };

  const openRaceMode = () => {
    playSound(collectionClickSound, 0.7);
    setShowRaceMode(true);
  };

  const resetGame = () => {
    localStorage.removeItem("gachaCollectionNames");
    localStorage.removeItem("gachaTrayNames");
    localStorage.removeItem("gachaMachineNames");
    window.location.reload();
  };

  return (
    <>
      <div className="machine-wrapper" ref={wrapperRef}>
        <div className="top-buttons">
          <button
            className="race-mode-btn"
            onClick={openRaceMode}
          >
            🏎Race Mode
          </button>
          <CollectionButton onClick={openCollection} />
        </div>

        <div
          className="machine"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="glass">
            <div className="box-area">
              {renderCars.map((item) => (
                <img
                  key={item.id}
                  src={item.car.box}
                  alt={item.car.name}
                  className="mini-box"
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    transform: `translate(-50%, -50%) rotate(${item.angle}rad)`,
                  }}
                />
              ))}

              {fallingPrizes.map((prize, index) => (
                <img
                  key={index}
                  src={prize.car.box}
                  alt={prize.car.name}
                  className="falling-prize"
                  style={{
                    left: `${prize.x}px`,
                    top: `${prize.y}px`,
                    transform: `translate(-50%, -50%) rotate(${prize.angle}rad)`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="bottom-section">
            <SpinRing
              onSpinComplete={spinMachine}
              spinning={spinning}
            />
            <OutputTray
              prizes={droppedCars}
              onPrizeClick={handleTrayClick}
            />
          </div>
        </div>
      </div>

      {popupPrizes.length > 0 && (
        <PrizePopup
          prize={popupPrizes}
          onClose={() => setPopupPrizes([])}
        />
      )}
{showCollection && (
  <CollectionModal
    cars={collectionCars}
    onClose={() => {
      playSound(closeClickSound, 0.7);
      setShowCollection(false);
    }}
    onCarClick={handleCollectionClick}
  />
)}

{showRaceMode && (
  <RaceMode
    cars={collectionCars}
    onClose={() => setShowRaceMode(false)}
  />
)}

{showEmptyPopup && (
  <EmptyMachinePopup
    onReset={resetGame}
    onClose={() => {
      playSound(closeClickSound, 0.7);

      setTimeout(() => {
        window.location.reload();
      }, 180);
    }}
    onViewCollection={() => {
      setShowEmptyPopup(false);
      openCollection();
    }}
  />
)}
    </>
  );
}