import type { NextPage } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NoWallet: NextPage = () => {
  return (
    <div style={{ height: "100vh" }}>
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
    </div>
  );
};

export default NoWallet;
