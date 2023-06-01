import { ConnectionContext } from "@/pages/_app";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { FiCornerDownRight } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface Props {
  tokenID: BigNumber;
}

type PromptForm = {
  price: number;
};

export default function NFTOwned({ tokenID }: Props) {
  const { connected, address, contract } = useContext(ConnectionContext);
  const [listProgress, setListProgress] = useState(false);
  const [listed, setListed] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PromptForm>();

  const [tokenMetaData, setTokenMetaData] = useState<any>(null);
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
      } catch (error) {
        console.log(error);
        setTokenInfoError(error);
      }

      setTokenInfoLoading(false);
    };

    tokenDetailsFetcher();
  }, [address, tokenID, listProgress]);

  if (!connected || !address || !contract) {
    return <></>;
  }

  if (tokenInfoLoading || tokenMetaData === null) {
    return (
      <div className="relative mb-4 w-full h-64 md:h-80 bg-gray-900 rounded-lg ">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const onListItem = async (data: PromptForm) => {
    if (!connected || !address || !contract) {
      return;
    }
    if (data.price <= 0) {
      toast.error("Price must be greater than 0 TFUEL");
      return;
    }

    setListProgress(true);
    setPrice(data.price);
    const task = contract
      .listNFT(
        tokenID,
        ethers.utils.parseUnits(data.price.toString(), "ether"),
        {
          gasLimit: 5000000,
        }
      )
      .then((tx) => tx.wait());
    toast
      .promise(task, {
        pending: "Listing NFT...",
        success: "NFT listed successfully!",
        error: "Error listing NFT",
      })
      .then(() => {
        setListed(true);
      });

    setListProgress(false);
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
          {listed ? (
            <div className="text-white">
              Listed for {price} TFUEL
            </div>
          ) : (
            <form onSubmit={handleSubmit(onListItem)}>
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                List
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-xs">
                  <FiCornerDownRight />
                </div>
                <input
                  type="number"
                  id="default-search"
                  className="block p-4 pl-10 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Price in TFUEL"
                  // disabled={generateStatus === "progress"}
                  {...register("price", { required: true })}
                />
                <button
                  type="submit"
                  disabled={listProgress}
                  className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {listProgress ? "Listing..." : "List"}
                </button>
              </div>
              {errors.price && (
                <span className="px-2 text-red-400">
                  This field is required
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
