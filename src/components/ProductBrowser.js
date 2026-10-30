"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ProductCard from "./ProductCard";
import { CATEGORIES } from "@/data/categories";
import { fetchProducts } from "@/lib/api-client";

const FILTERS = [{ id: "alle", label: "Alle" }, ...CATEGORIES];

export default function ProductBrowser() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("alle");
  // Ergebnis ist an den Abfrageschlüssel gebunden; abweichender Schlüssel = lädt.
  const [result, setResult] = useState({ key: null, items: [], nextCursor: null, error: false });
  const [more, setMore] = useState({ busy: false, error: false });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const key = `${debounced}|${category}`;

  useEffect(() => {
    const controller = new AbortController();
    const cat = category === "alle" ? "" : category;
    fetchProducts({ q: debounced, category: cat, signal: controller.signal })
      .then((data) => setResult({ key, items: data.items, nextCursor: data.nextCursor, error: false }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setResult({ key, items: [], nextCursor: null, error: true });
      });
    return () => controller.abort();
  }, [key, debounced, category]);

  async function loadMore() {
    setMore({ busy: true, error: false });
    try {
      const cat = category === "alle" ? "" : category;
      const data = await fetchProducts({ q: debounced, category: cat, cursor: result.nextCursor });
      setResult((prev) =>
        prev.key === key
          ? { ...prev, items: [...prev.items, ...data.items], nextCursor: data.nextCursor }
          : prev,
      );
      setMore({ busy: false, error: false });
    } catch {
      setMore({ busy: false, error: true });
    }
  }

  const loading = result.key !== key;
  const q = query.trim().toLowerCase();
  // Sofortiges lokales Filtern der bereits geladenen Karten, bis der Server antwortet.
  const visible = result.items.filter((p) => {
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
        <p className="browser__count" aria-hidden="true">{loading ? "··" : String(visible.length).padStart(2, "0")}</p>
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
      <p className="sr-only" aria-live="polite">{loading ? "Lade …" : `${visible.length} Ergebnisse`}</p>
      {!loading && result.error ? (
        <div className="empty" role="alert">
          <p>Die Eissorten konnten nicht geladen werden.</p>
          <button type="button" className="btn btn--ink" onClick={() => setDebounced((d) => d + " ")}>
            Erneut versuchen
          </button>
        </div>
      ) : loading && visible.length === 0 ? (
        <p className="empty" aria-hidden="true">Lade Eis …</p>
      ) : visible.length === 0 ? (
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
                <ProductCard product={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
      {!loading && result.nextCursor && (
        <div className="more">
          <button type="button" className="btn btn--ink" onClick={loadMore} disabled={more.busy}>
            {more.busy ? "Lädt …" : "Mehr laden"}
          </button>
          {more.error && <p className="error" role="alert">Konnte nicht nachgeladen werden.</p>}
        </div>
      )}
    </section>
  );
}
