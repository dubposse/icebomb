"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "./StoreProvider";
import ProductCard from "./ProductCard";
import { CATEGORIES } from "@/data/categories";

const FILTERS = [{ id: "alle", label: "Alle" }, ...CATEGORIES];

export default function ProductBrowser() {
  const { products, ratings } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("alle");

  const counts = useMemo(() => {
    const map = {};
    for (const r of ratings) map[r.productId] = (map[r.productId] ?? 0) + 1;
    return map;
  }, [ratings]);

  const q = query.trim().toLowerCase();
  const visible = products.filter((p) => {
    if (category !== "alle" && p.category !== category) return false;
    if (!q) return true;
    return [p.name, p.brand, p.shop, p.city].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <section id="eis" aria-labelledby="eis-heading" className="browser">
      <div className="browser__head">
        <h2 id="eis-heading" className="browser__title">
          Alle <span>Eissorten</span>
        </h2>
        <p className="browser__count" aria-hidden="true">{String(visible.length).padStart(2, "0")}</p>
      </div>
      <div className="filters">
        <label className="search">
          <span className="sr-only">Eis suchen</span>
          <input
            type="search"
            placeholder="Suchen: Sorte, Marke, Eisdiele"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div role="group" aria-label="Kategorie filtern" className="pills">
          {FILTERS.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              className="pill"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              whileTap={{ scale: 0.92 }}
            >
              {category === c.id && (
                <motion.span
                  layoutId="filter-bg"
                  className="pill__bg"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                />
              )}
              <span className="pill__label">{c.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{visible.length} Ergebnisse</p>
      {visible.length === 0 ? (
        <p className="empty">Nichts gefunden. Vielleicht fehlt dein Eis noch.</p>
      ) : (
        <motion.ul className="grid" layout>
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.li
                key={p.id}
                layout
                className="grid__cell"
                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              >
                <ProductCard product={p} ratingCount={counts[p.id] ?? 0} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
