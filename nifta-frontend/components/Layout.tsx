import React, { ReactNode, useContext } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { ConnectionContext } from "@/pages/_app";

type Props = {
  children?: ReactNode;
};

export default function Layout({ children }: Props) {
  const { connected, address, contract } = useContext(ConnectionContext);
  return (
    <div className="dark">
      <div className="min-h-screen justify-between bg-gray-100 text-black dark:bg-gray-900 dark:text-white py-1">
        <Header />
        {connected && address && contract ? (
          children
        ) : (
          <div className="flex flex-col gap-4 justify-center items-center my-10">
            <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4 space-y-1 bg-gray-800 rounded py-3 px-3">
              <p className="text-center text-lg">
                Please connect your wallet continue.
              </p>
              <p className="text-center text-sm">
                {" "}
                Refer{" "}
                <a className="text-gray-300 underline" href="https://docs.thetatoken.org/docs/web3-stack-metamask">
                  here
                </a>{" "}
                to setup Metamask for <a href="#" className="text-blue-400">Theta Testnet</a>
              </p>
            </div>
          </div>
        )}
        <div className="sticky top-[100vh]">
          <Footer />{" "}
        </div>
      </div>
    </div>
  );
}
