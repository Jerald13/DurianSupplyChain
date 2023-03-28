// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MyContract {
    event ProductBought(address indexed buyer, uint256 productId, uint256 price);

    function buyProduct(uint256 productId, uint256 price) public payable {
        // require(msg.value == price, "Incorrect price sent");
        emit ProductBought(msg.sender, productId, price);
    }
}
