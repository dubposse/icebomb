export const SCALES = [
  { id: "natur", left: "Künstlich", right: "Natürlich" },
  { id: "umami", left: "Fad", right: "Umami" },
  { id: "herkunft", left: "Orientalisch", right: "Europäisch" },
  { id: "stil", left: "Modern", right: "Klassisch" },
  { id: "szene", left: "Hipster", right: "Oldschool" },
  { id: "geschmack", left: "Fruchtig", right: "Milchig" },
  { id: "saison", left: "Winter", right: "Sommer" },
  { id: "qualitaet", left: "Waste", right: "Delicious" },
  { id: "kauf", left: "Never Buy", right: "Buy Again" },
];

export const NEUTRAL_VALUE = 50;
export const neutralValues = () => SCALES.map(() => NEUTRAL_VALUE);
