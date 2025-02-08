"use client";

import { NextPage } from "next";
import CreatePool from "~~/components/CreatePool";
import DEXInterface from "~~/components/DexInterface";
import LLMChat from "~~/components/LLMChat";
import ManageLiquidity from "~~/components/ManageLiquidity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/Tabs";

const Home: NextPage = () => {
  return (
    <section className="flex flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Agent DEX</h1>
      <Tabs defaultValue="swap" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="create-pool">Create Pool</TabsTrigger>
          <TabsTrigger value="manage-liquidity">Manage Liquidity</TabsTrigger>
          <TabsTrigger value="llm-chat">AI Assistant</TabsTrigger>
        </TabsList>
        <TabsContent value="swap">
          <DEXInterface />
        </TabsContent>
        <TabsContent value="create-pool">
          <CreatePool />
        </TabsContent>
        <TabsContent value="manage-liquidity">
          <ManageLiquidity />
        </TabsContent>
        <TabsContent value="llm-chat">
          <LLMChat />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default Home;
