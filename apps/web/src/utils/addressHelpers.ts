import { ChainId } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import addresses from 'config/constants/contracts'
import { VaultKey } from 'state/types'

export const getAddress = (address: Pool.Address, chainId?: number): string => {
  return address[chainId] ? address[chainId] : address[ChainId.BSC]
}

export const getMasterChefAddress = (chainId?: number) => {
  return getAddress(addresses.masterChef, chainId)
}
export const getMasterChefV1Address = () => {
  return getAddress(addresses.masterChefV1)
}
export const getMulticallAddress = (chainId?: number) => {
  return getAddress(addresses.multiCall, chainId)
}
export const getLotteryV2Address = () => {
  return getAddress(addresses.lotteryV2)
}
export const getPancakeProfileAddress = () => {
  return getAddress(addresses.pancakeProfile)
}
export const getPancakeBunniesAddress = () => {
  return getAddress(addresses.pancakeBunnies)
}
export const getBunnyFactoryAddress = () => {
  return getAddress(addresses.bunnyFactory)
}
export const getPredictionsV1Address = () => {
  return getAddress(addresses.predictionsV1)
}
export const getClaimRefundAddress = () => {
  return getAddress(addresses.claimRefund)
}
export const getPointCenterIfoAddress = () => {
  return getAddress(addresses.pointCenterIfo)
}
export const getBunnySpecialAddress = () => {
  return getAddress(addresses.bunnySpecial)
}
export const getTradingCompetitionAddressEaster = () => {
  return getAddress(addresses.tradingCompetitionEaster)
}
export const getTradingCompetitionAddressFanToken = () => {
  return getAddress(addresses.tradingCompetitionFanToken)
}

export const getTradingCompetitionAddressMobox = () => {
  return getAddress(addresses.tradingCompetitionMobox)
}

export const getTradingCompetitionAddressMoD = () => {
  return getAddress(addresses.tradingCompetitionMoD)
}

export const getEasterNftAddress = () => {
  return getAddress(addresses.easterNft)
}

export const getVaultPoolAddress = (vaultKey: VaultKey) => {
  if (!vaultKey) {
    return null
  }
  return getAddress(addresses[vaultKey])
}

export const getCakeVaultAddress = () => {
  return getAddress(addresses.cakeVault)
}

export const getCakeFlexibleSideVaultAddress = () => {
  return getAddress(addresses.cakeFlexibleSideVault)
}

export const getBunnySpecialCakeVaultAddress = () => {
  return getAddress(addresses.bunnySpecialCakeVault)
}
export const getBunnySpecialPredictionAddress = () => {
  return getAddress(addresses.bunnySpecialPrediction)
}
export const getBunnySpecialLotteryAddress = () => {
  return getAddress(addresses.bunnySpecialLottery)
}
export const getBunnySpecialXmasAddress = () => {
  return getAddress(addresses.bunnySpecialXmas)
}
export const getFarmAuctionAddress = () => {
  return getAddress(addresses.farmAuction)
}
export const getAnniversaryAchievement = () => {
  return getAddress(addresses.AnniversaryAchievement)
}

export const getNftSaleAddress = () => {
  return getAddress(addresses.nftSale)
}
export const getPancakeSquadAddress = () => {
  return getAddress(addresses.pancakeSquad)
}
export const getPotteryDrawAddress = () => {
  return getAddress(addresses.potteryDraw)
}

export const getZapAddress = () => {
  return getAddress(addresses.zap)
}
export const getICakeAddress = () => {
  return getAddress(addresses.iCake)
}

export const getBCakeFarmBoosterAddress = () => {
  return getAddress(addresses.bCakeFarmBooster)
}

export const getBCakeFarmBoosterProxyFactoryAddress = () => {
  return getAddress(addresses.bCakeFarmBoosterProxyFactory)
}

export const getNonBscVaultAddress = (chainId?: number) => {
  return getAddress(addresses.nonBscVault, chainId)
}

export const getCrossFarmingSenderAddress = (chainId?: number) => {
  return getAddress(addresses.crossFarmingSender, chainId)
}

export const getCrossFarmingReceiverAddress = (chainId?: number) => {
  return getAddress(addresses.crossFarmingReceiver, chainId)
}

export const getNftMarketAddress = (chainId?: number) => {
  return getAddress(addresses.nftMarket,chainId)
}
export const getDFSAddress = (chainId?: number) => {
  return getAddress(addresses.dfs,chainId)
}
export const getAIDFSAddress = (chainId?: number) => {
  return getAddress(addresses.aidfs,chainId)
}
export const getPDFSAddress = (chainId?: number) => {
  return getAddress(addresses.pdfs,chainId)
}
export const getPairAddress = (chainId?: number) => {
  return getAddress(addresses.pair,chainId)
}
export const getBondAddress = (chainId?: number) => {
  return getAddress(addresses.bond,chainId)
}
export const getBondOldAddress = (chainId?: number) => {
  return getAddress(addresses.bondOld,chainId)
}
export const getMiningAddress = (chainId?: number) => {
  return getAddress(addresses.dfsMining,chainId)
}
export const getSavingsAddress = (chainId?: number) => {
  return getAddress(addresses.dfsSavings,chainId)
}
export const getIDOAddress = (chainId?: number) => {
  return getAddress(addresses.pdfs,chainId)
}
export const getSocialNFTAddress = (chainId?: number) => {
  return getAddress(addresses.socialNFT,chainId)
}
export const getStarlightAddress = (chainId?: number) => {
  return getAddress(addresses.starlightNft,chainId)
}
export const getNFTDatabaseAddress = (chainId?: number) => {
  return getAddress(addresses.nftDatabase,chainId)
}
export const getHBondAddress = (chainId?: number) => {
  return getAddress(addresses.hbond,chainId)
}
export const getHDFSAddress = (chainId?: number) => {
  return getAddress(addresses.hdfs,chainId)
}
export const getShareHolderAddress = (chainId?: number) => {
  return getAddress(addresses.shareholder,chainId)
}
export const getDiffusionAICatAddress = (chainId?: number) => {
  return getAddress(addresses.diffusionAICat,chainId)
}

export const getUSDTAddress = (chainId?: number) => {
  return getAddress(addresses.usdt,chainId)
}

export const getDashboardAddress = (chainId?: number) => {
  return getAddress(addresses.dashboard,chainId)
}