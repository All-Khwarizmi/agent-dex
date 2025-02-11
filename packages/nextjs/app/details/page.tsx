"use client";

import { useState } from "react";
import { ProvidersDetailedTable } from "./components/ProvidersDetailedTable";
import { UsersDetailedTable } from "./components/UsersDetailesdTable";
import { useDetailedData } from "~~/components/hooks/useDetailedData";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/Tabs";

export default function DetailsPage() {
  const { users, liquidityProviders, isLoading } = useDetailedData();
  const [activeTab, setActiveTab] = useState<"users" | "providers">("users");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Detailed Information</h1>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as "users" | "providers")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="providers">Liquidity Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Detailed User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersDetailedTable users={users || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Liquidity Provider Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProvidersDetailedTable providers={liquidityProviders || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
