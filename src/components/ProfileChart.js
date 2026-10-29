"use client";

import { motion, useReducedMotion } from "motion/react";
import { SCALES } from "@/data/scales";

// Durchschnitt (dunkles Quadrat) und optional eigene Bewertung (pinker Kreis).
export default function ProfileChart({ average, own }) {
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 16 };

  return (
    <ul className="profile">
      {SCALES.map((scale, i) => (
        <li key={scale.id} className="profile__row">
          <div className="profile__labels">
            <span>{scale.left}</span>
            <span>{scale.right}</span>
          </div>
          <div className="profile__track">
            <motion.span
              className="profile__fill"
              initial={{ width: "50%" }}
              whileInView={{ width: `${average[i]}%` }}
              viewport={{ once: true }}
              transition={spring}
            />
            <motion.span
              className="marker marker--avg"
              initial={{ left: "50%" }}
              whileInView={{ left: `${average[i]}%` }}
              viewport={{ once: true }}
              transition={spring}
            >
              <span className="sr-only">Durchschnitt: {Math.round(average[i])} von 100</span>
            </motion.span>
            {own && (
              <motion.span
                className="marker marker--own"
                initial={{ left: "50%" }}
                animate={{ left: `${own[i]}%` }}
                transition={spring}
              >
                <span className="sr-only">Deine Bewertung: {own[i]} von 100</span>
              </motion.span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
