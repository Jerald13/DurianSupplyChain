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
    Progress,
    Checkbox,
} from "@chakra-ui/react"
// Custom components
import Banner from "views/admin/marketplace/components/Banner"
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators"
import HistoryItem from "views/admin/marketplace/components/HistoryItem"
import NFT from "components/card/NFT"
import Card from "components/card/Card.js"
import ProgressBar from "components/progressBar/ProgressBar.js"

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

    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState("Preparing for shipment")

    const web3 = new Web3(Web3.givenProvider)
    const contractAbi = require("../../../contracts/durianSupplyChain.json").abi
    const {
        DurianSupplyChain: contractAddress,
    } = require("../../../contracts/contract-address.json")
    const contract = new web3.eth.Contract(contractAbi, contractAddress)
    // State for harvester address input
    const [isAuthorized, setIsAuthorized] = useState(false) // add a state for authorization status
    const [foundDurianData, setFoundDurianData] = useState(null)
    const [acc, setAcc] = useState("")

    const [durians, setDurians] = useState([])
    const [durianCodes, setDurianCodes] = useState([])
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
                    const bufferTwo = await contract.methods
                        .fetchDurianBufferTwo(durianCodes[i])
                        .call()
                    const bufferThree = await contract.methods
                        .fetchDurianBufferThree(durianCodes[i])
                        .call()
                    const bufferFour = await contract.methods
                        .fetchDurianBufferFour(durianCodes[i])
                        .call()

                    const result = await contract.methods.getAllFarmTrees(i).call()
                    const farmName = result[0]
                    const treeIndices = result[1]
                    const statusCurrentName = handleUpdateStatus(bufferOne.durianState)
                    // Combine the data from the two buffers into a single object
                    var digit = Number(bufferOne.durianState)
                    const durian = {
                        durianToCode: bufferOne.durianToCode,
                        ownerID: bufferOne.ownerID,
                        durianWeight: bufferOne.durianWeight,
                        statusPercentage: (digit + 1) * 7.7,
                        status: bufferOne.durianState,
                        durianType: bufferOne.durianType,
                        treeId: bufferOne.treeId,
                        farmName: bufferOne.farmName,
                        statusName: statusCurrentName,

                        harvesterID: bufferTwo.harvesterID,
                        harvestedTime: bufferTwo.harvestedTime,
                        distributorID: bufferTwo.distributorID,
                        distributedDurianPrice: bufferTwo.distributedDurianPrice,
                        distributedTime: bufferTwo.distributedTime,
                        retailerID: bufferTwo.retailerID,
                        retailedTime: bufferTwo.retailedTime,

                        consumerID: bufferThree.consumerID,
                        consumerBoughtTime: bufferThree.consumerBoughtTime,
                        packaging: bufferThree.packaging,
                        piecesFlesh: bufferThree.piecesFlesh,

                        taste: bufferFour.taste,
                        condition: bufferFour.condition,
                        fragrance: bufferFour.fragrance,
                        creaminess: bufferFour.creaminess,
                        ripeness: bufferFour.ripeness,
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

    const handleCheckSubmit = async () => {
        const durian = await contract.methods.fetchDurianBufferOne(checkHarvesterAddress).call()

        const ownerDurian = await checkIsOwner(durian.ownerID)
        const durianData = {
            "Durian ID": durian.durianToCode,
            "Owner ID": `${ownerDurian} : ` + durian.ownerID,
            "Harvest Location Address": durian.HarvestLocationAddress,
            "Durian Type": durian.durianType,
            "Durian State": durian.durianState,
            // "Durian Current Price State (Durian Weight * 0.005 ether)":
            //     web3.utils.fromWei(durian.durianCurrentPriceState, "ether") + "ETH",
            "Harvested Time": new Date(durian.harvestedTime * 1000).toLocaleString(),
        }
        if (durian != null) {
            setFoundDurianData(durianData) // update found durian data state
            toast.success(`Found`, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 2000,
            })
        } else {
            setFoundDurianData(null)
            toast.error(`Not Found`, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 5000,
            })
        }
    }

    async function checkIsOwner(ownerId) {
        console.log(contract)
        if (checkHarvesterAddress !== "") {
            const owner = await contract.methods.isOwner(ownerId).call()
            const harvester = await contract.methods.isHarvester(ownerId).call()
            const retailer = await contract.methods.isRetailer(ownerId).call()
            console.log(retailer)
            if (owner) {
                return "Owner"
            } else if (harvester) {
                return "Harvester"
            } else if (retailer) {
                return "Retailer"
            } else {
                return "User"
            }
        }
    }

    return (
        <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
            <SimpleGrid columns={1} spacing={6}>
                <Card>
                    <Box p="6">
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                                Check Durian Status
                            </Text>
                        </Box>
                        <Box my={4} textAlign="left">
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel htmlFor="CheckharvesterId" color={textColor}>
                                        Durian Id
                                    </FormLabel>
                                    <Input
                                        id="CheckHarvesterAddress"
                                        placeholder="Enter Durian Id"
                                        colorScheme="white"
                                        color={textColor}
                                        value={checkHarvesterAddress}
                                        onChange={(e) => setCheckHarvesterAddress(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={handleCheckSubmit}>
                                {checkProcessing ? "Processing" : "Durian ID"}
                                {checkProcessing && <Spinner size="sm" ml="2" zIndex="9999" />}
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

            <Card mt={4}>
                <Box p="6">
                    {durians.map((durian) => (
                        <div key={durian.durianToCode}>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian To Code:
                                </Text>
                                <Text color={textColorBrand}>{durian.durianToCode}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Owner ID:
                                </Text>
                                <Text color={textColorBrand}>{durian.ownerID}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian Weight:
                                </Text>
                                <Text color={textColorBrand}>{durian.durianWeight}</Text>
                            </Flex>

                            <Flex alignItems="center" justifyContent="space-between">
                                <Text fontWeight="bold" color={textColor}>
                                    Durian StatusPercentage & statusName:
                                </Text>
                                <Flex justifyContent="flex-end" mt={4}>
                                    <Box maxW="xl">
                                        <ProgressBar
                                            progress={durian.statusPercentage}
                                            status={durian.statusName}
                                        />
                                    </Box>
                                </Flex>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian status:
                                </Text>
                                <Text color={textColorBrand}>{durian.status}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian statusPercentage:
                                </Text>
                                <Text color={textColorBrand}>{durian.statusPercentage}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian durianType:
                                </Text>
                                <Text color={textColorBrand}>{durian.durianType}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian treeId:
                                </Text>
                                <Text color={textColorBrand}>{durian.treeId}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian farmName:
                                </Text>
                                <Text color={textColorBrand}>{durian.farmName}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian statusCurrentName:
                                </Text>
                                <Text color={textColorBrand}>{durian.statusCurrentName}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian harvesterID:
                                </Text>
                                <Text color={textColorBrand}>{durian.harvesterID}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian harvestedTime:
                                </Text>
                                <Text color={textColorBrand}>{durian.harvestedTime}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian distributorID:
                                </Text>
                                <Text color={textColorBrand}>{durian.distributorID}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian distributedDurianPrice:
                                </Text>
                                <Text color={textColorBrand}>{durian.distributedDurianPrice}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian distributedTime:
                                </Text>
                                <Text color={textColorBrand}>{durian.distributedTime}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian distributedDurianPrice:
                                </Text>
                                <Text color={textColorBrand}>{durian.distributedDurianPrice}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian retailerID:
                                </Text>
                                <Text color={textColorBrand}>{durian.retailerID}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian retailedTime:
                                </Text>
                                <Text color={textColorBrand}>{durian.retailedTime}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian consumerID:
                                </Text>
                                <Text color={textColorBrand}>{durian.consumerID}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian consumerBoughtTime:
                                </Text>
                                <Text color={textColorBrand}>{durian.consumerBoughtTime}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian retailedTime:
                                </Text>
                                <Text color={textColorBrand}>{durian.retailedTime}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian packaging:
                                </Text>
                                <Text color={textColorBrand}>{durian.packaging || "false"}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian piecesFlesh:
                                </Text>
                                <Text color={textColorBrand}>{durian.piecesFlesh}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian taste:
                                </Text>
                                <Text color={textColorBrand}>{durian.taste}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian condition:
                                </Text>
                                <Text color={textColorBrand}>{durian.condition}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian fragrance:
                                </Text>
                                <Text color={textColorBrand}>{durian.fragrance}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian creaminess:
                                </Text>
                                <Text color={textColorBrand}>{durian.creaminess}</Text>
                            </Flex>
                            <Flex alignItems="center" justifyContent="space-between" mt={2}>
                                <Text fontWeight="bold" color={textColor}>
                                    Durian ripeness:
                                </Text>
                                <Text color={textColorBrand}>{durian.ripeness}</Text>
                            </Flex>
                        </div>
                    ))}
                </Box>
            </Card>

            {/*
                   



                        consumerID: bufferThree.consumerID,
                        consumerBoughtTime: bufferThree.consumerBoughtTime,
                        packaging: bufferThree.packaging,
                        piecesFlesh: bufferThree.piecesFlesh,

                        taste: bufferFour.taste,
                        condition: bufferFour.condition,
                        fragrance: bufferFour.fragrance,
                        creaminess: bufferFour.creaminess,
                        ripeness: bufferFour.ripeness, */}

            <Flex direction="column" gap={4}>
                {durians.map((durian) => (
                    <Flex
                        key={durian.durianToCode}
                        direction="column"
                        borderWidth="1px"
                        p={4}
                        borderRadius="md"
                        float="right"
                    >
                        <Text fontWeight="bold">Durian Details</Text>
                        <Text>Durian To Code: {durian.durianToCode}</Text>
                        <Text>Owner ID: {durian.ownerID}</Text>
                        <Text>Durian Weight: {durian.durianWeight}</Text>
                        <Text>Status Percentage: {durian.statusPercentage}</Text>
                        <Text>Status: {durian.status}</Text>
                        <Text>Durian Type: {durian.durianType}</Text>
                        <Text>Tree ID: {durian.treeId}</Text>
                        <Text>Farm Name: {durian.farmName}</Text>
                        <Text>Status Name: {durian.statusName}</Text>
                        <Text>Harvester ID: {durian.harvesterID}</Text>
                        <Text>Harvested Time: {durian.harvestedTime}</Text>
                        <Text>Distributor ID: {durian.distributorID}</Text>
                        <Text>Distributed Durian Price: {durian.distributedDurianPrice}</Text>
                        <Text>Distributed Time: {durian.distributedTime}</Text>
                        <Text>Retailer ID: {durian.retailerID}</Text>
                        <Text>Retailed Time: {durian.retailedTime}</Text>
                        <Text>Consumer ID: {durian.consumerID}</Text>
                        <Text>Consumer Bought Time: {durian.consumerBoughtTime}</Text>
                        <Text>Packaging: {durian.packaging}</Text>
                        <Text>Pieces Flesh: {durian.piecesFlesh}</Text>
                        <Text>Taste: {durian.taste}</Text>
                        <Text>Condition: {durian.condition}</Text>
                        <Text>Fragrance: {durian.fragrance}</Text>
                        <Text>Creaminess: {durian.creaminess}</Text>
                        <Text>Ripeness: {durian.ripeness}</Text>
                    </Flex>
                ))}
            </Flex>

            {/* <Card marginTop="4">
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
                                    <Td>{durian.durianToCode}</Td>
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
                                        </Box>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card> */}
        </Box>
    )
}
