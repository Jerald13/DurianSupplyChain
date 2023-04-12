import { Icon } from "@chakra-ui/react"
import { MdAddCircleOutline } from "react-icons/md"
import React, { useEffect, useState } from "react"
import AddHarvester from "views/Harvester/addHarvester"
import HarvestDurian from "views/Harvester/harvestDurian"
import Web3 from "web3"
// Auth Imports
import SignInCentered from "views/auth/signIn"
import { Route, Redirect } from "react-router-dom"

const web3 = new Web3(Web3.givenProvider)
const contractAbi = require("../src/contracts/durianSupplyChain.json").abi
const { DurianSupplyChain: contractAddress } = require("../src/contracts/contract-address.json")

const contract = new web3.eth.Contract(contractAbi, contractAddress)

const accessLevels = {
    OWNER: 0,
    HARVESTER: 1,
    DISTRIBUTOR: 2,
    RETAILER: 3,
    CUSTOMER: 4,
}

let owner
let harvester

let routes = [
    {
        name: "Add Harvester",
        layout: "/admin",
        path: "/Add-Harvester",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        ownerUser: "Owner",
        authenticate: "Owner",
    },
    {
        name: "Add Distributor",
        layout: "/admin",
        path: "/Harvest-durian",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Add DistributorAAASDSDDS",
        layout: "/admin",
        path: "/Harvest-durian",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        ownerUser: "Owner",
        authenticate: "Retailer",
    },
]
console.log(routes)
export function setAddHarvesterAuth(value) {
    routes[0].authenticate = value
    console.log(routes[0].authenticate)
}

// export const getAuthenticatedRoutes = (authenticated) => {
//     return routes.filter((route) => {
//         if (route.authenticate) {
//             return authenticated && route.authenticate
//         } else {
//             return true
//         }
//     })
// }

export const getAuthenticatedRoutes = (authenticated) => {
    return routes.filter((route) => {
        return !route.authenticate || (route.authenticate && authenticated)
    })
}

export default routes
