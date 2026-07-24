import React, { useState } from 'react';

export type AddWalletStatus = 'idle' | 'connecting' | 'saving' | 'success' | 'error';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: AddWalletStatus;
  wallet: string | null;
  error: string | null;
  created: boolean;
  onAddWallet: () => void;
  appUrl?: string;
}

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function AddWalletModal({
  isOpen,
  onClose,
  status,
  wallet,
  error,
  created,
  onAddWallet,
  appUrl = 'https://app.clawxlab.xyz',
}: AddWalletModalProps) {
  const [hovered, setHovered] = useState(false);

  if (!isOpen) return null;

  const busy = status === 'connecting' || status === 'saving';
  const done = status === 'success';

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
      onClick={busy ? undefined : onClose}
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
        <button
          onClick={onClose}
          disabled={busy}
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
            cursor: busy ? 'not-allowed' : 'pointer',
            padding: '4px 8px',
            opacity: busy ? 0.4 : 1,
          }}
        >
          ✕
        </button>

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
            ◆ Private Beta Access
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
            {done ? 'Wallet Added' : 'Add Your Wallet'}
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
            {done
              ? created
                ? `You're on the list. Connect ${wallet ? shortAddress(wallet) : 'your wallet'} on the app to start trading.`
                : `This wallet is already registered. Open the app and connect ${wallet ? shortAddress(wallet) : 'it'} to continue.`
              : 'Connect MetaMask to register your address for app.clawxlab.xyz access.'}
          </p>

          {wallet && !done && (
            <p
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '12px',
                color: '#0D0B08',
                margin: 0,
                wordBreak: 'break-all',
              }}
            >
              {wallet}
            </p>
          )}

          {error && (
            <p
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '13px',
                color: '#C0392B',
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
            {done ? (
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: hovered ? '#B03030' : '#E74141',
                  color: '#FAF8F3',
                  border: 'none',
                  padding: '10px 24px',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                Open App ↗
              </a>
            ) : (
              <button
                onClick={onAddWallet}
                disabled={busy}
                style={{
                  alignSelf: 'flex-start',
                  background: busy ? '#666' : '#0D0B08',
                  color: '#FAF8F3',
                  border: 'none',
                  padding: '10px 24px',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: busy ? 'wait' : 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {status === 'connecting'
                  ? 'Connecting…'
                  : status === 'saving'
                    ? 'Saving…'
                    : 'Connect & Add Wallet'}
              </button>
            )}

            <button
              onClick={onClose}
              disabled={busy}
              style={{
                background: 'transparent',
                color: '#0D0B08',
                border: '1.5px solid #0D0B08',
                padding: '10px 20px',
                fontFamily: '"Courier New", monospace',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.4 : 1,
              }}
            >
              {done ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
