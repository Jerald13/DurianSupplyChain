// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DurianShop {
    address public owner;
    uint public durianPrice;
    uint public durianStock;

    event DurianPurchase(address buyer, uint quantity);

    constructor() {
        owner = msg.sender;
        // durianPrice = 1 ether;
        durianPrice = 0.001 ether;
        durianStock = 100;
    }

    function buyDurian(uint quantity) public payable {
        require(msg.value == quantity * durianPrice, "Insufficient payment.");
        require(quantity <= durianStock, "Not enough durian in stock.");

        durianStock -= quantity;
        emit DurianPurchase(msg.sender, quantity);
    }
}
