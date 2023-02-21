// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract OpenLogic is Initializable {
    uint public value;

    function initialize(uint _value) public initializer {
        value = _value;
    }

    function increaseValue() external {
        ++value;
    }
}

contract OpenLogicV2 is Initializable {
    uint public value;

    function initialize(uint _value) public initializer {
        value = _value;
    }

    function increaseValue() external {
        --value;
    }
}
