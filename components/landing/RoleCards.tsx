import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Card {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  cta: { label: string; href: string };
  features: string[];
  dark: boolean;
}

const CARDS: Card[] = [
  {
    id: 'agent',
    kicker: '◆ MODE A',
    headline: 'Deploy an Agent',
    body: 'Delegate trading to one of the on-chain AI agents. Approve a TUSDC allowance once, and the agent executes positions autonomously on your behalf based on its encoded strategy.',
    cta: { label: 'VIEW AGENTS', href: '/agents' },
    features: ['Autonomous Execution', 'Permit-Based Delegation', 'Live Activity Feed'],
    dark: true,
  },
  {
    id: 'human',
    kicker: '◆ MODE B',
    headline: 'Trade Manually',
    body: 'Connect your wallet, pick BTC, ETH, or AVAX, and lock a UP or DOWN position before the 5-minute window closes. Chainlink oracle settles the outcome. Winners claim proportional pool rewards.',
    cta: { label: 'GO TO MARKETS', href: '/markets' },
    features: ['Chainlink Oracle Pricing', 'Gasless Entry on Fuji', 'Instant Settlement'],
    dark: false,
  },
];

function RoleCardCTA({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <span
        className="np-role-cta"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-block',
          background: hovered ? '#B03030' : '#E74141',
          color: '#FAF8F3',
          padding: '12px 28px',
          fontFamily: '"Courier New", monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.2s ease',
        }}
      >
        {label} →
      </span>
    </Link>
  );
}

export default function RoleCards() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="modes"
      className="np-modes-section"
      style={{
        background: '#FAF8F3',
        borderBottom: '3px solid #0D0B08',
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50%      { opacity: 1; transform: scale(1.15); }
        }
      `}</style>

      {/* Section header rule */}
      <div
        style={{
          borderBottom: '1px solid #0D0B08',
          padding: '10px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ flex: 1, height: 1, background: '#0D0B08' }} />
        <span
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#0D0B08',
            whiteSpace: 'nowrap',
          }}
        >
          TWO WAYS TO TRADE
        </span>
        <div style={{ flex: 1, height: 1, background: '#0D0B08' }} />
      </div>

      {/* Two-column card grid */}
      <div className="np-cards-grid" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`np-role-card np-role-card--${card.id}`}
            style={{
              flex: isMobile ? '1 1 100%' : '1 1 50%',
              overflow: 'hidden',
              background: 'transparent',
              color: '#0D0B08',
              borderRight: (!isMobile && i === 0) ? '1px solid #0D0B08' : 'none',
              borderBottom: (isMobile && i === 0) ? '1px solid #0D0B08' : 'none',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: 'auto',
                minWidth: isMobile ? '0px' : '400px',
                padding: isMobile ? '36px 24px' : '48px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                boxSizing: 'border-box',
                height: '100%',
                flex: 1,
                position: 'relative',
                border: card.id === 'agent' ? '2.5px solid #E74141' : 'none',
                margin: card.id === 'agent' ? '12px' : '0px',
                background: card.id === 'agent' ? 'rgba(231, 65, 65, 0.02)' : 'transparent',
              }}
            >
              {/* HUD techy brackets for Agent card */}
              {card.id === 'agent' && (
                <>
                  <div style={{ position: 'absolute', top: 8, left: 8, width: 10, height: 10, borderTop: '2px solid #E74141', borderLeft: '2px solid #E74141', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderTop: '2px solid #E74141', borderRight: '2px solid #E74141', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 8, left: 8, width: 10, height: 10, borderBottom: '2px solid #E74141', borderLeft: '2px solid #E74141', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 8, right: 8, width: 10, height: 10, borderBottom: '2px solid #E74141', borderRight: '2px solid #E74141', pointerEvents: 'none' }} />
                </>
              )}

              {/* Kicker Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <p
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: '#0D0B08',
                    margin: 0,
                  }}
                >
                  {card.kicker}
                </p>
                {card.id === 'agent' && (
                  <span style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#E74141',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(231, 65, 65, 0.08)',
                    border: '1.5px solid #E74141',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>
                    <span style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#E74141',
                      display: 'inline-block',
                      animation: 'pulseGlow 1.8s infinite',
                    }} />
                    MODULE_ACTIVE
                  </span>
                )}
              </div>

              {/* Headline */}
              <h2
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: 'inherit',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                }}
              >
                {card.headline}
              </h2>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: card.id === 'agent' ? 'rgba(231, 65, 65, 0.25)' : 'rgba(13, 11, 8, 0.15)',
                  flexShrink: 0,
                }}
              />

              {/* Body */}
              <p
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: 'rgba(13, 11, 8, 0.7)',
                  margin: 0,
                }}
              >
                {card.body}
              </p>

              {/* Feature list */}
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {card.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: card.id === 'agent' ? '#C0392B' : 'rgba(13, 11, 8, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: card.id === 'agent' ? '#E74141' : '#0D0B08', fontSize: 12 }}>—</span> {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <RoleCardCTA label={card.cta.label} href={card.cta.href} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}