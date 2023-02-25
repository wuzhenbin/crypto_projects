const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { eth2big, getBalance } = require("../../utils/utils")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("ProxyV1 Unit Tests", function () {
        let owner, ProxyV1Logic, ProxyV1Proxy
        beforeEach(async () => {
            ;[owner] = await ethers.getSigners()
            const LogicContract = await ethers.getContractFactory(
                "ProxyV1Logic"
            )
            const ProxyContract = await ethers.getContractFactory(
                "ProxyV1Proxy"
            )
            ProxyV1Logic = await LogicContract.deploy()
            ProxyV1Proxy = await ProxyContract.deploy(ProxyV1Logic.address)
        })

        it("Initializes Correctly", async () => {
            expect(await ProxyV1Proxy.implementation()).to.equal(
                ProxyV1Logic.address
            )
        })

        it("callIncrement", async () => {
            await ProxyV1Proxy.callIncrement()
            expect(await ProxyV1Proxy.x()).to.equal(100)
            expect(await ProxyV1Logic.x()).to.equal(99)
        })
    })
}
