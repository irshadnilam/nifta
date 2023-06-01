import Mint from "../components/Mint";

export default function CreatePage() {
  return (
    <div className="flex flex-col gap-4 items-center pb-8">
      <div className="mb-4 text-xl">
        <p className="font-semibold">Prompt · Mint · List · Sell</p>
      </div>
      <Mint />
    </div>
  );
}
