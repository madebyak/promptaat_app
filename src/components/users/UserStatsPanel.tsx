import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface UserStats {
  total: number;
  proUsers: number;
  freeUsers: number;
  verifiedUsers: number;
  countriesDistribution: { [key: string]: number };
  recentSignups: {
    date: string;
    count: number;
  }[];
}

interface UserStatsPanelProps {
  stats: UserStats | null;
  loading: boolean;
}

export function UserStatsPanel({ stats, loading }: UserStatsPanelProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  // Calculate percentages
  const proPercentage = ((stats.proUsers / stats.total) * 100).toFixed(1);
  const verifiedPercentage = ((stats.verifiedUsers / stats.total) * 100).toFixed(1);

  // Get top 3 countries
  const topCountries = Object.entries(stats.countriesDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Calculate growth rate
  const growthRate = stats.recentSignups.length > 1
    ? ((stats.recentSignups[stats.recentSignups.length - 1].count - 
        stats.recentSignups[0].count) / 
        stats.recentSignups[0].count * 100).toFixed(1)
    : '0';

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {growthRate}% growth in last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.proUsers}</div>
          <p className="text-xs text-muted-foreground">
            {proPercentage}% of total users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
          <p className="text-xs text-muted-foreground">
            {verifiedPercentage}% of total users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topCountries.map(([country, count]) => (
              <div key={country} className="flex justify-between text-sm">
                <span>{country}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
