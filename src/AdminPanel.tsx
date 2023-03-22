import type { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  goerli,
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { abi, contractAddress, metadata } from "../src/contract";
import styles from "../styles/Home.module.css";
import Image from "next/image";

const AdminPanel: NextPage = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [tokenId, setTokenId] = useState(0);
  const [to, setTo] = useState("");

  const { data: isAdmin } = useContractRead({
    address: contractAddress(chain?.name),
    abi,
    functionName: "admins",
    args: [address],
  });

  const { config } = usePrepareContractWrite({
    address: contractAddress(chain?.name),
    abi,
    functionName: "mintVaulted",
    args: [to, tokenId],
  });
  const { isLoading, isSuccess, isError, write, data } =
    useContractWrite(config);

  const [tokenData, setTokenData] = useState<any>(null);
  const onChangeTokenId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 981) {
      setTokenId(value);
      fetch(`https://hashvalley.4everland.link/ipfs/${metadata}/${value}.json`)
        .then((res) => res.json())
        .then((data) => {
          setTokenData(data);
        });
    }
  };

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
    fetch(`https://hashvalley.4everland.link/ipfs/${metadata}/0.json`)
      .then((res) => res.json())
      .then((data) => {
        setTokenData(data);
      });
  }, []);

  if (!loaded || !isAdmin) return null;

  return (
    <div className={styles.container}>
      <br />
      <div className={styles.grid}>
        <h4>Mint Vaulted</h4>
        <label>Enter a token id (0-981):</label>
        <br />
        <input
          type="number"
          placeholder="5"
          value={tokenId}
          onChange={onChangeTokenId}
          min={0}
          max={981}
        />
        <br />
        <label>Enter an address to send to:</label>
        <br />
        <input
          placeholder="0x1234..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <br />
        {tokenData && (
          <div>
            <Image
              src={
                "https://hashvalley.4everland.link/ipfs/" +
                tokenData?.image.substring(7).replace("#", "%23")
              }
              height={150}
              width={150}
            />
            <h4>{tokenData.name}</h4>
          </div>
        )}
        <button disabled={!write || isLoading || !to} onClick={() => write?.()}>
          Mint
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
