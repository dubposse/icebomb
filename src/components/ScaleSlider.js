"use client";

import { useEffect, useId } from "react";
import { motion, useSpring, useTransform } from "motion/react";

// Farbpaare je Skala (Reihenfolge entspricht SCALES).
const PALETTE = [
  ["#7a3cff", "#8fe000"],
  ["#ffd400", "#ff2e93"],
  ["#ff6a00", "#00b8ff"],
  ["#00b8ff", "#7a3cff"],
  ["#ff2e93", "#ff9a00"],
  ["#ff2e93", "#00c8e6"],
  ["#4aa8ff", "#ffb300"],
  ["#7c7a8c", "#ff2e93"],
  ["#ff3b30", "#8fe000"],
];

export default function ScaleSlider({ scale, value, onChange, index = 0 }) {
  const id = useId();
  const [left, right] = PALETTE[index % PALETTE.length];

  const spring = useSpring(value, { stiffness: 380, damping: 24 });
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const orbLeft = useTransform(spring, (v) => `calc(16px + (100% - 32px) * ${v / 100})`);
  const rotate = useTransform(spring, (v) => (v - 50) * 3.2);
  const size = useTransform(spring, (v) => 0.85 + (Math.abs(v - 50) / 50) * 0.9);
  const radius = useTransform(spring, [0, 50, 100], ["10%", "50%", "10%"]);

  return (
    <div
      className="scale"
      style={{
        "--p": value / 100,
        "--l": left,
        "--r": right,
        "--c": `color-mix(in oklch, ${left}, ${right} ${value}%)`,
      }}
    >
      <label htmlFor={id} className="scale__labels">
        <span className="scale__l">{scale.left}</span>
        <span className="scale__r">{scale.right}</span>
      </label>
      <div className="scale__field">
        <div className="scale__track" />
        <motion.span
          className="scale__orb"
          aria-hidden="true"
          style={{ left: orbLeft, rotate, scale: size, borderRadius: radius, x: "-50%", y: "-50%" }}
        />
        <input
          id={id}
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={
            value === 50
              ? `Neutral zwischen ${scale.left} und ${scale.right}`
              : `Eher ${value < 50 ? scale.left : scale.right}`
          }
        />
      </div>
    </div>
  );
}
