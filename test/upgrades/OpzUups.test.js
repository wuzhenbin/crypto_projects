const { assert, expect } = require("chai")
const { network, ethers, upgrades } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { eth2big, getBalance } = require("../../utils/utils")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("OpzUups Unit Tests", function () {
        let owner, user1, proxy, Logic1Contract, Logic2Contract, logicAddr

        beforeEach(async () => {
            ;[owner, user1] = await ethers.getSigners()

            Logic1Contract = await ethers.getContractFactory("OpzUupsLogicV1")
            Logic2Contract = await ethers.getContractFactory("OpzUupsLogicV2")
            // 部署合约, 并调用初始化方法
            proxy = await upgrades.deployProxy(Logic1Contract, [], {
                initializer: "initialize",
                kind: "uups",
            })

            logicAddr = upgrades.erc1967.getImplementationAddress
        })

        it("inital correctly", async () => {
            expect(await proxy.value()).to.equal(10)
            await proxy.increaseValue()
            expect(await proxy.value()).to.equal(11)
        })

        it("upgrade logic", async () => {
            let logic1 = await logicAddr(proxy.address)
            proxy = await upgrades.upgradeProxy(proxy, Logic2Contract)
            let logic2 = await logicAddr(proxy.address)
            expect(logic1).to.not.equal(logic2)

            await proxy.increaseValue()
            await proxy.increaseValue()
            await proxy.decreaseValue()
            expect(await proxy.value()).to.equal(11)
        })
    })
}
