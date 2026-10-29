"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";
import ScaleSlider from "./ScaleSlider";
import { SCALES, neutralValues } from "@/data/scales";

export default function RatingForm({ productId, initialValues, onDone }) {
  const { rateProduct, visitorId } = useStore();
  const [values, setValues] = useState(initialValues ?? neutralValues());

  function onSubmit(e) {
    e.preventDefault();
    rateProduct(productId, values);
    onDone(true);
  }

  return (
    <form className="form rating-form" onSubmit={onSubmit} aria-labelledby="rate-heading">
      <h3 id="rate-heading">{initialValues ? "Deine Bewertung ändern" : "Wie schmeckt’s?"}</h3>
      <p className="muted">Schiebe jeden Regler dorthin, wo das Eis für dich liegt. Die Mitte ist neutral.</p>
      {SCALES.map((scale, i) => (
        <ScaleSlider
          key={scale.id}
          scale={scale}
          index={i}
          value={values[i]}
          onChange={(v) => setValues((prev) => prev.map((x, j) => (j === i ? v : x)))}
        />
      ))}
      <div className="actions">
        <button type="submit" className="btn btn--lime btn--big" disabled={!visitorId}>
          Bewertung speichern
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => onDone(false)}>Abbrechen</button>
      </div>
    </form>
  );
}
