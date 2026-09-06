import "./EmptyMachinePopup.css";
export default function EmptyMachinePopup({
  onReset,
  onViewCollection,
  onClose,
}){
  return (
    <div className="empty-overlay">
      <div className="empty-popup">
       <button
  className="empty-close-btn"
  onClick={onClose}
>
  ✕
</button>
        <h2>🎉 You collected them all! 🎉</h2>
        <p>Your F1 gashapon collection is complete.</p>
        <button className="restart-btn" onClick={onReset}>
          wanna restart?
        </button>
      </div>
    </div>
  );
}