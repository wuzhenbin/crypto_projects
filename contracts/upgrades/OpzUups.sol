// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract OpzUupsLogicV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint public value;

    function initialize() public initializer {
        value = 10;
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    // 需要此方法来防止未经授权的升级, 因为在 UUPS 模式中, 升级是从逻辑合约完成的, 而在透明代理模式中, 升级是通过代理合约完成的
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function increaseValue() external {
        ++value;
    }
}

contract OpzUupsLogicV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint public value;

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    // 需要此方法来防止未经授权的升级, 因为在 UUPS 模式中, 升级是从逻辑合约完成的, 而在透明代理模式中, 升级是通过代理合约完成的
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function increaseValue() external {
        ++value;
    }

    function decreaseValue() external {
        --value;
    }
}
