const { network, ethers, upgrades } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const deployContract = async () => {
    const OpenLogic = await ethers.getContractFactory("OpenLogic")

    // 部署合约, 并调用初始化方法
    // 参数 - 逻辑合约名 逻辑合约参数
    const myOpenProxy = await upgrades.deployProxy(OpenLogic, [10], {
        initializer: "initialize",
    })

    // 逻辑合约地址
    const implementationAddress =
        await upgrades.erc1967.getImplementationAddress(myOpenProxy.address)
    // proxyAdmin 合约地址
    const adminAddress = await upgrades.erc1967.getAdminAddress(
        myOpenProxy.address
    )

    console.log(`proxyAddress: ${myOpenProxy.address}`)
    console.log(`implementationAddress: ${implementationAddress}`)
    console.log(`adminAddress: ${adminAddress}`)
}

const upgradeContract = async () => {
    const myOpenProxy = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    console.log("======================================")

    const OpenLogicV2 = await ethers.getContractFactory("OpenLogicV2")
    console.log("upgrade to OpenLogicV2...")

    const myOpenLogicV2 = await upgrades.upgradeProxy(myOpenProxy, OpenLogicV2)
    console.log("proxyAddress", myOpenLogicV2.address)

    console.log(
        "getImplementationAddress:",
        await upgrades.erc1967.getImplementationAddress(myOpenLogicV2.address)
    )
    console.log(
        "getAdminAddress:",
        await upgrades.erc1967.getAdminAddress(myOpenLogicV2.address)
    )
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // If we are on a local development network, we need to deploy mocks!
    if (developmentChains.includes(network.name)) {
        await deployContract()
        await upgradeContract()
    }
}
module.exports.tags = ["all", "transparent"]
