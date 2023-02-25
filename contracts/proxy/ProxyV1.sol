// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ProxyV1Proxy {
    address public implementation;
    uint public x = 99;

    constructor(address implementation_) {
        implementation = implementation_;
    }

    function callIncrement() public returns (uint) {
        (, bytes memory data) = implementation.delegatecall(
            abi.encodeWithSignature("increment()")
        );
        return abi.decode(data, (uint));
    }
}

contract ProxyV1Logic {
    address public implementation;
    uint public x = 99;

    function increment() external returns (uint) {
        x = x + 1;
        return x;
    }
}
