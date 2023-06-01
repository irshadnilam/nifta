import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-8 md:pt-16 bg-gray-800 text-white overflow-x-hidden pb-8">
      <div className="flex flex-col gap-6 items-center space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal  w-3/4 md:w-1/2 text-center ">
          AI meets NFTs on Theta.
        </h1>
        <p className="text-base text-gray-300 sm:text-lg md:text-xl font-light w-10/12 md:w-7/12 text-center">
          Use the state of the art AI image models to create unique NFTs on the
          Theta blockchain. List them on the marketplace to earn TFuel. Buy and
          sell NFTs of your favorite creators.
        </p>
        <div className="flex gap-3 sm:gap-5 mt-2 text-sm sm:text-base">
          <Link href="/create" legacyBehavior>
            <button className="bg-blue-400 text-black font-semibold py-3 px-4 sm:px-8 md:px-12 rounded-lg hover:bg-white">
              Get Started
            </button>
          </Link>
          <Link href="/marketplace" legacyBehavior>
            <button className="border-2 border-white-500 text-white-500 font-semibold py-3 px-4 sm:px-8 md:px-12 rounded-lg hover:bg-white hover:text-black">
              View Marketplace
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
