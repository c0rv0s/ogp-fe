import { ConnectButton } from "@rainbow-me/rainbowkit";
import { constants, utils } from "ethers";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  goerli,
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { abi, contractAddress, mintPrice, isTest } from "../src/contract";
import styles from "../styles/Home.module.css";
import JSConfetti from "js-confetti";

const Home: NextPage = () => {
  const [amount, setAmount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const { address } = useAccount();
  const { chain } = useNetwork();
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

  // etherscan url
  const [etherscsanUrl, setEtherscan] = useState("");
  useEffect(() => {
    setTotalPrice(Number(mintPrice(chain?.name ?? goerli.name)) * amount);
    setEtherscan(
      chain?.blockExplorers?.default.url +
        "/address/" +
        contractAddress(chain?.name)
    );
  }, [amount, chain]);

  // tx completed
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    const _async = async () => {
      if (isSuccess) {
        await data?.wait();
        setCompleted(true);
        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti();
      }
    };
    _async();
  }, [isSuccess]);

  return (
    <div className={styles.container}>
      <Head>
        <title>OG Potheads</title>
        <meta
          content="Join the OG Potheads community and mint an OG Pothead NFT."
          name="OG Potheads"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>OG Potheads</h1>

        <p className={styles.description}>
          OG Potheads is a community of OG Potheads who are OG Potheads.
          <br />
          Mint one of our OG Pothead NFTs and become an OG Pothead.
        </p>

        <div className={styles.grid}>
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
            disabled={!write || isLoading || chain?.id != 5}
            onClick={() => write?.()}
          >
            Mint
          </button>
          {isTest && chain && chain?.id !== goerli.id && (
            <p className={styles.error}>Please switch network to Goerli</p>
          )}
          {isSuccess ? (
            completed ? (
              <p>Minted!</p>
            ) : (
              <p>Minting...</p>
            )
          ) : isError ? (
            <p className={styles.error}>Error: Something went wrong</p>
          ) : null}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="http://ogpothead.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          OG Pothead
        </a>
        |
        <a href={etherscsanUrl} rel="noopener noreferrer" target="_blank">
          Etherscan
        </a>
        |
        <a
          href={
            isTest
              ? "https://testnets.opensea.io/collection/og-potheads-1"
              : "https://opensea.io/collection/og-potheads"
          }
          rel="noopener noreferrer"
          target="_blank"
        >
          OpenSea
        </a>
      </footer>
    </div>
  );
};

export default Home;
