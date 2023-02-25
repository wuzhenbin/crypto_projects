const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

const parseEther = ethers.utils.parseEther
const formatEther = ethers.utils.formatEther
const getBalance = ethers.provider.getBalance

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = parseEther("50")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("VRFV2 Unit Tests", function () {
        let owner, VRFV2, VRFCoordinatorV2Mock, VRFv2Consumer

        beforeEach(async () => {
            ;[owner] = await ethers.getSigners()

            const VRFCoordinatorV2MockContract =
                await ethers.getContractFactory("VRFCoordinatorV2Mock")
            VRFCoordinatorV2Mock = await VRFCoordinatorV2MockContract.deploy(
                BASE_FEE,
                GAS_PRICE_LINK
            )

            const tx = await VRFCoordinatorV2Mock.createSubscription()
            const txReceipt = await tx.wait()
            const subscriptionId = txReceipt.events[0].args.subId
            // Fund the subscription
            // Our mock makes it so we don't actually have to worry about sending fund
            await VRFCoordinatorV2Mock.fundSubscription(
                subscriptionId,
                FUND_AMOUNT
            )

            const VRFv2ConsumerContract = await ethers.getContractFactory(
                "VRFv2Consumer"
            )
            VRFv2Consumer = await VRFv2ConsumerContract.deploy(
                subscriptionId,
                VRFCoordinatorV2Mock.address,
                // keyhash随便填
                "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"
            )

            await VRFCoordinatorV2Mock.addConsumer(
                subscriptionId.toNumber(),
                VRFv2Consumer.address
            )
        })

        it("request randomNumber", async () => {
            // send some link token to contract
            await VRFv2Consumer.requestRandomWords()
        })

        it("fulfillRandomness no request", async () => {
            // send some link token to contract
            await expect(
                VRFCoordinatorV2Mock.fulfillRandomWords(
                    0,
                    VRFv2Consumer.address
                )
            ).to.be.revertedWith("nonexistent request")
        })

        it("fulfillRandomness success", async () => {
            const tx = await VRFv2Consumer.requestRandomWords()
            const txReceipt = await tx.wait(1)

            await VRFCoordinatorV2Mock.fulfillRandomWords(
                txReceipt.events[1].args.requestId,
                VRFv2Consumer.address
            )

            let word1 = await VRFv2Consumer.randomWords(0)
            let word2 = await VRFv2Consumer.randomWords(1)
            let word3 = await VRFv2Consumer.randomWords(2)
            console.log(word1.toString())
            console.log(word2.toString())
            console.log(word3.toString())
        })
    })
}
