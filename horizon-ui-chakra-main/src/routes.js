import { Icon } from "@chakra-ui/react"
import {
    MdBarChart,
    MdPerson,
    MdHome,
    MdLock,
    MdOutlineShoppingCart,
    MdAddCircleOutline,
    MdLocalFlorist,
    MdMonetizationOn,
    MdShoppingCart,
    MdLocalShipping,
    MdLocalGroceryStore,
    MdCheckCircle,
    MdShoppingBasket,
    MdStar,
    MdLocalDining,
} from "react-icons/md"
import NFTMarketplace from "views/admin/marketplace"
import React, { useEffect, useState } from "react"
import AddHarvester from "views/Harvester/ManageHarvester"
import AddDistributor from "views/Harvester/ManageDistributor"
import AddRetailer from "views/Harvester/ManageRetailer"

import HarvestDurian from "views/Harvester/harvestDurian"
import HarvestSale from "views/Harvester/harvestSale"

import DisplayDurian from "views/Harvester/DisplayDurian"

import CustomerPurchase from "views/Harvester/CustomerPurchase"
import ManageOwner from "views/Harvester/ManageOwner"

import PurchasedByDistributor from "views/Harvester/PurchaseByDistributor"

let routes = [
    {
        name: "Manage Owner",
        layout: "/admin",
        path: "/ManageOwner",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        component: ManageOwner,
        ownerUser: "Owner",
        authenticate: "Owner",
    },
    {
        name: "Manage Harveste Role",
        layout: "/admin",
        path: "/ManageHarvester",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        component: AddHarvester,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Manage Distributor Role",
        layout: "/admin",
        path: "/ManageDistributor",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        component: AddDistributor,
        ownerUser: "Owner",
        authenticate: "Distributor",
    },
    {
        name: "Manage Retailer Role",
        layout: "/admin",
        path: "/ManageRetailer",
        icon: <Icon as={MdAddCircleOutline} width="20px" height="20px" color="inherit" />,
        component: AddRetailer,
        ownerUser: "Owner",
        authenticate: "Retailer",
    },
    {
        name: "Harvester Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdLocalFlorist} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Display Durian Data",
        layout: "/admin",
        path: "/DisplayDurian",
        icon: <Icon as={MdLocalDining} width="20px" height="20px" color="inherit" />,
        component: DisplayDurian,
        ownerUser: "Owner",
        authenticate: "Customer",
    },
    {
        name: "Harvester Sale Durian",
        layout: "/admin",
        path: "/harvesterSale",
        icon: <Icon as={MdMonetizationOn} width="20px" height="20px" color="inherit" />,
        component: HarvestSale,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Distributor Purchase Durian",
        layout: "/admin",
        path: "/PurchaseByDistributor",
        icon: <Icon as={MdShoppingCart} width="20px" height="20px" color="inherit" />,
        component: PurchasedByDistributor,
        ownerUser: "Owner",
        authenticate: "Distributor",
    },
    {
        name: "Harvester Shipped Durian",
        layout: "/admin",
        path: "/ShippedByHarvester",
        icon: <Icon as={MdLocalShipping} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Distributor Received Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdCheckCircle} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Distributor Processed Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdShoppingBasket} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Distributor Sale Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdMonetizationOn} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Retailer Purchase Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdShoppingCart} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Distributor Shipped Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdLocalShipping} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Retailer Received Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdCheckCircle} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Retailer Sale Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdMonetizationOn} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Customer Purchase Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdShoppingCart} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Customer Rate Durian",
        layout: "/admin",
        path: "/harvester-default",
        icon: <Icon as={MdStar} width="20px" height="20px" color="inherit" />,
        component: HarvestDurian,
        ownerUser: "Owner",
        authenticate: "Harvester",
    },
    {
        name: "Customer Purchase Durian",
        layout: "/admin",
        path: "/CustomerPurchase",
        icon: <Icon as={MdShoppingCart} width="20px" height="20px" color="inherit" />,
        component: CustomerPurchase,
        ownerUser: "Owner",
        authenticate: "Customer",
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
