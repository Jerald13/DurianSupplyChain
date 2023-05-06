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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Checkbox,
} from "@chakra-ui/react"

// Custom components
import Banner from "views/admin/marketplace/components/Banner"
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators"
import HistoryItem from "views/admin/marketplace/components/HistoryItem"
import NFT from "components/card/NFT"
import Card from "components/card/Card.js"
import Web3Modal from "web3modal"
import Web3 from "web3"
import ProgressBar from "components/progressBar/ProgressBar.js"
import { ToastContainer, toast } from "react-toastify"
export default function Marketplace() {
    // Chakra Color Mode
    const textColor = useColorModeValue("secondaryGray.900", "white")
    const textColorBrand = useColorModeValue("brand.500", "white")
    const [harvesterAddress, setHarvesterAddress] = useState("")
    const [checkHarvesterAddress, setCheckHarvesterAddress] = useState("")
    const [removeHarvesterAddress, setRemoveHarvesterAddress] = useState("")

    const [foundDurianData, setFoundDurianData] = useState(null) // add state for found durian data
    const [checkProcessing, checkIsProcessing] = useState(false)
    const web3 = new Web3(Web3.givenProvider)
    const [durians, setDurians] = useState([])
    const contractAbi = require("../../../contracts/durianSupplyChain.json").abi
    const {
        DurianSupplyChain: contractAddress,
    } = require("../../../contracts/contract-address.json")
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    // State for harvester address input
    const [isAuthorized, setIsAuthorized] = useState(false) // add a state for authorization status
    const [selectedValues, setSelectedValues] = useState([])
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

    const handleCheckboxChange = (event) => {
        const { value } = event.target
        setSelectedValues((prevValues) =>
            prevValues.includes(value)
                ? prevValues.filter((v) => v !== value)
                : [...prevValues, value]
        )
        console.log(selectedValues)
    }

    useEffect(() => {
        async function fetchData() {
            try {
                // Get the number of durians in the mapping
                const count = await contract.methods.stockUnit().call()
                const durianCodes = await contract.methods.getAllDurianCodes().call()
                // Loop through all the durians in the mapping and get their data
                const durianData = []
                for (let i = 0; i < count; i++) {
                    const bufferOne = await contract.methods
                        .fetchDurianBufferOne(durianCodes[i])
                        .call()

                    const statusCurrentName = handleUpdateStatus(bufferOne.durianState)
                    // Combine the data from the two buffers into a single object
                    var digit = Number(bufferOne.durianState)
                    const durian = {
                        id: i,
                        durianCode: bufferOne.durianToCode,
                        name: bufferOne.HarvestLocationAddress,
                        type: bufferOne.durianType,
                        statusPercentage: (digit + 1) * 7.7,
                        status: bufferOne.durianState,
                        statusName: statusCurrentName,
                    }

                    // Add the durian data to the array
                    durianData.push(durian)
                }

                // Update the state with the durian data
                setDurians(durianData)
            } catch (error) {
                console.log(error)
            }
        }

        fetchData()
    }, [])

    function handleUpdateStatus(progress) {
        if (progress == 0) {
            return "Produce by Harvester"
        } else if (progress == 1) {
            return "For sale by harvester"
        } else if (progress == 2) {
            return "Purchase by distributor"
        } else if (progress == 3) {
            return "Shipped by harvester"
        } else if (progress == 4) {
            return "ReceivedByDistributor"
        } else if (progress == 5) {
            return "ProcessedByDistributor"
        } else if (progress == 6) {
            return "ForSaleByDistributor"
        } else if (progress == 7) {
            return "PurchasedByRetailer"
        } else if (progress == 8) {
            return "ShippedByDistributor"
        } else if (progress == 9) {
            return "ReceivedByRetailer"
        } else if (progress == 10) {
            return "ForSaleByRetailer"
        } else if (progress == 11) {
            return "PurchasedByConsumer"
        } else if (progress == 12) {
            return "RatingByConsumer"
        }
    }
    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(harvesterAddress)
        console.log(contract)

        try {
            await contract.methods
                .sellDurianByHarvester(harvesterAddress)
                .send({ from: sessionStorage.getItem("walletAddress") })

            // Display success message
            toast.success("Harvester added successfully!")
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
                                Sell Durian Id
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="harvesterId" color={textColor}>
                                        Sell Durian Id
                                    </FormLabel>
                                    <Input
                                        id="HarvesterAddress"
                                        placeholder="Enter Sell Durian Id"
                                        colorScheme="white"
                                        color={textColor}
                                        value={harvesterAddress}
                                        onChange={(e) => setHarvesterAddress(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={handleSubmit}>
                                Sell
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </SimpleGrid>

            {foundDurianData && (
                <Card mt={4}>
                    <Box p="6">
                        {Object.entries(foundDurianData).map(([key, value]) => (
                            <Flex
                                key={key}
                                alignItems="center"
                                justifyContent="space-between"
                                mt={2}
                            >
                                <Text fontWeight="bold" color={textColor}>
                                    {key}
                                </Text>
                                <Text color={textColorBrand}>{value}</Text>
                            </Flex>
                        ))}
                    </Box>
                </Card>
            )}

            <Card marginTop="4">
                <Box>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Select</Th>
                                <Th>Durian ID</Th>
                                <Th>Durian Name</Th>
                                <Th>Durian Type</Th>
                                <Th>Durian Price</Th>
                                <Th>Durian Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {durians.map((durian) => (
                                <Tr key={durian.id}>
                                    <Td>
                                        <Checkbox
                                            key={durian.durianCode}
                                            value={durian.durianCode}
                                            onChange={handleCheckboxChange}
                                        >
                                            {durian.durianCode}
                                        </Checkbox>
                                    </Td>

                                    <Td>{durian.durianCode}</Td>
                                    <Td>{durian.name}</Td>
                                    <Td>{durian.type}</Td>
                                    <Td>{durian.price}</Td>
                                    <Td>{durian.status}</Td>
                                    <Td>
                                        <Box maxW="xl" mx="auto" mt={8}>
                                            <ProgressBar
                                                progress={durian.statusPercentage}
                                                status={durian.statusName}
                                            />
                                            <Text>Status: {durian.statusName}</Text>
                                        </Box>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
                <Button mt={4} colorScheme="blue" onClick={handleSubmit}>
                    Sell
                </Button>
            </Card>
        </Box>
    )
}
