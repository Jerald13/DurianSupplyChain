const path = require("path")
const fs = require("fs")

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying the contracts with the account:", await deployer.getAddress())

    //Deploy Contracts

    //Supply Chain
    const DN = await ethers.getContractFactory("durianSupplyChain")
    const dn = await DN.deploy()
    await dn.deployed()

    //Access Roles
    const CR = await ethers.getContractFactory("ConsumerRole")
    const cs = await CR.deploy()
    await cs.deployed()

    const DR = await ethers.getContractFactory("DistributorRole")
    const dr = await DR.deploy()
    await dr.deployed()

    const HR = await ethers.getContractFactory("HarvesterRole")
    const hr = await HR.deploy()
    await hr.deployed()

    const RR = await ethers.getContractFactory("RetailerRole")
    const rr = await RR.deploy()
    await rr.deployed()

    const RS = await ethers.getContractFactory("Roles")
    const rs = await RS.deploy()
    await rs.deployed()

    // Save contract addresses to file
    saveFrontendFiles({
        dnAddress: dn.address,
        csAddress: cs.address,
        drAddress: dr.address,
        hrAddress: hr.address,
        rrAddress: rr.address,
        rsaddress: rs.address,
    })


    
    console.log(
        "ConsumerRole deployed to:",
        dn.address,
        cs.address,
        dr.address,
        hr.address,
        rr.address,
        rs.address
    )
}

function saveFrontendFiles({ dnAddress, csAddress, drAddress, hrAddress, rrAddress, rsAddress }) {
    const contractsDir = path.join(__dirname, "/../horizon-ui-chakra-main/src/contracts")
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir)
    }

    // Save Contracts ABI to file
    const DNArtifact = artifacts.readArtifactSync("durianSupplyChain")
    fs.writeFileSync(
        path.join(contractsDir, "durianSupplyChain.json"),
        JSON.stringify(DNArtifact, null, 2)
    )

    const CRArtifact = artifacts.readArtifactSync("ConsumerRole")
    fs.writeFileSync(
        path.join(contractsDir, "ConsumerRole.json"),
        JSON.stringify(CRArtifact, null, 2)
    )

    const DRArtifact = artifacts.readArtifactSync("DistributorRole")
    fs.writeFileSync(
        path.join(contractsDir, "DistributorRole.json"),
        JSON.stringify(DRArtifact, null, 2)
    )

    const HRArtifact = artifacts.readArtifactSync("HarvesterRole")
    fs.writeFileSync(
        path.join(contractsDir, "HarvesterRole.json"),
        JSON.stringify(HRArtifact, null, 2)
    )

    const RRArtifact = artifacts.readArtifactSync("RetailerRole")
    fs.writeFileSync(
        path.join(contractsDir, "RetailerRole.json"),
        JSON.stringify(RRArtifact, null, 2)
    )

    const RSArtifact = artifacts.readArtifactSync("Roles")
    fs.writeFileSync(path.join(contractsDir, "Roles.json"), JSON.stringify(RSArtifact, null, 2))

    // Save contract addresses to file
    fs.writeFileSync(
        contractsDir + "/contract-address.json",
        JSON.stringify(
            {
                DurianSupplyChain: dnAddress,
                ConsumerRole: csAddress,
                DistributorRole: drAddress,
                HarvesterRole: hrAddress,
                RetailerRole: rrAddress,
                Roles: rsAddress,
            },
            null,
            2
        )
    )
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
