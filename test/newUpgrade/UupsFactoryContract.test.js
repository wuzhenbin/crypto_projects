const { assert, expect } = require("chai")
const { network, ethers, upgrades } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { eth2big, getBalance } = require("../../utils/utils")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("UupsFactoryContract Unit Tests", function () {
        let owner, user1

        beforeEach(async () => {
            ;[owner, user1] = await ethers.getSigners()
        })

        it("inital correctly", async () => {
            const UupsFactoryContractFactory = await ethers.getContractFactory(
                "UupsFactoryContract"
            )

            const UupsFactoryContract =
                await UupsFactoryContractFactory.deploy()
            let proxy = await UupsFactoryContract.callStatic.createMyLogic()
            await UupsFactoryContract.createMyLogic()

            // const implement = await upgrades.erc1967.getImplementationAddress(
            //     proxy
            // )
            // console.log(implement)

            const Logic1Factory = await ethers.getContractFactory(
                "LogicContract"
            )
            // const instance = Logic1Factory.attach(proxy)
            let instance = await upgrades.forceImport(proxy, Logic1Factory)
            let admin = await instance.admin()
            console.log(admin)
            console.log(owner.address)

            // can't init twice
            // await instance.initialize()

            // await instance.setValue(10)
            // let value = await instance.value()
            // console.log(value)

            // console.log(owner.address)
            const Logic2Factory = await ethers.getContractFactory(
                "LogicContract2"
            )
            // only admin can upgrade
            instance = await upgrades.upgradeProxy(instance, Logic2Factory)
            // instance = await upgrades.upgradeProxy(instance, Logic2Factory)

            // await instance.add()
            // let number = await instance.number()
            // console.log(number)
            // value = await instance.value()
            // console.log(value)

            // const logic2 = Logic2Factory.attach(proxy)
            // await logic2.add()
            // let number = await logic2.number()
            // console.log(number)
        })
    })
}
