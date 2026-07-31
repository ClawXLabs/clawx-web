import { useCallback, useState } from 'react';
import Navbar from './landing/Navbar';
import HeroSection from './landing/HeroSection';
import AssetMarquee from './landing/AssetMarquee';
import RoleCards from './landing/RoleCards';
import TimelineSection from './landing/TimelineSection';
import Footer from './landing/Footer';
import AddWalletModal, { AddWalletStatus } from './ui/AddWalletModal';
import { persistConnectedWallet } from '../utils/walletSession';

const APP_API_BASE =
  process.env.NEXT_PUBLIC_APP_API_URL?.replace(/\/$/, '') || 'https://app.clawxlab.xyz';

interface LandingPageProps {
  onConnectWallet: () => Promise<string | null>;
  onDisconnectWallet: () => void;
  account: string | null;
}

export default function LandingPage({
  onConnectWallet,
  onDisconnectWallet,
  account,
}: LandingPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<AddWalletStatus>('idle');
  const [wallet, setWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const openModal = useCallback(() => {
    setError(null);
    setWallet(account);
    if (account) {
      setStatus('success');
      setCreated(false);
    } else {
      setStatus('idle');
      setCreated(false);
    }
    setIsModalOpen(true);
  }, [account]);

  const closeModal = useCallback(() => {
    if (status === 'connecting' || status === 'saving') return;
    setIsModalOpen(false);
  }, [status]);

  const registerWallet = useCallback(async (address: string) => {
    setStatus('saving');
    setError(null);
    const res = await fetch(`${APP_API_BASE}/api/v1/wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: address,
        source: 'landing',
        referrer:
          typeof window !== 'undefined'
            ? window.location.href
            : 'https://clawxlab.xyz',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Failed to register wallet (${res.status})`);
    }
    const stored = data.wallet || address;
    setWallet(stored);
    setCreated(Boolean(data.created));
    persistConnectedWallet(stored);
    setStatus('success');
    setStatsRefreshKey((n) => n + 1);
  }, []);

  const handleAddWallet = useCallback(async () => {
    setError(null);
    try {
      let address = account;
      if (!address) {
        setStatus('connecting');
        address = await onConnectWallet();
        if (!address) {
          setStatus('idle');
          return;
        }
      }
      setWallet(address);
      await registerWallet(address);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setStatus('error');
    }
  }, [account, onConnectWallet, registerWallet]);

  const handleDisconnect = useCallback(() => {
    onDisconnectWallet();
    setWallet(null);
    setStatus('idle');
    setCreated(false);
    setError(null);
  }, [onDisconnectWallet]);

  return (
    <div
      className="np-root"
      style={{ background: '#FAF8F3', minHeight: '100vh' }}
    >
      <Navbar
        account={account}
        onConnect={onConnectWallet}
        onDisconnect={handleDisconnect}
        onAddWalletClick={openModal}
      />

      <main>
        <HeroSection
          account={account}
          onConnect={onConnectWallet}
          onAddWalletClick={openModal}
          statsRefreshKey={statsRefreshKey}
        />
        <AssetMarquee />
        <RoleCards onAddWalletClick={openModal} />
        <TimelineSection />
      </main>

      <Footer account={account} onConnect={onConnectWallet} />

      <AddWalletModal
        isOpen={isModalOpen}
        onClose={closeModal}
        status={status}
        wallet={wallet || account}
        error={error}
        created={created}
        onAddWallet={handleAddWallet}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}
