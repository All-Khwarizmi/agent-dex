"use client";

import { useEffect, useState } from "react";
import useManageLiquidity from "./hooks/useManageLiquidity";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { LoaderIcon } from "react-hot-toast";
import { zeroAddress } from "viem";
import { TOKENS } from "~~/utils/constants";

function getTokenAddr(tokenSymbol: string) {
  return TOKENS.find(token => token.symbol === tokenSymbol)?.address || "";
}

export default function ManageLiquidity() {
  const [tokenA, setTokenA] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[0].symbol);
  const [tokenB, setTokenB] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[1].symbol);

  const {
    data: {
      pairAddr,
      poolBalance,
      userLiquidity,
      isLoading: isLoadingPoolLiquidity,
      amountA,
      amountB,
      liquidityToRemove,
      isLoadingContract,
      writeContractError,
      balanceTokenA,
      balanceTokenB,
    },
    functions: {
      setTokenAddresses,
      setAmountA,
      setAmountB,
      setLiquidityToRemove,
      handleAddLiquidity,
      handleRemoveLiquidity,
    },
  } = useManageLiquidity();

  useEffect(() => {
    setTokenAddresses([getTokenAddr(tokenA), getTokenAddr(tokenB)]);
  }, [tokenA, tokenB, setTokenAddresses]);

  const isPairInitialized = pairAddr && pairAddr !== zeroAddress;
  const hasUserLiquidity = userLiquidity && BigInt(userLiquidity as string) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Liquidity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select value={tokenA} onValueChange={value => setTokenA(TOKENS.find(t => t.symbol === value)!.symbol)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-base-100 rounded-box">
                {TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={e => setAmountA(e.target.value)}
              className="flex-grow"
            />
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className="text-sm text-green-500">
              {balanceTokenA?.toLocaleString() || "0"} {tokenA}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={tokenB} onValueChange={value => setTokenB(TOKENS.find(t => t.symbol === value)!.symbol)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-base-100 rounded-box">
                {TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={amountB}
              onChange={e => setAmountB(e.target.value)}
              className="flex-grow"
            />
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className="text-sm text-green-500">
              {balanceTokenB?.toLocaleString() || "0"} {tokenB}
            </span>
          </div>
          <div>
            {isLoadingPoolLiquidity ? (
              <p className="text-sm text-gray-500 mb-2">Loading pool information...</p>
            ) : isPairInitialized ? (
              <>
                <p className="text-sm text-gray-500 mb-2">Pool Balance: {poolBalance?.toLocaleString() || "0"}</p>
                <p className="text-sm text-gray-500 mb-2">Your Liquidity: {userLiquidity?.toLocaleString() || "0"}</p>
              </>
            ) : (
              <p className="text-sm text-yellow-500 mb-2">This pool has not been initialized yet.</p>
            )}
          </div>
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-2">
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove" disabled={!hasUserLiquidity}>
                Remove Liquidity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="add">
              <Button
                className="w-full"
                onClick={handleAddLiquidity}
                disabled={isLoadingContract || !amountA || !amountB || !isPairInitialized}
              >
                {isLoadingContract ? "Processing..." : isPairInitialized ? "Add Liquidity" : "Initialize Pool"}
              </Button>
            </TabsContent>
            <TabsContent value="remove">
              <Input
                type="number"
                placeholder="Amount of liquidity to remove"
                value={liquidityToRemove}
                onChange={e => setLiquidityToRemove(e.target.value)}
                className="mb-2"
              />
              <Button
                className="w-full"
                onClick={handleRemoveLiquidity}
                disabled={isLoadingContract || !liquidityToRemove || !hasUserLiquidity}
              >
                {isLoadingContract ? "Processing..." : "Remove Liquidity"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-center">
        {isPairInitialized && <p className="text-sm text-green-500">Pair Exists</p>}
        {isLoadingContract && (
          <p className="text-sm text-green-500">
            <LoaderIcon className="animate-spin" />
          </p>
        )}
        {writeContractError && (
          <div className="text-sm text-red-500 w-full overflow-scroll">
            <p>{writeContractError.message}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
