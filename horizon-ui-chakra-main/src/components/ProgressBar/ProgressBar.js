import React from "react"
import { Progress, Box, Text } from "@chakra-ui/react"

function DeliveryStatus({ progress, status }) {
    return (
        <Box>
            <Text mb={2} fontWeight="bold">
                Delivery Status
            </Text>
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Box bg="gray.100" w="100%" p={2}>
                    <Box bg="blue.500" h="5px" w={`${progress}%`} />
                </Box>
                <Box p={4}>
                    <Text fontWeight="bold">{status}</Text>
                    <Text>{progress}%</Text>
                </Box>
            </Box>
        </Box>
    )
}

export default DeliveryStatus
