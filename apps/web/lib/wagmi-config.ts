import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import type { Config } from "wagmi";

export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder_build_id";

let _config: Config | null = null;

export function getWagmiConfig(): Config {
  if (!_config) {
    _config = getDefaultConfig({
      appName: "AI Treasury Council",
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [baseSepolia],
      ssr: true,
    });
  }
  return _config;
}
