"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Button } from "./ui/button";

const tokens = [
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "WBTC", name: "Wrapped Bitcoin" },
  { symbol: "DAI", name: "Dai Stablecoin" },
];

export default function CreatePool() {
  const [tokenA, setTokenA] = useState(tokens[0]);
  const [tokenB, setTokenB] = useState(tokens[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePool = async () => {
    setIsCreating(true);
    // In a real app, this would call a smart contract function to create the pool
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating blockchain delay
    setIsCreating(false);
    // Reset form after pool creation
    setAmountA("");
    setAmountB("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Liquidity Pool</CardTitle>
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
      <CardFooter>
        <Button className="w-full" onClick={handleCreatePool} disabled={isCreating || !amountA || !amountB}>
          {isCreating ? "Creating Pool..." : "Create Pool"}
        </Button>
      </CardFooter>
    </Card>
  );
}
