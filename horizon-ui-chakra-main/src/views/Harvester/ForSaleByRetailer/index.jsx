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
    // State for distributor address input
    const [isAuthorized, setIsAuthorized] = useState(false) // add a state for authorization status

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
        console.log(contract)
    
        console.log(durian.durianCurrentPriceState)
        try {
            await contract.methods
                .sellDurianByRetailer(harvesterAddress)
          
                .send({ from: sessionStorage.getItem("walletAddress")}) 

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
