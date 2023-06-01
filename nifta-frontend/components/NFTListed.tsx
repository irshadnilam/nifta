import { ConnectionContext } from "@/pages/_app";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";

interface Props {
  tokenID: BigNumber;
}

type ListedDetail = [boolean, BigNumber, string] & {
  isListed: boolean;
  price: BigNumber;
  lastOwner: string;
};
export default function NFTOwned({ tokenID }: Props) {
  const { connected, address, contract } = useContext(ConnectionContext);

  const [tokenMetaData, setTokenMetaData] = useState<any>(null);
  const [tokenListedData, setTokenListedData] = useState<ListedDetail | null>(
    null
  );
  const [tokenInfoLoading, setTokenInfoLoading] = useState(false);
  const [tokenInfoError, setTokenInfoError] = useState<any>(null);

  useEffect(() => {
    if (!connected || !address || !contract) {
      return;
    }
    const tokenDetailsFetcher = async () => {
      setTokenInfoLoading(true);
      try {
        const uri = await contract.tokenURI(tokenID);
        const url = `https://data.thetaedgestore.com/api/v2/data/${uri}`;
        const response = await axios.get(url);
        setTokenMetaData(response.data);

        const tokenListedData = await contract.nftDetails(tokenID);
        setTokenListedData(tokenListedData);
      } catch (error) {
        console.log(error);
        setTokenInfoError(error);
      }

      setTokenInfoLoading(false);
    };

    tokenDetailsFetcher();
  }, [address, tokenID]);

  if (!connected || !address || !contract) {
    return <></>;
  }

  console.log(`${tokenID.toNumber()} is listed: ${tokenListedData?.isListed}`);
  if (tokenInfoLoading || tokenMetaData === null) {
    return (
      <div className="relative mb-4 w-full h-64 md:h-80 bg-gray-900 rounded-lg ">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

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
          {tokenListedData &&
            tokenListedData.isListed &&
            tokenListedData.price && (
              <div className="text-white">
                Listed for {ethers.utils.formatEther(tokenListedData.price)}{" "}
                TFUEL
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
