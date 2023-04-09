import { Button, useToast, Flex, Text, Box } from "@chakra-ui/react"
import { Web3Provider } from "@ethersproject/providers"
import Web3Modal from "web3modal"
import { useState } from "react"

function HeaderLinks(props) {
  const [web3Modal, setWeb3Modal] = useState(null)
  const [provider, setProvider] = useState(null)
  const [address, setAddress] = useState("")
  const [connected, setConnected] = useState(false)
  const toast = useToast()

  const connectWeb3Modal = async () => {
    const newWeb3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })

    setWeb3Modal(newWeb3Modal)

    const newProvider = await newWeb3Modal.connect()

    if (newProvider) {
      setProvider(new Web3Provider(newProvider))
      setConnected(true)

      // get the user address
      const signer = new Web3Provider(newProvider).getSigner()
      const address = await signer.getAddress()
      setAddress(address)

      toast({
        title: "Connected",
        description: `Connected to ${await newProvider
          .getNetwork()
          .then((n) => n.name)}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const disconnectWeb3Modal = async () => {
    if (web3Modal) {
      await web3Modal.clearCachedProvider()

      setProvider(null)
      setConnected(false)
      setAddress("")

      toast({
        title: "Disconnected",
        description: `Disconnected from wallet`,
        status: "info",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const shortAddress = (addr) => {
    return addr.substring(0, 6) + "..." + addr.substring(38)
  }

  return (
    <Box p={2} borderRadius="md">
      {connected ? (
        <Flex alignItems="center">
          <Text mr={2} fontSize="sm">
            {shortAddress(address)}
          </Text>
          <Button onClick={disconnectWeb3Modal} size="sm">
            Disconnect
          </Button>
        </Flex>
      ) : (
        <Button onClick={connectWeb3Modal} size="sm">
          Connect Wallet
        </Button>
      )}
    </Box>
  )
}

export default HeaderLinks
