import { ConnectionContext } from "@/pages/_app";
import { useContext, useEffect, useState } from "react";
import NFTOwned from "./NFTOwned";
import { RiRefreshLine } from "react-icons/ri";
import NFTListed from "./NFTListed";
import Link from "next/link";
import BounceLoader from "react-spinners/BounceLoader";

export default function Owned() {
  const { connected, address, contract } = useContext(ConnectionContext);

  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [listedNFTs, setListedNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const [refresh, setRefresh] = useState(1);

  useEffect(() => {
    if (!connected || !address || !contract) {
      return;
    }
    const fetcher = async () => {
      setLoading(true);
      try {
        const owned = await contract.getNFTsOfOwner(address);
        setOwnedNFTs(owned);

        const listed = await contract.getNFTsListedByUser(address);
        setListedNFTs(listed);
      } catch (error) {
        console.log(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [address, refresh]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center mb-10">
        <BounceLoader color="#60a5fa" />
        <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
        <p className="font-semibold">NFTs you own</p>
        <button
          onClick={() => setRefresh(refresh + 1)}
          className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none"
        >
          <RiRefreshLine className="text-white" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mx-5">
        {listedNFTs?.map((nft) => (
          <NFTListed key={nft.toNumber()} tokenID={nft} />
        ))}
        {ownedNFTs?.map((nft) => (
          <NFTOwned key={nft.toNumber()} tokenID={nft} />
        ))}
      </div>
      {listedNFTs.length === 0 && ownedNFTs.length === 0 && (
        <div className="flex flex-col my-3 space-y-2">
          <p className="font-semibold">You do not own any NFTs of Nifta.</p>
          <p>
            <Link className="text-blue-400" href={"/create"}>
              Create
            </Link>{" "}
            or checkout the{" "}
            <Link className="text-blue-400" href={"/marketplace"}>
              Marketplace
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
