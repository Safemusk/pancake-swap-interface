import React, { useMemo } from 'react'
import { Card, CardHeader, CardBody, Text } from '@pancakeswap-libs/uikit'
import { Pair } from '@pancakeswap-libs/sdk'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { StyledInternalLink } from 'components/Shared'
import { useActiveWeb3React } from 'hooks'
import { usePairs } from 'data/Reserves'
import FullPositionCard from 'components/PositionCard'

const SecondCard = () => {
  const { account } = useActiveWeb3React()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  return (
    <Card>
      <CardHeader>
        <Text bold>Remove Liquidity</Text>
        <Text small color="textSubtle">
          Unstake your legacy LP tokens from the liquidity pools
        </Text>
      </CardHeader>
      <CardBody>
        <Text bold>V1 LP Tokens in wallet</Text>
        <Card>
          {v2IsLoading ? (
            <CardBody>Loading</CardBody>
          ) : (
            <CardBody>
              {allV2PairsWithLiquidity?.length > 0 ? (
                <>
                  {allV2PairsWithLiquidity.map((v2Pair) => (
                    <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                  ))}
                </>
              ) : (
                <Text color="textDisabled" textAlign="center">
                  No liquidity found.
                </Text>
              )}
              <Text>
                Don&apos;t see a pool you joined?{' '}
                <StyledInternalLink id="import-pool-link" to="/find">
                  Import it
                </StyledInternalLink>
              </Text>
            </CardBody>
          )}
        </Card>
      </CardBody>
    </Card>
  )
}

export default SecondCard
