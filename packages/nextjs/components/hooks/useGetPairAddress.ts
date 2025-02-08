import { useState } from "react";
import { useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { FACTORY_CONTRACT_NAME } from "~~/utils/constants";

export function useGetPairAddress() {
  const [addresses, setAddresses] = useState<[string, string]>(["", ""]);
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo({
    contractName: FACTORY_CONTRACT_NAME,
  });

  const { data: pairAddr, isLoading: isLoadingPairCount } = useReadContract({
    abi: [
      {
        type: "function",
        name: "getPair",
        inputs: [
          {
            name: "",
            type: "address",
            internalType: "address",
          },
          {
            name: "",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [
          {
            name: "",
            type: "address",
            internalType: "address",
          },
        ],
        stateMutability: "view",
      },
    ],
    address: deployedContractData?.address,
    functionName: "getPair",
    args: [addresses[0], addresses[1]],
    query: {
      enabled: addresses.every(address => address !== "") && deployedContractData !== undefined,
    },
  });

  console.log({
    addresses,
    factoryAddr: deployedContractData?.address,
    pairAddr,
    enabled: addresses.every(address => address !== "") && deployedContractData !== undefined,
  });

  return {
    data: { pairAddr, isLoading: deployedContractLoading && isLoadingPairCount },
    functions: { setTokenAddresses: setAddresses },
  };
}
