import type { NextPage } from "next";
import { useNetwork } from "wagmi";
import Babies from "../src/Babies";
import Mainnet from "../src/Mainnet";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const { chain } = useNetwork();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (chain) {
      setLoaded(true);
    }
  }, [chain]);

  if (loaded && chain?.name === "zkSync") return <Babies />;
  else if (loaded) return <Mainnet />;
  else return null;
};

export default Home;
