import { ConnectionContext } from "@/pages/_app";
import { useContext, useEffect, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";

import NFTMarketItem from "./NFTMarketItem";
import { BigNumber } from "ethers";
import BounceLoader from "react-spinners/BounceLoader";

export default function Market() {
  const { connected, address, contract } = useContext(ConnectionContext);

  const [refresh, setRefresh] = useState(1);

  const marketFetcher = async () => {
    if (!contract) {
      throw new Error("Not connected");
    }
    setMarketLoading(true);
    try {
      const data = await contract.getNFTsListedForSale();
      setMarketData(data);
    } catch (e) {
      setMarketError(e);
      console.log(e);
    }
    setMarketLoading(false);
  };

  useEffect(() => {
    if (connected && contract) {
      marketFetcher();
    }
  }, [address, refresh]);

  const [marketData, setMarketData] = useState<BigNumber[]>([]);
  const [marketError, setMarketError] = useState<any>(null);
  const [marketLoading, setMarketLoading] = useState(false);

  if (marketLoading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center mb-10">
        <BounceLoader color="#60a5fa" />
        <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (marketError) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center mb-10">
        <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
          <p className="text-center">
            Error occurred while fetching... Please refresh!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center mb-10">
      <div className="mb-4 text-xl flex space-x-3">
        <p className="font-semibold">NFTs listed in the Market</p>
        <button
          onClick={() => setRefresh(refresh + 1)}
          className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none"
        >
          <RiRefreshLine className="text-white" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mx-5">
        {marketData?.map((nft) => (
          <NFTMarketItem key={nft.toNumber()} tokenID={nft} />
        ))}
      </div>
    </div>
  );
}
