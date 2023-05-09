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

import { ToastContainer, toast } from "react-toastify"
export default function Marketplace() {
    // Chakra Color Mode
    const textColor = useColorModeValue("secondaryGray.900", "white")
    const textColorBrand = useColorModeValue("brand.500", "white")
    const [harvesterAddress, setHarvesterAddress] = useState("")
    const [checkHarvesterAddress, setCheckHarvesterAddress] = useState("")
    const [removeHarvesterAddress, setRemoveHarvesterAddress] = useState("")

    const [checkProcessing, checkIsProcessing] = useState(false)

    const web3 = new Web3(Web3.givenProvider)
    const contractAbi = require("../../../contracts/durianSupplyChain.json").abi
    const {
        DurianSupplyChain: contractAddress,
    } = require("../../../contracts/contract-address.json")
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    // State for harvester address input
    const [isAuthorized, setIsAuthorized] = useState(false) // add a state for authorization status

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(harvesterAddress)
        console.log(contract)

        try {
            await contract.methods
                .addRetailer(harvesterAddress)
                .send({ from: sessionStorage.getItem("walletAddress") })

            // Display success message
            toast.success("Retailer added successfully!")
            console.log("CHECK")
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    const handleCheckSubmit = async () => {
        const check = await contract.methods.isRetailer(checkHarvesterAddress).call()
        if (check) {
            toast.success(`${checkHarvesterAddress} is Retailer`, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 2000,
            })
        } else {
            toast.error(`${checkHarvesterAddress} not a Retailer`, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 5000,
            })
        }
    }

    const removeHandleSubmit = async () => {
        try {
            await contract.methods
                .removeRetailer(removeHarvesterAddress)
                .send({ from: sessionStorage.getItem("walletAddress") })

            // Display success message
            toast.success("Retailer Removed successfully!")
            console.log("CHECK")
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    return (
        <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
            <SimpleGrid columns={1} spacing={6}>
                <Card>
                    <Box p="6">
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                Add Retailer Address
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="harvesterId" color={textColor}>
                                        Retailer Address
                                    </FormLabel>
                                    <Input
                                        id="HarvesterAddress"
                                        placeholder="Enter Retailer Address"
                                        colorScheme="white"
                                        color={textColor}
                                        value={harvesterAddress}
                                        onChange={(e) => setHarvesterAddress(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={handleSubmit}>
                                Add Retailer
                            </Button>
                        </Box>
                    </Box>
                </Card>

                <Card>
                    <Box p="6">
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                Check Retailer Address
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="CheckharvesterId" color={textColor}>
                                        Retailer Address
                                    </FormLabel>
                                    <Input
                                        id="CheckHarvesterAddress"
                                        placeholder="Enter Retailer Address"
                                        colorScheme="white"
                                        color={textColor}
                                        value={checkHarvesterAddress}
                                        onChange={(e) => setCheckHarvesterAddress(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={handleCheckSubmit}>
                                {checkProcessing ? "Processing" : "Check Harvester"}
                                {checkProcessing && <Spinner size="sm" ml="2" zIndex="9999" />}
                            </Button>
                        </Box>
                    </Box>
                </Card>

                <Card>
                    <Box p="6">
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                Remove Retailer Address
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="RemoveharvesterId" color={textColor}>
                                        Retailer Address
                                    </FormLabel>
                                    <Input
                                        id="RemoveHarvesterAddress"
                                        placeholder="Enter Retailer Address"
                                        colorScheme="white"
                                        color={textColor}
                                        value={removeHarvesterAddress}
                                        onChange={(e) => setRemoveHarvesterAddress(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={removeHandleSubmit}>
                                Remove Retailer
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </SimpleGrid>
        </Box>
    )
}
