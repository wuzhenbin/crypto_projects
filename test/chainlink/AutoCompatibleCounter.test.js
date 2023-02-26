const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { increaseTime } = require("../../utils/utils")

const parseEther = ethers.utils.parseEther
const formatEther = ethers.utils.formatEther
const getBalance = ethers.provider.getBalance

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("AutoCompatibleCounter Unit Tests", function () {
        let owner, AutoCompatibleCounter
        beforeEach(async () => {
            ;[owner] = await ethers.getSigners()
            AutoCompatibleCounterContract = await ethers.getContractFactory(
                "AutoCompatibleCounter"
            )
            AutoCompatibleCounter = await AutoCompatibleCounterContract.deploy(
                30
            )
        })

        describe("constructor", function () {
            it("initializes  correctly", async () => {
                expect(await AutoCompatibleCounter.interval()).to.equal(30)
                expect(await AutoCompatibleCounter.counter()).to.equal(0)
            })
        })

        describe("checkUpkeep", function () {
            it("returns false if enough time hasn't passed", async () => {
                await increaseTime(25)
                const { upkeepNeeded } =
                    await AutoCompatibleCounter.callStatic.checkUpkeep("0x")
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed", async () => {
                await increaseTime(31)
                const { upkeepNeeded } =
                    await AutoCompatibleCounter.callStatic.checkUpkeep("0x")
                assert(upkeepNeeded)
            })
        })

        describe("performUpkeep", function () {
            it("can only run if checkupkeep is true", async () => {
                await increaseTime(31)
                const tx = await AutoCompatibleCounter.performUpkeep("0x")
                assert(tx)
            })
            it("reverts if checkup is false", async () => {
                await expect(
                    AutoCompatibleCounter.performUpkeep("0x")
                ).to.be.revertedWith("AutoCompatibleCounter__UpkeepNotNeeded")
            })
            it("updates the counter state", async () => {
                // Too many asserts in this test!
                await increaseTime(31)
                await AutoCompatibleCounter.performUpkeep("0x")

                expect(await AutoCompatibleCounter.counter()).to.equal(1)
            })
        })
    })
}
