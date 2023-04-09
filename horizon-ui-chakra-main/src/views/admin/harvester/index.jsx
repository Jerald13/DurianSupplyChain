import React from "react"

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

// Custom components
import Banner from "views/admin/marketplace/components/Banner"
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators"
import HistoryItem from "views/admin/marketplace/components/HistoryItem"
import NFT from "components/card/NFT"
import Card from "components/card/Card.js"

export default function Marketplace() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const textColorBrand = useColorModeValue("brand.500", "white")

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
              <form>
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
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="harvesterId" color={textColor}>
                      Harvester ID
                    </FormLabel>
                    <Input
                      id="harvesterId"
                      placeholder="Enter Harvester ID"
                      colorScheme="white"
                      color={textColor}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="harvesterAddress" color={textColor}>
                      Harvester Address
                    </FormLabel>
                    <Input
                      id="harvesterAddress"
                      placeholder="Enter Harvester Address"
                      colorScheme="white"
                      color={textColor}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel color={textColor}>Durian Type</FormLabel>
                    <Select placeholder="Select Durian Type" color={textColor}>
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
                    />
                  </FormControl>
                </SimpleGrid>
                <Button mt={4} colorScheme="blue" type="submit">
                  Submit
                </Button>
              </form>
            </Box>
          </Box>
        </Card>
      </SimpleGrid>
    </Box>
  )
}
