import "@/styles/globals.css";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import {
  // arbitrum,
  avalanche,
  bsc,
  fantom,
  gnosis,
  mainnet,
  // optimism,
  polygon,
  base,
} from "wagmi/chains";

const chains = [
  mainnet,
  polygon,
  avalanche,
  // arbitrum,
  bsc,
  // optimism,
  gnosis,
  fantom,
  base,
];

// 1. Get projectID at https://cloud.walletconnect.com

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";

const metadata = {
  name: "Web3 Wallet Security",
  description: "Secure your Web3 wallets with Web3 Wallet Security",
  url: "https://walletconnect.com/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiConfig>
      ) : null}
    </>
  );
}
