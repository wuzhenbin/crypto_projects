// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

error LogicContract__NotOwner();

contract LogicContract is UUPSUpgradeable {
    address public admin;
    uint256 public value;

    modifier onlyOwner() {
        if (msg.sender != admin) revert LogicContract__NotOwner();
        _;
    }

    function initialize(address _admin) public initializer {
        admin = _admin;
        __UUPSUpgradeable_init();
    }

    function setValue(uint256 newValue) external {
        value = newValue;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}

contract LogicContract2 is UUPSUpgradeable {
    address public admin;
    uint256 public value;
    uint256 public number;

    modifier onlyOwner() {
        require(msg.sender == admin, "Ownable: caller is not the owner");
        _;
    }

    function initialize(address _admin) public initializer {
        admin = _admin;
        __UUPSUpgradeable_init();
    }

    function setValue(uint256 newValue) external {
        value = newValue;
    }

    function add() external {
        number = number + 1;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}

contract UupsFactoryContract {
    function createMyLogic() external returns (address) {
        LogicContract logicContract = new LogicContract();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(logicContract),
            abi.encodeWithSelector(
                logicContract.initialize.selector,
                msg.sender
            )
        );

        return address(proxy);
    }
}
