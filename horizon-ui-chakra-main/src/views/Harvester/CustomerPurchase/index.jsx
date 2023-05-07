import React, { useState, useEffect } from "react"
// Chakra imports
import {
    Box,
    Button,
    Flex,
    Grid,
    Link,
    Text,
    useColorModeValue,
    SimpleGrid,
    Stack,
    FormControl,
    FormLabel,
    Input,
} from "@chakra-ui/react"
import Web3 from "web3"
import { ToastContainer, toast } from "react-toastify"
// Custom components
import Banner from "../CustomerPurchase/components/Banner"
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators"
import HistoryItem from "views/admin/marketplace/components/HistoryItem"
import NFT from "components/card/NFT"
import Card from "components/card/Card.js"

// Assets
import Nft1 from "assets/img/nfts/durian4.gif"
import Nft2 from "assets/img/nfts/durian2.gif"
import Nft3 from "assets/img/nfts/durian.gif"
import Nft4 from "assets/img/nfts/Nft4.png"
import Nft5 from "assets/img/nfts/Nft5.png"
import Nft6 from "assets/img/nfts/Nft6.png"
import Avatar1 from "assets/img/avatars/avatar1.png"
import Avatar2 from "assets/img/avatars/avatar2.png"
import Avatar3 from "assets/img/avatars/avatar3.png"
import Avatar4 from "assets/img/avatars/avatar4.png"
import tableDataTopCreators from "views/admin/marketplace/variables/tableDataTopCreators.json"
import { tableColumnsTopCreators } from "views/admin/marketplace/variables/tableColumnsTopCreators"

export default function Marketplace() {
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

    const [musangKingQtt, setMusangKingQtt] = useState(0)
    const [d24Qtt, setd24Qtt] = useState(0)
    const [blackThornQtt, setBlackThornQtt] = useState(0)

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
                console.log(durianCodes)
                // Loop through all the durians in the mapping and get their data
                const durianData = []
                let musangKing = 0
                let d24 = 0
                let blackThorn = 0

                for (let i = 0; i < count; i++) {
                    const bufferOne = await contract.methods
                        .fetchDurianBufferOne(durianCodes[i])
                        .call()
                    console.log(bufferOne.durianType)
                    if (bufferOne.durianType === "musang king") {
                        musangKing++
                    } else if (bufferOne.durianType === "d24") {
                        d24++
                    } else if (bufferOne.durianType === "black thorn") {
                        blackThorn++
                    }
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
                    }

                    durianData.push(durian)
                }

                // Update the state with the durian data
                setDurians(durianData)
                setMusangKingQtt(musangKing)
                console.log(musangKing)
                setd24Qtt(d24)
                setBlackThornQtt(blackThorn)
            } catch (error) {
                console.log(error)
            }
        }

        fetchData()
    }, [])
    return (
        <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
            {/* Main Fields */}
            <Grid
                mb="20px"
                gridTemplateColumns={{ xl: "repeat(3, 1fr)", "2xl": "1fr 0.46fr" }}
                gap={{ base: "20px", xl: "20px" }}
                display={{ base: "block", xl: "grid" }}
            >
                <Flex
                    flexDirection="column"
                    gridArea={{ xl: "1 / 1 / 2 / 3", "2xl": "1 / 1 / 2 / 2" }}
                >
                    <Banner />
                    <Flex direction="column">
                        <Flex
                            mt="45px"
                            mb="20px"
                            justifyContent="space-between"
                            direction={{ base: "column", md: "row" }}
                            align={{ base: "start", md: "center" }}
                        >
                            <Text color={textColor} fontSize="2xl" ms="24px" fontWeight="700">
                                Durian Types
                            </Text>
                            <Flex
                                align="center"
                                me="20px"
                                ms={{ base: "24px", md: "0px" }}
                                mt={{ base: "20px", md: "0px" }}
                            ></Flex>
                        </Flex>
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px">
                            <NFT
                                name="Musang King"
                                author={`pieces available: ${musangKingQtt}`}
                                data="musang king"
                                bidders={[
                                    Avatar1,
                                    Avatar2,
                                    Avatar3,
                                    Avatar4,
                                    Avatar1,
                                    Avatar1,
                                    Avatar1,
                                    Avatar1,
                                ]}
                                image={Nft1}
                                currentbid="0.91 ETH"
                                download="#"
                            />
                            <NFT
                                name="D24"
                                author={`pieces available: ${d24Qtt}`}
                                data="d24"
                                bidders={[
                                    Avatar1,
                                    Avatar2,
                                    Avatar3,
                                    Avatar4,
                                    Avatar1,
                                    Avatar1,
                                    Avatar1,
                                    Avatar1,
                                ]}
                                image={Nft2}
                                currentbid="0.91 ETH"
                                download="#"
                            />
                            <NFT
                                name="Black Thorn"
                                data="black thorn"
                                author={`pieces available: ${blackThornQtt}`}
                                bidders={[
                                    Avatar1,
                                    Avatar2,
                                    Avatar3,
                                    Avatar4,
                                    Avatar1,
                                    Avatar1,
                                    Avatar1,
                                    Avatar1,
                                ]}
                                image={Nft3}
                                currentbid="0.91 ETH"
                                download="#"
                            />
                        </SimpleGrid>
                    </Flex>
                </Flex>
            </Grid>
            {/* Delete Product */}
        </Box>
    )
}
