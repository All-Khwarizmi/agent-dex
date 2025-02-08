"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const pools = [
  { id: "1", name: "ETH/USDC" },
  { id: "2", name: "WBTC/USDC" },
  { id: "3", name: "ETH/DAI" },
];

const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export default function ManageLiquidity() {
  const [selectedPool, setSelectedPool] = useState(pools[0]);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // const {
  //   writeContract,
  //   isPending: isLoadingContract,
  //   isError: isErrorContract,
  // } = useScaffoldWriteContract({
  //   contractName: "Pair",
  // });

  const { data: pairAddr, isLoading: isLoadingPairCount } = useScaffoldReadContract({
    contractName: "Factory",
    functionName: "getPair",
    args: [usdc, weth],
  });

  const handleAddLiquidity = async () => {
    setIsProcessing(true);
    // const tx = writeContract({ functionName: "addLiquidity", args: [BigInt(amount), BigInt(amount)] });
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

  console.log(pairAddr);

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
            <SelectContent className="bg-base-100 rounded-box">
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
