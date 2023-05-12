import { FC, useEffect, useState } from 'react'
import Typed from 'react-typed'
import { Grid } from '@material-ui/core'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import { Skeleton, useMatchBreakpoints } from '@pancakeswap/uikit'
import { getMiningAddress, getDFSAddress, getPairAddress, getUSDTAddress } from 'utils/addressHelpers'
import { MaxUint256 } from '@ethersproject/constants'
import { useBondContract,useBondOldContract, useDashboardContract, useDFSContract, useDFSMiningContract, useERC20, usePairContract } from 'hooks/useContract'
import { formatBigNumber, formatNumber } from '@pancakeswap/utils/formatBalance'
import { useRouterContract } from 'utils/exchange'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import useSWR from 'swr'
import { foundation } from 'views/Dashboard'
import { USDT_BSC } from '@pancakeswap/tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'

import {
  BondPageWrap,
  BondPageHeader,
  SculptureWrap,
  HeaderTitle,
  HeaderDes,
  OverviewWrap,
  OverviewCard,
  OverviewPromptList,
  OverviewPromptItem,
  OverviewPromptWrap,
  OverviewPromptLine,
  OverviewPromptTitle,
  Horizontal,
  OverviewCardItem,
  OverviewCardItemTitle,
  OverviewCardItemContent,
  BondListItem,
  BondListItemHeader,
  BondListItemContent,
  ContentCell,
  CellTitle,
  CellText,
  TextColor,
  BondListItemBtn,
  BondListItemBtnClosed,
  ImgWrap,
  FromImg,
  ToImg,
  BondHeaderName,
} from './style'
import bondDatas from './bondData'
import BondModal from './components/BondModal'
import SettingModal from './components/SettingModal'

const Bond = () => {
  const {chainId} = useActiveChainId()
  const { account } = useWeb3React()
  const { isMobile } = useMatchBreakpoints()
  const { t } = useTranslation()
  const [bondData, setBondData] = useState<any[]>(bondDatas)
  const [bondModalVisible, setBondModalVisible] = useState<boolean>(false)
  const [settingModalVisible, setSettingModalVisible] = useState<boolean>(false)

  const [discount, setDiscount] = useState<number>(0)

  const [isApprove, setIsApprove] = useState<boolean>(false)
  const [bondItem, setBondItem] = useState<any>(null)
  const [dfsTotalSupply, setDfsTotalSupply] = useState<number>()
  const [marketPrice, setMarketPrice] = useState<number>(0)
  const [central, setCentral] = useState<number>()
  const bond = useBondContract()
  const bondOld = useBondOldContract()
  const dfs = useDFSContract()
  const usdtAddress = getUSDTAddress(chainId)
  const usdt = useERC20(usdtAddress, true)
  const pairAddress = getPairAddress(chainId)
  const dfsAddress = getDFSAddress(chainId)
  const pair = usePairContract(pairAddress)
  const dashboard = useDashboardContract()

  const { data, status } = useSWR('setMarketPriceAndCentral', async () => {
    const bondDiscount = await bond.discount()
    setDiscount(bondDiscount.toNumber())

    const reserves = await pair.getReserves()
    const [numerator, denominator] = usdtAddress.toLowerCase() < dfsAddress.toLowerCase() ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]]
     
    const marketPriceNumber = parseFloat(formatUnits(numerator)) / parseFloat(formatUnits(denominator)) 
    setMarketPrice(marketPriceNumber)

    const bondPrice = marketPriceNumber * (10000 - bondDiscount) / 10000
    bondDatas[0].price = formatNumber(bondPrice,2)
    bondDatas[0].discount = bondDiscount

    const totalPayout = (await bond.totalPayout()).add(await bondOld.totalPayout())

    const central = bondPrice * parseFloat(formatUnits(totalPayout,"ether")) + 2350000
    const additionalCentral = await dashboard.central()
    setCentral(central + +additionalCentral)
  })

  const openBondModal = (item) => {
    setBondItem(item)
    setBondModalVisible(true)
  }
  const closeBondModal = () => {
    setBondModalVisible(false)
  }
  const openSettingModal = () => {
    setSettingModalVisible(true)
  }
  const closeSettingModal = () => {
    setSettingModalVisible(false)
  }

  const getApprove = () => {
    usdt
      .approve(bond.address, MaxUint256)
      .then((receipt) =>
        receipt.wait().then(() => setIsApprove(true))
      )
  }
  useEffect(() => {
    if (account) {
      usdt.allowance(account, bond.address).then((res) => {
        if (res.gt(0)) {
          setIsApprove(true)
        } else {
          setIsApprove(false)
        }
      })
    }
  }, [account])
  useEffect(() => {
    const dfsUsdt = bondDatas[0]
    // eslint-disable-next-line no-return-assign, no-param-reassign
    bond
      .vestingTerm()
      .then((res) => {
        if (res / (24 * 3600) >= 1) {
          dfsUsdt.duration = `${formatNumber(res / (24 * 3600), 2)} Days`
        } else if (res / 3600 >= 1) {
          dfsUsdt.duration = `${formatNumber(res / 3600, 2)} Hours`
        } else if (res / 60 >= 1) {
          dfsUsdt.duration = `${formatNumber(res / 60, 2)} Minutes`
        }
      })
      .catch((error) => {
        console.log(error.reason ?? error.data?.message ?? error.message)
      })
    setBondData([dfsUsdt, ...bondDatas.slice(1)])

  }, [account, marketPrice])
  return (
    <BondPageWrap>
      <BondPageHeader>
        <SculptureWrap src="/images/bond/bondSculpture.png" isMobile={isMobile} />
        <HeaderTitle>
          <div>{t('Bonds')}</div>
        </HeaderTitle>
        {!isMobile && (
          <HeaderDes>
            {t(
              'Sales of bonds is the only way for AIDFS to be minted, through the sales of bonds to accumulate large asset volume, the central financial agreement will have but not limited to USDT, ETH, BNB and equivalent type of assets. This type of asset will become the core foundation supporting the value of AIDFS.',
            )}
          </HeaderDes>
        )}
      </BondPageHeader>

      <OverviewWrap>
        <OverviewCard isMobile={isMobile}>
          <OverviewCardItem>
            <OverviewCardItemTitle>{t('Central Financial Agreement Assets')}</OverviewCardItemTitle>
            { marketPrice > 0 && central ? (
              <OverviewCardItemContent isMobile={isMobile}>
                ${central?.toFixed(2)}
              </OverviewCardItemContent>
            ) : (
              <Skeleton />
            )}
          </OverviewCardItem>
          <OverviewCardItem>
            <OverviewCardItemTitle>{t('Price of AIDFS')}</OverviewCardItemTitle>
            {marketPrice > 0 ? (
              <OverviewCardItemContent isMobile={isMobile}>${formatNumber(marketPrice, 2)}</OverviewCardItemContent>
            ) : (
              <Skeleton />
            )}
          </OverviewCardItem>
        </OverviewCard>
        {isMobile ? (
          <>
            {/* <OverviewPromptLine style={{ width: 'calc(50% - 25px)' }} />
              <OverviewPromptTitle>{t('Reminder')}</OverviewPromptTitle>
              <OverviewPromptLine style={{ width: 'calc(50% - 25px)' }} /> */}
          </>
        ) : (
          <OverviewPromptWrap>
            <OverviewPromptTitle>{t('Reminder')}</OverviewPromptTitle>
            <OverviewPromptLine style={{ width: 'calc(100% - 50px)' }} />
          </OverviewPromptWrap>
        )}

        {!isMobile && (
          <OverviewPromptList>
            <OverviewPromptItem>{t('Get AIDFS at a discounted bond price')}</OverviewPromptItem>
            <OverviewPromptItem>{t('AIDFS will be fully released linearly in 10 days after bonds purchase')}</OverviewPromptItem>
            <OverviewPromptItem>
              {t(
                'Unused bonds can be used to mint NFT',
              )}
            </OverviewPromptItem>
          </OverviewPromptList>
        )}
      </OverviewWrap>

      <Grid container spacing={2}>
        {bondData.map((item) => (
          <Grid item lg={4} md={4} sm={12} xs={12} key={item.key}>
            <BondListItem>
              <BondListItemHeader isMobile={isMobile}>
                <ImgWrap>
                  <FromImg src={item.from} />
                  <ToImg src={item.to} />
                </ImgWrap>
                <BondHeaderName>{item.name}</BondHeaderName>
              </BondListItemHeader>
              <BondListItemContent isMobile={isMobile}>
                <ContentCell isMobile={isMobile}>
                  <CellTitle>{t('Price')}</CellTitle>
                  <CellText>{`$${item.price}`}</CellText>
                </ContentCell>
                <ContentCell isMobile={isMobile}>
                  <CellTitle>{t('Discount')}</CellTitle>
                  <CellText>
                    <TextColor isRise={item.discount > 0}>{formatNumber(item.discount / 100, 2)}%</TextColor>
                  </CellText>
                </ContentCell>
                <ContentCell isMobile={isMobile}>
                  <CellTitle>{t('Duration')}</CellTitle>
                  <CellText>{`${item.duration.split(' ')[0]} ${t(item.duration.split(' ')[1])}`}</CellText>
                </ContentCell>
              </BondListItemContent>
              {item.status === 'opened' ? (
                <BondListItemBtn onClick={() => openBondModal(item)}>{t('Bonds')}</BondListItemBtn>
              ) : (
                <BondListItemBtnClosed>{t('Not opened')}</BondListItemBtnClosed>
              )}
            </BondListItem>
          </Grid>
        ))}
      </Grid>
      {bondModalVisible ? (
        <BondModal
          bondData={bondItem}
          onClose={closeBondModal}
          openSettingModal={openSettingModal}
          account={account}
          isApprove={isApprove}
          getApprove={getApprove}
        />
      ) : null}
      {settingModalVisible ? <SettingModal account={account} bondData={bondItem} onClose={closeSettingModal} /> : null}
    </BondPageWrap>
  )
}
export default Bond
