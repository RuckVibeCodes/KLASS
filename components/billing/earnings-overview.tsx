"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
} from "lucide-react";

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  previousMonthEarnings: number;
  totalMembers: number;
  paidMembers: number;
  platformFeePercent: number;
  recentTransactions: {
    id: string;
    amount: number;
    platformFee: number;
    netAmount: number;
    status: string;
    date: string;
    description?: string;
  }[];
  pendingPayouts: number;
}

interface EarningsOverviewProps {
  communityId: string;
  communitySlug: string;
  connectAccount: {
    stripe_account_id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    platform_fee_percent: number;
    total_earnings_cents?: number;
  } | null;
}

export function EarningsOverview({
  communityId,
  communitySlug,
  connectAccount,
}: EarningsOverviewProps) {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connectAccount?.charges_enabled) {
      setLoading(false);
      return;
    }

    async function fetchEarnings() {
      try {
        const res = await fetch(
          `/api/stripe/connect/earnings?communityId=${communityId}`
        );
        if (res.ok) {
          const data = await res.json();
          setEarnings(data);
        }
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, [communityId, connectAccount]);

  if (!connectAccount?.charges_enabled) {
    return null;
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const monthlyGrowth =
    earnings && earnings.previousMonthEarnings > 0
      ? (
          ((earnings.monthlyEarnings - earnings.previousMonthEarnings) /
            earnings.previousMonthEarnings) *
          100
        ).toFixed(1)
      : null;

  const isGrowthPositive =
    monthlyGrowth !== null && parseFloat(monthlyGrowth) >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : formatCurrency(
                        earnings?.totalEarnings ||
                          connectAccount?.total_earnings_cents ||
                          0
                      )}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : formatCurrency(earnings?.monthlyEarnings || 0)}
                </p>
                {monthlyGrowth && (
                  <div className="flex items-center gap-1 mt-1">
                    {isGrowthPositive ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs ${
                        isGrowthPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {monthlyGrowth}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Members</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : earnings?.paidMembers || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {earnings?.totalMembers || 0} total
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Fee</p>
                <p className="text-2xl font-bold">
                  {connectAccount.platform_fee_percent}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You keep{" "}
                  {100 - connectAccount.platform_fee_percent}%
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Your latest payment activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading transactions...
            </p>
          ) : !earnings?.recentTransactions?.length ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Payments from your community members will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {tx.description || "Member payment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(tx.netAmount)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          tx.status === "succeeded"
                            ? "default"
                            : tx.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                      {tx.platformFee > 0 && (
                        <span className="text-xs text-muted-foreground">
                          -{formatCurrency(tx.platformFee)} fee
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
