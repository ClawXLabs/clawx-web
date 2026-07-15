import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrabLogo from '../svgs/CrabLogo';

interface NavbarProps {
  account?: string | null;
  onConnect?: () => void;
  onLaunchClick: () => void;
}

export default function Navbar({ onLaunchClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: scrolled
          ? 'rgba(250, 248, 243, 0.82)'
          : 'rgba(250, 248, 243, 0.95)',
        backdropFilter: scrolled ? 'blur(16px) saturate(1.4)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(13, 11, 8, 0.1)'
          : '1px solid transparent',
        transition: 'background 0.35s ease, border-bottom 0.35s ease, backdrop-filter 0.35s ease',
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
        }}
      >
        <CrabLogo
          width={32}
          height={33}
          style={{ display: 'block' }}
        />
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: '#0D0B08',
            lineHeight: 1,
          }}
        >
          CLAW<span style={{ color: '#C0392B' }}>X</span>
        </span>
      </Link>

      {/* Right: Go to App Button */}
      <button
        onClick={onLaunchClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#E74141',
          color: '#FAF8F3',
          border: '1.5px solid #E74141',
          borderRadius: 24,
          padding: '8px 20px',
          fontFamily: '"Courier New", monospace',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#B03030';
          e.currentTarget.style.borderColor = '#B03030';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#E74141';
          e.currentTarget.style.borderColor = '#E74141';
        }}
      >
        Go to App
      </button>
    </nav>
  );
}
