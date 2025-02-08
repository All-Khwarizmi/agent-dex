"use client";

import { useEffect, useState } from "react";
import { useGetPairAddress } from "./hooks/useGetPairAddress";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { zeroAddress } from "viem";
import { TOKENS } from "~~/utils/constants";

function getTokenAddr(tokenSymbol: string) {
  return TOKENS.find(token => token.symbol === tokenSymbol)?.address || "";
}
export default function CreatePool() {
  const [tokenA, setTokenA] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[0].symbol);
  const [tokenB, setTokenB] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[1].symbol);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: { pairAddr, isLoading: isLoadingPairCount },
    functions: { setTokenAddresses },
  } = useGetPairAddress();

  const handleCreatePool = async () => {
    setIsCreating(true);

    setIsCreating(false);
    // Reset form after pool creation
    setAmountA("");
    setAmountB("");
  };

  useEffect(() => {
    setTokenAddresses([getTokenAddr(tokenA), getTokenAddr(tokenB)]);
  }, [tokenA, tokenB, setTokenAddresses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Liquidity Pool</CardTitle>
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-center">
        <Button
          className="w-full"
          onClick={handleCreatePool}
          disabled={isCreating || !amountA || !amountB || !pairAddr || pairAddr !== zeroAddress}
        >
          {isCreating || isLoadingPairCount ? "Creating..." : "Create Pool"}
        </Button>

        {pairAddr && pairAddr !== zeroAddress && <p className="text-sm text-green-500">Pair Already Created</p>}
      </CardFooter>
    </Card>
  );
}
