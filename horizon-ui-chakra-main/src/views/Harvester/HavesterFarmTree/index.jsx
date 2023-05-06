import React, { useState, useEffect, useCallback } from "react"

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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react"
import Nft2 from "assets/img/nfts/Nft1.png"

// Custom components
import Banner from "./components/Banner"
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators"
import HistoryItem from "./components/HistoryItem"
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

    const [farmName, setFarmName] = useState(0)
    const [treeId, setTreeId] = useState(0)

    const web3 = new Web3(Web3.givenProvider)
    const contractAbi = require("../../../contracts/durianSupplyChain.json").abi
    const {
        DurianSupplyChain: contractAddress,
    } = require("../../../contracts/contract-address.json")
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    // State for distributor address input
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [durians, setDurians] = useState([])

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

    const handleSubmit = async (event) => {
        event.preventDefault()

        console.log(contract)

        try {
            await contract.methods.addFarm(harvesterAddress).send({
                from: sessionStorage.getItem("walletAddress"),
            })
            toast.success("Distributor Purchase successfully!")
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    const handleTreeSubmit = async (event) => {
        event.preventDefault()

        console.log(contract)
        console.log(farmName)
        try {
            await contract.methods.addTree(farmName, treeId).send({
                from: sessionStorage.getItem("walletAddress"),
            })
            toast.success("Distributor Purchase successfully!")
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    return (
        <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
            <SimpleGrid columns={1} spacing={6}>
                <Banner></Banner>
                <Card>
                    <Box p="6">
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                Create New Farm
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="harvesterId" color={textColor}>
                                        Farm Name
                                    </FormLabel>
                                    <Input
                                        id="HarvesterAddress"
                                        placeholder="Enter Farm Name"
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
                <Card>
                    <Box p="6">
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                Create Tree in which farm
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="harvesterId" color={textColor}>
                                        Farm Name
                                    </FormLabel>
                                    <Select onChange={(e) => setFarmName(e.target.value)}>
                                        <option>Select Farm Option</option>
                                        {durians.map((durian) => (
                                            <option key={durian.id} value={durian.id}>
                                                {durian.farmName}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor="TreeId" color={textColor}>
                                        Tree ID
                                    </FormLabel>
                                    <Input
                                        id="TreeId"
                                        placeholder="Enter Tree Id"
                                        colorScheme="white"
                                        color={textColor}
                                        value={treeId}
                                        onChange={(e) => setTreeId(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={handleTreeSubmit}>
                                Purchase Durian
                            </Button>
                        </Box>
                    </Box>
                </Card>
                <Card marginTop="4">
                    <Box>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>TREE ID</Th>
                                    <Th>Durian FarmName</Th>
                                    <Th>Durian TreeIndices</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {durians.map((durian) => (
                                    <Tr key={durian.id}>
                                        <Td>{durian.id}</Td>
                                        <Td>{durian.farmName}</Td>
                                        <Td>
                                            {durian.treeIndices.length > 0 ? (
                                                durian.treeIndices.join(", ")
                                            ) : (
                                                <span>Empty</span>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </Card>
            </SimpleGrid>
        </Box>
    )
}
