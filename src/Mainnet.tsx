import { ConnectButton } from "@rainbow-me/rainbowkit";
import { constants, utils } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  goerli,
  mainnet,
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { abi, contractAddress, gateway, metadata, mintPrice } from "./contract";
import styles from "../styles/Home.module.css";
import JSConfetti from "js-confetti";
import AdminPanel from "./AdminPanel";
import Image from "next/image";
import { useBalance } from "wagmi";

const Mainnet = ({ setCollection }: { setCollection: any }) => {
  const { chain } = useNetwork();
  const [amount, setAmount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  const { data: supply, refetch } = useContractRead({
    address: contractAddress(chain?.name),
    abi,
    functionName: "supply",
    args: [0],
  });

  const { config } = usePrepareContractWrite({
    address: contractAddress(chain?.name),
    abi,
    functionName: "mint",
    args: [address, amount],
    overrides: {
      value: utils.parseEther(mintPrice(chain?.name)).mul(amount),
    },
  });
  const { isLoading, isSuccess, isError, write, data } =
    useContractWrite(config);

  // total price
  useEffect(() => {
    setTotalPrice(Number(mintPrice(chain?.name)) * amount);
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
        fetch(`${gateway}/${metadata(tokenId)}/${tokenId}.json`)
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

  const airdropAmount = (amount: number) => amount * 10000000;

  return (
    <div className={styles.container}>
      <Head>
        <title>OG Potheads</title>
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

      <div
        className={styles.switcher}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 0 -72px 0",
        }}
      >
        <button onClick={() => setCollection("babies")}>
          Now Minting - Babies
        </button>
      </div>

      <main className={styles.main}>
        <div className={styles.grid}>
          <h1 className={styles.title}>OG Potheads</h1>

          <p className={styles.description}>
            <i>Drink your worth</i>
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
            Total Price: {totalPrice.toFixed(2)} {constants.EtherSymbol}
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
          <p style={{ color: "green" }}>
            Bonus - {airdropAmount(amount).toLocaleString()} $OGPH 🍀
          </p>
          <p>{loaded ? supply?.toString() : "-" ?? "0"} / 3118 minted</p>
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
                    <h4>{tokenData.name}</h4>
                    <a
                      href={
                        !chain || chain?.name === mainnet.name
                          ? `https://opensea.io/assets/goerli/${contractAddress(
                              mainnet.name
                            )}/${Number(supply) + 1301}`
                          : `https://testnets.opensea.io/assets/goerli/${contractAddress(
                              goerli.name
                            )}/${Number(supply) + 1301}`
                      }
                      rel="noopener noreferrer"
                      target="_blank"
                      style={{ textDecoration: "underline" }}
                    >
                      View on OpenSea
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

        <AdminPanel />
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
                !chain || chain?.name === mainnet.name
                  ? `https://etherscan.io/address/${contractAddress(
                      mainnet.name
                    )}`
                  : `https://goerli.etherscan.io/address/${contractAddress(
                      goerli.name
                    )}`
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
                !chain || chain?.name === mainnet.name
                  ? "https://opensea.io/collection/og-potheads"
                  : "https://testnets.opensea.io/collection/og-potheads-7"
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              OpenSea
            </a>
          </>
        ) : (
          <>...</>
        )}
      </footer>
    </div>
  );
};

export default Mainnet;
