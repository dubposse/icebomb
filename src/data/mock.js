// Beispieldaten: alle Läden, Orte und Bewertungen sind erfunden.
export const MOCK_PRODUCTS = [
  { id: "bounty", category: "stiel", name: "Bounty", brand: "Beispiel-Eis Co.", color: "#8a5a3c" },
  { id: "himbeer-wasser", category: "stiel", name: "Himbeer-Wassereis", brand: "Frosty Fabrik", color: "#ff4d6d" },
  { id: "schoko-krokant", category: "stiel", name: "Schoko Krokant", brand: "Nordpol Eis", color: "#5a3825" },
  { id: "pistazie", category: "kanister", name: "Pistazie", brand: "Kaltgenuss", color: "#9ccc65" },
  { id: "vanille", category: "kanister", name: "Vanille Bourbon", brand: "Gelato Beispiel", color: "#ffe9a8" },
  { id: "salzkaramell", category: "kanister", name: "Salzkaramell", brand: "Kaltgenuss", color: "#d9983b" },
  { id: "erdbeere", category: "diele", name: "Erdbeere", shop: "Eisdiele Muster-Bella", city: "Beispielstadt", color: "#ff6f91" },
  { id: "stracciatella", category: "diele", name: "Stracciatella", shop: "Gelateria Fantasia", city: "Musterdorf", color: "#f5f0e1" },
  { id: "lavendel-honig", category: "diele", name: "Lavendel-Honig", shop: "Eiszeit Probierhausen", city: "Beispielstadt", color: "#b39ddb" },
];

// Je Zeile die neun Werte (0–100) in Reihenfolge der Skalen.
const RATING_ROWS = {
  bounty: [
    [20, 40, 70, 80, 85, 70, 75, 85, 90],
    [30, 35, 65, 70, 75, 60, 80, 90, 95],
    [15, 50, 75, 85, 90, 75, 70, 70, 80],
  ],
  pistazie: [
    [60, 65, 50, 45, 40, 80, 60, 80, 85],
    [70, 70, 40, 35, 30, 85, 55, 95, 100],
  ],
  erdbeere: [
    [90, 30, 85, 60, 55, 15, 95, 90, 95],
    [85, 40, 80, 65, 60, 20, 90, 85, 90],
    [95, 25, 90, 70, 65, 10, 100, 95, 100],
    [80, 35, 75, 55, 50, 25, 85, 80, 85],
  ],
  vanille: [[40, 30, 90, 90, 80, 95, 60, 60, 55]],
  "lavendel-honig": [
    [75, 70, 20, 10, 5, 50, 70, 70, 60],
    [80, 75, 30, 15, 10, 55, 65, 80, 75],
  ],
};

export const MOCK_RATINGS = Object.entries(RATING_ROWS).flatMap(([productId, rows]) =>
  rows.map((values, i) => ({ productId, visitorId: `mock-${productId}-${i}`, values })),
);
