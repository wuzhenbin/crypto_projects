const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { eth2big, getBalance } = require("../../utils/utils")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("Upgrade Unit Tests", function () {
        let owner, user1, UpgradeV2Logic1, UpgradeV2Logic2, UpgradeV2Proxy
        beforeEach(async () => {
            ;[owner, user1] = await ethers.getSigners()

            const Logic1Contract = await ethers.getContractFactory(
                "UpgradeV2Logic1"
            )
            const Logic2Contract = await ethers.getContractFactory(
                "UpgradeV2Logic2"
            )
            const ProxyContract = await ethers.getContractFactory(
                "UpgradeV2Proxy"
            )
            UpgradeV2Logic1 = await Logic1Contract.deploy()
            UpgradeV2Logic2 = await Logic2Contract.deploy()
            UpgradeV2Proxy = await ProxyContract.deploy(UpgradeV2Logic1.address)
        })

        it("inital correctly", async () => {
            expect(await UpgradeV2Proxy.implementation()).to.equal(
                UpgradeV2Logic1.address
            )
            expect(await UpgradeV2Proxy.admin()).to.equal(owner.address)
            expect(await UpgradeV2Proxy.words()).to.equal("")
        })

        it("delegacall logic", async () => {
            const fooSignature = "foo()"
            const fakeContractCall = (user) => {
                return new ethers.Contract(
                    UpgradeV2Proxy.address,
                    [
                        ...UpgradeV2Proxy.interface.fragments,
                        `function ${fooSignature}`,
                    ],
                    user
                )
            }
            // admin can't call logic
            await expect(fakeContractCall(owner)[fooSignature]()).to.be.reverted
            // user call logic
            await fakeContractCall(user1)[fooSignature]()
            // word's update
            expect(await UpgradeV2Proxy.words()).to.equal("old")

            // user can't call upgrade
            await expect(
                UpgradeV2Proxy.connect(user1).upgrade(UpgradeV2Logic1.address)
            ).to.be.reverted

            // owner call upgrade
            await UpgradeV2Proxy.upgrade(UpgradeV2Logic2.address)
            expect(await UpgradeV2Proxy.implementation()).to.equal(
                UpgradeV2Logic2.address
            )
            // user call logic2-foo
            await fakeContractCall(user1)[fooSignature]()
            // word's update
            expect(await UpgradeV2Proxy.words()).to.equal("new")
        })
    })
}
