import { useId } from "react";

// Lokale SVG-Platzhalter-Illustration je Kategorie.
export default function IceArt({ category, color }) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 200" role="img" aria-hidden="true" className="ice-art">
            {category === "stiel" && (
        <g>
          <rect x="92" y="130" width="16" height="62" rx="8" fill="#e8b878" stroke="#14101f" strokeWidth="3" />
          <rect x="54" y="26" width="92" height="115" rx="40" fill={color} stroke="#14101f" strokeWidth="3" />
          <path d="M70 60q10-20 30-18" stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none" opacity=".6" />
        </g>
      )}
      {category === "kanister" && (
        <g>
          <path d="M40 80h120l-14 100a12 12 0 0 1-12 10H66a12 12 0 0 1-12-10z" fill="#fff" stroke="#14101f" strokeWidth="3" />
          <rect x="34" y="66" width="132" height="22" rx="11" fill="#14101f" />
          <path d="M56 66a44 36 0 0 1 88 0z" fill={color} stroke="#14101f" strokeWidth="3" />
          <rect x="62" y="110" width="76" height="46" rx="14" fill={color} stroke="#14101f" strokeWidth="3" />
        </g>
      )}
      {category === "diele" && (
        <g>
          <path d="M66 100h68l-34 92z" fill="#e8b878" stroke="#14101f" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="100" cy="82" r="38" fill={color} stroke="#14101f" strokeWidth="3" />
          <circle cx="76" cy="100" r="22" fill={color} stroke="#14101f" strokeWidth="3" />
          <circle cx="126" cy="100" r="22" fill={color} stroke="#14101f" strokeWidth="3" />
          <circle cx="100" cy="40" r="9" fill="#ff3d8b" stroke="#14101f" strokeWidth="3" />
        </g>
      )}
      <title id={id}>Illustration</title>
    </svg>
  );
}
