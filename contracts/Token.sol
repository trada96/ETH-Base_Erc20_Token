// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./AccessControl.sol";

contract Token is ERC20, AccessControl, Pausable, ERC20Burnable {

    constructor(string memory name, string memory symbol ,uint256 _initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, _initialSupply);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Paused: token transfer while paused!");
    }

    // function mintToken(address to,uint256 amount) external onlyOperator {
    //     _mint(to, amount);
    // }

    function pause() external virtual onlyOperator {
        _pause();
    }

    function unpause() external virtual onlyOperator {
        _unpause();
    }
}