import { useState, useEffect, useRef } from "react";
import "./CollectionModal.css";
import dragSoundFile from "../assets/sounds/drag.wav";

const SHELF_KEY = "gachaShelfPositions";
const TOTAL_ROWS = 16;
const SLOT_WIDTH = 300;
const SLOT_HEIGHT = 190;
const GAP = 12;

export default function CollectionModal({
  cars,
  onClose,
  onCarClick,
}) {
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);
  const dragRef = useRef(null);
  const dragSoundRef = useRef(null);
  const [cols, setCols] = useState(3);
  const [positions, setPositions] = useState({});
  const [dragState, setDragState] = useState(null);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 700) setCols(1);
      else if (window.innerWidth < 1050) setCols(2);
      else setCols(3);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(SHELF_KEY) || "{}"
    );

    const migratedPositions = {};

    Object.keys(saved).forEach((key) => {
      const val = saved[key];

      if (val.col !== undefined) {
        migratedPositions[key] = val;
      } else if (val.x !== undefined) {
        migratedPositions[key] = {
          col: Math.round(
            val.x / (SLOT_WIDTH + GAP)
          ),
          row: Math.round(
            val.y / (SLOT_HEIGHT + GAP)
          ),
        };
      }
    });

    setPositions(migratedPositions);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      SHELF_KEY,
      JSON.stringify(positions)
    );
  }, [positions]);

  const activeRows = Math.max(
    TOTAL_ROWS,
    Math.ceil(cars.length / cols)
  );

  const getCarPosition = (car, index) => {
    if (
      dragState &&
      dragState.name === car.name
    ) {
      return {
        x: dragState.x,
        y: dragState.y,
      };
    }

    let col;
    let row;

    if (positions[car.name]) {
      col = Math.min(
        positions[car.name].col,
        cols - 1
      );
      row = positions[car.name].row;
    } else {
      col = index % cols;
      row = Math.floor(index / cols);
    }

    return {
      x: col * (SLOT_WIDTH + GAP),
      y: row * (SLOT_HEIGHT + GAP),
    };
  };

  const startDrag = (e, car) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = car.name;
    playDragSound();

    const initialPos = getCarPosition(
      car,
      cars.indexOf(car)
    );

    setDragState({
      name: car.name,
      x: initialPos.x,
      y: initialPos.y,
    });
  };

  const handleMove = (e) => {
    if (!dragState || !gridRef.current) return;

    const rect =
      gridRef.current.getBoundingClientRect();

    let x =
      e.clientX -
      rect.left -
      SLOT_WIDTH / 2;

    let y =
      e.clientY -
      rect.top -
      SLOT_HEIGHT / 2;

    x = Math.max(
      0,
      Math.min(
        x,
        (cols - 1) * (SLOT_WIDTH + GAP)
      )
    );

    y = Math.max(
      0,
      Math.min(
        y,
        (activeRows - 1) *
          (SLOT_HEIGHT + GAP)
      )
    );

    setDragState({
      name: dragState.name,
      x,
      y,
    });
  };

  const endDrag = () => {
    if (!dragState) return;

    setPositions((prev) => {
      let col = Math.round(
        dragState.x / (SLOT_WIDTH + GAP)
      );

      let row = Math.round(
        dragState.y / (SLOT_HEIGHT + GAP)
      );

      col = Math.max(
        0,
        Math.min(col, cols - 1)
      );

      row = Math.max(
        0,
        Math.min(row, activeRows - 1)
      );

      return {
        ...prev,
        [dragState.name]: {
          col,
          row,
        },
      };
    });

    dragRef.current = null;
    setDragState(null);
  };

  useEffect(() => {
    const touchMoveHandler = (e) => {
      handleMove(e.touches[0]);
    };

    window.addEventListener(
      "mousemove",
      handleMove
    );
    window.addEventListener(
      "mouseup",
      endDrag
    );
    window.addEventListener(
      "touchmove",
      touchMoveHandler,
      { passive: false }
    );
    window.addEventListener(
      "touchend",
      endDrag
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMove
      );
      window.removeEventListener(
        "mouseup",
        endDrag
      );
      window.removeEventListener(
        "touchmove",
        touchMoveHandler
      );
      window.removeEventListener(
        "touchend",
        endDrag
      );
    };
  }, [dragState, cols]);

  return (
    <div
      className="collection-overlay"
      onClick={onClose}
    >
      <div
        className="collection-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="collection-header">
          <h2>My Collection Shelf</h2>
          <button onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          className="collection-shelf-wrapper"
          ref={wrapperRef}
        >
          <div
            className="collection-grid"
            ref={gridRef}
            style={{
              height: `${
                activeRows * SLOT_HEIGHT +
                (activeRows - 1) * GAP
              }px`,
              width: `${
                cols * SLOT_WIDTH +
                (cols - 1) * GAP
              }px`,
              gridTemplateColumns: `repeat(${cols}, ${SLOT_WIDTH}px)`,
            }}
          >
            {Array.from({
              length: activeRows * cols,
            }).map((_, index) => (
              <div
                key={index}
                className="shelf-slot"
              >
                <div className="slot-light" />
              </div>
            ))}

            {cars.length === 0 ? (
              <p className="empty-text">
                No cars collected yet
              </p>
            ) : (
              cars.map((car, index) => {
                const pos =
                  getCarPosition(
                    car,
                    index
                  );

                const isDragging =
                  dragState?.name ===
                  car.name;

                return (
                  <div
                    key={car.name}
                    className="collection-item"
                    onMouseDown={(e) =>
                      startDrag(e, car)
                    }
                    onTouchStart={(e) =>
                      startDrag(
                        e.touches[0],
                        car
                      )
                    }
                    onDoubleClick={() =>
                      onCarClick(car)
                    }
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      zIndex: isDragging
                        ? 100
                        : 20,
                      transition:
                        isDragging
                          ? "none"
                          : "left 0.3s ease-out, top 0.3s ease-out",
                    }}
                  >
                    <img
                      src={car.car}
                      alt={car.name}
                      draggable="false"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}