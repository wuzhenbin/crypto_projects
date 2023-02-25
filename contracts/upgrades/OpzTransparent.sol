// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract OpzTransparentLogicV1 is Initializable {
    uint public value;
    string public words;

    function initialize(uint _value) public initializer {
        value = _value;
        words = "logic1";
    }

    function increaseValue() external {
        ++value;
    }
}

contract OpzTransparentLogicV2 is Initializable {
    uint public value;
    string public words;

    function initialize(uint _value) public initializer {
        value = _value;
        words = "logic2";
    }

    function increaseValue() external {
        --value;
    }
}
