// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MyToken - ERC20 Token for BlueCarbon project
/// @notice Simple ERC20 token with initial supply minted to deployer
contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("BlueCarbonToken", "BCT") {
        _mint(msg.sender, initialSupply);
    }
}
