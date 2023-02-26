const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")
const { increaseTime } = require("../../utils/utils")

const parseEther = ethers.utils.parseEther
const formatEther = ethers.utils.formatEther
const getBalance = ethers.provider.getBalance

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = parseEther("50")

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("Raffle Unit Tests", function () {
        let Raffle,
            VRFCoordinatorV2Mock,
            raffleEntranceFee,
            interval,
            player,
            accounts

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            ;[owner, player] = accounts

            // deploy VRFCoordinatorV2Mock
            const VRFCoordinatorV2MockContract =
                await ethers.getContractFactory("VRFCoordinatorV2Mock")
            VRFCoordinatorV2Mock = await VRFCoordinatorV2MockContract.deploy(
                BASE_FEE,
                GAS_PRICE_LINK
            )
            const tx = await VRFCoordinatorV2Mock.createSubscription()
            const txReceipt = await tx.wait()
            const subscriptionId = txReceipt.events[0].args.subId
            await VRFCoordinatorV2Mock.fundSubscription(
                subscriptionId,
                FUND_AMOUNT
            )

            // deploy Raffle
            const RaffleContract = await ethers.getContractFactory("Raffle")
            Raffle = await RaffleContract.deploy(
                VRFCoordinatorV2Mock.address,
                parseEther("0.01"),
                // keyHash
                "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
                subscriptionId,
                "500000", // callbackGasLimit
                "30" // interval
            )
            await VRFCoordinatorV2Mock.addConsumer(
                subscriptionId.toNumber(),
                Raffle.address
            )

            raffleEntranceFee = await Raffle.getEntranceFee()
            interval = await Raffle.getInterval()
        })

        describe("constructor", function () {
            it("initializes the raffle correctly", async () => {
                // Ideally, we'd separate these out so that only 1 assert per "it" block
                // And ideally, we'd make this check everything
                expect(await Raffle.getRaffleState()).to.equal(0)
                expect(interval).to.equal(30)
            })
        })

        describe("enterRaffle", function () {
            it("reverts when you don't pay enough", async () => {
                await expect(Raffle.enterRaffle()).to.be.revertedWith(
                    // is reverted when not paid enough or raffle is not open
                    "Raffle__SendMoreToEnterRaffle"
                )
            })
            it("records player when they enter", async () => {
                await Raffle.connect(player).enterRaffle({
                    value: raffleEntranceFee,
                })
                expect(await Raffle.getPlayer(0)).to.equal(player.address)
            })
            it("emits event on enter", async () => {
                await expect(
                    Raffle.enterRaffle({ value: raffleEntranceFee })
                ).to.emit(Raffle, "RaffleEnter")
            })
            it("doesn't allow entrance when raffle is calculating", async () => {
                await Raffle.enterRaffle({ value: raffleEntranceFee })

                await increaseTime(interval.toNumber() + 1)

                // we pretend to be a keeper for a second
                await Raffle.performUpkeep([]) // changes the state to calculating for our comparison below
                await expect(
                    Raffle.enterRaffle({ value: raffleEntranceFee })
                ).to.be.revertedWith(
                    // is reverted as raffle is calculating
                    "Raffle__RaffleNotOpen"
                )
            })
        })

        describe("checkUpkeep", function () {
            it("returns false if people haven't sent any ETH", async () => {
                await increaseTime(interval.toNumber() + 1)
                // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                const { upkeepNeeded } = await Raffle.callStatic.checkUpkeep(
                    "0x"
                )
                assert(!upkeepNeeded)
            })
            it("returns false if raffle isn't open", async () => {
                await Raffle.enterRaffle({ value: raffleEntranceFee })
                await increaseTime(interval.toNumber() + 1)
                await Raffle.performUpkeep([])

                expect(await Raffle.getRaffleState()).to.equal(1)
                const { upkeepNeeded } = await Raffle.callStatic.checkUpkeep(
                    "0x"
                )
                expect(upkeepNeeded).to.equal(false)
            })
            it("returns false if enough time hasn't passed", async () => {
                await Raffle.enterRaffle({ value: raffleEntranceFee })
                await increaseTime(interval.toNumber() - 5)

                const { upkeepNeeded } = await Raffle.callStatic.checkUpkeep(
                    "0x"
                )
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await Raffle.enterRaffle({ value: raffleEntranceFee })
                await increaseTime(interval.toNumber() + 1)

                const { upkeepNeeded } = await Raffle.callStatic.checkUpkeep(
                    "0x"
                )
                assert(upkeepNeeded)
            })
        })

        describe("performUpkeep", function () {
            it("can only run if checkupkeep is true", async () => {
                await Raffle.enterRaffle({ value: raffleEntranceFee })
                await increaseTime(interval.toNumber() + 1)
                const tx = await Raffle.performUpkeep("0x")
                assert(tx)
            })
            it("reverts if checkup is false", async () => {
                await expect(Raffle.performUpkeep("0x")).to.be.revertedWith(
                    "Raffle__UpkeepNotNeeded"
                )
            })
            it("updates the raffle state and emits a requestId", async () => {
                // Too many asserts in this test!
                await Raffle.enterRaffle({ value: raffleEntranceFee })
                await increaseTime(interval.toNumber() + 1)

                const txResponse = await Raffle.performUpkeep("0x")
                const txReceipt = await txResponse.wait(1)

                const raffleState = await Raffle.getRaffleState() // updates state
                const requestId = txReceipt.events[1].args.requestId
                assert(requestId.toNumber() > 0)
                assert(raffleState == 1) // 0 = open, 1 = calculating
            })
        })

        describe("fulfillRandomWords", function () {
            beforeEach(async () => {
                await Raffle.enterRaffle({ value: raffleEntranceFee })
                await increaseTime(interval.toNumber() + 1)
            })
            it("can only be called after performupkeep", async () => {
                await expect(
                    VRFCoordinatorV2Mock.fulfillRandomWords(0, Raffle.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request")
                await expect(
                    VRFCoordinatorV2Mock.fulfillRandomWords(1, Raffle.address) // reverts if not fulfilled
                ).to.be.revertedWith("nonexistent request")
            })

            // This test is too big...
            // This test simulates users entering the raffle and wraps the entire functionality of the raffle
            // inside a promise that will resolve if everything is successful.
            // An event listener for the WinnerPicked is set up
            // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
            // All the assertions are done once the WinnerPicked event is fired

            it("picks a winner, resets, and sends money", async () => {
                const additionalEntrances = 3 // to test
                const startingIndex = 2

                for (
                    let i = startingIndex;
                    i < startingIndex + additionalEntrances;
                    i++
                ) {
                    // i = 2; i < 5; i=i+1
                    // pass the player and owner
                    await Raffle.connect(accounts[i]).enterRaffle({
                        value: raffleEntranceFee,
                    })
                }
                // stores starting timestamp (before we fire our event)
                const startingTimeStamp = await Raffle.getLastTimeStamp()

                // This will be more important for our staging tests...
                await new Promise(async (resolve, reject) => {
                    Raffle.once("WinnerPicked", async () => {
                        // event listener for WinnerPicked
                        console.log("WinnerPicked event fired!")

                        // assert throws an error if it fails, so we need to wrap
                        // it in a try/catch so that the promise returns event
                        // if it fails.
                        try {
                            // Now lets get the ending values...
                            const recentWinner = await Raffle.getRecentWinner()
                            const raffleState = await Raffle.getRaffleState()
                            const winnerBalance = await accounts[2].getBalance()
                            const endingTimeStamp =
                                await Raffle.getLastTimeStamp()

                            // players will be clear
                            await expect(Raffle.getPlayer(0)).to.be.reverted
                            // Comparisons to check if our ending values are correct
                            expect(recentWinner).to.be.equal(
                                accounts[2].address
                            )
                            expect(raffleState).to.be.equal(0)
                            expect(
                                endingTimeStamp > startingTimeStamp
                            ).to.be.equal(true)
                            // 彩票池资金 = 入场费*玩家人数(owner+3)
                            let poolMoney = raffleEntranceFee
                                .mul(additionalEntrances)
                                .add(raffleEntranceFee)
                            // 赢家余额 = 赢家一开始的资金 + 彩票池资金
                            expect(winnerBalance).to.be.equal(
                                startingBalance.add(poolMoney)
                            )

                            resolve() // if try passes, resolves the promise
                        } catch (e) {
                            reject(e) // if try fails, rejects the promise
                        }
                    })

                    // kicking off the event by mocking the chainlink keepers and vrf coordinator
                    const tx = await Raffle.performUpkeep("0x")
                    const txReceipt = await tx.wait(1)
                    const startingBalance = await accounts[2].getBalance()
                    await VRFCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        Raffle.address
                    )
                })
            })
        })
    })
}
