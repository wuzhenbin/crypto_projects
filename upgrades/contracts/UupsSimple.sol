// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract UUPSProxy {
    address public implementation;
    address public admin;
    string public words;

    constructor(address _implementation) {
        admin = msg.sender;
        implementation = _implementation;
    }

    fallback() external payable {
        (bool success, bytes memory data) = implementation.delegatecall(
            msg.data
        );
    }
}

contract UUPS1 {
    address public implementation;
    address public admin;
    string public words;

    function foo() public {
        words = "old";
    }

    function upgrade(address newImplementation) external {
        require(msg.sender == admin);
        implementation = newImplementation;
    }
}

contract UUPS2 {
    address public implementation;
    address public admin;
    string public words;
    uint256 private score;

    function foo() public {
        words = "new";
    }

    function getScore() external view returns (uint256) {
        return score;
    }

    function writeScore(uint256 _score) public {
        score = _score;
    }

    function upgrade(address newImplementation) external {
        require(msg.sender == admin);
        implementation = newImplementation;
    }
}
