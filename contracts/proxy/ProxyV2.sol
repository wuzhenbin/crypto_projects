// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ProxyV2Caller {
    // 代理合约地址
    address public proxy;

    constructor(address proxy_) {
        proxy = proxy_;
    }

    // 通过代理合约调用increment()函数
    function increment() external returns (uint) {
        // address.call(bytes);
        (, bytes memory data) = proxy.call(
            abi.encodeWithSignature("increment()")
        );
        // 将abi.encode的二进制编码输入给decode,将解码出原来的参数
        return abi.decode(data, (uint));
    }
}

// 逻辑合约, 执行被委托的调用
contract ProxyV2Logic {
    // 与Proxy保持一致, 防止插槽冲突
    address public implementation;
    uint public x = 99;
    event CallSuccess();

    // 这个函数会释放CallSuccess事件并返回一个uint。
    // 函数selector: 0xd09de08a
    function increment() external returns (uint) {
        emit CallSuccess();
        return x + 1;
    }
}

contract ProxyV2Proxy {
    // 逻辑合约地址. 和Proxy合约的变量布局相同
    address public implementation;
    uint public x;
    event CallSuccess();

    // 初始化逻辑合约地址
    constructor(address implementation_) {
        implementation = implementation_;
    }

    // 回调函数, 调用`_delegate()`函数将本合约的调用委托给 `implementation` 合约
    fallback() external payable {
        _delegate();
    }

    receive() external payable {
        _delegate();
    }

    // 通过assembly, 让回调函数也能有返回值
    function _delegate() internal {
        // address _implementation = implementation;

        assembly {
            // 读取位置为0的storage, 也就是implementation地址。
            let _implementation := sload(0)

            // 将 msg.data 拷贝到内存里
            calldatacopy(0, 0, calldatasize())

            // 利用delegatecall调用implementation合约
            let result := delegatecall(
                gas(),
                _implementation,
                0,
                calldatasize(),
                0,
                0
            )

            // 将return data拷贝到内存
            returndatacopy(0, 0, returndatasize())

            switch result
            // 如果delegate call失败, revert
            case 0 {
                revert(0, returndatasize())
            }
            // 如果delegate call成功, 返回mem起始位置为0, 长度为returndatasize()的数据（格式为bytes）
            default {
                return(0, returndatasize())
            }
        }
    }
}
