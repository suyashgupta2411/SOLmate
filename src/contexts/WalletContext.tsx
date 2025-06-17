import { ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

const wallets = [new SolflareWalletAdapter({ network })];

interface WalletContextProviderProps {
  children: ReactNode;
}

function WalletLocalStorageSync() {
  const { publicKey } = useWallet();
  useEffect(() => {
    if (publicKey) {
      localStorage.setItem("connectedWallet", publicKey.toString());
    }
  }, [publicKey]);
  return null;
}

export function WalletContextProvider({
  children,
}: WalletContextProviderProps) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletLocalStorageSync />
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
