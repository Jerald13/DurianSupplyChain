// Chakra Imports
import {
    Avatar,
    Icon,
    Image,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useColorModeValue,
} from "@chakra-ui/react"
// Custom Components
import { ItemContent } from "components/menu/ItemContent"
import { SearchBar } from "components/navbar/searchBar/SearchBar"
import { SidebarResponsive } from "components/sidebar/Sidebar"
// import { Links } from "../sidebar/components/Links"

// Assets
import navImage from "assets/img/layout/Navbar.png"
import { MdNotificationsNone, MdInfoOutline } from "react-icons/md"
import { FaEthereum } from "react-icons/fa"
import { ThemeEditor } from "./ThemeEditor"

import { Button, useToast, Flex, Text, Box } from "@chakra-ui/react"
import { Web3Provider } from "@ethersproject/providers"
import Web3Modal from "web3modal"
import React, { useEffect, useState } from "react"
import Web3 from "web3"
import { useHistory } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import routes, { setAddHarvesterAuth } from "../../routes"
import { isCompositeComponent } from "react-dom/test-utils"
import ChildComponent from "../sidebar/components/Links"
const web3 = new Web3(Web3.givenProvider)
const contractAbi = require("../../contracts/durianSupplyChain.json").abi
const { DurianSupplyChain: contractAddress } = require("../../contracts/contract-address.json")
const contract = new web3.eth.Contract(contractAbi, contractAddress)

function App(props) {
    const { secondary } = props
    // Chakra Color Mode
    const navbarIcon = useColorModeValue("gray.400", "white")
    let menuBg = useColorModeValue("white", "navy.800")
    const textColor = useColorModeValue("secondaryGray.900", "white")
    const textColorBrand = useColorModeValue("brand.700", "brand.400")
    const ethColor = useColorModeValue("gray.700", "white")
    const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)")
    const ethBg = useColorModeValue("secondaryGray.300", "navy.900")
    const ethBox = useColorModeValue("white", "navy.800")
    const shadow = useColorModeValue(
        "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
        "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
    )
    const history = useHistory()
    const borderButton = useColorModeValue("secondaryGray.500", "whiteAlpha.200")

    const [web3Modal, setWeb3Modal] = useState(null)
    const [provider, setProvider] = useState(null)
    const [address, setAddress] = useState("")
    const [connected, setConnected] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [acc, setAcc] = useState(false)

    const [web3Instance, setWeb3Instance] = useState(null)
    const [accountList, setAccountList] = useState([])
    const [currentAccount, setCurrentAccount] = useState("")
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const sessionExists = sessionStorage.getItem("walletAddress")
        if (sessionExists) {
            checkIsOwner()
            setCurrentAccount(sessionStorage.getItem("walletAddress"))
            setIsConnected(true)
        } else {
            connectWeb3Modal()
        }
    }, [])

    const connectWeb3Modal = async () => {
        console.log(isConnected + " Wgatus ")

        if (window.ethereum && isConnected) {
            console.log("WJAT")

            const web3 = new Web3(window.ethereum)
            try {
                await window.ethereum.enable()
                setWeb3Instance(web3)
                const accounts = await web3.eth.getAccounts()
                setAccountList(accounts)
                setCurrentAccount(accounts[0])

                // Set session storage when user switches account
                sessionStorage.setItem("walletAddress", accounts[0])
                window.ethereum.on("accountsChanged", function (accounts) {
                    setAccountList(accounts)
                    setCurrentAccount(accounts[0])
                    sessionStorage.setItem("walletAddress", accounts[0])
                    checkIsOwner()
                })
                checkIsOwner()
            } catch (error) {
                console.error(error)
            }
        } else {
            console.log("Please install Metamask to use this feature")
        }
    }

    async function checkIsOwner() {
        console.log(currentAccount + "AASX")

        if (currentAccount !== "") {
            const owner = await contract.methods.isOwner(currentAccount).call()
            const harvester = await contract.methods.isHarvester(currentAccount).call()
            const retailer = await contract.methods.isRetailer(currentAccount).call()
            console.log(owner)
            if (owner) {
                setAcc("Owner")
            } else if (harvester) {
                setAcc("Harvester")
            } else if (retailer) {
                setAcc("Retailer")
            } else {
                setAcc("User")
            }
        }
    }

    const checkSession = () => {
        const sessionExists = sessionStorage.getItem("walletAddress")
        if (sessionExists) {
            setCurrentAccount(sessionStorage.getItem("walletAddress"))
        }

        setConnected(sessionExists)
    }

    useEffect(() => {
        checkSession()
        checkIsOwner()
    }, [web3, currentAccount])

    useEffect(() => {
        if (sessionStorage.getItem("loggedOut")) {
            sessionStorage.removeItem("loggedOut")
            disconnectWeb3Modal()
        }
    })

    const disconnectWeb3Modal = async () => {
        sessionStorage.removeItem("walletAddress")
        window.ethereum.removeAllListeners()
        setAccountList([])
        setCurrentAccount("")
        setIsConnected(false)
        setWeb3Instance(null)

        history.push("/admin/CustomerPurchase")
    }

    const handleLogin = async () => {
        setIsConnected(true)
        console.log(isConnected)
    }

    useEffect(() => {
        connectWeb3Modal()
    }, [isConnected])

    return (
        <Flex
            w={{ sm: "100%", md: "auto" }}
            alignItems="center"
            flexDirection="row"
            bg={menuBg}
            flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
            p="10px"
            borderRadius="30px"
            boxShadow={shadow}
        >
            <ToastContainer />
            <SearchBar
                mb={secondary ? { base: "10px", md: "unset" } : "unset"}
                me="10px"
                borderRadius="30px"
            />
            <Flex
                bg={ethBg}
                display={secondary ? "flex" : "none"}
                borderRadius="30px"
                ms="auto"
                p="6px"
                align="center"
                me="6px"
            >
                <Flex
                    align="center"
                    justify="center"
                    bg={ethBox}
                    h="29px"
                    w="29px"
                    borderRadius="30px"
                    me="7px"
                >
                    <Icon color={ethColor} w="9px" h="14px" as={FaEthereum} />
                </Flex>
                <Text w="max-content" color={ethColor} fontSize="sm" fontWeight="700" me="6px">
                    1,924
                    <Text as="span" display={{ base: "none", md: "unset" }}>
                        {" "}
                        ETH
                    </Text>
                </Text>
            </Flex>
            <SidebarResponsive routes={routes} />
            <Menu>
                <MenuButton p="0px">
                    <Icon
                        mt="6px"
                        as={MdNotificationsNone}
                        color={navbarIcon}
                        w="18px"
                        h="18px"
                        me="10px"
                    />
                </MenuButton>
                <MenuList
                    boxShadow={shadow}
                    p="20px"
                    borderRadius="20px"
                    bg={menuBg}
                    border="none"
                    mt="22px"
                    me={{ base: "30px", md: "unset" }}
                    minW={{ base: "unset", md: "400px", xl: "450px" }}
                    maxW={{ base: "360px", md: "unset" }}
                >
                    <Flex jusitfy="space-between" w="100%" mb="20px">
                        <Text fontSize="md" fontWeight="600" color={textColor}>
                            Notifications {currentAccount}
                        </Text>
                        <Text
                            fontSize="sm"
                            fontWeight="500"
                            color={textColorBrand}
                            ms="auto"
                            cursor="pointer"
                        >
                            Mark all read
                        </Text>
                    </Flex>
                    <Flex flexDirection="column">
                        <MenuItem
                            _hover={{ bg: "none" }}
                            _focus={{ bg: "none" }}
                            px="0"
                            borderRadius="8px"
                            mb="10px"
                        >
                            <ItemContent info="Horizon UI Dashboard PRO" aName="Alicia" />
                        </MenuItem>
                        <MenuItem
                            _hover={{ bg: "none" }}
                            _focus={{ bg: "none" }}
                            px="0"
                            borderRadius="8px"
                            mb="10px"
                        >
                            <ItemContent info="Horizon Design System Free" aName="Josh Henry" />
                        </MenuItem>
                    </Flex>
                </MenuList>
            </Menu>

            <Menu>
                <MenuButton p="0px">
                    <Icon
                        mt="6px"
                        as={MdInfoOutline}
                        color={navbarIcon}
                        w="18px"
                        h="18px"
                        me="10px"
                    />
                </MenuButton>
                <MenuList
                    boxShadow={shadow}
                    p="20px"
                    me={{ base: "30px", md: "unset" }}
                    borderRadius="20px"
                    bg={menuBg}
                    border="none"
                    mt="22px"
                    minW={{ base: "unset" }}
                    maxW={{ base: "360px", md: "unset" }}
                >
                    <Image src={navImage} borderRadius="16px" mb="28px" />
                    <Flex flexDirection="column">
                        <Link w="100%" href="https://horizon-ui.com/pro">
                            <Button w="100%" h="44px" mb="10px" variant="brand">
                                Buy Horizon UI PRO
                            </Button>
                        </Link>
                        <Link
                            w="100%"
                            href="https://horizon-ui.com/documentation/docs/introduction"
                        >
                            <Button
                                w="100%"
                                h="44px"
                                mb="10px"
                                border="1px solid"
                                bg="transparent"
                                borderColor={borderButton}
                            >
                                See Documentation
                            </Button>
                        </Link>
                        <Link w="100%" href="https://github.com/horizon-ui/horizon-ui-chakra">
                            <Button
                                w="100%"
                                h="44px"
                                variant="no-hover"
                                color={textColor}
                                bg="transparent"
                            >
                                Supply Chain
                            </Button>
                        </Link>
                    </Flex>
                </MenuList>
            </Menu>

            <ThemeEditor navbarIcon={navbarIcon} />

            <Menu>
                <Menu>
                    <Flex alignItems="center">
                        {isConnected ? (
                            <Flex alignItems="center">
                                <Text mr={2} fontSize="sm" fontWeight="bold">
                                    {acc} : {shortAddress(currentAccount)}
                                </Text>
                                <Button onClick={disconnectWeb3Modal} size="sm">
                                    Disconnect
                                </Button>
                            </Flex>
                        ) : (
                            <Button onClick={handleLogin} size="sm">
                                Connect Wallet
                            </Button>
                        )}
                    </Flex>
                </Menu>
            </Menu>
        </Flex>
    )
}

function shortAddress(address) {
    return address.substr(0, 6) + "..." + address.substr(-4)
}

export default App
