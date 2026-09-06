import { motion } from "framer-motion";
import { commonCars, rareCars } from "../data/cars";

const allCars = [...commonCars, ...rareCars];

export default function FloatingBoxes() {
  return (
    <>
      {allCars.slice(0, 75).map((car, i) => (
        <motion.img
          key={i}
          src={car.box}
          className="floating-box"
          animate={{
            y: [0, -10, 0],
            rotate: [-10, 5, -5],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i * 0.1,
          }}
        />
      ))}
    </>
  );
}