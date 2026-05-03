import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { fallback, http } from "viem";
import type { Config } from "wagmi";

export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder_build_id";

// Multi-RPC fallback dla Base Sepolia (defensive - public RPCs sporadycznie 503/timeout
// pod heavy load demo). viem `fallback` = automatic failover po retry/timeout.
const BASE_SEPOLIA_RPC_URLS: string[] = [
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
  "https://sepolia.base.org",
  "https://base-sepolia-rpc.publicnode.com",
  "https://base-sepolia.gateway.tenderly.co",
  "https://1rpc.io/base-sepolia",
].filter((url): url is string => Boolean(url));

let _config: Config | null = null;

export function getWagmiConfig(): Config {
  if (!_config) {
    _config = getDefaultConfig({
      appName: "AI Treasury Council",
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: fallback(
          BASE_SEPOLIA_RPC_URLS.map((url) =>
            http(url, { timeout: 8_000, retryCount: 2, retryDelay: 200 }),
          ),
          { rank: false, retryCount: 0 },
        ),
      },
      ssr: true,
    });
  }
  return _config;
}
