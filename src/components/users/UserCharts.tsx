import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

interface UserChartsProps {
  stats: UserStats | null;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function UserCharts({ stats, loading }: UserChartsProps) {
  if (loading || !stats) {
    return null;
  }

  // Prepare data for membership distribution pie chart
  const membershipData = [
    { name: 'Pro Users', value: stats.proUsers },
    { name: 'Free Users', value: stats.freeUsers }
  ];

  // Prepare data for top countries pie chart
  const countriesData = Object.entries(stats.countriesDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({
      name: country,
      value: count
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* User Growth Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.recentSignups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: number) => [value, 'New Users']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Membership Distribution Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Membership Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={membershipData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {membershipData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Countries Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countriesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {countriesData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
