import type { NextApiRequest, NextApiResponse } from 'next';
import { getOnchainContractTxCount } from '../../utils/onchainContractTxs';

type StatsPayload = {
  ok: boolean;
  stats: {
    enrolledWallets: number;
    totalTransactions: number;
    totalVolumeTusdc: number;
    onchainContractTxs?: number;
  };
  meta?: {
    onchainSource?: string;
    onchainLastBlock?: number;
    onchainLastHash?: string | null;
    upstreamOk?: boolean;
  };
  error?: string;
};

const FALLBACK = {
  enrolledWallets: 18,
  totalTransactions: 66738,
  totalVolumeTusdc: 112915,
};

const APP_API_BASE =
  process.env.NEXT_PUBLIC_APP_API_URL?.replace(/\/$/, '') ||
  process.env.APP_API_URL?.replace(/\/$/, '') ||
  'https://app.clawxlab.xyz';

async function tryUpstreamStats(): Promise<{
  ok: boolean;
  enrolledWallets?: number;
  totalVolumeTusdc?: number;
  totalTransactions?: number;
}> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(`${APP_API_BASE}/api/v1/stats`, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    if (!data?.ok || !data?.stats) return { ok: false };
    return {
      ok: true,
      enrolledWallets: Number(data.stats.enrolledWallets) || undefined,
      totalVolumeTusdc: Number(data.stats.totalVolumeTusdc) || undefined,
      // Prefer on-chain below; keep upstream only as soft fallback if Snowtrace fails.
      totalTransactions: Number(data.stats.totalTransactions) || undefined,
    };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsPayload>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, stats: FALLBACK, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const [upstream, onchain] = await Promise.all([
    tryUpstreamStats(),
    getOnchainContractTxCount().catch(() => null),
  ]);

  const totalTransactions =
    onchain?.totalTransactions ??
    upstream.totalTransactions ??
    FALLBACK.totalTransactions;

  const stats = {
    enrolledWallets: upstream.enrolledWallets ?? FALLBACK.enrolledWallets,
    totalTransactions,
    totalVolumeTusdc: upstream.totalVolumeTusdc ?? FALLBACK.totalVolumeTusdc,
    onchainContractTxs: onchain?.totalTransactions,
  };

  return res.status(200).json({
    ok: true,
    stats,
    meta: {
      onchainSource: onchain?.source,
      onchainLastBlock: onchain?.lastBlock,
      onchainLastHash: onchain?.lastHash ?? null,
      upstreamOk: upstream.ok,
    },
  });
}
