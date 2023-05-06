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
    const [harvesterAddress, setHarvesterAddress] = useState("")
    const [durianType, setDurianType] = useState("")
    const [durianWeight, setDurianWeight] = useState(0)
    const [durians, setDurians] = useState([])
    const [farmName, setFarmName] = useState(0)
    const [treeId, setTreeId] = useState(0)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            // Get the number of durians in the mapping
            const count = await contract.methods.farmCount().call()
            console.log(count)

            // Loop through all the durians in the mapping and get their data
            const durianData = []
            for (let i = 1; i <= count; i++) {
                const result = await contract.methods.getAllFarmTrees(i).call()
                const farmName = result[0]
                const treeIndices = result[1]

                const durian = {
                    id: i,
                    farmName: farmName,
                    treeIndices: treeIndices,
                }
                console.log(i)

                // Add the durian data to the array
                durianData.push(durian)
            }

            // Update the state with the durian data
            setDurians(durianData)
        } catch (error) {
            console.log(error)
        }
    }

    // Update state variables on input change
    const handleDurianIdChange = (event) => {
        setDurianId(event.target.value)
    }

    const handleHarvesterAddressChange = (event) => {
        setHarvesterAddress(event.target.value)
    }

    const handleDurianTypeChange = (event) => {
        setDurianType(event.target.value)
    }

    const handleDurianWeightChange = (event) => {
        setDurianWeight(event.target.value)
    }

    // Log state variables on form submit
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log("Durian ID:", durianId)
        console.log("Harvester Address:", harvesterAddress)
        console.log("Durian Type:", durianType)
        console.log("Durian Weight:", durianWeight)

        try {
            await contract.methods
                .produceDurianByHarvester(durianId, durianWeight, durianType, farmName, treeId)
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
                                Durian Form
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="durianId" color={textColor}>
                                        Durian ID
                                    </FormLabel>
                                    <Input
                                        id="durianId"
                                        placeholder="Enter Durian ID"
                                        colorScheme="white"
                                        color={textColor}
                                        value={durianId}
                                        type="number"
                                        min="0"
                                        onChange={handleDurianIdChange}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel htmlFor="harvesterId" color={textColor}>
                                        Farm Name
                                    </FormLabel>
                                    <Select onChange={(e) => setFarmName(e.target.value)}>
                                        {durians.map((durian) => (
                                            <option key={durian.id} value={durian.id}>
                                                {durian.farmName}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel htmlFor="TreeID" color={textColor}>
                                        Tree ID
                                    </FormLabel>
                                    <Input
                                        id="durianWeight"
                                        placeholder="Enter Tree ID"
                                        colorScheme="white"
                                        color={textColor}
                                        type="number"
                                        min="0"
                                        value={treeId}
                                        onChange={(e) => setTreeId(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl mb={4}>
                                    <FormLabel color={textColor}>Durian Type</FormLabel>
                                    <Select
                                        placeholder="Select Durian Type"
                                        color={textColor}
                                        value={durianType}
                                        onChange={handleDurianTypeChange}
                                    >
                                        <option value="musang king">Musang King</option>
                                        <option value="d24">D24</option>
                                        <option value="black thorn">Black Thorn</option>
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor="durianWeight" color={textColor}>
                                        Durian Weight
                                    </FormLabel>
                                    <Input
                                        id="durianWeight"
                                        placeholder="Enter Durian Weight"
                                        colorScheme="white"
                                        color={textColor}
                                        type="number"
                                        min="0"
                                        value={durianWeight}
                                        onChange={handleDurianWeightChange}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" type="submit" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </SimpleGrid>
        </Box>
    )
}
