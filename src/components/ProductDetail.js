"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import ProductImage from "./ProductImage";
import ProfileChart from "./ProfileChart";
import RatingForm from "./RatingForm";
import DetailScene, { AnimatedTitle } from "./DetailScene";
import { getCategory } from "@/data/categories";
import { isUuid } from "@/lib/validation";
import { fetchProduct, fetchRatings, saveRating } from "@/lib/api-client";

const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return { x: Math.cos(angle) * 90, y: Math.sin(angle) * 90, c: i % 3 };
});

function SavedToast({ onGone }) {
  useEffect(() => {
    const t = setTimeout(onGone, 2600);
    return () => clearTimeout(t);
  }, [onGone]);

  return (
    <motion.div
      className="toast"
      role="status"
      initial={{ y: 60, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 30, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <span className="toast__burst" aria-hidden="true">
        {BURST.map((b, i) => (
          <motion.i
            key={i}
            className={`toast__dot toast__dot--${b.c}`}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: b.x, y: b.y, scale: 0, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        ))}
      </span>
      Bewertung gespeichert ✺
    </motion.div>
  );
}

export default function ProductDetail({ id }) {
  const [state, setState] = useState({ id: null });
  const [rating, setRating] = useState(false);
  const [saved, setSaved] = useState(false);
  const clearSaved = useCallback(() => setSaved(false), []);

  useEffect(() => {
    if (!isUuid(id)) return;
    let active = true;
    Promise.all([fetchProduct(id), fetchRatings(id)])
      .then(([product, summary]) => active && setState({ id, product, summary }))
      .catch((err) => active && setState({ id, failed: err.status === 404 ? "missing" : "error" }));
    return () => {
      active = false;
    };
  }, [id]);

  const current = !isUuid(id) ? { id, failed: "missing" } : state;
  if (current.id !== id) return <p className="empty" aria-live="polite">Lade Eis …</p>;
  if (current.failed) {
    return (
      <div className="empty">
        <h1>{current.failed === "missing" ? "Dieses Eis gibt es nicht." : "Das hat nicht geklappt."}</h1>
        <p>
          {current.failed === "missing"
            ? "Vielleicht wurde der Link falsch kopiert."
            : "Das Eis konnte nicht geladen werden. Bitte später erneut versuchen."}
        </p>
        <Link href="/" className="btn btn--lime">Zur Startseite</Link>
      </div>
    );
  }

  const { product, summary } = current;
  const onSave = async (values) => {
    const next = await saveRating(id, values);
    setState((prev) => ({ ...prev, summary: next }));
  };

  const cat = getCategory(product.category);
  const average = summary.average ?? null;
  const own = summary.own ?? undefined;
  const count = summary.count;

  return (
    <article className="detail" data-cat={product.category}>
      <DetailScene title={product.name} refreshKey={`${count}-${rating}-${Boolean(own)}`}>
        <Link href="/" className="back">← Zurück</Link>
        <div className="detail__hero">
          <div className="detail__figure">
            <ProductImage product={product} large />
          </div>
          <div className="detail__meta">
            <span className="chip">{cat.label}</span>
            <AnimatedTitle text={product.name} />
            <p className="detail__origin">
              {product.category === "diele" ? `${product.shop} · ${product.city}` : product.brand}
            </p>
            <p className="muted">
              {count === 0 ? "Noch keine Bewertungen" : `${count} ${count === 1 ? "Bewertung" : "Bewertungen"}`}
            </p>
            {!rating && (
              <button type="button" className="btn btn--ink btn--big" onClick={() => setRating(true)}>
                {own ? "Bewertung ändern" : "Jetzt bewerten"}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {rating && (
            <motion.div
              key="rate"
              className="rate-wrap"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
            >
              <RatingForm
                initialValues={own}
                onSave={onSave}
                onDone={(didSave) => {
                  setRating(false);
                  if (didSave === true) setSaved(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <section aria-labelledby="profile-heading" className="panel sweep">
          <h2 id="profile-heading" className="section-title">Geschmacksprofil</h2>
          {average ? (
            <>
              <p className="legend">
                <span><i className="marker marker--avg" /> Durchschnitt aller Bewertungen</span>
                {own && <span><i className="marker marker--own" /> Deine Bewertung</span>}
              </p>
              <ProfileChart average={average} own={own} />
            </>
          ) : (
            <div className="empty">
              <p>Noch niemand hat dieses Eis bewertet. Sei der Erste.</p>
            </div>
          )}
        </section>
      </DetailScene>

      <AnimatePresence>
        {saved && <SavedToast key="saved" onGone={clearSaved} />}
      </AnimatePresence>
    </article>
  );
}
