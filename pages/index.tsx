import type { NextPage } from "next";
import { useNetwork } from "wagmi";
import Babies from "../src/Babies";
import Mainnet from "../src/Mainnet";
import { useEffect, useState } from "react";
import NoWallet from "../src/NoWallet";

const Home: NextPage = () => {
  const { chain } = useNetwork();
  const [loaded, setLoaded] = useState(false);
  const [collection, setCollection] = useState<"original" | "babies">("original");

  useEffect(() => {
    if (chain) {
      setLoaded(true);
    }
  }, [chain]);

  if (loaded && (collection === "babies" || chain?.name === "zkSync")) return <Babies setCollection={setCollection} />;
  else if (loaded && collection === "original") return <Mainnet setCollection={setCollection} />;
  else return <NoWallet />;
};

export default Home;
