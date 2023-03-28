const { expect } = require("chai")
const { expectRevert } = require("@openzeppelin/test-helpers")
const humanReadableUnixTimestamp = (timestampInt) => {
    return new Date(timestampInt * 1000)
}
describe("Escrow Events and State", function () {
    // 1.
    let provider
    let Escrow, escrow, seller, firstBuyer, secondBuyer // seller is owner
    let closedEvent,
        confirmPurchaseEvent,
        sellerRefundBuyerEvent,
        confirmReceivedEvent,
        sellerRefundedEvent,
        restartedEvent,
        endEvent
    beforeEach(async () => {
        provider = ethers.getDefaultProvider()
        Escrow = await ethers.getContractFactory("Escrow")
        escrow = await Escrow.deploy({ value: ethers.utils.parseEther("2.0") })
        // 2.
        ;[seller, firstBuyer, secondBuyer, _] = await ethers.getSigners()
        // 3.
        closedEvent = new Promise((resolve, reject) => {
            escrow.on("Closed", (when, event) => {
                event.removeListener()
                resolve({
                    when,
                })
            })
            setTimeout(() => {
                reject(new Error("timeout"))
            }, 60000)
        })
        confirmPurchaseEvent = new Promise((resolve, reject) => {
            escrow.on("ConfirmPurchase", (when, by, event) => {
                event.removeListener()
                resolve({
                    when,
                    by,
                })
            })
            setTimeout(() => {
                reject(new Error("timeout"))
            }, 60000)
        })
        sellerRefundBuyerEvent = new Promise((resolve, reject) => {
            escrow.on("SellerRefundBuyer", (when, event) => {
                event.removeListener()
                resolve({
                    when,
                })
            })
            setTimeout(() => {
                reject(new Error("timeout"))
            }, 60000)
        })
        confirmReceivedEvent = new Promise((resolve, reject) => {
            escrow.on("ConfirmReceived", (when, by, event) => {
                event.removeListener()
                resolve({
                    when,
                    by,
                })
            })
            setTimeout(() => {
                reject(new Error("timeout"))
            }, 60000)
        })
        sellerRefundedEvent = new Promise((resolve, reject) => {
            escrow.on("SellerRefunded", (when, event) => {
                event.removeListener()
                resolve({
                    when,
                })
            })
            setTimeout(() => {
                reject(new Error("timeout"))
            }, 60000)
        })
        restartedEvent = new Promise((resolve, reject) => {
            escrow.on("Restarted", (when, event) => {
                event.removeListener()
                resolve({
                    when,
                })
            })
            setTimeout(() => {
                reject(new Error("timeout"))
            }, 60000)
        })
        endEvent = new Promise((resolve, reject) => {
            escrow.on("End", (when, event) => {
                event.removeListener()
                resolve({
                    when,
                })
            })
            setTimeout(() => {
                reject(new Error("timeout"))
            }, 60000)
        })
    })
    // 4.
    it("Should set the contract state to 'Closed'.", async function () {
        expect(await escrow.seller()).to.equal(seller.address)
        expect(await escrow.totalSales()).to.equal(0) // Should be 0
        expect(await escrow.state()).to.equal(0) // Sale
        // 4.
        await escrow.close()
        let event = await closedEvent
        console.log("Closed")
        console.log(humanReadableUnixTimestamp(event.when.toString()))
        expect(await escrow.state()).to.equal(3) // Closed
    })
    it("Should set the contract state to 'Closed' to 'Sale' again", async function () {
        expect(await escrow.seller()).to.equal(seller.address)
        expect(await escrow.state()).to.equal(0) // Sale
        // const beforeContractBalance = await provider.getBalance(escrow.address);
        // console.log(ethers.utils.formatEther(beforeContractBalance));
        // expect(ethers.utils.formatEther(beforeContractBalance)).to.equal(2);
        // const beforeCloseSellerBalance = await provider.getBalance(seller.address);
        // console.log(ethers.utils.formatEther(beforeCloseSellerBalance));
        await escrow.close()
        expect(await escrow.state()).to.equal(3) // Closed
        await escrow.restartContract({ value: ethers.utils.parseEther("2.0") })
        let event = await restartedEvent
        console.log("Restarted")
        console.log(humanReadableUnixTimestamp(event.when.toString()))
        expect(await escrow.state()).to.equal(0) // Sale
    })
    it("Should allow the seller to end the contract when the state is 'Closed'", async function () {
        expect(await escrow.seller()).to.equal(seller.address)
        expect(await escrow.state()).to.equal(0) // Sale
        await escrow.close()
        expect(await escrow.state()).to.equal(3) // Closed
        // Revert with the error message "Seller shouldn't call this"
        // 4.
        await expectRevert(escrow.connect(firstBuyer).end(), "Only seller can call this.")
        await expectRevert(escrow.connect(secondBuyer).end(), "Only seller can call this.")
        // Only seller can call this.
        await escrow.end()
        let event = await endEvent
        console.log("End")
        console.log(humanReadableUnixTimestamp(event.when.toString()))
    })
    // 5.
    it("Should set the contract state to 'Sale' to 'Locked' and refundSeller should fail and refundBuyer should work.", async function () {
        expect(await escrow.seller()).to.equal(seller.address)
        expect(await escrow.state()).to.equal(0) // Sale
        expect(await escrow.buyer()).to.equal("0x0000000000000000000000000000000000000000") // Not set yet, default
        // Revert with the error message "Seller shouldn't call this"
        await expectRevert(
            escrow.confirmPurchase({ value: ethers.utils.parseEther("2.0") }),
            "Seller shouldn't call this"
        )
        // How to set msg.sender for ether js?
        // Use connect method
        // 5.
        await escrow.connect(firstBuyer).confirmPurchase({ value: ethers.utils.parseEther("2.0") })
        let event = await confirmPurchaseEvent
        console.log("ConfirmPurchase")
        console.log(humanReadableUnixTimestamp(event.when.toString()))
        expect(event.by).to.equal(firstBuyer.address)
        expect(await escrow.buyer()).to.equal(firstBuyer.address)
        expect(await escrow.state()).to.equal(1) // Locked
        // When "Locked", shouldn't allow this. Revert with the error message "revert Invalid state"
        await expectRevert(escrow.refundSeller(), "revert Invalid state")
        await escrow.refundBuyer()
        event = await sellerRefundBuyerEvent
        console.log("SellerRefundBuyer")
        console.log(humanReadableUnixTimestamp(event.when.toString()))
        expect(await escrow.state()).to.equal(0) // Sale
        expect(await escrow.buyer()).to.equal("0x0000000000000000000000000000000000000000")
    })
    it(`
    Should set the contract state to 'Sale' -> 'Locked' -> 'Release' (First Buyer)
    and allow refundSeller -> 'Complete' and contract should increase total sales. (Seller)
  `, async function () {
        expect(await escrow.seller()).to.equal(seller.address)
        expect(await escrow.state()).to.equal(0) // Sale
        expect(await escrow.buyer()).to.equal("0x0000000000000000000000000000000000000000") // Not set yet, default
        // Revert with the error message "Seller shouldn't call this"
        await expectRevert(
            escrow.confirmPurchase({ value: ethers.utils.parseEther("2.0") }),
            "Seller shouldn't call this"
        )
        // How to set msg.sender for ether js?
        // Use connect method
        await escrow.connect(firstBuyer).confirmPurchase({ value: ethers.utils.parseEther("2.0") })
        expect(await escrow.buyer()).to.equal(firstBuyer.address)
        expect(await escrow.state()).to.equal(1) // Locked
        await escrow.connect(firstBuyer).confirmReceived()
        let event = await confirmReceivedEvent
        console.log("ConfirmReceived")
        console.log(humanReadableUnixTimestamp(event.when.toString()))
        expect(await event.by).to.equal(firstBuyer.address)
        expect(await escrow.state()).to.equal(2) // Released
        await escrow.refundSeller()
        event = await sellerRefundedEvent
        console.log("SellerRefunded")
        console.log(humanReadableUnixTimestamp(event.when.toString()))
        expect(await escrow.state()).to.equal(4) // Complete
        expect(await escrow.totalSales()).to.equal(1) // Complete
    })
    const firstPurchase = async () => {
        expect(await escrow.seller()).to.equal(seller.address)
        expect(await escrow.state()).to.equal(0) // Sale
        expect(await escrow.buyer()).to.equal("0x0000000000000000000000000000000000000000") // Not set yet, default
        // Revert with the error message "Seller shouldn't call this"
        await expectRevert(
            escrow.confirmPurchase({ value: ethers.utils.parseEther("2.0") }),
            "Seller shouldn't call this"
        )
        // How to set msg.sender for ether js?
        // Use connect method
        await escrow.connect(firstBuyer).confirmPurchase({ value: ethers.utils.parseEther("2.0") })
        expect(await escrow.buyer()).to.equal(firstBuyer.address)
        expect(await escrow.state()).to.equal(1) // Locked
        await escrow.connect(firstBuyer).confirmReceived()
        expect(await escrow.state()).to.equal(2) // Released
        await escrow.refundSeller()
        expect(await escrow.state()).to.equal(4) // Complete
        expect(await escrow.totalSales()).to.equal(1) // Complete
    }
    // 6.
    it(`
    (First Buyer)
    Should set the contract state to 'Sale' -> 'Locked' -> 'Release' 
    (Seller)
    and allow refundSeller -> 'Complete' and contract should increase total sales.
    Then, the seller can restart the contract.
  `, async function () {
        await firstPurchase()
        await escrow.restartContract({ value: ethers.utils.parseEther("2.0") })
        expect(await escrow.state()).to.equal(0) // Sale again
    })
    it(`
    (First Buyer)
    Should set the contract state to 'Sale' -> 'Locked' -> 'Release' 
    (Seller)
    and allow refundSeller -> 'Complete' and contract should increase total sales.
    Then, the seller can end the contract.
  `, async function () {
        await firstPurchase()
        await escrow.restartContract({ value: ethers.utils.parseEther("2.0") })
        await escrow.end()
    })
    it(`
    (First Buyer)
    Should set the contract state to 'Sale' -> 'Locked' -> 'Release' 
    (Seller)
    and allow refundSeller -> 'Complete' and contract should increase total sales.
    Then, the seller can restart the contract.
    (First Buyer)
    Then, first buyer can rebuy
  `, async function () {
        await firstPurchase()
        await escrow.restartContract({ value: ethers.utils.parseEther("2.0") })
        //
        expect(await escrow.seller()).to.equal(seller.address)
        expect(await escrow.state()).to.equal(0) // Sale
        expect(await escrow.buyer()).to.equal("0x0000000000000000000000000000000000000000") // Not set yet, default
        // Revert with the error message "Seller shouldn't call this"
        await expectRevert(
            escrow.confirmPurchase({ value: ethers.utils.parseEther("2.0") }),
            "Seller shouldn't call this"
        )
        // How to set msg.sender for ether js?
        // Use connect method
        await escrow.connect(firstBuyer).confirmPurchase({ value: ethers.utils.parseEther("2.0") })
        expect(await escrow.buyer()).to.equal(firstBuyer.address)
        expect(await escrow.state()).to.equal(1) // Locked
        await escrow.connect(firstBuyer).confirmReceived()
        expect(await escrow.state()).to.equal(2) // Released
        await escrow.refundSeller()
        expect(await escrow.state()).to.equal(4) // Complete
        expect(await escrow.totalSales()).to.equal(2) // Complete
    })
    it(`
    (Second Buyer)
    Should set the contract state to 'Sale' -> 'Locked' -> 'Release' 
    (Seller)
    and allow refundSeller -> 'Complete' and contract should increase total sales.
    Then, the seller can restart the contract
  `, async function () {
        await firstPurchase()
        await escrow.restartContract({ value: ethers.utils.parseEther("2.0") })
        // Second Buyer
        expect(await escrow.state()).to.equal(0) // Sale again
        // Buyer should be reset;
        expect(await escrow.buyer()).to.equal("0x0000000000000000000000000000000000000000")
        // Repeat the almost same code for the second buyer.
        // expect(await escrow.buyer()).to.equal(firstBuyer.address); // Yet, First Buyer
        // Revert with the error message "Seller shouldn't call this"
        await expectRevert(
            escrow.confirmPurchase({ value: ethers.utils.parseEther("2.0") }),
            "Seller shouldn't call this"
        )
        await escrow
            .connect(secondBuyer)
            .confirmPurchase({ value: ethers.utils.parseEther("2.0") })
        // New buyer
        expect(await escrow.buyer()).to.equal(secondBuyer.address)
        expect(await escrow.state()).to.equal(1) // Locked
        await escrow.connect(secondBuyer).confirmReceived()
        expect(await escrow.state()).to.equal(2) // Released
        await escrow.refundSeller()
        expect(await escrow.state()).to.equal(4) // Complete
        expect(await escrow.totalSales()).to.equal(2) // One more purchase
        await escrow.restartContract({ value: ethers.utils.parseEther("2.0") })
        // 6.
        // Without deep, it fails here.
        expect(await escrow.listPreviousBuyers()).to.deep.equal([
            firstBuyer.address,
            secondBuyer.address,
        ])
    })
})
