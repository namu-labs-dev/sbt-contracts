import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-web3'
import '@nomiclabs/hardhat-ethers'
import dotenv from 'dotenv'

dotenv.config()

const ALCHEMY_API_KEY = 'wFqh0iulROT4cLCCkVBFjCFMol86a7r4'
const commonConfig = {
  gas: 5_000_000,
  accounts: {
    mnemonic: process.env.MNEMONIC || ''
  }
}

const config: HardhatUserConfig = {
  solidity: '0.8.16',
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: {
        mnemonic: process.env.MNEMONIC || ''
      }
      // gas: 5_000_000,
      // gasPrice: 60000000000
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/MPUYCtv0CbPRqR1DtRlf3Cx2DS_nAund`,
      accounts: {
        mnemonic: process.env.MNEMONIC || ''
      }
      // gas: 5_000_000,
      // gasPrice: 60000000000
    }
  }
}

task('address', 'Convert mnemonic to address')
  .addParam('mnemonic', "The account's mnemonic")
  .setAction(async (taskArgs, hre) => {
    const something = hre.ethers.Wallet.fromMnemonic(taskArgs.mnemonic)
    console.log(something.address)
  })

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs, hre) => {
    const account = hre.web3.utils.toChecksumAddress(taskArgs.account)
    const balance = await hre.web3.eth.getBalance(account)
    console.log(hre.web3.utils.fromWei(balance, 'ether'), 'ETH')
  })

task('deploy', 'Deploy SBT')
  .addParam('name', 'SBT name')
  .addParam('symbol', 'SBT symbol')
  .addParam('baseUri', 'URI (must end with /) that will be used as prefix when returning tokenURI')
  .setAction(async (args, hre) => {
    const sbtContract = await hre.ethers.getContractFactory('SBT')
    const sbt = await sbtContract.deploy(args.name, args.symbol, args.baseUri)
    await sbt.deployed()
    console.log(
      `SBT was deployed to ${hre.network.name} network and can be interacted with at address ${sbt.address}`
    )
  })

task('mint', 'Mint SBT')
  .addParam('address', 'Address of deployed SBT')
  .addParam('to', 'Address receiving SBT token')
  .addParam('tokenId', 'ID of SBT token that is being minted')
  .setAction(async (args, hre) => {
    const sbt = await hre.ethers.getContractAt('SBT', args.address)
    const [owner] = await hre.ethers.getSigners()
    const tx = await (await sbt.safeMint(args.to, args.tokenId)).wait()
    console.log(tx)
    console.log(`SBT with tokenId ${args.tokenId} was minted for address ${args.to}`)
  })

export default config
