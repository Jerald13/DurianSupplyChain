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
    const [foundDurianData, setFoundDurianData] = useState(null) // add state for found durian data
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

                    const statusCurrentName = handleUpdateStatus(bufferOne.durianState)
                    // Combine the data from the two buffers into a single object
                    var digit = Number(bufferOne.durianState)
                    const durian = {
                        id: i,
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
            "Durian Current Price State (Durian Weight * 0.005 ether)":
                web3.utils.fromWei(durian.durianCurrentPriceState, "ether") + "ETH",
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

    const [checkboxes, setCheckboxes] = useState([
        { id: 1, label: "Checkbox 1", checked: false },
        { id: 2, label: "Checkbox 2", checked: true },
        { id: 3, label: "Checkbox 3", checked: false },
    ])

    const handleCheckboxChange = (index) => {
        const newCheckboxes = [...checkboxes]
        newCheckboxes[index].checked = !newCheckboxes[index].checked
        setCheckboxes(newCheckboxes)
        console.log(checkboxes)
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
                                        <>
                                            {checkboxes.map((checkbox, index) => (
                                                <Checkbox
                                                    key={checkbox.id}
                                                    isChecked={checkbox.checked}
                                                    onChange={() => handleCheckboxChange(index)}
                                                >
                                                    {checkbox.label}
                                                </Checkbox>
                                            ))}
                                        </>
                                    </Td>

                                    <Td>{durian.id}</Td>
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
            </Card>
        </Box>
    )
}
