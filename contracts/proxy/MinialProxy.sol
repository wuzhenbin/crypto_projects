// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

library MinimalProxyClone {
    function clone(address implementation) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(
                ptr,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )
            mstore(add(ptr, 0x14), shl(0x60, implementation))

            mstore(
                add(ptr, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "ERC1167: create failed");
    }
}

contract MinimalProxyDemo {
    uint256 public a;

    constructor() {
        a = 1000;
    }

    function setA(uint256 _a) external {
        a = _a;
    }
}

contract MinimalProxyFactory {
    using MinimalProxyClone for address;

    event ProxyGenerated(address proxy);

    function clone(address implementation) external returns (address proxy) {
        proxy = implementation.clone();
        emit ProxyGenerated(proxy);
    }
}
