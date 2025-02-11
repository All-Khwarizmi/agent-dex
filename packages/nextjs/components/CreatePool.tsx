"use client";

import { useEffect, useState } from "react";
import { useGetPairAddress } from "./hooks/useGetPairAddress";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { LoaderIcon } from "react-hot-toast";
import { zeroAddress } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { TOKENS } from "~~/utils/constants";

function getTokenAddr(tokenSymbol: string) {
  return TOKENS.find(token => token.symbol === tokenSymbol)?.address || "";
}
export default function CreatePool() {
  const [tokenA, setTokenA] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[0].symbol);
  const [tokenB, setTokenB] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[1].symbol);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const {
    data: { pairAddr, isLoading: isLoadingPairCount },
    functions: { setTokenAddresses },
  } = useGetPairAddress();

  const {
    writeContract,
    isPending: isLoadingContract,
    error: writeContractError,
  } = useScaffoldWriteContract({
    contractName: "Factory",
  });

  const handleCreatePool = async () => {
    writeContract({ functionName: "createPair", args: [getTokenAddr(tokenA), getTokenAddr(tokenB)] });

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
        <div className=" gap-4 flex flex-col md:flex-row items-center justify-center">
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
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-center">
        <Button
          className="w-full"
          onClick={handleCreatePool}
          disabled={isLoadingContract || (pairAddr !== undefined && pairAddr !== zeroAddress)}
        >
          {isLoadingContract || isLoadingPairCount ? "Creating..." : "Create Pool"}
        </Button>

        {pairAddr && pairAddr !== zeroAddress && <p className="text-sm text-green-500">Pair Already Created</p>}
        {isLoadingContract && (
          <p className="text-sm text-green-500">
            <LoaderIcon className="animate-spin " />
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
