import React from "react"

// Chakra imports
import { Button, Flex, Link, Text } from "@chakra-ui/react"

// Assets
import banner from "assets/img/nfts/tree2.png"

export default function Banner() {
    // Chakra Color Mode
    return (
        <Flex
            direction="column"
            bgImage={banner}
            bgSize="auto 100%"
            py={{ base: "30px", md: "56px" }}
            px={{ base: "30px", md: "64px" }}
            borderRadius="30px"
        ></Flex>
    )
}
