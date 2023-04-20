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
} from "@chakra-ui/react"

import Card from "components/card/Card.js"

import Web3 from "web3"
import { toast } from "react-toastify"

const web3 = new Web3(Web3.givenProvider)
const contractAbi = require("../../../contracts/durianSupplyChain.json").abi
const { DurianSupplyChain: contractAddress } = require("../../../contracts/contract-address.json")
const contract = new web3.eth.Contract(contractAbi, contractAddress)
export default function Marketplace() {
    // Chakra Color Mode
    const textColor = useColorModeValue("secondaryGray.900", "white")
    const textColorBrand = useColorModeValue("brand.500", "white")

    // Initialize state variables
    const [durianId, setDurianId] = useState(0)
    const [durianPrice, setDurianPrice] = useState("")
  
    // Update state variables on input change
    const handleDurianIdChange = (event) => {
        setDurianId(event.target.value)
    }

    const handleDurianPriceChange = (event) => {
        setDurianPrice(event.target.value)
    }


    // Log state variables on form submit
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(harvesterAddress)
        console.log(contract)

        try {
            await contract.methods
                .sellDurianByRetailer(harvesterAddress)

                .send({ from: sessionStorage.getItem("walletAddress") })

            // Display success message
            toast.success("Harvest Durian Added Succesfully!")
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
                                Purchase Durian :for sale by retailer
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="harvesterId" color={textColor}>
                                        Durian ID
                                    </FormLabel>
                                    <Input
                                        id="HarvesterAddress"
                                        placeholder="Enter Distributor Address"
                                        colorScheme="white"
                                        color={textColor}
                                        value={harvesterAddress}
                                        onChange={(e) => setHarvesterAddress(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={handleSubmit}>
                                Purchase Durian
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </SimpleGrid>
        </Box>
    )
}
