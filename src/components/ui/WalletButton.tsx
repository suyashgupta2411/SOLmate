import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";

export default function WalletButton() {
  // Phantom may block localhost or unknown domains in dev
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <WalletMultiButton className="!bg-gradient-to-r !from-accent-600 !to-primary-600 hover:!from-accent-700 hover:!to-primary-700 !text-white !font-medium !rounded-lg !px-6 !py-3 !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />
      {isDev && (
        <div className="mt-2 text-yellow-400 text-xs max-w-xs">
          If Phantom blocks wallet connection, use HTTPS or a trusted domain, or
          try Solflare for development.
        </div>
      )}
    </motion.div>
  );
}
