import {
  Box,
  Button,
  Flex,
  InjectedModalProps,
  LinkExternal,
  Message,
  Skeleton,
  Text,
  CopyAddress,
  useToast,
} from '@pancakeswap/uikit'
import { ChainId } from '@pancakeswap/sdk'
import { FetchStatus } from 'config/constants/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useTranslation } from '@pancakeswap/localization'
import useAuth from 'hooks/useAuth'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useGetDfsBalance } from 'hooks/useTokenBalance'
import { ChainLogo } from 'components/Logo/ChainLogo'

import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { formatBigNumber } from '@pancakeswap/utils/formatBalance'
import { useBalance } from 'wagmi'
import { useShareHolderContract } from 'hooks/useContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useSWR from 'swr'
import { BondListItemBtn } from 'views/Bond/style'

const COLORS = {
  ETH: '#627EEA',
  BNB: '#14151A',
}

interface WalletInfoProps {
  hasLowNativeBalance: boolean
  switchView: (newIndex: number) => void
  onDismiss: InjectedModalProps['onDismiss']
}


const WalletInfo: React.FC<WalletInfoProps> = ({ hasLowNativeBalance, onDismiss }) => {
  const { t } = useTranslation()
  const { account, chainId, chain } = useActiveWeb3React()
  const isBSC = chainId === ChainId.BSC
  const bnbBalance = useBalance({ addressOrName: account, chainId })
  const nativeBalance = useBalance({ addressOrName: account, enabled: !isBSC })
  const native = useNativeCurrency()
  const { balance: cakeBalance, fetchStatus: cakeFetchStatus } = useGetDfsBalance()
  const { logout } = useAuth()
  const { toastError, toastSuccess } = useToast()
  const [assets, setAssets] = useState<BigNumber>(BigNumber.from(0))
  const [claimable, setClaimable] = useState<BigNumber>(BigNumber.from(0))
  const [claimed, setClaimed] = useState<BigNumber>(BigNumber.from(0))
  const [isShareHolder, setIsShareHolder] = useState(false)
  const [refresh, setRefresh] = useState(false)

  const shareholder = useShareHolderContract()
  const getShareHolders = useCallback(async () => {
    if (account) {
      const holderAssets = await shareholder.holderAssets(account)
      if (holderAssets) {
        setAssets(holderAssets.assets)
        setClaimable(holderAssets.claimable)
        setClaimed(holderAssets.claimed)
      }
      setIsShareHolder(await shareholder.isShareHolder(account))
    }
  }, [account])

  useEffect(() => { getShareHolders() }, [account, refresh,shareholder])


  const handleLogout = () => {
    onDismiss?.()
    logout()
  }

  return (
    <>
      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
        {t('Your Address')}
      </Text>
      <CopyAddress tooltipMessage={t('Copied')} account={account} mb="24px" />
      {hasLowNativeBalance && (
        <Message variant="warning" mb="24px">
          <Box>
            <Text fontWeight="bold">
              {t('%currency% Balance Low', {
                currency: native.symbol,
              })}
            </Text>
            <Text as="p">
              {t('You need %currency% for transaction fees.', {
                currency: native.symbol,
              })}
            </Text>
          </Box>
        </Message>
      )}
      {!isBSC && chain && (
        <Box mb="12px">
          <Flex justifyContent="space-between" alignItems="center" mb="8px">
            <Flex bg={COLORS.ETH} borderRadius="16px" pl="4px" pr="8px" py="2px">
              <ChainLogo chainId={chain.id} />
              <Text color="white" ml="4px">
                {chain.name}
              </Text>
            </Flex>
            <LinkExternal href={getBlockExploreLink(account, 'address', chainId)}>
              {getBlockExploreName(chainId)}
            </LinkExternal>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Text color="textSubtle">
              {native.symbol} {t('Balance')}
            </Text>
            {!nativeBalance.isFetched ? (
              <Skeleton height="22px" width="60px" />
            ) : (
              <Text>{formatBigNumber(nativeBalance.data.value, 6)}</Text>
            )}
          </Flex>
        </Box>
      )}
      <Box mb="24px">
        <Flex justifyContent="space-between" alignItems="center" mb="8px">
          <Flex bg={COLORS.BNB} borderRadius="16px" pl="4px" pr="8px" py="2px">
            <ChainLogo chainId={ChainId.BSC} />
            <Text color="white" ml="4px">
              BNB Chain
            </Text>
          </Flex>
          <LinkExternal href={getBlockExploreLink(account, 'address', ChainId.BSC)}>
            {getBlockExploreName(ChainId.BSC)}
          </LinkExternal>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between">
          <Text color="textSubtle">BNB {t('Balance')}</Text>
          {!bnbBalance.isFetched ? (
            <Skeleton height="22px" width="60px" />
          ) : (
            <Text>{formatBigNumber(bnbBalance.data.value, 6)}</Text>
          )}
        </Flex>

      </Box>
      {isShareHolder &&
        <Box mb="24px">
          <Flex justifyContent="space-between" alignItems="center" mb="8px">
            <Flex bg={COLORS.BNB} borderRadius="16px" pl="4px" pr="8px" py="2px">
              <Text color="white" ml="4px">
                {t("Shareholder Assets")}
              </Text>
            </Flex>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Text>{`${t("Total Assets")}: ${formatBigNumber(assets, 6)}`}</Text>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Text>{`${t("Claimable Assets")}: ${formatBigNumber(claimable, 6)}`}</Text>
            <BondListItemBtn style={{ width: "30%" }} onClick={async () => {
              try {
                const receipt = await shareholder.claim()
                await receipt.wait()
                toastSuccess(t("Claim Successful"))
                setRefresh(true)
              } catch (error: any) {
                toastError(t(error.reason ?? error.data?.message ?? error.message))
              }
            }}>{t('Claim')}</BondListItemBtn>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Text>{`${t("Claimed Assets")}: ${formatBigNumber(claimed, 6)}`}</Text>
          </Flex>
        </Box>}
      <Button variant="secondary" width="100%" onClick={handleLogout}>
        {t('Disconnect Wallet')}
      </Button>
    </>
  )
}

export default WalletInfo
