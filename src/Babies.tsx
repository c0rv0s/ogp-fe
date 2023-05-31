import { ConnectButton } from "@rainbow-me/rainbowkit";
import { constants, utils } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { zkAbi as abi, gateway } from "./contract";
import styles from "../styles/Home.module.css";
import JSConfetti from "js-confetti";
import Image from "next/image";
import { useBalance } from "wagmi";

const mintPrice = "0.0042";
const metadata = "bafybeicpc67b6lrbjiileqxgl3p25mdoinj4uscopdlwja5tprqcy566dq";

const Babies = ({ setCollection }: { setCollection: any }) => {
  const [amount, setAmount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });
  const { chain } = useNetwork();

  const contractAddress =
    chain?.name === "zkSync"
      ? "0x9b7193Fe11c9dC04B2363a84A70Bd5e4F68E1FEB"
      : "0xbeE7aB427505eFF93409f96942aE9Fa5a25a0555";

  const { data: supply, refetch } = useContractRead({
    address: contractAddress,
    abi,
    functionName: "totalSupply",
  });

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi,
    functionName: "mint",
    args: [amount],
    overrides: {
      value: utils.parseEther("0.0042").mul(amount),
    },
  });
  const { isLoading, isSuccess, isError, write, data } =
    useContractWrite(config);

  // total price
  useEffect(() => {
    setTotalPrice(Number(mintPrice) * amount);
  }, [amount, chain]);

  // tx completed
  const [completed, setCompleted] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  useEffect(() => {
    const _async = async () => {
      if (isSuccess) {
        await data?.wait();
        const tokenId = Number(supply) + 1302;
        setCompleted(true);
        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti();
        fetch(`${gateway}/${metadata}/${tokenId}.json`)
          .then((res) => res.json())
          .then((data) => {
            setTokenData(data);
          });
        await refetch();
      }
    };
    _async();
  }, [isSuccess]);

  // for hydration
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>OG Pothead</title>
        <meta content="Join the OG Potheads community" name="OG Potheads" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ marginTop: "36px" }}>
          <ConnectButton />
        </div>
      </div>

      {chain?.name !== "zkSync" && (
        <div
          className={styles.switcher}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 0 -72px 0",
          }}
        >
          <button
            className="switch-button"
            onClick={() => setCollection("original")}
          >
            View OGs
          </button>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.grid}>
          <h1 className={styles.title}>Baby OG Potheads</h1>

          <p className={styles.description}>
            <i>Indulge Sustainably</i>
          </p>
          <p style={{ marginTop: "-6px" }}>&#x2726;</p>
          <h4>Enter an amount</h4>
          <input
            type="number"
            placeholder="5"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            max={20}
          />
          <br />
          <p>
            Total Price: {totalPrice.toFixed(4)} {constants.EtherSymbol}
          </p>
          <button
            disabled={!write || isLoading}
            onClick={() => {
              setCompleted(false);
              setTokenData(null);
              write?.();
            }}
          >
            {Number(balance?.formatted) < totalPrice
              ? "Insufficent Funds"
              : "Mint"}
          </button>
          <p>{loaded ? supply?.toString() : "-" ?? "0"} / 4420 minted</p>
          {isSuccess ? (
            completed ? (
              <>
                <p>Minted!</p>
                {tokenData && (
                  <div>
                    <a
                      href={
                        "https://ogpotheads.4everland.link/ipfs/" +
                        tokenData?.image.substring(7).replace("#", "%23")
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image
                        src={
                          "https://ogpotheads.4everland.link/ipfs/" +
                          tokenData?.image.substring(7).replace("#", "%23")
                        }
                        height={150}
                        width={150}
                      />
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p>Minting...</p>
            )
          ) : isError ? (
            <p className={styles.error}>Error: Something went wrong</p>
          ) : null}
        </div>
      </main>

      <footer className={styles.footer}>
        {loaded ? (
          <>
            <a
              href="http://ogpothead.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              OG Pothead
            </a>
            |
            <a
              href={
                chain?.name === "zkSync"
                  ? "https://explorer.zksync.io/address/0x9b7193Fe11c9dC04B2363a84A70Bd5e4F68E1FEB#transactions"
                  : `https://etherscan.io/address/${contractAddress}`
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              NFT
            </a>
            |
            <a
              href="https://etherscan.io/token/0xc0baacb079095f6dbdeac6896ce946107cf3de80"
              rel="noopener noreferrer"
              target="_blank"
            >
              OGPH Token
            </a>
            |
            <a
              href={
                chain?.name === "zkSync"
                  ? ""
                  : "https://opensea.io/collection/baby-og-potheads"
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              Marketplace {chain?.name === "zkSync" && "(coming soon)"}
            </a>
          </>
        ) : (
          <>...</>
        )}
      </footer>
    </div>
  );
};

export default Babies;
