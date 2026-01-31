// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MyTokenV1 {
    string public name;
    string public symbol;
    mapping(address => uint256) public balanceOf;

    bool private initialized;

    function initialize(
        string memory _name,
        string memory _symbol,
        address _owner
    ) public {
        require(!initialized, "Already initialized");
        initialized = true;

        name = _name;
        symbol = _symbol;
        balanceOf[_owner] = 0;
    }

    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Not enough balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
    }
}
