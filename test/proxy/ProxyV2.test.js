const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { eth2big, getBalance } = require("../../utils/utils")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("ProxyV2 Unit Tests", function () {
        let owner, ProxyV2Logic, ProxyV2Proxy, ProxyV2Caller
        beforeEach(async () => {
            ;[owner] = await ethers.getSigners()
            const LogicContract = await ethers.getContractFactory(
                "ProxyV2Logic"
            )
            const ProxyContract = await ethers.getContractFactory(
                "ProxyV2Proxy"
            )
            const CallerContract = await ethers.getContractFactory(
                "ProxyV2Caller"
            )
            ProxyV2Logic = await LogicContract.deploy()
            ProxyV2Proxy = await ProxyContract.deploy(ProxyV2Logic.address)
            ProxyV2Caller = await CallerContract.deploy(ProxyV2Proxy.address)
        })

        it("delegacall", async () => {
            expect(await ProxyV2Caller.callStatic.increment()).to.equal(1)
            await ProxyV2Caller.increment()
            expect(await ProxyV2Logic.x()).to.equal(99)
        })
    })
}
