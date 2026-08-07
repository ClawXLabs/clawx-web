/**
 * Count normal txs sent to the Fuji market contract via Snowtrace.
 * Full history is slow (10k/page cap), so we seed a verified baseline and
 * only count blocks after the seed when refreshing.
 */

const SNOWTRACE_API =
  process.env.SNOWTRACE_API_URL || 'https://api-testnet.snowtrace.io/api';

const DEFAULT_CONTRACT =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x378FBf873fF77a44ae9aac0B5427804A9Ec1Bf1d';

/** Verified full count through SEED_LAST_BLOCK (May 14 – Jul 31, 2026). */
const SEED_COUNT = 66738;
const SEED_LAST_BLOCK = 57481926;

type TxRow = { blockNumber?: string; hash?: string; timeStamp?: string };

type CacheState = {
  count: number;
  lastBlock: number;
  lastHash: string | null;
  updatedAt: number;
  source: 'seed' | 'snowtrace';
};

let memoryCache: CacheState | null = null;
let inflight: Promise<CacheState> | null = null;

const CACHE_TTL_MS = 10 * 60 * 1000;

function contractAddress(): string {
  return String(DEFAULT_CONTRACT).toLowerCase();
}

async function snowtraceTxlist(params: {
  startblock: number | string;
  endblock: number | string;
  page?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
}): Promise<TxRow[]> {
  const u = new URL(SNOWTRACE_API);
  u.searchParams.set('module', 'account');
  u.searchParams.set('action', 'txlist');
  u.searchParams.set('address', contractAddress());
  u.searchParams.set('startblock', String(params.startblock));
  u.searchParams.set('endblock', String(params.endblock));
  u.searchParams.set('page', String(params.page ?? 1));
  u.searchParams.set('offset', String(params.offset ?? 1000));
  u.searchParams.set('sort', params.sort ?? 'asc');
  const key = process.env.AVALANCHE_API_KEY || process.env.SNOWTRACE_API_KEY;
  if (key) u.searchParams.set('apikey', key);

  const res = await fetch(u.toString(), { headers: { accept: 'application/json' } });
  const json = (await res.json()) as { status?: string; result?: TxRow[] | string };
  if (json.status !== '1' || !Array.isArray(json.result)) return [];
  return json.result;
}

async function latestTx(): Promise<TxRow | null> {
  const rows = await snowtraceTxlist({
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 1,
    sort: 'desc',
  });
  return rows[0] || null;
}

/** Count txs in [start, end] using adaptive block windows (avoids 10k page cap). */
async function countInRange(start: number, end: number): Promise<number> {
  if (start > end) return 0;
  let total = 0;
  let from = start;
  let window = 50_000;

  while (from <= end) {
    let to = Math.min(from + window - 1, end);
    let page = 1;
    let windowCount = 0;
    let hitCap = false;

    for (;;) {
      const rows = await snowtraceTxlist({
        startblock: from,
        endblock: to,
        page,
        offset: 1000,
        sort: 'asc',
      });
      windowCount += rows.length;
      if (rows.length < 1000) break;
      if (page >= 10) {
        hitCap = true;
        break;
      }
      page += 1;
    }

    if (hitCap) {
      window = Math.max(1_000, Math.floor(window / 2));
      continue;
    }

    total += windowCount;
    from = to + 1;
    if (windowCount < 2_000 && window < 200_000) {
      window = Math.min(200_000, window * 2);
    }
  }

  return total;
}

function seedState(): CacheState {
  return {
    count: SEED_COUNT,
    lastBlock: SEED_LAST_BLOCK,
    lastHash: '0x209353a71ef20b69e24d8768d94b229291d3ba2a8a6a315c3be4c2cad9170959',
    updatedAt: Date.now(),
    source: 'seed',
  };
}

async function refreshCount(): Promise<CacheState> {
  const base = memoryCache || seedState();
  const last = await latestTx();
  if (!last?.blockNumber) {
    return { ...base, updatedAt: Date.now() };
  }

  const latestBlock = Number(last.blockNumber);
  if (!Number.isFinite(latestBlock)) {
    return { ...base, updatedAt: Date.now() };
  }

  if (latestBlock <= base.lastBlock) {
    return {
      count: base.count,
      lastBlock: latestBlock,
      lastHash: last.hash || base.lastHash,
      updatedAt: Date.now(),
      source: 'snowtrace',
    };
  }

  const delta = await countInRange(base.lastBlock + 1, latestBlock);
  return {
    count: base.count + delta,
    lastBlock: latestBlock,
    lastHash: last.hash || null,
    updatedAt: Date.now(),
    source: 'snowtrace',
  };
}

/**
 * Returns cached on-chain tx count. Refreshes at most every CACHE_TTL_MS.
 * Safe for serverless: uses in-memory cache + verified seed baseline.
 */
export async function getOnchainContractTxCount(): Promise<{
  totalTransactions: number;
  lastBlock: number;
  lastHash: string | null;
  source: string;
  cached: boolean;
}> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.updatedAt < CACHE_TTL_MS) {
    return {
      totalTransactions: memoryCache.count,
      lastBlock: memoryCache.lastBlock,
      lastHash: memoryCache.lastHash,
      source: memoryCache.source,
      cached: true,
    };
  }

  if (!inflight) {
    inflight = refreshCount()
      .then((state) => {
        memoryCache = state;
        return state;
      })
      .catch((err) => {
        console.error('[onchainContractTxs]', err);
        if (!memoryCache) memoryCache = seedState();
        return memoryCache;
      })
      .finally(() => {
        inflight = null;
      });
  }

  const state = await inflight;
  return {
    totalTransactions: state.count,
    lastBlock: state.lastBlock,
    lastHash: state.lastHash,
    source: state.source,
    cached: false,
  };
}

export const ONCHAIN_TX_SEED = { count: SEED_COUNT, lastBlock: SEED_LAST_BLOCK };
