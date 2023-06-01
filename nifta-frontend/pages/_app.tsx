import Layout from "@/components/Layout";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { createContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import NiftaArtifact from "../contracts/Nifta.json";
import contractAddresses from "../contracts/contract-address.json";
import { ethers } from "ethers";
import { Nifta } from "@/contracts/typechain-types";

declare global {
  interface Window {
    ethereum: any;
  }
}

export type ConnectionContextType = {
  connected: boolean;
  setConnected: (connected: boolean) => void;

  address: string;
  setAddress: (address: string) => void;

  contract?: Nifta;
};

export const ConnectionContext = createContext<ConnectionContextType>(
  {} as ConnectionContextType
);

const contract = () => {
  const { ethereum } = window;
  const contractAddress = contractAddresses.Nifta;
  const contractABI = NiftaArtifact.abi;
  const contract = new ethereum.Contract(contractABI, contractAddress);
  return contract;
};
export default function App({ Component, pageProps }: AppProps) {
  const [connected, setConnected] = useState(false);
  const [address, setAddressValue] = useState("");
  const [contract, setContract] = useState<undefined | Nifta>(undefined);

  const setAddress = (address: string) => {
    setAddressValue(address);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const contract = new ethers.Contract(
      contractAddresses.Nifta,
      NiftaArtifact.abi,
      signer
    ) as Nifta;
    setContract(contract);
  };

  useEffect(() => {
    // Check if MetaMask is installed
    // MetaMask injects the global API into window.ethereum
    if (window.ethereum) {
      // window.ethereum
      //   .request({
      //     method: "wallet_switchEthereumChain",
      //     params: [{ chainId: "0x169" }], // chainId must be in hexadecimal numbers
      //   })
      //   .catch((error: any) => {
      //     if (error.code === 4902) {
      //       window.ethereum
      //         .request({
      //           method: "wallet_addEthereumChain",
      //           params: [
      //             {
      //               chainId: "0x169",
      //               rpcUrl: "https://eth-rpc-api.thetatoken.org/rpc",
      //             },
      //           ],
      //         })
      //         .catch((addError: any) => {
      //           console.error(addError);
      //         });
      //     } else {
      //       console.error(error);
      //     }
      //   });

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setConnected(false);
        } else {
          setConnected(true);
          setAddress(accounts[0]);
        }
      });
    } else {
      // if no window.ethereum then MetaMask is not installed
      alert(
        "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
      );
    }
  }, []);

  const connectionContextData: ConnectionContextType = {
    connected,
    setConnected,
    address,
    setAddress,
    contract,
  };

  return (
    <>
      <Head>
        <title>Nifta</title>
        <meta
          name="AI generated NFTs Marketplace"
          content="AI generated NFTs on the Theta blockchain"
        />
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <ToastContainer />
      <ConnectionContext.Provider value={connectionContextData}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ConnectionContext.Provider>
    </>
  );
}
