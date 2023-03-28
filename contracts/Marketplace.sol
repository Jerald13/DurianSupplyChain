// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    address payable public owner;

    event ProductBought(address buyer, uint256 productId, uint256 amount);
    uint256 productId;
    uint256 amount;

    constructor() {
        owner = payable(msg.sender);
    }

    function buyProduct(uint256 _productId, uint256 _amount) external payable {
        // logic to buy product
        // require(msg.value == amount, "Incorrect amount sent.");
        productId = _productId;
        amount = _amount;
        owner.transfer(msg.value);
        emit ProductBought(msg.sender, productId, amount);
    }
}
