// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Roles.sol";
import "../utils/Context.sol";
// Define a contract 'HarvesterRole' to manage this role - add, remove, check
contract HarvesterRole is Context {
    using Roles for Roles.Role;
    // Define 2 events, one for Adding, and other for Removing
    event HarvesterAdded(address indexed account);
    event HarvesterRemoved(address indexed account);
    event DistributorAddedByHarvester(address indexed harvester, address indexed account);

    // Define a struct 'Harvesters' by inheriting from 'Roles' library, struct Role
    Roles.Role Harvesters;

    // In the constructor make the address that deploys this contract the 1st Harvester
    constructor() {
        _addHarvester(_msgSender());
    }

    // Define a modifier that checks to see if _msgSender() has the appropriate role
    modifier onlyHarvester() {
        require(isHarvester(_msgSender()));
        _;
    }

    // Define a function 'isHarvester' to check this role
    function isHarvester(address account) public view returns (bool) {
        return Harvesters.has(account);
    }

    // Define a function 'addHarvester' that adds this role
    function addHarvester(address account) public onlyHarvester {
        _addHarvester(account);
    }

    // Define a function 'renounceHarvester' to renounce this role
    // function renounceHarvester() public {
    //     _removeHarvester(_msgSender());
    // }

    // Define an internal function '_addHarvester' to add this role, called by 'addHarvester'
    function _addHarvester(address account) internal {
        Harvesters.add(account);
        emit HarvesterAdded(account);
    }

    // Define an internal function '_removeHarvester' to remove this role, called by 'removeHarvester'
    function removeHarvester(address account) public onlyHarvester {
        Harvesters.remove(account);
        emit HarvesterRemoved(account);
    }


}
