import { Grid, Typography, CircularProgress } from '@material-ui/core'
import { useTranslation } from '@pancakeswap/localization'
import { makeStyles } from '@material-ui/core/styles'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Skeleton, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useBondContract, useBondOldContract, useDashboardContract, useDFSContract, useDFSMiningContract, useDFSSavingsContract, usePairContract } from 'hooks/useContract'
import { getDFSAddress, getPairAddress, getUSDTAddress } from 'utils/addressHelpers'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseEther } from '@ethersproject/units'
import { formatBigNumber, formatNumber } from '@pancakeswap/utils/formatBalance'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { Paper } from './style'
import { DataCell } from './components/DataCell/DataCell'
import {
  EightGraph,
  ElevenGraph,
  FiveGraph,
  FourGraph,
  NineGraph,
  OneGraph,
  SevenGraph,
  SixGraph,
  TenGraph,
  ThirteenGraph,
  ThreeGraph,
  TwelveGraph,
  TwoGraph,
} from './components/Graph/Graph'
import { dashboardMock } from './MockData'

const useStyles = makeStyles((theme) => ({
  hasRLBorder: {
    [theme?.breakpoints?.up(981)]: {
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
    },
  },
}))

const telegramLink =
  'https://api.telegram.org/bot5334696884:AAHzLTcSxbmnzHZUBNfCBN2SjXAyaT06hQo/getChatMembersCount?chat_id=@DiffusionDAO'
const discordLink = 'https://discord.com/api/invite/XYKQdqmuTe?with_counts=true'
const twitterLink = 'https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=DFSDIFFUSION'
const mediumLink = 'https://medium.com/@getdiffusion?format=json'

const { one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen } =
  dashboardMock.OverviewData

export const dao = [
  '0xb93260C33e95a966212B0b99c29089a790b8c3d8',
  '0x1514FeE6D775DEb32DC464bE5bAb0b712573e9EC',
]
export const foundation = '0xe1F758081c7Bcaec75097294950959b3a91a088a'

const unstakeNFTAddress = '0x3753649E5E4b124Bdf233fAeD3177F723264D2AB'

const nftMarketDestroyAddress = '0xD51574e8b0140C5613ABf8bD26d7B187d58A12fb'

const elementaryUnusedMintAddress = '0xD294eBf617daECA9549995331941187Bd2E524ac'

const advancedUnusedMintAddress = '0x04a735A8712De3F689E9547209bC57f60a5E87aA'

const elementaryMintAddress = '0x06cE1EB2De0DfC29d801cF3885E90E35Dd26148D'

const advancedMintAddress = '0x4d998E96b581430592Cef98A7aA586a817d54709'

const Dashboard = () => {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const classes = useStyles()
  const [activeTab, setActiveTab] = useState<string>('Overview')
  const [elementaryUnusedMintAddressDfs, setElementaryUnusedMintAddressDfs] = useState<BigNumber>(BigNumber.from(0))
  const [foundationDFS, setFoundationDFS] = useState<BigNumber>(BigNumber.from(0))
  const [advancedUnusedMintAddressDfs, setAdvancedUnusedMintAddressDfs] = useState<BigNumber>(BigNumber.from(0))
  const [elementaryMintAddressDfs, setElementaryMintAddressDfs] = useState<BigNumber>(BigNumber.from(0))
  const [advancedMintAddressDfs, setAdvancedMintAddressDfs] = useState<BigNumber>(BigNumber.from(0))
  const [bondDfs, setBondDfs] = useState<BigNumber>(BigNumber.from(0))
  const [unstakeNFTDFS, setUnstakeNFTDFS] = useState<BigNumber>(BigNumber.from(0))
  const [nftMarketDestroyedDFS, setNftMarketDestroyedDFS] = useState<BigNumber>(BigNumber.from(0))
  const [daoDFS, setDaoDFS] = useState<BigNumber>(BigNumber.from(0))
  const [genesisDFS, setGenesisDFS] = useState<BigNumber>(BigNumber.from(0))
  const [dfsTotalCalls, setDfsTotalCalls] = useState<BigNumber>()
  const [dfsTotalSupply, setDfsTotalSupply] = useState<BigNumber>(BigNumber.from(0))

  const [DSGE, setDSGE] = useState<string>()
  const [houseHoldSavingsRate, setHouseHoldSavingsRate] = useState<string>()
  const [savingsTotalCalls, setSavingsTotalCalls] = useState<BigNumber>()

  const [current, setCurrent] = useState<string>()

  const [currentCirculationSupply, setCurrentCirculationSupply] = useState<BigNumber>()
  const [totalCirculationSupply, setTotalCirculationSupply] = useState<BigNumber>()
  const [targetInflationRate, setTargetInflationRate] = useState<string>()

  const [withdrawedSavingReward, setWithdrawedSavingReward] = useState<BigNumber>(BigNumber.from(0))

  const [withdrawedSocialReward, setWithdrawedSocialReward] = useState<BigNumber>(BigNumber.from(0))
  const [miningTotalCalls, setMiningTotalCalls] = useState<BigNumber>()

  const [bondUsed, setBondUsed] = useState<BigNumber>(BigNumber.from(0))
  const [bondRewardWithdrawed, setBondRewardWithdrawed] = useState<BigNumber>(BigNumber.from(0))
  const [bondTotalCalls, setBondTotalCalls] = useState<BigNumber>()

  // const [debtRatio, setDebtRatio] = useState<number>()

  const [gettingDFSBalance, setGettingDFSBalance] = useState<boolean>(false)
  const [gettingSavings, setGettingSavings] = useState<boolean>(false)
  const [gettingBond, setGettingBond] = useState<boolean>(false)
  const [gettingMining, setGettingMining] = useState<boolean>(false)
  const [gettingPair, setGettingPair] = useState<boolean>(false)
  const [totalPayout, setTotalPayout] = useState<BigNumber>()
  const [tvl, setTvl] = useState<BigNumber>()
  const [numerator, setNumerator] = useState<BigNumber>()
  const [marketPrice, setMarketPrice] = useState<number>()
  const [solitaryReserve, setSolitaryReserve] = useState<string>()
  
  const [holderLength, setHolderLength] = useState<number>(undefined)
  // const [data, setData] = useState<any>({})
  const pair = usePairContract(getPairAddress(chainId))
  const dfs = useDFSContract()
  const dfsMining = useDFSMiningContract()
  const dfsSavings = useDFSSavingsContract()
  const bond = useBondContract()
  const bondOld = useBondOldContract()
  const dashboard = useDashboardContract()
  const dfsAddress = getDFSAddress(chainId)
  const usdtAddress = getUSDTAddress(chainId)

  const { data, mutate } = useSWR('getDashboard', async () => {
    if (pair) {
      const reserves = await pair.getReserves()
      const [numerator, denominator] = usdtAddress.toLowerCase() < dfsAddress.toLowerCase() ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]]
      setNumerator(numerator)
      const tvl = await dashboard.tvl()
      setTvl(numerator.mul(2).add(parseEther("10000")).add(parseEther(tvl)))
      const marketPrice = parseFloat(formatUnits(numerator)) / parseFloat(formatUnits(denominator))
      setMarketPrice(marketPrice)

    }
    if (dfsSavings) {
      const savingsTotalCalls = await dfsSavings.totalCalls()
      setSavingsTotalCalls(savingsTotalCalls)
      setDSGE(await dfsSavings.DSGE())
      setHouseHoldSavingsRate(await dfsSavings.HouseHoldSavingsRate())
      setWithdrawedSavingReward(await dfsSavings.withdrawedSavingReward())
    }

    if (bond) {
      const buyers = await bond.getBuyers()
      let bondUsed = BigNumber.from(0)
      let bondRewardWithdrawed = BigNumber.from(0)
      await Promise.all(
        buyers?.map(async (buyer) => {
          const referral = await bond.addressToReferral(buyer)
          bondUsed = bondUsed.add(referral.bondUsed)
          bondRewardWithdrawed = bondRewardWithdrawed.add(referral.bondRewardWithdrawed)
        }),
      )
      setBondUsed(bondUsed)
      const totalPayout = (await bond.totalPayout()).add(await bondOld.totalPayout())

      setTotalPayout(totalPayout)

      const totalCirculation = await dashboard.totalCirculation()
      const totalCirculationSupply = totalPayout
        .mul(1315)
        .div(1000)
        .add(parseEther("158200")).add(parseEther(totalCirculation))


      setTotalCirculationSupply(totalCirculationSupply)
      const bondTotalCalls = await bond.totalCalls()
      setBondTotalCalls(bondTotalCalls)
      setBondRewardWithdrawed(bondRewardWithdrawed)
      setTargetInflationRate(await bond.targetInflationRate())
    }
    if (dfs) {
      const foundationDFS = await dfs.balanceOf(foundation)

      setFoundationDFS(foundationDFS)
      const elementaryUnusedMintAddressDfs = await dfs.balanceOf(elementaryUnusedMintAddress)
      setElementaryUnusedMintAddressDfs(elementaryUnusedMintAddressDfs)

      const advancedUnusedMintAddressDfs = await dfs.balanceOf(advancedUnusedMintAddress)
      setAdvancedUnusedMintAddressDfs(advancedUnusedMintAddressDfs)

      const elementaryMintAddressDfs = await dfs.balanceOf(elementaryMintAddress)
      setElementaryMintAddressDfs(elementaryMintAddressDfs)

      const advancedMintAddressDfs = await dfs.balanceOf(advancedMintAddress)
      setAdvancedMintAddressDfs(advancedMintAddressDfs)

      const bondDfs = (await dfs.balanceOf(bond.address)).add(await dfs.balanceOf(bondOld.address))
      setBondDfs(bondDfs)

      const unstakeNFTDFS = await dfs.balanceOf(unstakeNFTAddress)
      setUnstakeNFTDFS(unstakeNFTDFS)

      const nftMarketDestroyedDFS = await dfs.balanceOf(nftMarketDestroyAddress)
      setNftMarketDestroyedDFS(nftMarketDestroyedDFS)

      const daoDFS = (await Promise.all(dao.map(async (d) => dfs.balanceOf(d)))).reduce((accum, curr) => {
        // eslint-disable-next-line no-return-assign, no-param-reassign
        accum = accum.add(curr)
        return accum
      }, BigNumber.from(0))
      setDaoDFS(daoDFS)

      const genesisDFS = await dfs.balanceOf(await dfs.genesis())
      setGenesisDFS(genesisDFS)

      const dfsTotalSupply = await dfs.totalSupply()
      setDfsTotalSupply(dfsTotalSupply)

      const receiver = await bond.receiver()
      const receiverDFS = await dfs.balanceOf(receiver)

      const currentCirculationSupply = dfsTotalSupply
        .sub(genesisDFS)
        .sub(receiverDFS)
        .sub(daoDFS)
        .sub(foundationDFS)
        .sub(bondDfs)
        .sub(unstakeNFTDFS)
        .sub(nftMarketDestroyedDFS)
        .sub(elementaryUnusedMintAddressDfs)
        .sub(advancedUnusedMintAddressDfs)
        .sub(elementaryMintAddressDfs)
        .sub(advancedMintAddressDfs)

      const currentCirculation = await dashboard.currentCirculation()
      setCurrentCirculationSupply(currentCirculationSupply.add(parseEther(currentCirculation)))

      const solitaryReserve = await dashboard.solitaryReserve()
      setSolitaryReserve(solitaryReserve)

      const getHoldersLength = await dfs.getHoldersLength()
      setHolderLength(getHoldersLength)

      const dfsTotalCalls = await dfs.totalCalls()
      setDfsTotalCalls(dfsTotalCalls)
    }


    if (dfsMining) {
      const miningTotalCalls = await dfsMining.totalCalls()
      setMiningTotalCalls(miningTotalCalls)
      setWithdrawedSocialReward(await dfsMining.withdrawedSocialReward())
    }


    const avgConentraction = 6991.59
    return { avgConentraction }
  })


  const clickTab = (tab: string) => {
    setActiveTab(tab)
  }

  // console.log("totalCirculation:",formatUnits(totalCirculation))

  // const telegram = await fetch(telegramLink)
  // const telegramJson = await telegram.json()
  // const telegramFollowers = telegramJson.result
  // console.log('telegramFollowers:', telegramFollowers)

  // const discord = await fetch(discordLink)
  // const discordJson = await discord.json()
  // const discordFollowers = discordJson.approximate_member_count
  // console.log('discordFollowers:', discordFollowers)

  // const twitter = await fetch(twitterLink)
  // const twitterJson = await twitter.json()
  // const twitterFollowers = twitterJson[0].followers_count
  // console.log('twitterFollowers:', twitterFollowers)

  // const medium = await fetch(mediumLink)
  // const text = await medium.text()
  // const mediumJson = JSON.parse(text.replace('])}while(1);</x>', ''))
  // console.log(mediumJson)
  // const userId = mediumJson.payload.user.userId
  // const mediumFollowers = mediumJson.payload.references.SocialStats.userId.usersFollowedByCount
  // console.log('mediumFollowers:', mediumFollowers)

  // const followers = {
  //   concentration: {
  //     telegram: telegramFollowers,
  //     discord: discordFollowers,
  //     twitter: twitterFollowers,
  //     medium: mediumFollowers,
  //   },
  // }
  // console.log(followers)
  // return followers

  // const response = await fetch('https://middle.diffusiondao.org/dashboard')
  // const json = await response.json()

  // const concentractions = Object.keys(json?.concentration).map((key) => json?.concentration[key])
  // eslint-disable-next-line no-return-assign, no-param-reassign
  // const avgConentraction = concentractions.reduce((acc, cur) => (acc += cur), 0) / concentractions.length

  const time = new Date()

  const expansionFund = useMemo(() =>foundationDFS.gt(0) &&  marketPrice > 0 && parseFloat(formatUnits(foundationDFS)) * marketPrice, [foundationDFS, marketPrice])
  const callFactor = useMemo(() => miningTotalCalls && dfsTotalCalls && bondTotalCalls && savingsTotalCalls && miningTotalCalls.add(dfsTotalCalls).add(bondTotalCalls).add(savingsTotalCalls), [miningTotalCalls, dfsTotalCalls, bondTotalCalls, savingsTotalCalls])

  const solitaryReserves = useMemo(() => numerator && currentCirculationSupply  && solitaryReserve && parseFloat(formatUnits(numerator)) / parseFloat(formatUnits(currentCirculationSupply)) + +solitaryReserve, [currentCirculationSupply, numerator, solitaryReserve])
  const inflationRate = useMemo(() => marketPrice && solitaryReserves && (marketPrice - solitaryReserves) / marketPrice, [marketPrice, solitaryReserves])
  const debtRatio = useMemo(() => totalPayout && currentCirculationSupply && (parseFloat(formatUnits(totalPayout?.sub(bondUsed))) * 100) / parseFloat(formatUnits(currentCirculationSupply?.add(parseEther("65000")))), [currentCirculationSupply, totalPayout])
  return (
    <div className="dashboard-view">
      <Typography variant="h4" style={{ fontWeight: 700, overflow: 'hidden', color: '#fff' }}>
        {t('Dashboard')}
      </Typography>
      {isMobile ? (
        <div className="dashboard-tab">
          <div
            aria-hidden="true"
            className={`${activeTab === 'Overview' && 'active'}`}
            onClick={() => clickTab('Overview')}
          >
            {t('Overview')}
          </div>
          {/* <div aria-hidden="true" className={`${activeTab === 'Chart' && 'active'}`} onClick={() => clickTab('Chart')}>
            {t('Chart')}
          </div> */}
        </div>
      ) : (
        <div style={{ fontWeight: 500, fontSize: '15px', overflow: 'hidden', lineHeight: '40px', color: '#fff' }}>
          {t('Overview')}
          <span style={{ color: 'grey', fontSize: '12px', fontWeight: 400, marginLeft: '16px' }}>
            {`${time.toLocaleDateString().replace(/\//g, '-')} ${time.toTimeString().slice(0, 8)}`}
          </span>
        </div>
      )}
      <Grid container spacing={2}>
        {!(isMobile && activeTab !== 'Overview') ? (
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Grid container spacing={2}>
              <Grid item lg={9} md={9} sm={12} xs={12}>
                <Grid container spacing={2}>
                  <Grid item lg={12} md={12} sm={12} xs={12}>
                    <div className="cell-box cell-item1">
                      <Grid container spacing={0}>
                        <Grid item lg={4} md={4} sm={12} xs={12}>
                          <div className="cell-sub-item">
                            <DataCell
                              title={t('TVL')}
                              data={tvl && `$${formatBigNumber(tvl.mul(9), 2)}`}
                              style={{ fontSize: '32px' }}
                            />
                            <DataCell title="" data="" imgUrl="/images/dashboard/tvl.svg" />
                          </div>
                        </Grid>
                        <Grid item lg={4} md={4} sm={12} xs={12}>
                          <div className={`${classes.hasRLBorder} cell-sub-item`}>
                            <DataCell
                              title={t('Total circulation')}
                              data={
                                totalCirculationSupply &&
                                `${formatBigNumber(totalCirculationSupply, 2)} AIDFS`
                              }
                            />
                            <DataCell
                              title={t('Solitary Reserve')}
                              data={solitaryReserves && `$${formatNumber(solitaryReserves, 2)}`}
                            />
                          </div>
                        </Grid>
                        <Grid item lg={4} md={4} sm={12} xs={12}>
                          <div className="cell-sub-item">
                            <DataCell
                              title={t('Current circulation volume')}
                              data={
                                currentCirculationSupply && 
                                `${formatBigNumber(currentCirculationSupply.add(parseEther("65000")), 2)} DFS`
                              }
                              imgUrl="/images/dashboard/rf.svg"
                            />
                            <DataCell
                              title={t('Expansion Fund')}
                              data={expansionFund > 0 ? `$${expansionFund?.toFixed(2)}`: undefined}
                              imgUrl="/images/dashboard/rm.svg"
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                  <Grid item lg={4} md={4} sm={12} xs={12}>
                    <div className="cell-box cell-item2">
                      <div className="has-border cell-sub-item">
                        <div className="ctir-image">
                          <CircularProgress
                            variant="determinate"
                            style={{ color: 'rgba(171, 182, 255, 0.1)', margin: 'auto', width: '100%', height: '100%' }}
                            size={40}
                            thickness={4}
                            value={100}
                          />
                          <CircularProgress
                            variant="determinate"
                            size={40}
                            thickness={4}
                            style={{
                              color: '#0819ff',
                              width: '100%',
                              height: '100%',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                            }}
                            value={8}
                          />
                          {targetInflationRate ? (
                            <div className="ctir-data">{targetInflationRate}%</div>
                          ) : (
                            <Skeleton width={100} />
                          )}
                        </div>
                        <div className="ctir-title">{t('Target inflation rate')}</div>
                      </div>
                    </div>
                  </Grid>
                  <Grid item lg={8} md={8} sm={12} xs={12}>
                    <div className="cell-box cell-item3">
                      <Grid container spacing={0}>
                        <Grid item lg={6} md={6} sm={12} xs={12}>
                          <div
                            className="cell-sub-item"
                            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                          >
                            <DataCell
                              title={t('Household savings rate')}
                              data={houseHoldSavingsRate && `${houseHoldSavingsRate}%`}
                              progressColor="#f200ff"
                            />
                          </div>
                        </Grid>
                        <Grid item lg={6} md={6} sm={12} xs={12}>
                          <div
                            className="cell-sub-item"
                            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                          >
                            <DataCell
                              title={t('DSGE suitability')}
                              data={DSGE && `${DSGE}%`}
                              progressColor="#01ffed"
                            />
                          </div>
                        </Grid>
                        <Grid item lg={6} md={6} sm={12} xs={12}>
                          <div className="cell-sub-item">
                            <DataCell
                              title={t('Inflation')}
                              data={inflationRate && `${(inflationRate * 100).toFixed(2)}%`}
                              progressColor="#f5d700"
                            />
                          </div>
                        </Grid>
                        <Grid item lg={6} md={6} sm={12} xs={12}>
                          <div className="cell-sub-item">
                            <DataCell
                              title={t('Debt ratio')}
                              data={debtRatio && `${formatNumber(debtRatio)}%`}
                              progressColor="#0131ff"
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item lg={3} md={3} sm={12} xs={12}>
                <Grid container spacing={2}>
                  <Grid item lg={12} md={12} sm={12} xs={12}>
                    <div className="cell-box cell-item4" style={{ position: 'relative' }}>
                      <div className="cell-sub-item">
                        <img
                          alt=""
                          src="/images/dashboard/cell-bg4.png"
                          style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}
                        />
                        <div className="disvg">
                          <img src="/images/dashboard/di.png" style={{ width: '56px', height: '52px' }} alt="" />
                        </div>
                        <div className="di-font">{t('Diffusion index')}</div>
                        {/* {/* <h3 className="di-content">{eleven}</h3> */}
                        <DataCell
                          title={t('Diffusion Coefficient')}
                          data={holderLength && holderLength.toString()}
                          titleStyle={{ color: '#ABB6FF' }}
                        />
                        <DataCell
                          title={t('Attention Factor')}
                          data={data?.avgConentraction?.toString()}
                          titleStyle={{ color: '#ABB6FF' }}
                        />
                        <DataCell
                          title={t('Call Factor')}
                          data={callFactor?.toString()}
                          imgUrl="/images/dashboard/cf.png"
                          titleStyle={{ color: '#ABB6FF' }}
                          imgStyle={{ height: '85px', width: '54px' }}
                        />
                      </div>
                    </div>
                  </Grid>
                  <Grid item lg={12} md={12} sm={12} xs={12}>
                    <div className="cell-box cell-item5">
                      <div className="cell-sub-item">
                        <DataCell
                          title={t('Expansion Fund')}
                          data={expansionFund > 0 ? `$${expansionFund?.toFixed(2)}`: undefined}
                          imgUrl="/images/dashboard/rz.svg"
                        />
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : null}

        {/* echarts */}
        {false && !(isMobile && activeTab !== 'Chart') ? (
          <>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Grid container spacing={2}>
                <Grid item lg={7} md={7} sm={12} xs={12}>
                  <Paper className="dfs-card dfs-chart-card">
                    <OneGraph />
                  </Paper>
                </Grid>
                <Grid item lg={5} md={5} sm={12} xs={12}>
                  <Paper className="dfs-card dfs-chart-card">
                    <TwoGraph />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Grid container spacing={2}>
                <Grid item lg={7} md={7} sm={12} xs={12}>
                  <Grid container spacing={4}>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <Paper className="dfs-card dfs-chart-card">
                        <ThreeGraph />
                      </Paper>
                    </Grid>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <Paper className="dfs-card dfs-chart-card">
                        <FourGraph />
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item lg={5} md={5} sm={12} xs={12}>
                  <Grid container spacing={2}>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <Paper className="dfs-card dfs-chart-card" style={{ height: '238px' }}>
                        <FiveGraph />
                      </Paper>
                    </Grid>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <Paper className="dfs-card dfs-chart-card" style={{ height: '238px' }}>
                        <SixGraph />
                      </Paper>
                    </Grid>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <Paper className="dfs-card dfs-chart-card" style={{ height: '238px' }}>
                        <SevenGraph />
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Grid container spacing={2}>
                <Grid item lg={7} md={7} sm={12} xs={12}>
                  <Paper className="dfs-card dfs-chart-card">
                    <EightGraph />
                  </Paper>
                </Grid>
                <Grid item lg={5} md={5} sm={12} xs={12}>
                  <Paper className="dfs-card dfs-chart-card">
                    <NineGraph />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Paper className="dfs-card dfs-chart-card">
                <TenGraph />
              </Paper>
            </Grid>

            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Grid container spacing={2}>
                <Grid item lg={4} md={4} sm={12} xs={12}>
                  <Paper className="dfs-card dfs-chart-card">
                    <ElevenGraph />
                  </Paper>
                </Grid>
                <Grid item lg={4} md={4} sm={12} xs={12}>
                  <Paper className="dfs-card dfs-chart-card">
                    <TwelveGraph />
                  </Paper>
                </Grid>
                <Grid item lg={4} md={4} sm={12} xs={12}>
                  <Paper className="dfs-card dfs-chart-card">
                    <ThirteenGraph />
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </>
        ) : null}
      </Grid>
    </div>
  )
}

export default Dashboard
