"use client";

import { useState } from "react";
import ScaleSlider from "./ScaleSlider";
import { SCALES, neutralValues } from "@/data/scales";

export default function RatingForm({ initialValues, onSave, onDone }) {
  const [values, setValues] = useState(initialValues ?? neutralValues());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(values);
      onDone(true);
    } catch (err) {
      setError(err.message || "Speichern fehlgeschlagen.");
      setSaving(false);
    }
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
      {error && <p className="error form-error" role="alert">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn btn--lime btn--big" disabled={saving}>
          {saving ? "Speichert …" : "Bewertung speichern"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => onDone(false)}>Abbrechen</button>
      </div>
    </form>
  );
}
