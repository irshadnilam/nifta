import { ConnectionContext } from "@/pages/_app";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  tokenID: BigNumber;
}
type ListedDetail = [boolean, BigNumber, string] & {
  isListed: boolean;
  price: BigNumber;
  lastOwner: string;
};
export default function NFTListed({ tokenID }: Props) {
  const { connected, address, contract } = useContext(ConnectionContext);
  const [purchaseProgress, setPurchaseProgress] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const [tokenMetaData, setTokenMetaData] = useState<any>(null);
  const [tokenOwnerAddress, settokenOwnerAddress] = useState<string | null>(
    null
  );
  const [tokenListedData, settokenListedData] = useState<ListedDetail | null>(
    null
  );
  const [tokenListedDataError, settokenListedDataError] = useState<any>(null);
  const [tokenListedDataLoading, settokenListedDataLoading] = useState(false);

  const sameOwner = useMemo(
    () =>
      tokenOwnerAddress &&
      address &&
      tokenOwnerAddress.toLowerCase() === address.toLowerCase(),
    [tokenOwnerAddress, address]
  );
  useEffect(() => {
    const tokenDetailsFetcher = async () => {
      if (!connected || !address || !contract) {
        return;
      }

      settokenListedDataLoading(true);
      const uri = await contract.tokenURI(tokenID);
      const url = `https://data.thetaedgestore.com/api/v2/data/${uri}`;

      try {
        const response = await axios.get(url);
        setTokenMetaData(response.data);

        const info = await contract.nftDetails(tokenID);
        settokenListedData(info);

        settokenOwnerAddress(info.lastOwner);
      } catch (error) {
        settokenListedDataError(error);
      } finally {
        settokenListedDataLoading(false);
      }
    };

    if (address) {
      tokenDetailsFetcher();
    }
  }, [address, tokenID, purchaseProgress]);

  if (!connected || !address || !contract) {
    return <></>;
  }

  if (tokenListedDataLoading || !tokenListedData || !tokenMetaData) {
    return (
      <div className="relative mb-4 w-full h-64 md:h-80 bg-gray-900 rounded-lg ">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (tokenListedDataError) {
    return (
      <div className="relative mb-4 w-full h-64 md:h-80 bg-gray-900 rounded-lg ">
        <p className="text-lg">An error occurred.</p>
      </div>
    );
  }

  const onBuy = () => {
    if (!connected || !address || !contract || !tokenListedData) {
      return;
    }

    setPurchaseProgress(true);
    const task = contract.purchase(tokenID, {
      value: tokenListedData.price,
      gasLimit: 5000000,
    });
    toast
      .promise(task, {
        pending: "Purchasing NFT...",
        success: "NFT purchased successfully!",
        error: "Transaction failed",
      })
      .then(() => {
        setPurchased(true);
      })
      .catch((err) => {
        console.log("NFT purchase error");
        console.log(err);
      })
      .finally(() => {
        setPurchaseProgress(false);
      });
  };

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <a href="#">
        <img
          className="p-8 rounded-t-lg"
          src={tokenMetaData.b64_json}
          alt="product image"
        />
      </a>
      <div className="px-5 pb-5">
        <a href="#">
          <h5 className="text-md font-semibold tracking-tight text-gray-900 dark:text-white">
            UMN #{tokenID.toNumber()}
          </h5>
        </a>

        <div className="my-2">
          {purchased && (
            <>
              <div className="text-white py-1">Purchase successful.</div>
              <div className="text-white py-1 bg-slate-600 rounded text-center my-1">
                You own this NFT
              </div>{" "}
            </>
          )}

          {tokenListedData && tokenListedData.isListed && !purchased && (
            <div className="text-white py-1">
              Listed for {ethers.utils.formatEther(tokenListedData.price)} TFUEL
            </div>
          )}

          {tokenOwnerAddress && sameOwner && !purchased && (
            <div className="text-white py-1 bg-slate-600 rounded text-center my-1">
              You own this NFT
            </div>
          )}
          {tokenListedData &&
            tokenListedData.isListed &&
            tokenOwnerAddress &&
            !sameOwner &&
            !purchased && (
              <button
                onClick={onBuy}
                disabled={purchaseProgress}
                className="text-white py-1 bg-blue-600 rounded text-center my-1 w-full"
              >
                {purchaseProgress ? "Loading..." : "Buy"}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
