// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Roles.sol";
import "../utils/Context.sol";
// Define a contract 'DistributorRole' to manage this role - add, remove, check
contract DistributorRole is Context {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event DistributorAdded(address indexed account);
    event DistributorRemoved(address indexed account);
    event RetailerAddedByDistributor(address indexed harvester, address indexed account);
    // Define a struct 'distributors' by inheriting from 'Roles' library, struct Role
    Roles.Role distributors;

    // In the constructor make the address that deploys this contract the 1st distributor
    constructor()  {
        _addDistributor(_msgSender());
    }

    // Define a modifier that checks to see if _msgSender() has the appropriate role
    modifier onlyDistributor() {
        require(isDistributor(_msgSender()));
        _;
    }

    // Define a function 'isDistributor' to check this role
    function isDistributor(address account) public view returns (bool) {
        return distributors.has(account);
    }

    // Define a function 'addDistributor' that adds this role
    function addDistributor(address account) public onlyDistributor {
        _addDistributor(account);
    }

    // function methodAddDistributor(address account) external {
    //     _addDistributor(account);
    // }

    // Define a function 'renounceDistributor' to renounce this role
    // function renounceDistributor() public {
    //     _removeDistributor(_msgSender());
    // }

    // Define an internal function '_addDistributor' to add this role, called by 'addDistributor'
    function _addDistributor(address account) internal {
        distributors.add(account);
        emit DistributorAdded(account);
    }

    // Define an internal function '_removeDistributor' to remove this role, called by 'removeDistributor'
    function removeDistributor(address account) public onlyDistributor {
        distributors.remove(account);
        emit DistributorRemoved(account);
    }

}