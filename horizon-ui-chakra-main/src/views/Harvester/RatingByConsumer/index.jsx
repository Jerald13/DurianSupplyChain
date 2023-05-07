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
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react"
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
    // State for distributor address input
    const [isAuthorized, setIsAuthorized] = useState(false) // add a state for authorization status
    const [taste, setTaste] = useState(5)
    const [condition, setCondition] = useState(5)
    const [fragrance, setFragrance] = useState(5)
    const [creaminess, setCreaminess] = useState(5)
    const [ripeness, setRipeness] = useState(5)

    const handleTasteChange = (value) => {
        setTaste(value)
    }

    const handleConditionChange = (value) => {
        setCondition(value)
    }

    const handleFragranceChange = (value) => {
        setFragrance(value)
    }

    const handleCreaminessChange = (value) => {
        setCreaminess(value)
    }

    const handleRipenessChange = (value) => {
        setRipeness(value)
    }
    useEffect(() => {
        // check if user is authorized

        async function checkAuthorization() {
            const walletAddress = sessionStorage.getItem("walletAddress")
            const owner = await contract.methods.owner().call()
            const distributor = await contract.methods.isHarvester(walletAddress).call()

            if (walletAddress === owner || distributor) {
                setIsAuthorized(true)
            }
        }

        checkAuthorization()
    }, [contract.methods])

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(harvesterAddress)
        console.log(taste)

        try {
            await contract.methods
                .rateDurianFromConsumer(
                    harvesterAddress,
                    taste,
                    condition,
                    fragrance,
                    creaminess,
                    ripeness
                )
                .send({ from: sessionStorage.getItem("walletAddress") })

            // Display success message
            toast.success("Distributor Purchase successfully!")
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
                                Rating by consumer
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
                                <FormControl></FormControl>
                            </SimpleGrid>
                            <Button mt={4} colorScheme="blue" onClick={handleSubmit}>
                                Purchase Durian
                            </Button>
                        </Box>
                    </Box>
                </Card>
                <div>
                    <Card p="4" mb="4">
                        <Text mb="2">Taste</Text>
                        <Slider
                            defaultValue={taste}
                            min={1}
                            max={5}
                            step={1}
                            w="200px"
                            onChange={handleTasteChange}
                        >
                            <SliderTrack bg="gray.200">
                                <SliderFilledTrack bg="brand.500" />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </Card>
                    <Card p="4" mb="4">
                        <Text mb="2">Condition</Text>
                        <Slider
                            defaultValue={condition}
                            min={1}
                            max={5}
                            step={1}
                            w="200px"
                            onChange={handleConditionChange}
                        >
                            <SliderTrack bg="gray.200">
                                <SliderFilledTrack bg="brand.500" />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </Card>
                    <Card p="4" mb="4">
                        <Text mb="2">Fragrance</Text>
                        <Slider
                            defaultValue={fragrance}
                            min={1}
                            max={5}
                            step={1}
                            w="200px"
                            onChange={handleFragranceChange}
                        >
                            <SliderTrack bg="gray.200">
                                <SliderFilledTrack bg="brand.500" />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </Card>
                    <Card p="4" mb="4">
                        <Text mb="2">Creaminess</Text>
                        <Slider
                            defaultValue={creaminess}
                            min={1}
                            max={5}
                            step={1}
                            w="200px"
                            onChange={handleCreaminessChange}
                        >
                            <SliderTrack bg="gray.200">
                                <SliderFilledTrack bg="brand.500" />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </Card>
                    <Card p="4" mb="4">
                        <Text mb="2">Ripeness</Text>
                        <Slider
                            defaultValue={ripeness}
                            min={1}
                            max={5}
                            step={1}
                            w="200px"
                            onChange={handleRipenessChange}
                        >
                            <SliderTrack bg="gray.200">
                                <SliderFilledTrack bg="brand.500" />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </Card>
                </div>
            </SimpleGrid>
        </Box>
    )
}
