const { network, ethers, upgrades } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const deployContract = async () => {
    const LogicV1 = await ethers.getContractFactory("LogicV1")

    // 部署合约, 并调用初始化方法
    const myLogicV1 = await upgrades.deployProxy(LogicV1, [], {
        initializer: "initialize",
        kind: "uups",
    })
    const implementationAddress =
        await upgrades.erc1967.getImplementationAddress(myLogicV1.address)
    console.log(`proxyAddress: ${myLogicV1.address}`)
    console.log(`implementationAddress: ${implementationAddress}`)
}

const upgradeContract = async () => {
    const proxyAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    console.log("======================================")

    const LogicV2 = await ethers.getContractFactory("LogicV2")
    console.log("upgrade to OpenLogicV2...")

    const myOpenLogicV2 = await upgrades.upgradeProxy(proxyAddress, LogicV2)
    console.log("proxyAddress", myOpenLogicV2.address)

    console.log(
        "getImplementationAddress:",
        await upgrades.erc1967.getImplementationAddress(myOpenLogicV2.address)
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
module.exports.tags = ["all", "uups"]
