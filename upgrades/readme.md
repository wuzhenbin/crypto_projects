hh run scripts/uups_simple.js
hh deploy --tags uups
hh deploy --tags transparent

transparent
实际上部署的合约有三个:

-   代理合约
-   实现合约
-   ProxyAdmin 合约(用来管理代理合约的, 包括了升级合约, 转移合约所有权。)

升级合约的步骤就是
1 部署一个新的实现合约,
2 调用 ProxyAdmin 合约中升级相关的方法, 设置新的实现合约地址。

uups
编译并部署 UUPS 代理模式的合约时, 实际只会部署两个合约

-   代理合约
-   实现合约

此时的升级合约的步骤就是
1 部署一个新的实现合约,
2 调用 ProxyAdmin 合约中升级相关的方法, 设置新的实现合约地址。
