"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const WORDMARK = "ICEBOMB".split("");
const WORDS = ["TASTE.", "RATE.", "REPEAT."];

// Layout-Effekt im Browser, damit der Startzustand vor dem ersten Paint gesetzt wird.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Hero() {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const mm = gsap.matchMedia();

    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", coarse: "(pointer: coarse)" },
      (ctx) => {
        if (!ctx.conditions.motion) return;
        const letters = gsap.utils.toArray(".wm-letter", el);
        const inners = gsap.utils.toArray(".wm-inner", el);
        const words = gsap.utils.toArray(".kin-word", el);
        const cleanups = [];

        // Eingangssequenz: Buchstaben, dann Wörter, dann Aktionen.
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .from(letters, {
            yPercent: 130,
            rotation: () => gsap.utils.random(-45, 45),
            scale: 0.5,
            opacity: 0,
            duration: 1.1,
            stagger: 0.06,
            ease: "back.out(1.7)",
          })
          .from(
            ".kin-char",
            {
              yPercent: 110,
              rotationX: -80,
              opacity: 0,
              duration: 0.8,
              stagger: 0.025,
              transformOrigin: "50% 100%",
            },
            "-=0.7",
          )
          .from(".hero__fade", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.5");

        // Scroll: Wörter ziehen gegenläufig auseinander, Wortmarke driftet nach oben.
        gsap.to(words, {
          xPercent: (i) => (i % 2 ? -14 : 14),
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
        });
        gsap.to(".wm", {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
        });
        gsap.to(".shape", {
          yPercent: (i) => -25 - i * 12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 },
        });

        // Zeiger: Buchstaben weichen aus, rotieren und federn zurück.
        let frame = 0;
        const onMove = (e) => {
          if (e.pointerType === "touch") return;
          const { clientX, clientY } = e;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            inners.forEach((node) => {
              const r = node.getBoundingClientRect();
              const dx = clientX - (r.left + r.width / 2);
              const dy = clientY - (r.top + r.height / 2);
              const force = Math.max(0, 1 - Math.hypot(dx, dy) / 340);
              gsap.to(node, {
                x: -dx * force * 0.3,
                y: -dy * force * 0.3,
                rotation: (-dx / 18) * force,
                scale: 1 + force * 0.18,
                duration: 0.5,
                ease: "power3.out",
                overwrite: "auto",
              });
            });
          });
        };
        const onLeave = () => {
          cancelAnimationFrame(frame);
          gsap.to(inners, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.3,
            ease: "elastic.out(1, 0.4)",
            overwrite: "auto",
          });
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          cancelAnimationFrame(frame);
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        });

        // Touch: Tippen auf einen Buchstaben dreht ihn; dazu eine seltene Welle.
        inners.forEach((node) => {
          const onTap = () =>
            gsap
              .timeline()
              .fromTo(node, { rotation: 0, scale: 1 }, { rotation: 360, scale: 1.3, duration: 0.5, ease: "power2.out" })
              .to(node, { rotation: 360, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.4)" })
              .set(node, { rotation: 0 });
          node.addEventListener("pointerdown", onTap);
          cleanups.push(() => node.removeEventListener("pointerdown", onTap));
        });

        if (ctx.conditions.coarse) {
          const wave = gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 2.5 }).to(inners, {
            y: -16,
            rotation: (i) => (i % 2 ? 7 : -7),
            duration: 0.35,
            stagger: 0.07,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          });
          const io = new IntersectionObserver(([entry]) =>
            entry.isIntersecting ? wave.resume() : wave.pause(),
          );
          io.observe(el);
          cleanups.push(() => io.disconnect());
        }

        return () => cleanups.forEach((fn) => fn());
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section className="hero" ref={root} aria-labelledby="hero-title">
      <div className="stage" aria-hidden="true">
        <div className="shape shape--sun"><div className="float float--a" /></div>
        <div className="shape shape--blob">
          <svg viewBox="0 0 200 200" className="float float--b">
            <path d="M44 -63C57 -52 67 -38 74 -22C81 -5 85 14 77 28C69 42 49 52 31 60C12 68 -5 74 -22 70C-39 66 -55 53 -64 37C-73 21 -74 2 -69 -15C-64 -32 -52 -46 -38 -57C-24 -68 -8 -74 6 -72C20 -70 31 -74 44 -63Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="shape shape--pop"><div className="float float--c"><i /></div></div>
        <div className="shape shape--cone"><div className="float float--d"><i /></div></div>
        <div className="shape shape--ring"><div className="float float--e" /></div>
      </div>

      <p className="eyebrow hero__fade">Eis · öffentlich · neun Skalen</p>

      <h1 id="hero-title" className="wm" aria-label="icebomb">
        {WORDMARK.map((ch, i) => (
          <span key={i} className={`wm-letter wm-letter--${i}`} aria-hidden="true">
            <span className="wm-inner">{ch}</span>
          </span>
        ))}
      </h1>

      <p className="sr-only">Taste. Rate. Repeat.</p>
      <div className="kin" aria-hidden="true">
        {WORDS.map((word, wi) => (
          <div key={word} className={`kin-word kin-word--${wi}`}>
            {word.split("").map((c, ci) => (
              <span key={ci} className="kin-char">{c}</span>
            ))}
          </div>
        ))}
      </div>

      <div className="hero__row">
        <p className="hero__fade">Neun Regler. Keine Gesamtnote. Nur Haltung.</p>
        <a href="#eis" className="btn btn--ink btn--big hero__fade">
          Eis entdecken ↓
        </a>
      </div>
    </section>
  );
}
