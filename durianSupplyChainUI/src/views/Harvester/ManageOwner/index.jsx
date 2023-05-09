import React, { useState, useEffect } from "react"

// Chakra imports
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    Input,
    Link,
    Text,
    useColorModeValue,
    Select,
    SimpleGrid,
    Spinner,
} from "@chakra-ui/react"

// Custom components
import Banner from "views/admin/marketplace/components/Banner"
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators"
import HistoryItem from "views/admin/marketplace/components/HistoryItem"
import NFT from "components/card/NFT"
import Card from "components/card/Card.js"
import Web3Modal from "web3modal"
import Web3 from "web3"
import { useHistory } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
export default function Marketplace() {
    // Chakra Color Mode
    const textColor = useColorModeValue("secondaryGray.900", "white")
    const textColorBrand = useColorModeValue("brand.500", "white")
    const [harvesterAddress, setHarvesterAddress] = useState("")
    const [checkHarvesterAddress, setCheckHarvesterAddress] = useState("")
    const [removeHarvesterAddress, setRemoveHarvesterAddress] = useState("")

    const [checkProcessing, checkIsProcessing] = useState(false)
    const history = useHistory()

    const web3 = new Web3(Web3.givenProvider)
    const contractAbi = require("../../../contracts/durianSupplyChain.json").abi
    const {
        DurianSupplyChain: contractAddress,
    } = require("../../../contracts/contract-address.json")
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    // State for harvester address input
    const [isAuthorized, setIsAuthorized] = useState(false) // add a state for authorization status

    useEffect(() => {
        // check if user is authorized

        async function checkAuthorization() {
            const walletAddress = sessionStorage.getItem("walletAddress")
            const owner = await contract.methods.owner().call()
            const harvester = await contract.methods.isHarvester(walletAddress).call()

            if (walletAddress === owner || harvester) {
                setIsAuthorized(true)
            }
        }

        checkAuthorization()
    }, [contract.methods])

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(harvesterAddress)
        console.log(contract)

        try {
            await contract.methods
                .transferOwnership(harvesterAddress)
                .send({ from: sessionStorage.getItem("walletAddress") }),
                // Display success message

                history.push("/admin/CustomerPurchase")

            window.location.reload(true)

            sessionStorage.removeItem("walletAddress")
            sessionStorage.setItem("loggedOut", "loggedOut")
            console.log("CHECK")
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    const handleCheckSubmit = async () => {
        const check = await contract.methods.isOwner(checkHarvesterAddress).call()
        if (check) {
            toast.success(`${checkHarvesterAddress} is Owner`, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 2000,
            })
        } else {
            toast.error(`${checkHarvesterAddress} not a Owner`, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 5000,
            })
        }
    }

    return (
        <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
            {isAuthorized ? (
                <SimpleGrid columns={1} spacing={6}>
                    <Card>
                        <Box p="6">
                            <Box textAlign="center">
                                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                    Transfer Owner Role To Others
                                </Text>
                                <Text fontSize="x" color={textColor}>
                                    Transfer Harvester, Distributor, Retailer Role
                                </Text>
                            </Box>
                            <Box my={4} textAlign="left">
                                <SimpleGrid columns={2} spacing={3}>
                                    <FormControl>
                                        <FormLabel htmlFor="harvesterId" color={textColor}>
                                            Owner Address
                                        </FormLabel>
                                        <Input
                                            id="HarvesterAddress"
                                            placeholder="Enter Harvester Address"
                                            colorScheme="white"
                                            color={textColor}
                                            value={harvesterAddress}
                                            onChange={(e) => setHarvesterAddress(e.target.value)}
                                        />
                                    </FormControl>
                                </SimpleGrid>
                                <Button mt={4} colorScheme="blue" onClick={handleSubmit}>
                                    Transfer Owner
                                </Button>
                            </Box>
                        </Box>
                    </Card>

                    <Card>
                        <Box p="6">
                            <Box textAlign="center">
                                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                    Check Owner Address
                                </Text>
                            </Box>
                            <Box my={4} textAlign="left">
                                <SimpleGrid columns={2} spacing={3}>
                                    <FormControl>
                                        <FormLabel htmlFor="CheckharvesterId" color={textColor}>
                                            Owner Address
                                        </FormLabel>
                                        <Input
                                            id="CheckHarvesterAddress"
                                            placeholder="Enter Harvester Address"
                                            colorScheme="white"
                                            color={textColor}
                                            value={checkHarvesterAddress}
                                            onChange={(e) =>
                                                setCheckHarvesterAddress(e.target.value)
                                            }
                                        />
                                    </FormControl>
                                </SimpleGrid>
                                <Button mt={4} colorScheme="blue" onClick={handleCheckSubmit}>
                                    {checkProcessing ? "Processing" : "Check Owner"}
                                    {checkProcessing && <Spinner size="sm" ml="2" zIndex="9999" />}
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                </SimpleGrid>
            ) : (
                <Text>Not Authorized</Text>
            )}
        </Box>
    )
}
