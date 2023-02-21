const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

async function main() {
    let [owner, user] = await ethers.getSigners()

    console.log(`admin: ${owner.address}`)

    // 部署uups1 uups2
    const uups1Contract = await ethers.getContractFactory("UUPS1")
    const uups2Contract = await ethers.getContractFactory("UUPS2")
    let uups1 = await uups1Contract.deploy()
    let uups2 = await uups2Contract.deploy()

    console.log(`uups1 address: ${uups1.address}`)
    console.log(`uups2 address: ${uups2.address}`)

    // 部署uupsProxy
    const uupsproxyContract = await ethers.getContractFactory("UUPSProxy")
    let uupsproxy = await uupsproxyContract.deploy(uups1.address)

    let admin = await uupsproxy.admin()
    let implementation = await uupsproxy.implementation()
    console.log(`implementation =>: ${implementation}`)

    // 在代理合约中调用旧逻辑合约UUPS1的foo()函数, 将words的值改为"old".
    let uups_proxy = await ethers.getContractAt("UUPS1", uupsproxy.address)
    await uups_proxy.foo()
    let words = await uups_proxy.words()
    console.log(`words => ${words}`)

    // 调用升级函数upgrade(), 将implementation地址指向新逻辑合约UUPS2.
    await uups_proxy.upgrade(uups2.address)
    implementation = await uupsproxy.implementation()
    console.log(`implementation =>: ${implementation}`)

    // 在代理合约中调用新逻辑合约UUPS2的foo()函数, 将words的值改为"new".
    uups_proxy = await ethers.getContractAt("UUPS2", uupsproxy.address)
    await uups_proxy.foo()
    words = await uups_proxy.words()
    console.log(`words => ${words}`)

    // call new function writeScore
    await uups_proxy.writeScore(25)
    // 由于代理合约缺乏新加的变量 读取不到 要用读槽的方式
    // let score = await uups_proxy.getScore()
    let score = await ethers.provider.getStorageAt(uupsproxy.address, 3)
    console.log(`score => ${score}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
