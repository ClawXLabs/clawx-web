import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WalletAnimation from "../ui/WalletAnimation";
import MarketSelector from "../ui/MarketSelector";
import UpnDown from "../ui/UpnDown";
import CoinsNote from "../ui/CoinsNote";

// Register once at module level
gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: "01",
    tag: "CONNECT",
    title: "Link Your Wallet",
    body: "Install MetaMask and switch to Avalanche Fuji C-Chain (chain 43113). Our relay pays your gas — zero AVAX required.",
    note: "No AVAX needed from you.",
  },
  {
    n: "02",
    tag: "SELECT",
    title: "Pick a Market",
    body: "Choose BTC, ETH, or AVAX. Each market runs 5-minute prediction rounds settled by Chainlink oracle prices.",
    note: "Oracle-settled on every round.",
  },
  {
    n: "03",
    tag: "POSITION",
    title: "Take UP or DOWN",
    body: "Lock TUSDC into the round contract before the window closes. Your position is immutable on-chain once submitted.",
    note: "Commit before window closes.",
  },
  {
    n: "04",
    tag: "SETTLE",
    title: "Claim Your Winnings",
    body: "Chainlink oracle settles the round at expiry. Winners claim a proportional share of the losing side's pool instantly.",
    note: "Instant on-chain settlement.",
  },
];

export default function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const fill = progressFillRef.current;
    if (!section || !fill) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const totalSteps = STEPS.length;

    const ctx = gsap.context(() => {
      /* ── Initial states ── */
      cards.forEach((card, i) => {
        const leftPos = isMobile ? "0%" : `${i * 25}%`;
        const widthVal = isMobile ? "100%" : "25%";
        gsap.set(card, {
          left: leftPos,
          width: widthVal,
          top: i === 0 ? "0%" : "100%",
          opacity: i === 0 ? 1 : 0,
        });
      });

      /* ── Master scrub timeline ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "50% 50%",
          // Each card gets 1.5× viewport height of scroll room
          end: () => `+=${section.offsetHeight * (totalSteps - 1) * 1.5}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          onUpdate: (self) => {
            fill.style.width = self.progress * 100 + "%";
          },
        },
      });

      // Phase i (0-indexed from 1): card slides up from bottom during timeline [i-1 … i]
      for (let i = 1; i < totalSteps; i++) {
        // Fade in quickly at phase start
        tl.to(cards[i], { opacity: 1, duration: 0.15, ease: "none" }, i - 1);
        // Slide from 100% to 0% (top position) over the full phase
        tl.to(cards[i], { top: "0%", duration: 1, ease: "power2.inOut" }, i - 1);
      }

      /* ── Entry Animation for WalletAnimation (Card 01) ── */
      gsap.fromTo(
        ".wallet-anim-container",
        { scale: 1, rotateX: 120, opacity: 0 },
        {
          scale: 1,
          rotateX: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "50% 50%",
            scrub: true,
          },
        }
      );

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <section
      id="how"
      ref={sectionRef}
      style={{
        background: "#FAF8F3",
        borderBottom: "3px solid #0D0B08",
        overflow: "hidden",
        width: "100%",
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Section header ── */}
      <div
        style={{
          borderBottom: "1px solid #0D0B08",
          padding: "10px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#0D0B08" }} />
        <span
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: isMobile ? 14 : 18,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#0D0B08",
            whiteSpace: "nowrap",
          }}
        >
          HOW IT WORKS
        </span>
        <div style={{ flex: 1, height: 1, background: "#0D0B08" }} />
      </div>

      {/* ── Red scrub progress bar ── */}
      <div style={{ height: 2, background: "rgba(13,11,8,0.08)", flexShrink: 0 }}>
        <div
          ref={progressFillRef}
          style={{
            height: "100%",
            width: "0%",
            background: "#C0392B",
            transition: "width 0.08s linear",
          }}
        />
      </div>

      {/* ── Card stack container ── */}
      <div
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            ref={(el) => { cardsRef.current[i] = el; }}
            style={{
              position: "absolute",
              top: i === 0 ? "0%" : "100%",
              left: isMobile ? "0%" : `${i * 25}%`,
              width: isMobile ? "100%" : "25%",
              height: "100%",
              background: "#FAF8F3",
              borderLeft: (!isMobile && i > 0) ? "1px solid #0D0B08" : "none",
              borderTop: (isMobile && i > 0) ? "3px solid #0D0B08" : "none",
              zIndex: i + 1,
              padding: isMobile ? "24px 20px" : "36px 24px",
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 12 : 16,
              opacity: i === 0 ? 1 : 0,
              boxSizing: "border-box",
            }}
          >
            {/* Step number + tag */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: isMobile ? 36 : 48,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "#E8E5DF",
                  letterSpacing: "-0.02em",
                }}
              >
                {step.n}
              </span>
              <span
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#C0392B",
                }}
              >
                {step.tag}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: isMobile ? 18 : 22,
                fontWeight: 900,
                lineHeight: 1.2,
                color: "#0D0B08",
                margin: 0,
              }}
            >
              {step.title}
            </h3>

            {/* Thin rule */}
            <div style={{ height: 1, background: "rgba(13,11,8,0.12)", flexShrink: 0 }} />

            {/* Body */}
            <p
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 13,
                lineHeight: 1.75,
                color: "#5A5248",
                margin: 0,
                maxWidth: isMobile ? "100%" : 360,
              }}
            >
              {step.body}
            </p>

            {/* Icons / Animations Container */}
            {i === 0 && (
              <div
                style={{
                  marginTop: "auto",
                  marginBottom: "auto",
                  transform: isMobile ? "scale(0.7)" : "scale(0.52)",
                  transformOrigin: "center center",
                  perspective: 1200,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div className="wallet-anim-container" style={{ transformOrigin: "bottom center" }}>
                  <WalletAnimation />
                </div>
              </div>
            )}
            {i === 1 && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transform: isMobile ? "scale(0.9)" : "scale(0.75)",
                  transformOrigin: "center center",
                }}
              >
                <MarketSelector />
              </div>
            )}
            {i === 2 && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transform: isMobile ? "scale(0.9)" : "scale(0.75)",
                  transformOrigin: "center center",
                }}
              >
                <UpnDown />
              </div>
            )}
            {i === 3 && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transform: isMobile ? "scale(0.9)" : "scale(0.75)",
                  transformOrigin: "center center",
                }}
              >
                <CoinsNote />
              </div>
            )}

            {/* Note */}
            <p
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#888",
                margin: 0,
                marginTop: "auto",
              }}
            >
              ↳ {step.note}
            </p>
          </div>
        ))}
      </div>

      {/* ── Footer chain info ── */}
      <div
        style={{
          borderTop: "1px solid #0D0B08",
          padding: "10px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? 12 : 32,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {["FastPrice Oracle", "Avalanche Fuji C-Chain", "Gasless Entry"].map((item, i) => (
          <span
            key={item}
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#888",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {i > 0 && !isMobile && <span style={{ color: "rgba(13,11,8,0.2)" }}>·</span>}
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}