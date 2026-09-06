import "./OutputTray.css";

export default function OutputTray({ prizes, onPrizeClick }) {
  return (
    <div className="output-tray">
      <div className="tray-slot">
        {prizes.map((car, index) => {
          const positions = [
            { left: 8, top: 28, rotate: -12 },
            { left: 40, top: 18, rotate: 10 },
            { left: 78, top: 30, rotate: -8 },
            { left: 22, top: 48, rotate: 14 },
            { left: 62, top: 52, rotate: -10 },
            { left: 100, top: 42, rotate: 8 },
            { left: 15, top: 12, rotate: -6 },
            { left: 88, top: 10, rotate: 12 },
          ];

          const pos = positions[index % positions.length];

          return (
            <img
              key={`${car.name}-${index}`}
              src={car.box}
              alt={car.name}
              className="tray-box"
              onClick={() => onPrizeClick(car)}
              style={{
                left: `${pos.left}px`,
                top: `${pos.top}px`,
                transform: `rotate(${pos.rotate}deg)`,
                zIndex: index,
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}