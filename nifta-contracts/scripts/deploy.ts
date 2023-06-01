import fs from "fs-extra";
import { Contract } from "ethers";
import { ethers, network, artifacts } from "hardhat";

// hardhat script to deploy the contract
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy the contract
  const contractFactory = await ethers.getContractFactory("Nifta");
  const contract = await contractFactory.deploy();
  console.log("Contract address:", contract.address);

  saveFrontendFiles(contract);
}

function saveFrontendFiles(contract: Contract) {
  const contractsDir = __dirname + "/../../nifta-frontend/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Nifta: contract.address }, undefined, 2)
  );

  const ContractArtifact = artifacts.readArtifactSync("Nifta");

  fs.writeFileSync(
    contractsDir + "/Nifta.json",
    JSON.stringify(ContractArtifact, null, 2)
  );

  // copy typechain-types folder frontend contracts folder
  const typechainTypesDir = __dirname + "/../typechain-types";
  const frontendTypechainTypesDir = contractsDir + "/typechain-types";

  if (!fs.existsSync(frontendTypechainTypesDir)) {
    fs.mkdirSync(frontendTypechainTypesDir);
  }

  try {
    fs.copySync(typechainTypesDir, frontendTypechainTypesDir, {
      overwrite: true,
    });
  } catch (err) {
    console.error(err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
