"use client";

import { PoolsTable } from "~~/components/PoolsTable";
import { ProvidersTable } from "~~/components/ProvidersTable";
import { StatsGrid } from "~~/components/StatsGrid";
import { UsersTable } from "~~/components/UsersTable";
import { usePoolsData } from "~~/components/hooks/usePoolsData";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/Tabs";
import { getSymbolFromAddress } from "~~/utils/tokens";

export default function ExplorerPage() {
  const { pools, users, liquidityProviders, isLoading } = usePoolsData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4  pt-12 space-y-8">
      <h1 className="text-3xl font-bold">Pools</h1>

      <StatsGrid
        poolsCount={pools?.length ?? 0}
        totalSwaps={pools?.reduce((acc, pool) => acc + Number(pool.swaps), 0) ?? 0}
        usersCount={users?.length ?? 0}
        providersCount={liquidityProviders?.length ?? 0}
      />

      <Tabs defaultValue="pools" className="w-full space-y-2 flex flex-col">
        <div>
          <TabsList className="md:grid flex flex-col size-full grid-cols-4 gap-2">
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="providers">Liquidity Providers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pools" className="shadow-md shadow-secondary rounded-lg">
          <Card>
            <CardHeader>
              <CardTitle>Active Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <PoolsTable pools={pools ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="shadow-md shadow-secondary rounded-lg">
          <Card>
            <CardHeader>
              <CardTitle>Available Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 overflow-x-auto">
                {Array.from(new Set([...(pools?.map(p => p.token0) ?? []), ...(pools?.map(p => p.token1) ?? [])])).map(
                  token => (
                    <div key={token} className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                      <span>{getSymbolFromAddress(token)}</span>
                      <span className="text-sm text-muted-foreground">
                        {pools?.filter(p => p.token0 === token || p.token1 === token).length} pools
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="shadow-md shadow-secondary rounded-lg">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable users={users ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="shadow-md shadow-secondary rounded-lg">
          <Card>
            <CardHeader>
              <CardTitle>Liquidity Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <ProvidersTable providers={liquidityProviders ?? []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
