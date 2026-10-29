export const CATEGORIES = [
  { id: "stiel", label: "Eis am Stiel", emoji: "🍦", color: "#ff3d8b" },
  { id: "kanister", label: "Eis im Kanister", emoji: "🥄", color: "#17c3b2" },
  { id: "diele", label: "Eis von der Diele", emoji: "🍨", color: "#ffc93c" },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
