import { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { WalletProvider } from '../contexts/WalletContext';
import Loading from '../components/Loading';
import '../styles/globals.css';

let initialLoadPlayed = false;

export default function App({ Component, pageProps }: AppProps) {
  const [showLoading, setShowLoading] = useState(!initialLoadPlayed);

  const handleLoadingComplete = () => {
    initialLoadPlayed = true;
    setShowLoading(false);
  };

  return (
    <WalletProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="icon"
          href="/favicon.svg"
        />
      </Head>
      <Component {...pageProps} />
      {showLoading && <Loading onComplete={handleLoadingComplete} />}
    </WalletProvider>
  );
}
