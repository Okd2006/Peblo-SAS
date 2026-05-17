"use client";
import { useEffect, useRef, useCallback } from "react";

/**
 * AnimatedBackground
 *
 * Layer 1 — Mesh gradient blobs (CSS keyframe, GPU composited via transform/opacity)
 * Layer 2 — Dot grid SVG overlay at 5% opacity
 * Layer 3 — Animated SVG feTurbulence noise at 3% opacity
 * Layer 4 — Cursor spotlight (radial gradient follows pointer, requestAnimationFrame)
 *
 * All layers are fixed, behind content (z-index: -1 on wrapper).
 * Respects prefers-reduced-motion — blobs freeze, spotlight disabled.
 */
export function AnimatedBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const updateSpotlight = useCallback(() => {
    if (!spotlightRef.current) return;
    const { x, y } = mouseRef.current;
    spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(139,92,246,0.07) 0%, transparent 70%)`;
    rafRef.current = requestAnimationFrame(updateSpotlight);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(updateSpotlight);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, updateSpotlight]);

  return (
    <>
      {/* ── Inject keyframes + blob styles ── */}
      <style>{`
        @keyframes blob-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(60px,-40px) scale(1.1); }
          66%      { transform: translate(-30px,50px) scale(0.95); }
        }
        @keyframes blob-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-50px,60px) scale(1.08); }
          66%      { transform: translate(40px,-30px) scale(1.05); }
        }
        @keyframes blob-3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,40px) scale(1.12); }
        }
        @keyframes blob-4 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-40px,-50px) scale(0.92); }
          80%      { transform: translate(50px,20px) scale(1.06); }
        }
        @keyframes noise-drift {
          0%   { transform: translate(0,0); }
          25%  { transform: translate(-2%,-1%); }
          50%  { transform: translate(1%,2%); }
          75%  { transform: translate(2%,-2%); }
          100% { transform: translate(0,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .peblo-blob { animation: none !important; }
          .peblo-noise { animation: none !important; }
        }
      `}</style>

      {/* ── Root wrapper — fixed, full-screen, behind everything ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          pointerEvents: "none",
          isolation: "isolate",
        }}
      >
        {/* ── Layer 1: Mesh gradient blobs ── */}
        <div style={{ position: "absolute", inset: 0 }}>
          {/* Blob A — blue, top-left */}
          <div
            className="peblo-blob"
            style={{
              position: "absolute",
              top: "-15%",
              left: "-10%",
              width: "55vw",
              height: "55vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)",
              filter: "blur(72px)",
              willChange: "transform",
              animation: "blob-1 18s ease-in-out infinite",
            }}
          />
          {/* Blob B — indigo, top-right */}
          <div
            className="peblo-blob"
            style={{
              position: "absolute",
              top: "-5%",
              right: "-15%",
              width: "50vw",
              height: "50vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
              filter: "blur(80px)",
              willChange: "transform",
              animation: "blob-2 22s ease-in-out infinite",
            }}
          />
          {/* Blob C — purple, center */}
          <div
            className="peblo-blob"
            style={{
              position: "absolute",
              top: "30%",
              left: "25%",
              width: "45vw",
              height: "45vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
              filter: "blur(90px)",
              willChange: "transform",
              animation: "blob-3 26s ease-in-out infinite",
            }}
          />
          {/* Blob D — violet, bottom-right */}
          <div
            className="peblo-blob"
            style={{
              position: "absolute",
              bottom: "-10%",
              right: "5%",
              width: "40vw",
              height: "40vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
              filter: "blur(64px)",
              willChange: "transform",
              animation: "blob-4 20s ease-in-out infinite",
            }}
          />
          {/* Blob E — deep blue, bottom-left */}
          <div
            className="peblo-blob"
            style={{
              position: "absolute",
              bottom: "5%",
              left: "-5%",
              width: "38vw",
              height: "38vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)",
              filter: "blur(80px)",
              willChange: "transform",
              animation: "blob-1 24s ease-in-out infinite reverse",
            }}
          />
        </div>

        {/* ── Layer 2: Dot grid overlay ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            color: "var(--text-primary, #0F172A)",
          }}
        />

        {/* ── Layer 3: Animated noise texture (SVG feTurbulence) ── */}
        <div
          className="peblo-noise"
          style={{
            position: "absolute",
            inset: "-10%",
            opacity: 0.03,
            willChange: "transform",
            animation: "noise-drift 8s ease-in-out infinite",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            style={{ display: "block" }}
          >
            <filter id="peblo-noise-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              width="100%"
              height="100%"
              filter="url(#peblo-noise-filter)"
            />
          </svg>
        </div>

        {/* ── Layer 4: Cursor spotlight ── */}
        {!reducedMotion && (
          <div
            ref={spotlightRef}
            style={{
              position: "absolute",
              inset: 0,
              transition: "background 0.1s ease",
              willChange: "background",
            }}
          />
        )}
      </div>
    </>
  );
}
