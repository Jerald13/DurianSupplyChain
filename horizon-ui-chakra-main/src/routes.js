import { Icon } from "@chakra-ui/react"
import { MdAddCircleOutline } from "react-icons/md"

import React, { useEffect, useState } from "react"
import AddHarvester from "views/Harvester/addHarvester"
import HarvestDurian from "views/Harvester/harvestDurian"
import Web3 from "web3"
// Auth Imports
import SignInCentered from "views/auth/signIn"

const web3 = new Web3(Web3.givenProvider)
const contractAbi = require("../src/contracts/durianSupplyChain.json").abi
const { DurianSupplyChain: contractAddress } = require("../src/contracts/contract-address.json")

const contract = new web3.eth.Contract(contractAbi, contractAddress)
const cachedWalletAddress = localStorage.getItem("walletAddress")
// Check if user is authorized harvester
async function isAuthorizedHarvester(address) {
    console.log("SSSS")
    console.log(cachedWalletAddress + "PLEASSSS")
    const isHarvester = await contract.methods.isHarvester(address).call()

    return isHarvester
}

async function checkIsOwner() {
    console.log(contract)
    if (address !== "") {
        const owner = await contract.methods.owner().call()
        setIsOwner(owner === address)
    }
}

// Access Levels
const accessLevels = {
    OWNER: 0,
    HARVESTER: 1,
    DISTRIBUTOR: 2,
    RETAILER: 3,
    CUSTOMER: 4,
}

const routes = [
    {
        name: "Add Harvester",
        layout: "/admin",
        path: "/Add-Harvester",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        component: AddHarvester,
        // accessLevel: [accessLevels.HARVESTER],
        authenticate: async (cachedWalletAddress) => {
            const isHarvester = await isAuthorizedHarvester(cachedWalletAddress)
            return isHarvester
        },
    },
    {
        name: "Add Distributor",
        layout: "/admin",
        path: "/Harvest-durian",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        // accessLevel: [accessLevels.OWNER, accessLevels.HARVESTER],
        authenticate: async (cachedWalletAddress) => {
            const isHarvester = await isAuthorizedHarvester(cachedWalletAddress)
            return isHarvester
        },
    },
]

export default routes
