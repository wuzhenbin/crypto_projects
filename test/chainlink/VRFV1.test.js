const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

const parseEther = ethers.utils.parseEther
const formatEther = ethers.utils.formatEther
const getBalance = ethers.provider.getBalance

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("VRFV1 Unit Tests", function () {
        let owner, VRFV1, LinkToken, vrfCoordinatorMock

        beforeEach(async () => {
            ;[owner] = await ethers.getSigners()
            const LinkTokenContract = await ethers.getContractFactory(
                "LinkToken"
            )
            LinkToken = await LinkTokenContract.deploy()

            let vrfCoordinatorMockContract = await ethers.getContractFactory(
                "VRFCoordinatorMock"
            )
            vrfCoordinatorMock = await vrfCoordinatorMockContract.deploy(
                LinkToken.address
            )

            let VRFV1Contract = await ethers.getContractFactory("VRFV1")
            VRFV1 = await VRFV1Contract.deploy(
                vrfCoordinatorMock.address,
                LinkToken.address,
                // keyhash随便填
                "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
                "1000"
            )
        })

        it("link not enough", async () => {
            await expect(VRFV1.getRandomNumber()).to.be.revertedWithCustomError(
                VRFV1,
                "VRFV1__LinkNotEnough"
            )
        })

        it("request randomNumber", async () => {
            // send some link token to contract
            await LinkToken.transfer(VRFV1.address, 1000)
            let requestId = await VRFV1.callStatic.getRandomNumber()
            await VRFV1.getRandomNumber()
            // console.log(requestId);
        })

        it("fulfillRandomness no request", async () => {
            // send some link token to contract
            await LinkToken.transfer(VRFV1.address, 1000)
            await expect(
                vrfCoordinatorMock.callBackWithRandomness(
                    0,
                    "12345",
                    VRFV1.address
                )
            ).to.be.reverted
        })

        it("fulfillRandomness", async () => {
            const rad = "12345"
            // send some link token to contract
            await LinkToken.transfer(VRFV1.address, 1000)
            let requestId = await VRFV1.callStatic.getRandomNumber()
            await VRFV1.getRandomNumber()

            await expect(
                vrfCoordinatorMock.callBackWithRandomness(
                    requestId,
                    rad,
                    VRFV1.address
                )
            )
                .to.emit(VRFV1, "RequestFulfilled")
                .withArgs(requestId, rad)
        })
    })
}
