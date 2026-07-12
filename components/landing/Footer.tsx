import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0D0B08',
        borderTop: '3px solid #0D0B08',
        padding: '24px 32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#FAF8F3',
            }}
          >
            CLAW<span style={{ color: '#C0392B' }}>X</span>
          </span>
          <span
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(250,248,243,0.3)',
              marginLeft: 12,
            }}
          >
            v2.0.0 · Avalanche Fuji Testnet
          </span>
        </div>

        <span
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(250,248,243,0.2)',
          }}
        >
          © 2026 CLAWX · ALL ROUNDS SIMULATED · FUJI TESTNET
        </span>
      </div>
    </footer>
  );
}
