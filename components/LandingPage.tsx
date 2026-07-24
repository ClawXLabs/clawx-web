import { useCallback, useState } from 'react';
import Navbar from './landing/Navbar';
import HeroSection from './landing/HeroSection';
import AssetMarquee from './landing/AssetMarquee';
import RoleCards from './landing/RoleCards';
import TimelineSection from './landing/TimelineSection';
import Footer from './landing/Footer';
import AddWalletModal, { AddWalletStatus } from './ui/AddWalletModal';

const APP_API_BASE =
  process.env.NEXT_PUBLIC_APP_API_URL?.replace(/\/$/, '') || 'https://app.clawxlab.xyz';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clawxlab.xyz';

interface LandingPageProps {
  onConnectWallet: () => Promise<string | null>;
  account: string | null;
}

export default function LandingPage({ onConnectWallet, account }: LandingPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<AddWalletStatus>('idle');
  const [wallet, setWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const openModal = useCallback(() => {
    setStatus('idle');
    setError(null);
    setCreated(false);
    setWallet(account);
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
      body: JSON.stringify({ wallet: address }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Failed to register wallet (${res.status})`);
    }
    setWallet(data.wallet || address);
    setCreated(Boolean(data.created));
    setStatus('success');
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

  return (
    <div
      className="np-root"
      style={{ background: '#FAF8F3', minHeight: '100vh' }}
    >
      <Navbar account={account} onConnect={onConnectWallet} onAddWalletClick={openModal} />

      <main>
        <HeroSection account={account} onConnect={onConnectWallet} onAddWalletClick={openModal} />
        <AssetMarquee />
        <RoleCards />
        <TimelineSection />
      </main>

      <Footer account={account} onConnect={onConnectWallet} />

      <AddWalletModal
        isOpen={isModalOpen}
        onClose={closeModal}
        status={status}
        wallet={wallet}
        error={error}
        created={created}
        onAddWallet={handleAddWallet}
        appUrl={APP_URL}
      />
    </div>
  );
}
