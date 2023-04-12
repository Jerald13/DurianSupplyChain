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

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import routes, { setAddHarvesterAuth } from "../../routes"
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
    const borderButton = useColorModeValue("secondaryGray.500", "whiteAlpha.200")

    const [web3Modal, setWeb3Modal] = useState(null)
    const [provider, setProvider] = useState(null)
    const [address, setAddress] = useState("")
    const [connected, setConnected] = useState(false)
    const [isOwner, setIsOwner] = useState(false)

    const connectWeb3Modal = async () => {
        const newWeb3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
            providerOptions: {
                alchemy: {
                    package: Web3Provider,
                    options: {
                        rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/0qa4mNIYOwQeUgs1nJl3_X6sDRcuPkuE",
                    },
                },
            },
        })

        setWeb3Modal(newWeb3Modal)

        const newProvider = await newWeb3Modal.connect()
        if (newProvider) {
            setProvider(new Web3Provider(newProvider))
            setConnected(true)
            // get the user address
            const signer = new Web3Provider(newProvider).getSigner()
            const address = await signer.getAddress()
            setAddress(address)

            sessionStorage.setItem("walletAddress", address)

            // toast.success(`Succesfully Loginned`, {
            //     position: toast.POSITION.TOP_RIGHT,
            //     autoClose: 2000,
            // })

            console.log("SSSSSSSSSS")
            console.log(routes)
            setAddHarvesterAuth(true)
            window.location.reload(true)
        }
    }

    async function checkIsOwner() {
        console.log(contract)

        if (address !== "") {
            const owner = await contract.methods.owner().call()
            setIsOwner(owner === address)
            console.log(owner + " : Owner")
            console.log(address + " : Address")
        }
    }

    const checkSession = () => {
        const sessionExists = sessionStorage.getItem("walletAddress") !== null

        if (sessionStorage.getItem("walletAddress") !== null) {
            setAddress(sessionStorage.getItem("walletAddress"))
        }

        setConnected(sessionExists)
    }

    useEffect(() => {
        checkSession()
        checkIsOwner()
    }, [web3, address])

    const disconnectWeb3Modal = async () => {
        if (web3Modal) {
            await web3Modal.clearCachedProvider()

            sessionStorage.removeItem("walletAddress")

            setProvider(null)
            setConnected(false)
            setAddress("")
            window.location.reload(true)
        } else if (connected) {
            sessionStorage.removeItem("walletAddress")

            setProvider(null)
            setConnected(false)
            setAddress("")
            window.location.reload(true)
        }
    }

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
                            Notifications
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
                        {connected ? (
                            <Flex alignItems="center">
                                <Text mr={2} fontSize="sm" fontWeight="bold">
                                    {isOwner ? "Owner" : "User"} : {shortAddress(address)}
                                </Text>
                                <Button onClick={disconnectWeb3Modal} size="sm">
                                    Disconnect
                                </Button>
                            </Flex>
                        ) : (
                            <Button onClick={connectWeb3Modal} size="sm">
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
