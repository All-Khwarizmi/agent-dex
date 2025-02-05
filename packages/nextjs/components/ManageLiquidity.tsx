"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { Button } from "./ui/button";

const pools = [
  { id: "1", name: "ETH/USDC" },
  { id: "2", name: "WBTC/USDC" },
  { id: "3", name: "ETH/DAI" },
];

export default function ManageLiquidity() {
  const [selectedPool, setSelectedPool] = useState(pools[0]);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddLiquidity = async () => {
    setIsProcessing(true);
    // In a real app, this would call a smart contract function to add liquidity
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating blockchain delay
    setIsProcessing(false);
    setAmount("");
  };

  const handleRemoveLiquidity = async () => {
    setIsProcessing(true);
    // In a real app, this would call a smart contract function to remove liquidity
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating blockchain delay
    setIsProcessing(false);
    setAmount("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Liquidity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedPool.id} onValueChange={value => setSelectedPool(pools.find(p => p.id === value)!)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pool" />
            </SelectTrigger>
            <SelectContent>
              {pools.map(pool => (
                <SelectItem key={pool.id} value={pool.id}>
                  {pool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <p className="text-sm text-gray-500 mb-2">Pool Balance: 1000 LP Tokens</p>
            <p className="text-sm text-gray-500 mb-2">Collected Fees: 10 USDC</p>
          </div>
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
            </TabsList>
            <TabsContent value="add">
              <Button className="w-full" onClick={handleAddLiquidity} disabled={isProcessing || !amount}>
                {isProcessing ? "Processing..." : "Add Liquidity"}
              </Button>
            </TabsContent>
            <TabsContent value="remove">
              <Button className="w-full" onClick={handleRemoveLiquidity} disabled={isProcessing || !amount}>
                {isProcessing ? "Processing..." : "Remove Liquidity"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
