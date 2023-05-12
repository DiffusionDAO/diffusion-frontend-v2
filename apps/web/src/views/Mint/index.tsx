/* eslint-disable no-param-reassign */
import { FC, useEffect, useState } from 'react'
import { Grid } from '@material-ui/core'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import { useBondContract, useSocialNftContract, useERC20, useDFSContract, useAIDFSContract } from 'hooks/useContract'
import { getDFSAddress, getSocialNFTAddress } from 'utils/addressHelpers'
import { MaxUint256 } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { useMatchBreakpoints, useModal } from '@pancakeswap/uikit'
import { formatBigNumber } from '@pancakeswap/utils/formatBalance'
import { estimateGas } from 'utils/calls'
import { useActiveChainId } from 'hooks/useActiveChainId'

import {
  BondPageWrap,
  DrawBlindBoxList,
  DrawBlindBoxItem,
  DrawBlindBoxImgWrap,
  BoxLeftAskImg,
  BoxRightAskImg,
  ContentWrap,
  DalaCardList,
  DalaCardListTitle,
  DalaCardCellWrap,
  DalaCardLabelDiv,
  DalaCardValueDiv,
  ColorFont,
  AvailableCount,
  ActionWrap,
  ActionLeft,
  ActionRight,
  CountInput,
  DrawBlindBoxTextBtn,
  DrawBlindBoxPrimaryBtn,
  UnWithdrawCount,
  CountWrap,
} from './style'
import DataCell from '../../components/ListDataCell'
import MintBoxModal from './components/MintBoxModal'
import InsufficientBalance from './components/InsufficientBalance'
import PlayBindBoxModal from './components/PlayMintBoxModal'

const Mint = () => {
  const { chainId } = useActiveChainId()
  const { account } = useWeb3React()
  const { isMobile } = useMatchBreakpoints()
  const { t } = useTranslation()

  const [mintBoxModalVisible, setMintBoxModalVisible] = useState<boolean>(false)
  const [InsufficientBalanceVisible, setInsufficientBalanceModalVisible] = useState<boolean>(false)
  const [playMintBoxModalVisible, setPlayBindBoxModalVisible] = useState<boolean>(false)
  const [gifUrl, setGifUrl] = useState<string>('/images/mint/ordinary.gif')

  const [seniorCount, setSeniorCount] = useState<number>(1)
  const [maxSenior, setMaxSenior] = useState<number>(1)

  const [ordinaryCount, setOrdinaryCount] = useState<number>(1)
  const [maxOrdinary, setMaxOrdinary] = useState<number>(1)

  const [tryCount, setTryCount] = useState<number>(1)
  const [maxTry, setMaxTry] = useState<number>(1)

  const [mintNFTData, setMintNFTData] = useState<any>([])
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [bondUnused, setBondPayout] = useState<BigNumber>(BigNumber.from(0))
  const [tryCost, setTryCost] = useState<BigNumber>(BigNumber.from(0))

  const [ordinaryPrice, setOneCost] = useState<BigNumber>(BigNumber.from(0))
  const [seniorPrice, setTwoCost] = useState<BigNumber>(BigNumber.from(0))
  const [bondUsed, setBondUsed] = useState<BigNumber>(BigNumber.from(0))

  const socialNFT = useSocialNftContract()

  useEffect(() => {
    socialNFT.tryCost().then((oneCost) => setTryCost(oneCost))
    socialNFT.elementaryCost().then((oneCost) => setOneCost(oneCost))
    socialNFT.advancedCost().then((twoCost) => setTwoCost(twoCost))
  }, [account, balance])
  // const DFS = useDFSContract()
  const AIDFS = useAIDFSContract()

  const bond = useBondContract()

  useEffect(() => {
    if (account) {
      bond.addressToReferral(account).then((res) => setBondUsed(res.bondUsed))
      bond.unusedOf(account).then((res) => setBondPayout(res))
      AIDFS.balanceOf(account)
        .then((res) => {
          if (!res.eq(balance)) {
            setBalance(res)
          }
        })
        .catch((error) => {
          console.log(error)
        })

      if (ordinaryPrice.gt(0)) {
        const balanceCount = balance.gt(0) ? balance.div(ordinaryPrice).toNumber() : 0
        const unusedCount = bondUnused.gt(0) ? bondUnused.div(ordinaryPrice).toNumber() : 0
        setMaxOrdinary(Math.max(balanceCount, unusedCount))
      }
      if (seniorPrice.gt(0)) {
        const balanceCount = balance.gt(0) ? balance.div(seniorPrice).toNumber() : 0
        const unusedCount = bondUnused.gt(0) ? bondUnused.div(seniorPrice).toNumber() : 0
        setMaxSenior(Math.max(balanceCount, unusedCount))
      }
      if (tryCost.gt(0)) {
        const balanceCount = balance.gt(0) ? balance.div(tryCost).toNumber() : 0
        const unusedCount = bondUnused.gt(0) ? bondUnused.div(tryCost).toNumber() : 0
        setMaxTry(Math.max(balanceCount, unusedCount))
      }
    }
  }, [account, mintBoxModalVisible, ordinaryPrice, seniorPrice])

  const mint = async (type: string, useBond: boolean) => {
    if (!account) {

      return
    }
    if (type === 'ordinary') {
      if (useBond) {
        if (bondUnused.lt(ordinaryPrice.mul(ordinaryCount))) {
          setInsufficientBalanceModalVisible(true)
          return
        }
      } else if (balance.lt(ordinaryPrice.mul(ordinaryCount))) {
        setInsufficientBalanceModalVisible(true)
        return
      }
    } else if (type === 'senior') {
      if (useBond) {
        if (bondUnused.lt(seniorPrice.mul(seniorCount))) {
          setInsufficientBalanceModalVisible(true)
          return
        }
      } else if (balance.lt(seniorPrice.mul(seniorCount))) {
        setInsufficientBalanceModalVisible(true)
        return
      }
    } else if (type === "try") {
      if (useBond) {
        if (bondUnused.lt(tryCost.mul(tryCount))) {
          setInsufficientBalanceModalVisible(true)
          return
        }
      } else if (balance.lt(tryCost.mul(tryCount))) {
        setInsufficientBalanceModalVisible(true)
        return
      }
    }

    setGifUrl(`/images/mint/${type}.gif`)
    setPlayBindBoxModalVisible(true)

    let gasEstimation: BigNumber = BigNumber.from(0)
    if (type === 'ordinary') {
      gasEstimation = await estimateGas(socialNFT, 'mintElementary', [ordinaryCount, useBond], {}, 1500)
    } else if (type === 'senior') {
      gasEstimation = await estimateGas(socialNFT, 'mintAdvanced', [seniorCount, useBond], {}, 1500)
    } else if (type === 'try') {
      gasEstimation = await estimateGas(socialNFT, 'mintTry', [tryCount, useBond], {}, 1500)
    }

    console.log('gasEstimation:', gasEstimation.toNumber())
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      let res
      if (type === 'ordinary') {
        res = await socialNFT.mintElementary(ordinaryCount, useBond, { gasLimit: gasEstimation })
      } else if (type === 'senior') {
        res = await socialNFT.mintAdvanced(seniorCount, useBond, { gasLimit: gasEstimation })
      } else if (type === 'try') {
        res = await socialNFT.mintTry(tryCount, useBond, { gasLimit: gasEstimation })
      }
      const receipt = await res.wait()
      const { logs } = receipt
      // eslint-disable-next-line prefer-const
      let levelTokenIds = {}
      const topics = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      console.log(logs)
      for (let i = 0; i < logs.length; i++) {
        if (logs[i] && logs[i].topics[0] === topics && logs[i].address === socialNFT.address) {
          const id = BigNumber.from(logs[i]?.topics[3])
          const tokenId = id.toString()
          // eslint-disable-next-line no-await-in-loop
          const getToken = await socialNFT.getToken(tokenId)
          if (!levelTokenIds[getToken.level]) levelTokenIds[getToken.level] = []
          levelTokenIds[getToken.level].push(tokenId)
        }
      }
      const nftData = Object.keys(levelTokenIds).map((level) => {
        const data = { id: level, level, tokenIds: levelTokenIds[level] }
        return data
      })
      setMintNFTData(nftData)
      setPlayBindBoxModalVisible(false)
      setMintBoxModalVisible(true)
    } catch (error: any) {
      window.alert(error.reason ?? error.data?.message ?? error.message)
      setPlayBindBoxModalVisible(false)
    }
  }

  const closeBlindBoxModal = () => {
    setMintBoxModalVisible(false)
    setMintNFTData([])
  }
  const closeJumpModal = () => {
    setInsufficientBalanceModalVisible(false)
  }
  const closePlayBindBoxModal = () => {
    setPlayBindBoxModalVisible(false)
  }
  return (
    <BondPageWrap>
      <DrawBlindBoxList>
        <Grid container spacing={2}>
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <DrawBlindBoxItem className="item1">
              <DrawBlindBoxImgWrap className="item1">
                <BoxLeftAskImg src="/images/mint/orangeLeftAsk.png" />
                <BoxRightAskImg src="/images/mint/orangeRightAsk.png" />
              </DrawBlindBoxImgWrap>
              <ContentWrap>
                <DalaCardList>
                  <DalaCardListTitle>{t('Advanced Mint')}</DalaCardListTitle>
                  <DataCell
                    label={t('Price')}
                    value={`${formatUnits(seniorPrice, 'ether')} AIDFS`}
                    valueDivStyle={{ fontSize: '14px' }}
                    position="horizontal"
                  />
                  {/* <DataCell
                    label={t('Description')}
                    value={t('Acquire any of the 2 types of NFT cards')}
                    valueDivStyle={{ fontSize: '14px', textAlign: 'right' }}
                    position="horizontal"
                  /> */}
                  <DalaCardCellWrap>
                    <DalaCardLabelDiv>{t('Probability')}</DalaCardLabelDiv>
                    <DalaCardValueDiv>
                      <ColorFont style={{ color: '#FF7056' }}> 95% </ColorFont>
                      {t('Wiseman')}
                      {isMobile ? <br /> : null}
                      <ColorFont style={{ color: '#FF7056' }}> 5% </ColorFont>
                      {t('General')}
                    </DalaCardValueDiv>
                  </DalaCardCellWrap>
                </DalaCardList>
                <CountWrap>
                  <AvailableCount>
                    {t('Balance')}: {balance ? formatBigNumber(balance, 2) : 0} AIDFS
                  </AvailableCount>
                  <UnWithdrawCount>
                    {t('Unused')}: {formatBigNumber(bondUnused, 2)} AIDFS
                  </UnWithdrawCount>
                </CountWrap>
                <ActionWrap>
                  <ActionLeft>
                    <DrawBlindBoxTextBtn
                      className="orangeBtn"
                      onClick={() => {
                        if (seniorCount > 1) setSeniorCount(seniorCount - 1)
                      }}
                    >
                      -
                    </DrawBlindBoxTextBtn>
                    <CountInput
                      value={seniorCount}
                      ismobile={isMobile.toString()}
                      min={1}
                      controls={false}
                      onChange={(val) => setSeniorCount(Number(val))}
                    />
                    <DrawBlindBoxTextBtn
                      className="orangeBtn"
                      onClick={() => {
                        if (seniorCount < maxSenior) setSeniorCount(seniorCount + 1)
                      }}
                    >
                      +
                    </DrawBlindBoxTextBtn>
                    <DrawBlindBoxTextBtn
                      className="orangeBtn"
                      onClick={() => {
                        setSeniorCount(maxSenior)
                      }}
                    >
                      {t('Max')}
                    </DrawBlindBoxTextBtn>
                  </ActionLeft>
                </ActionWrap>
                <DrawBlindBoxPrimaryBtn
                  className="orangeBtn"
                  onClick={async () => {
                    const allowance = await AIDFS.allowance(account, socialNFT.address)
                    if (allowance.eq(0)) {
                      const receipt = await AIDFS.approve(socialNFT.address, MaxUint256)
                      await receipt.wait()
                    }
                    mint('senior', false)
                  }}
                >
                  {t('Balance Mint')}
                </DrawBlindBoxPrimaryBtn>
                <DrawBlindBoxPrimaryBtn
                  className="orangeBtn"
                  onClick={() => {
                    mint('senior', true)
                  }}
                  style={{ marginTop: '20px' }}
                >
                  {t('Unsed Mint')}
                </DrawBlindBoxPrimaryBtn>
              </ContentWrap>
            </DrawBlindBoxItem>
          </Grid>
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <DrawBlindBoxItem className="item2">
              <DrawBlindBoxImgWrap className="item2">
                <BoxLeftAskImg src="/images/mint/purpleLeftAsk.png" />
                <BoxRightAskImg src="/images/mint/purpleRightAsk.png" />
              </DrawBlindBoxImgWrap>
              <ContentWrap>
                <DalaCardList>
                  <DalaCardListTitle>{t('Basic Mint')}</DalaCardListTitle>
                  <DataCell
                    label={t('Price')}
                    value={`${formatBigNumber(ordinaryPrice, 2)} AIDFS`}
                    valueDivStyle={{ fontSize: '14px' }}
                    position="horizontal"
                  />
                  {/* <DataCell
                    label={t('Description')}
                    value={t('Acquire any of the 2 types of NFT cards')}
                    valueDivStyle={{ fontSize: '14px', textAlign: 'right' }}
                    position="horizontal"
                  /> */}
                  <DalaCardCellWrap>
                    <DalaCardLabelDiv>{t('Probability')}</DalaCardLabelDiv>
                    <DalaCardValueDiv>
                      <ColorFont style={{ color: '#EC6EFF' }}> 95% </ColorFont>
                      {t('Fragment')}
                      {isMobile ? <br /> : null}
                      <ColorFont style={{ color: '#EC6EFF' }}> 5% </ColorFont>
                      {t('Wiseman')}
                    </DalaCardValueDiv>
                  </DalaCardCellWrap>
                </DalaCardList>
                <CountWrap>
                  <AvailableCount>
                    {t('Balance')}: {balance ? formatBigNumber(balance, 2) : 0} AIDFS
                  </AvailableCount>
                  <UnWithdrawCount>
                    {t('Unused')}: {formatBigNumber(bondUnused, 2)} AIDFS
                  </UnWithdrawCount>
                </CountWrap>
                <ActionWrap>
                  <ActionLeft>
                    <DrawBlindBoxTextBtn
                      className="purpleBtn"
                      onClick={() => {
                        if (ordinaryCount > 1) setOrdinaryCount(ordinaryCount - 1)
                      }}
                    >
                      -
                    </DrawBlindBoxTextBtn>
                    <CountInput
                      value={ordinaryCount}
                      ismobile={isMobile.toString()}
                      min={1}
                      controls={false}
                      onChange={(val) => setOrdinaryCount(Number(val))}
                    />
                    <DrawBlindBoxTextBtn
                      className="purpleBtn"
                      onClick={() => {
                        if (maxOrdinary > 1 && ordinaryCount < maxOrdinary) setOrdinaryCount(ordinaryCount + 1)
                      }}
                    >
                      +
                    </DrawBlindBoxTextBtn>
                    <DrawBlindBoxTextBtn
                      className="purpleBtn"
                      onClick={() => {
                        setOrdinaryCount(maxOrdinary)
                      }}
                    >
                      {t('Max')}
                    </DrawBlindBoxTextBtn>
                  </ActionLeft>
                </ActionWrap>
                <DrawBlindBoxPrimaryBtn
                  className="purpleBtn"
                  onClick={async () => {
                    const allowance = await AIDFS.allowance(account, socialNFT.address)
                    if (allowance.eq(0)) {
                      const receipt = await AIDFS.approve(socialNFT.address, MaxUint256)
                      await receipt.wait()
                    }
                    mint('ordinary', false)
                  }}
                >
                  {t('Balance Mint')}
                </DrawBlindBoxPrimaryBtn>
                <DrawBlindBoxPrimaryBtn
                  className="purpleBtn"
                  onClick={async () => {
                    mint('ordinary', true)
                  }}
                  style={{ marginTop: '20px' }}
                >
                  {t('Unsed Mint')}
                </DrawBlindBoxPrimaryBtn>
              </ContentWrap>
            </DrawBlindBoxItem>
          </Grid>
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <DrawBlindBoxItem className="item3">
              <DrawBlindBoxImgWrap className="item3">
                <BoxLeftAskImg src="/images/mint/5dfs-left.png" />
                <BoxRightAskImg src="/images/mint/5dfs-right.png" />
              </DrawBlindBoxImgWrap>
              <ContentWrap>
                <DalaCardList>
                  <DalaCardListTitle>{t('Experience Mint')}</DalaCardListTitle>
                  <DataCell
                    label={t('Price')}
                    value={`${formatBigNumber(tryCost, 2)} AIDFS`}
                    valueDivStyle={{ fontSize: '14px' }}
                    position="horizontal"
                  />
                  <DalaCardCellWrap>
                    <DalaCardLabelDiv>{t('Probability')}</DalaCardLabelDiv>
                    <DalaCardValueDiv>
                      <ColorFont style={{ color: '#11CA66' }}> 100% </ColorFont>
                      {t('Scholar')}
                      {isMobile ? <br /> : null}
                    </DalaCardValueDiv>
                  </DalaCardCellWrap>
                </DalaCardList>
                <CountWrap>
                  <AvailableCount>
                    {t('Balance')}: {balance ? formatBigNumber(balance, 2) : 0} AIDFS
                  </AvailableCount>
                  <UnWithdrawCount>
                    {t('Unused')}: {formatBigNumber(bondUnused, 2)} AIDFS
                  </UnWithdrawCount>
                </CountWrap>
                <ActionWrap>
                  <ActionLeft>
                    <DrawBlindBoxTextBtn
                      className="greenBtn"
                      onClick={() => {
                        if (tryCount > 1) setTryCount(tryCount - 1)
                      }}
                    >
                      -
                    </DrawBlindBoxTextBtn>
                    <CountInput
                      value={tryCount}
                      ismobile={isMobile.toString()}
                      min={1}
                      controls={false}
                      onChange={(val) => setTryCount(Number(val))}
                    />
                    <DrawBlindBoxTextBtn
                      className="greenBtn"
                      onClick={() => {
                        if (maxTry > 1 && tryCount < maxTry) setTryCount(tryCount + 1)
                      }}
                    >
                      +
                    </DrawBlindBoxTextBtn>
                    <DrawBlindBoxTextBtn
                      className="greenBtn"
                      onClick={() => {
                        setTryCount(maxTry)
                      }}
                    >
                      {t('Max')}
                    </DrawBlindBoxTextBtn>
                  </ActionLeft>
                </ActionWrap>
                <DrawBlindBoxPrimaryBtn
                  className="greenBtn"
                  onClick={async () => {
                    const allowance = await AIDFS.allowance(account, socialNFT.address)
                    if (allowance.eq(0)) {
                      const receipt = await AIDFS.approve(socialNFT.address, MaxUint256)
                      await receipt.wait()
                    }
                    mint('try', false)
                  }}
                >
                  {t('Balance Mint')}
                </DrawBlindBoxPrimaryBtn>
                <DrawBlindBoxPrimaryBtn
                  className="greenBtn"
                  onClick={async () => {
                    mint('try', true)
                  }}
                  style={{ marginTop: '20px' }}
                >
                  {t('Unsed Mint')}
                </DrawBlindBoxPrimaryBtn>
              </ContentWrap>
            </DrawBlindBoxItem>
          </Grid>
        </Grid>
      </DrawBlindBoxList>
      {playMintBoxModalVisible ? <PlayBindBoxModal onClose={closePlayBindBoxModal} gifUrl={gifUrl} /> : null}
      {mintBoxModalVisible ? <MintBoxModal data={mintNFTData} onClose={closeBlindBoxModal} /> : null}
      {InsufficientBalanceVisible ? <InsufficientBalance onClose={closeJumpModal} /> : null}
    </BondPageWrap>
  )
}
export default Mint
