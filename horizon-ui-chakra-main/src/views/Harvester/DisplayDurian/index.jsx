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
    Divider,
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

import tableDataTopCreators from "views/admin/marketplace/variables/tableDataTopCreators.json"
import { tableColumnsTopCreators } from "views/admin/marketplace/variables/tableColumnsTopCreators"

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
    const [dropdownVisible, setDropdownVisible] = useState(false)

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible)
    }
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

                    const formattedTimestamp = convertTimestamp(bufferTwo.harvestedTime)
                    const formattedTimestamp2 = convertTimestamp(bufferTwo.distributedTime)

                    const formattedTimestamp3 = convertTimestamp(bufferTwo.retailedTime)

                    const formattedTimestamp4 = convertTimestamp(bufferThree.consumerBoughtTime)
                    console.log(bufferOne.farmName + "WANT THIS")
                    // Combine the data from the two buffers into a single object
                    var digit = Number(bufferOne.durianState)
                    const durian = {
                        durianToCode: bufferOne.durianToCode,
                        ownerID: bufferOne.ownerID,
                        HarvesterPrice: bufferOne.harvestedDurianPrice,
                        statusPercentage: (digit + 1) * 7.7,
                        status: bufferOne.durianState,
                        durianType: bufferOne.durianType,
                        treeId: bufferOne.treeId,
                        farmName: bufferOne.farmName,
                        statusName: statusCurrentName,

                        harvesterID:
                            bufferTwo.harvesterID === "0x0000000000000000000000000000000000000000"
                                ? "-"
                                : bufferTwo.harvesterID,
                        harvestedTime: formattedTimestamp,
                        distributorID:
                            bufferTwo.distributorID ===
                            "0x0000000000000000000000000000000000000000"
                                ? "-"
                                : bufferTwo.distributorID,
                        distributedDurianPrice: bufferTwo.distributedDurianPrice,
                        distributedTime: formattedTimestamp2,
                        retailerID:
                            bufferTwo.retailerID === "0x0000000000000000000000000000000000000000"
                                ? "-"
                                : bufferTwo.retailerID,
                        retailedTime: formattedTimestamp3,

                        consumerID:
                            bufferThree.consumerID === "0x0000000000000000000000000000000000000000"
                                ? "-"
                                : bufferTwo.consumerID,
                        consumerBoughtTime: formattedTimestamp4,
                        packaging: bufferThree.packaging === "" ? bufferFour.packaging : "-",
                        piecesFlesh: bufferThree.piecesFlesh === 0 ? bufferFour.piecesFlesh : "-",

                        taste: bufferFour.taste === 0 ? bufferFour.taste : "-",
                        condition: bufferFour.condition === 0 ? bufferFour.condition : "-",
                        fragrance: bufferFour.fragrance === 0 ? bufferFour.fragrance : "-",
                        creaminess: bufferFour.creaminess === 0 ? bufferFour.creaminess : "-",
                        ripeness: bufferFour.ripeness === 0 ? bufferFour.ripeness : "-",
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

    function convertTimestamp(timestamp) {
        const date = new Date(timestamp * 1000)
        return date.toLocaleString()
    }

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

            <Flex direction="column" w="100%" overflowX={{ sm: "scroll", lg: "hidden" }} mt={10}>
                <Flex
                    align={{ sm: "flex-start", lg: "center" }}
                    justify="space-between"
                    w="100%"
                    px="22px"
                    pb="20px"
                    mb="10px"
                    boxShadow="0px 40px 58px -20px rgba(112, 144, 176, 0.26)"
                >
                    <Text color={textColor} fontSize="xl" fontWeight="600">
                        Display All Durian
                    </Text>
                    <Button variant="action">See all</Button>
                </Flex>
                <Card>
                    <Table variant="simple" color="gray.500">
                        <Thead></Thead>
                        <Tbody>
                            {durians.map((durian, index) => (
                                <React.Fragment key={index}>
                                    {index !== 0 && <Divider my={20} />}
                                    <Tr>
                                        <Th pe="10px" borderColor="transparent">
                                            <Flex
                                                justify="space-between"
                                                align="center"
                                                fontSize={{ sm: "10px", lg: "12px" }}
                                                color="gray.400"
                                            >
                                                Durian Detail
                                            </Flex>
                                        </Th>

                                        <Th pe="10px" borderColor="transparent">
                                            <Flex
                                                justify="space-between"
                                                align="center"
                                                fontSize={{ sm: "10px", lg: "12px" }}
                                                color="gray.400"
                                            >
                                                Value
                                            </Flex>
                                        </Th>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text fontWeight="bold" color={textColor}>
                                                    Durian To Code:
                                                </Text>
                                            </Flex>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.durianToCode}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To ownerID:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.ownerID}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To HarvesterPrice:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.HarvesterPrice} ETH
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To Status:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Box maxW="xl">
                                                    <ProgressBar
                                                        progress={durian.statusPercentage}
                                                        status={durian.statusName}
                                                    />
                                                </Box>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To durianType:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.durianType}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To Farm Name:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.farmName}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To Tree Id:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>{durian.treeId}</Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To harvesterID:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.harvesterID}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To harvestedTime:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.harvestedTime}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To distributorID:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.distributorID}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To distributedDurianPrice:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.distributedDurianPrice === "0"
                                                        ? "-"
                                                        : durian.distributedDurianPrice}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To distributedTime:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.distributedTime ===
                                                    "1/1/1970, 7:30:00 AM"
                                                        ? "-"
                                                        : durian.distributedTime}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To retailerID:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.retailerID}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To retailedTime:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.retailedTime === "1/1/1970, 7:30:00 AM"
                                                        ? "-"
                                                        : durian.retailedTime}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To consumerID:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.consumerID}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To consumerBoughtTime:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.consumerBoughtTime ===
                                                    "1/1/1970, 7:30:00 AM"
                                                        ? "-"
                                                        : durian.consumerBoughtTime}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To piecesFlesh:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.piecesFlesh === "0"
                                                        ? "-"
                                                        : durian.piecesFlesh}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To piecesFlesh:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.piecesFlesh}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To taste:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>{durian.taste}</Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To condition:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.condition}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To fragrance:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.fragrance}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To creaminess:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.creaminess}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>{" "}
                                    <Tr>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            ></Flex>

                                            <Text fontWeight="bold" color={textColor}>
                                                Durian To ripeness:
                                            </Text>
                                        </Td>
                                        <Td
                                            fontSize={{ sm: "14px" }}
                                            minW={{ sm: "150px", md: "200px", lg: "auto" }}
                                            borderColor="transparent"
                                        >
                                            <Flex
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt={2}
                                            >
                                                <Text color={textColorBrand}>
                                                    {durian.ripeness}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                </React.Fragment>
                            ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    )
}
