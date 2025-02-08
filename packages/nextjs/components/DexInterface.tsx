"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { ArrowDownUp, ArrowRight } from "lucide-react";

// Placeholder for token list - in a real app, this would come from an API or blockchain
const tokens = [
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "WBTC", name: "Wrapped Bitcoin" },
  { symbol: "DAI", name: "Dai Stablecoin" },
];

export default function DEXInterface() {
  const [tokenA, setTokenA] = useState(tokens[0]);
  const [tokenB, setTokenB] = useState(tokens[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  // Placeholder function for price calculation
  const calculatePrice = (amount: string, tokenA: (typeof tokens)[0], tokenB: (typeof tokens)[0]) => {
    // In a real app, this would call a smart contract or API
    return Number.parseFloat(amount) * 1.5; // Dummy calculation
  };

  useEffect(() => {
    if (amountA) {
      const calculatedB = calculatePrice(amountA, tokenA, tokenB);
      setAmountB(calculatedB.toFixed(6));
    }
  }, [amountA, tokenA, tokenB, calculatePrice]); // Added calculatePrice to dependencies

  const handleSwap = async () => {
    setIsSwapping(true);
    // In a real app, this would call a smart contract function
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating blockchain delay
    setIsSwapping(false);
    // Reset amounts after swap
    setAmountA("");
    setAmountB("");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Swap Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select value={tokenA.symbol} onValueChange={value => setTokenA(tokens.find(t => t.symbol === value)!)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
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
            <Select value={tokenB.symbol} onValueChange={value => setTokenB(tokens.find(t => t.symbol === value)!)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="0.0" value={amountB} readOnly className="flex-grow" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSwap} disabled={isSwapping || !amountA}>
          {isSwapping ? (
            <>
              Swapping... <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
            </>
          ) : (
            "Swap"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
