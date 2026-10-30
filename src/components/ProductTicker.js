"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProducts } from "@/lib/api-client";
import ProductImage from "./ProductImage";

const MIN_ITEMS = 10;

// Zwei identische Gruppen für die Endlosschleife; Duplikate sind inert und für Screenreader versteckt.
export default function ProductTicker() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    let active = true;
    fetchProducts({ limit: 24 })
      .then((d) => active && setProducts(d.items.slice(0, 16)))
      .catch(() => active && setProducts([]));
    return () => {
      active = false;
    };
  }, []);

  // Platzhalter mit fester Höhe verhindert Layout-Sprünge beim Laden.
  if (products === null) return <div className="ticker ticker--pending" aria-hidden="true" />;
  if (products.length === 0) return null;

  const repeats = Math.ceil(MIN_ITEMS / products.length);
  const items = Array.from({ length: repeats }, (_, r) =>
    products.map((p) => ({ product: p, dup: r > 0 })),
  ).flat();

  const renderGroup = (isCopy) => (
    <ul className="ticker__group" aria-hidden={isCopy || undefined} inert={isCopy || undefined}>
      {items.map(({ product, dup }, i) => {
        const hidden = dup && !isCopy;
        return (
          <li
            key={`${product.id}-${i}`}
            className={`ticker__item${dup || isCopy ? " ticker__dup" : ""}`}
            aria-hidden={hidden || undefined}
            inert={hidden || undefined}
          >
            <Link href={`/eis/${product.id}`} className="ticker__link">
              <span className="ticker__thumb">
                <ProductImage product={product} thumb />
              </span>
              <span className="ticker__name">{product.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav className="ticker" aria-label="Eissorten im Überblick">
      <div className="ticker__track" style={{ "--dur": `${Math.max(items.length * 4, 24)}s` }}>
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </nav>
  );
}
