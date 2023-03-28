const path = require("path")
const fs = require("fs")

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying the contracts with the account:", await deployer.getAddress())

    // Deploy MyContract
    const CM = await ethers.getContractFactory("MyContract")
    const cm = await CM.deploy()
    await cm.deployed()

    // Deploy DurianShop
    const DS = await ethers.getContractFactory("DurianShop")
    const ds = await DS.deploy()
    await ds.deployed()

    // Save contract addresses to file
    saveFrontendFiles({ cmAddress: cm.address, dsAddress: ds.address })

    console.log("MyContract deployed to:", cm.address)
    console.log("DurianShop deployed to:", ds.address)
}

function saveFrontendFiles({ cmAddress, dsAddress }) {
    const contractsDir = path.join(__dirname, "/../client/src/contracts")
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir)
    }

    // Save MyContract ABI to file
    const CMArtifact = artifacts.readArtifactSync("MyContract")
    fs.writeFileSync(contractsDir + "/MyContract.json", JSON.stringify(CMArtifact, null, 2))

    // Save DurianShop ABI to file
    const DSArtifact = artifacts.readArtifactSync("DurianShop")
    fs.writeFileSync(contractsDir + "/DurianShop.json", JSON.stringify(DSArtifact, null, 2))

    // Save contract addresses to file
    fs.writeFileSync(
        contractsDir + "/contract-address.json",
        JSON.stringify({ MyContract: cmAddress, DurianShop: dsAddress }, null, 2)
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
