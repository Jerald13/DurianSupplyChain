/* eslint-disable */
import React, { useEffect, useState } from "react"
import { NavLink, useLocation, useHistory } from "react-router-dom"
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react"
import { getAuthenticatedRoutes } from "../../../routes.js"
import Web3Modal from "web3modal"
import Web3 from "web3"
export function SidebarLinks(props) {
    //   Chakra color mode
    let location = useLocation()
    let activeColor = useColorModeValue("gray.700", "white")
    let inactiveColor = useColorModeValue("secondaryGray.600", "secondaryGray.600")
    let activeIcon = useColorModeValue("brand.500", "white")
    let textColor = useColorModeValue("secondaryGray.500", "white")
    let brandColor = useColorModeValue("brand.500", "brand.400")
    const [acc, setIsAcc] = useState(null)
    const history = useHistory()
    const { routes } = props

    const activeRoute = (routeName) => {
        return location.pathname.includes(routeName)
    }

    const web3 = new Web3(Web3.givenProvider)
    const contractAbi = require("../../../contracts/durianSupplyChain.json").abi
    const {
        DurianSupplyChain: contractAddress,
    } = require("../../../contracts/contract-address.json")
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    const [currentAccount, setCurrentAccount] = useState("")
    const [authenticated, setAuthenticated] = useState(false)
    const [filteredRoutes, setFilteredRoutes] = useState([])

    const [accountChanged, setAccountChanged] = useState(false)

    useEffect(() => {
        const isUserAuthenticated = sessionStorage.getItem("walletAddress")
        if (isUserAuthenticated) {
            setCurrentAccount(isUserAuthenticated)
        }
        setAuthenticated(Boolean(isUserAuthenticated))

        const web3Modal = new Web3Modal()
        web3Modal.connect().then((provider) => {
            const web3 = new Web3(provider)
            const account = web3.eth.defaultAccount
            if (account !== currentAccount) {
                setCurrentAccount(account)
                setAccountChanged(true)
            }
        })

        window.ethereum.on("accountsChanged", (accounts) => {
            const account = accounts[0]
            if (account !== currentAccount) {
                setCurrentAccount(account)
                setAccountChanged(true)
            }
        })
    }, [])

    useEffect(() => {
        const isUserAuthenticated = sessionStorage.getItem("walletAddress")
        if (isUserAuthenticated) {
            checkIsOwner()
            setAccountChanged(false)
        }
    }, [currentAccount])

    useEffect(() => {
        if (accountChanged) {
            checkIsOwner()
            setAccountChanged(false)
        }
    }, [accountChanged, currentAccount])
    async function checkIsOwner() {
        console.log(contract)
        if (sessionStorage.getItem("walletAddress") !== "") {
            const owner = await contract.methods.isOwner(currentAccount).call()
            const harvester = await contract.methods.isHarvester(currentAccount).call()
            const retailer = await contract.methods.isRetailer(currentAccount).call()
            const distributor = await contract.methods.isDistributor(currentAccount).call()

            if (owner) {
                setIsAcc("Owner")
                console.log(owner)
            } else if (harvester) {
                setIsAcc("Harvester")
            } else if (distributor) {
                setIsAcc("Distributor")
            } else if (retailer) {
                setIsAcc("Retailer")
            } else {
                setIsAcc("Customer")
            }
        }
    }

    // Add another useEffect hook to update the filteredRoutes array whenever the routes or authenticated state changes
    useEffect(() => {
        setFilteredRoutes(
            routes.filter((route) => {
                if (route.authenticate) {
                    console.log(contract)
                    if (route.ownerUser === acc) {
                        return authenticated
                    } else if (route.authenticate === acc) {
                        return authenticated
                    } else if (route.authenticate === acc) {
                        return authenticated // include the route without any conditions
                    } else if (route.authenticate === "Customer") {
                        return true // include the route without any conditions
                    }
                    history.push("/admin/CustomerPurchase")
                }
            })
        )
    }, [routes, currentAccount, authenticated, acc])

    // console.log("HEREEAAA")
    // const filteredRoutes = routes.filter((route) => route.authenticate)
    // console.log(filteredRoutes)

    // Update the filteredRoutes variable based on the authenticated state
    // const filteredRoutes = getAuthenticatedRoutes(authenticated)
    // console.log(filteredRoutes)

    const createLinks = (routes) => {
        return routes.map((route, index) => {
            if (route.category) {
                return (
                    <>
                        <Text
                            fontSize={"md"}
                            color={activeColor}
                            fontWeight="bold"
                            mx="auto"
                            ps={{
                                sm: "10px",
                                xl: "16px",
                            }}
                            pt="18px"
                            pb="12px"
                            key={index}
                        >
                            {route.name}
                        </Text>
                        {createLinks(route.items)}
                    </>
                )
            } else if (
                route.layout === "/admin" ||
                route.layout === "/auth" ||
                route.layout === "/rtl"
            ) {
                return (
                    <NavLink key={index} to={route.layout + route.path}>
                        {route.icon ? (
                            <Box>
                                <HStack
                                    spacing={
                                        activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                                    }
                                    py="5px"
                                    ps="10px"
                                >
                                    <Flex w="100%" alignItems="center" justifyContent="center">
                                        <Box
                                            color={
                                                activeRoute(route.path.toLowerCase())
                                                    ? activeIcon
                                                    : textColor
                                            }
                                            me="18px"
                                        >
                                            {route.icon}
                                        </Box>
                                        <Text
                                            me="auto"
                                            color={
                                                activeRoute(route.path.toLowerCase())
                                                    ? activeColor
                                                    : textColor
                                            }
                                            fontWeight={
                                                activeRoute(route.path.toLowerCase())
                                                    ? "bold"
                                                    : "normal"
                                            }
                                        >
                                            {route.name}
                                        </Text>
                                    </Flex>
                                    <Box
                                        h="36px"
                                        w="4px"
                                        bg={
                                            activeRoute(route.path.toLowerCase())
                                                ? brandColor
                                                : "transparent"
                                        }
                                        borderRadius="5px"
                                    />
                                </HStack>
                            </Box>
                        ) : (
                            <Box>
                                <HStack
                                    spacing={
                                        activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                                    }
                                    py="5px"
                                    ps="10px"
                                >
                                    <Text
                                        me="auto"
                                        color={
                                            activeRoute(route.path.toLowerCase())
                                                ? activeColor
                                                : inactiveColor
                                        }
                                        fontWeight={
                                            activeRoute(route.path.toLowerCase())
                                                ? "bold"
                                                : "normal"
                                        }
                                    >
                                        {route.name}
                                    </Text>
                                    <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                                </HStack>
                            </Box>
                        )}
                    </NavLink>
                )
            }
        })
    }
    //  BRAND
    return createLinks(filteredRoutes)
}

export default SidebarLinks
