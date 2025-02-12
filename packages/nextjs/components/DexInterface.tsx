"use client";

import useSwap from "./hooks/useSwaps";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { ArrowDownUp, ArrowRight } from "lucide-react";
import { TOKENS } from "~~/utils/constants";

export default function DEXInterface() {
  const {
    tokenA,
    tokenB,
    setTokenA,
    setTokenB,
    amountA,
    amountB,
    setAmountA,
    setAmountB,
    isSwapping,
    swapError,
    handleSwap,
    isLoading,
  } = useSwap();

  return (
    <Card className="w-full  mx-auto ">
      <CardHeader>
        <CardTitle>Swap Tokens</CardTitle>
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
                    {token.symbol}
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
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const temp = tokenA;
                setTokenA(tokenB);
                setTokenB(temp);
              }}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={tokenB} onValueChange={value => setTokenB(TOKENS.find(t => t.symbol === value)!.symbol)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-base-100 rounded-box">
                {TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="0.0" value={amountB} readOnly className="flex-grow" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" onClick={handleSwap} disabled={isSwapping || isLoading || !amountA || !amountB}>
          {isSwapping ? (
            <>
              Swapping... <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
            </>
          ) : isLoading ? (
            "Loading..."
          ) : (
            "Swap"
          )}
        </Button>
        {swapError && <p className="text-sm text-red-500">{swapError.message}</p>}
      </CardFooter>
    </Card>
  );
}
