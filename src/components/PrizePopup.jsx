import "./PrizePopup.css";

export default function PrizePopup({ prize, onClose }) {
  if (!prize || prize.length === 0) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h2>You Won!</h2>

        <div className="popup-prizes">
          {prize.map((car) => (
            <div key={car.id} className="popup-item">
              <img src={car.car || car.box} alt={car.name} />
              <p>{car.name}</p>
            </div>
          ))}
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}