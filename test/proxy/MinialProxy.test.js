const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { eth2big, getBalance } = require("../../utils/utils")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("Upgrade Unit Tests", function () {
        let owner, user1, MinimalDemo, demoContract, MinimalProxyFactory
        beforeEach(async () => {
            ;[owner, user1] = await ethers.getSigners()

            demoContract = await ethers.getContractFactory("MinimalProxyDemo")
            const MinimalProxyFactoryContract = await ethers.getContractFactory(
                "MinimalProxyFactory"
            )
            MinimalDemo = await demoContract.deploy()
            MinimalProxyFactory = await MinimalProxyFactoryContract.deploy()
        })

        it("clone logic contract", async () => {
            let demo1Addr = await MinimalProxyFactory.callStatic.clone(
                MinimalDemo.address
            )
            await MinimalProxyFactory.clone(MinimalDemo.address)

            const demo1 = await demoContract.attach(demo1Addr)
            expect(await demo1.a()).to.equal(0)
            await demo1.setA(99)
            expect(await demo1.a()).to.equal(99)
        })
    })
}
