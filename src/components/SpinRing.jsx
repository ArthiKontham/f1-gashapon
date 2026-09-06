import { useState, useRef } from "react";
import "./SpinRing.css";
export default function SpinRing({ onSpinComplete, spinning }) {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const draggingRef = useRef(false);
  const startAngleRef = useRef(0);
  const ringRef = useRef(null);

  const getAngle = (clientX, clientY, element) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const startDrag = (e) => {
    if (spinning) return;
    draggingRef.current = true;
    startAngleRef.current = getAngle(
      e.clientX,
      e.clientY,
      ringRef.current
    );
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", endDrag);
  };

  const handleDrag = (e) => {
    if (!draggingRef.current || spinning) return;
    const currentAngle = getAngle(
      e.clientX,
      e.clientY,
      ringRef.current
    );

    let diff = currentAngle - startAngleRef.current;
    if (diff < 0) diff += 360;
    diff = Math.min(diff, 160);
    if (diff > rotationRef.current) {
      rotationRef.current = diff;
      setRotation(diff);
    }
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", endDrag);
    if (rotationRef.current >= 120) {
      onSpinComplete();
      setTimeout(() => {
        rotationRef.current = 0;
        setRotation(0);
      }, 500);
    }
  };
  return (
    <div
      className="spin-ring-wrapper"
      onMouseDown={startDrag}
    >
      <div
        ref={ringRef}
        className="spin-ring"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: draggingRef.current
            ? "none"
            : "transform 0.35s ease-out",
        }}
      >
        <span className="rotate-text">ROTATE</span>
      </div>
    </div>
  );
}