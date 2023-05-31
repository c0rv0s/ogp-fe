import type { NextPage } from "next";
import { useNetwork } from "wagmi";
import Babies from "../src/Babies";
import Mainnet from "../src/Mainnet";
import { useEffect, useState } from "react";
import NoWallet from "../src/NoWallet";

const Home: NextPage = () => {
  const { chain } = useNetwork();
  const [loaded, setLoaded] = useState(false);
  const [collection, setCollection] = useState<"original" | "babies">(
    "original"
  );

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) return <NoWallet />;

  if (collection === "babies" || chain?.name === "zkSync")
    return <Babies setCollection={setCollection} />;
  else if (collection === "original")
    return <Mainnet setCollection={setCollection} />;
  else return <Mainnet setCollection={setCollection} />;
};

export default Home;
