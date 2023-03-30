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
import { abi, contractAddress, gateway, metadata } from "../src/contract";
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
  const { isLoading, write } = useContractWrite(config);

  const { config: withdrawConfig } = usePrepareContractWrite({
    address: contractAddress(chain?.name),
    abi,
    functionName: "withdrawAll",
    overrides: {
      value: 0,
    },
  });
  const { isLoading: isLoadingWithdraw, write: writeWithdraw } =
    useContractWrite(withdrawConfig);

  const [tokenData, setTokenData] = useState<any>(null);
  const onChangeTokenId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTokenId(value);
    fetch(`${gateway}/${metadata(value)}/${value}.json`)
      .then((res) => res.json())
      .then((data) => {
        setTokenData(data);
      });
  };

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
    fetch(`${gateway}/${metadata(0)}/0.json`)
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
        <p>Enter any token id (0-4419) to preview</p>
        <label>Enter a vaulted token id (0-1301) to mint:</label>
        <br />
        <input
          type="number"
          placeholder="5"
          value={tokenId}
          onChange={onChangeTokenId}
          min={0}
          max={4419}
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
            <a
              href={
                gateway +
                "/" +
                tokenData?.image.substring(7).replace("#", "%23")
              }
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src={
                  gateway +
                  "/" +
                  tokenData?.image.substring(7).replace("#", "%23")
                }
                height={150}
                width={150}
              />
            </a>
            <h4>{tokenData.name}</h4>
          </div>
        )}
        <button
          disabled={!write || isLoading || !to || Number(tokenId) > 1301}
          onClick={() => write?.()}
        >
          Mint
        </button>
        <br />
        <h4>Withdraw ETH from contract</h4>
        <button
          disabled={!writeWithdraw || isLoadingWithdraw}
          onClick={() => writeWithdraw?.()}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
