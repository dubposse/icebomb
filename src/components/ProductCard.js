"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import ProductImage from "./ProductImage";
import { getCategory } from "@/data/categories";

export default function ProductCard({ product, ratingCount = product.ratingCount ?? 0 }) {
  const cat = getCategory(product.category);
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 18 });
  const sy = useSpring(py, { stiffness: 220, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [9, -9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-9, 9]);

  // Nur echte Mauszeiger kippen die Karte; Werte laufen ohne React-Re-Render.
  function onMove(e) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(x - 0.5);
    py.set(y - 0.5);
    e.currentTarget.style.setProperty("--mx", `${x * 100}%`);
    e.currentTarget.style.setProperty("--my", `${y * 100}%`);
  }
  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    <div className="card-item" data-cat={product.category}>
      <motion.div
        className="tilt"
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        onPointerMove={onMove}
        onPointerLeave={reset}
      >
        <Link href={`/eis/${product.id}`} className="card">
          <div className="card__media">
            <ProductImage product={product} thumb />
            <span className="card__glare" aria-hidden="true" />
            <span className="card__tag">{cat.label}</span>
            <span className={`card__count${ratingCount === 0 ? " card__count--none" : ""}`}>
              {ratingCount === 0
                ? "Neu"
                : `${ratingCount} ${ratingCount === 1 ? "Bewertung" : "Bewertungen"}`}
            </span>
          </div>
          <div className="card__body">
            <h3>{product.name}</h3>
            <p className="card__meta">
              {product.category === "diele"
                ? `${product.shop} · ${product.city}`
                : product.brand}
            </p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
