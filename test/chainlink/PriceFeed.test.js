const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

const parseEther = ethers.utils.parseEther
const formatEther = ethers.utils.formatEther
const getBalance = ethers.provider.getBalance

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("PriceFeed Unit Tests", function () {
        let owner, MockV3AggregatorContract, PriceFeedContract
        beforeEach(async () => {
            ;[owner] = await ethers.getSigners()
            MockV3AggregatorContract = await ethers.getContractFactory(
                "MockV3Aggregator"
            )
            PriceFeedContract = await ethers.getContractFactory("PriceFeed")
        })

        it("mock price", async () => {
            const DECIMALS = 10
            const INITIAL = 2000

            let MockV3Aggregator = await MockV3AggregatorContract.deploy(
                DECIMALS,
                parseEther(INITIAL.toString()).div(10 ** 8)
            )

            let PriceFeed = await PriceFeedContract.deploy(
                MockV3Aggregator.address
            )
            expect(await PriceFeed.getLatestPrice()).to.equal(
                parseEther("2000").div(10 ** 8)
            )
        })
    })
}
