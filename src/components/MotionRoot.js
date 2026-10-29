"use client";

import { MotionConfig } from "motion/react";

export default function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
