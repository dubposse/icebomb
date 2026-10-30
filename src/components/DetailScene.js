"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Bühne der Detailseite: GSAP-Titelchoreografie und ScrollTrigger-Parallaxe.
export default function DetailScene({ title, refreshKey, children }) {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(".t-char", {
          yPercent: 120,
          rotation: () => gsap.utils.random(-25, 25),
          opacity: 0,
          duration: 0.9,
          stagger: 0.035,
          ease: "back.out(1.5)",
        })
        .from(".detail__meta > *", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.5")
        .from(".detail__figure", { scale: 0.9, rotation: -4, opacity: 0, duration: 1 }, 0);

      gsap.to(".detail__figure", {
        yPercent: -8,
        rotation: 3,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(".deco", {
        yPercent: (i) => -40 - i * 25,
        rotation: (i) => (i % 2 ? 40 : -40),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 },
      });
      // Übergang zum Bewertungsbereich: Fläche fährt auf, Inhalt folgt.
      const sweep = el.querySelector(".sweep");
      gsap.fromTo(
        sweep,
        { clipPath: "inset(0% 9% 0% 9% round 56px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: { trigger: sweep, start: "top 95%", end: "top 40%", scrub: 0.5 },
        },
      );
    }, el);
    return () => mm.revert();
  }, []);

  // Layout ändert sich mit Bewertungen/Formular: Trigger neu berechnen.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [refreshKey]);

  return (
    <div ref={root} className="scene" aria-label={title}>
      <div className="deco deco--a" aria-hidden="true" />
      <div className="deco deco--b" aria-hidden="true" />
      <div className="deco deco--c" aria-hidden="true" />
      {children}
    </div>
  );
}

// Skaliert die Überschrift so, dass das längste Wort in die Spalte passt (nur font-size, kollidiert nicht mit GSAP-Transforms).
export function AnimatedTitle({ text }) {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    const title = ref.current;
    const column = title?.parentElement;
    if (!title || !column) return;
    const fit = () => {
      const prev = parseFloat(title.style.getPropertyValue("--fit")) || 1;
      title.removeAttribute("data-break");
      let widest = 0;
      title.querySelectorAll(".t-word").forEach((w) => {
        widest = Math.max(widest, w.scrollWidth);
      });
      const natural = widest / prev;
      const ratio = natural > 0 ? column.clientWidth / natural : 1;
      const next = Math.min(1, Math.max(0.4, ratio));
      title.style.setProperty("--fit", next.toFixed(3));
      title.toggleAttribute("data-break", ratio < 0.4);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(column);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text]);

  return (
    <h1 ref={ref} className="t-title" aria-label={text}>
      {text.split(" ").flatMap((word) => word.split(/(?<=-)(?=.)/)).map((word, wi) => (
        <span key={wi} className="t-word" data-join={word.endsWith("-") || undefined} aria-hidden="true">
          {word.split("").map((c, ci) => (
            <span key={ci} className="t-mask">
              <span className="t-char">{c}</span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
