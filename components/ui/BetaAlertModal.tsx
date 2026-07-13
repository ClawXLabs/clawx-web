import React from 'react';

interface BetaAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BetaAlertModal({ isOpen, onClose }: BetaAlertModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(13, 11, 8, 0.5)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FAF8F3',
          border: '3px solid #0D0B08',
          maxWidth: '500px',
          width: '100%',
          position: 'relative',
          padding: '32px 24px',
          boxShadow: '8px 8px 0px 0px #0D0B08',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close "X" Button in top-right */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0D0B08',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#C0392B'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#0D0B08'; }}
        >
          ✕
        </button>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '11px',
              fontWeight: 700,
              color: '#C0392B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            ◆ Private Beta Active
          </span>

          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '22px',
              fontWeight: 900,
              color: '#0D0B08',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Access Restricted
          </h2>

          <div
            style={{
              height: '1px',
              background: 'rgba(13, 11, 8, 0.15)',
              margin: '4px 0',
            }}
          />

          <p
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#3A3530',
              margin: 0,
            }}
          >
            Access is currently restricted to approved pilot addresses. Address validation is performed automatically upon connection.
          </p>

          <button
            onClick={onClose}
            style={{
              alignSelf: 'flex-start',
              background: '#0D0B08',
              color: '#FAF8F3',
              border: 'none',
              padding: '10px 24px',
              fontFamily: '"Courier New", monospace',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#C0392B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#0D0B08'; }}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
