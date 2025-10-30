'use client';

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface AnalyticsChartsProps {
  monthlyPerformance: any[];
  metrics: any;
  brokerDistribution: any[];
  savingsAnalysis: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsCharts({ 
  monthlyPerformance, 
  metrics, 
  brokerDistribution, 
  savingsAnalysis 
}: AnalyticsChartsProps) {
  
  // Calculate trend
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return { trend: 'stable', percentage: 0 };
    const recent = data.slice(-3).reduce((sum, item) => sum + item[key], 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + item[key], 0) / 3;
    const percentage = ((recent - previous) / previous) * 100;
    return {
      trend: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable',
      percentage: Math.abs(percentage)
    };
  };

  const savingsTrend = calculateTrend(monthlyPerformance, 'savings');
  const volumeTrend = calculateTrend(monthlyPerformance, 'volume');

  return (
    <div className="space-y-6">
      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Savings Trend</p>
                <p className="text-lg font-bold text-slate-900">
                  {savingsTrend.trend === 'up' ? '+' : '-'}{savingsTrend.percentage.toFixed(1)}%
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                savingsTrend.trend === 'up' ? 'bg-green-100' : 
                savingsTrend.trend === 'down' ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                {savingsTrend.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : savingsTrend.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Volume Trend</p>
                <p className="text-lg font-bold text-slate-900">
                  {volumeTrend.trend === 'up' ? '+' : '-'}{volumeTrend.percentage.toFixed(1)}%
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                volumeTrend.trend === 'up' ? 'bg-green-100' : 
                volumeTrend.trend === 'down' ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                {volumeTrend.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : volumeTrend.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Efficiency Rate</p>
                <p className="text-lg font-bold text-slate-900">
                  {(metrics.savingsRate * 100).toFixed(3)}%
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Trades</p>
                <p className="text-lg font-bold text-slate-900">
                  {metrics.totalTrades.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en', { month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                  formatter={(value: number, name: string) => [
                    name === 'savings' ? `$${value.toFixed(2)}` : `$${(value / 1000000).toFixed(2)}M`,
                    name === 'savings' ? 'Savings' : 'Volume'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Savings"
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stackId="2"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Broker Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Broker Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brokerDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brokerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Savings']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsAnalysis.monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en', { month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === 'actualSavings' ? 'Actual Savings' : 'Potential Savings'
                  ]}
                />
                <Legend />
                <Bar dataKey="actualSavings" fill="#10b981" name="Actual Savings" />
                <Bar dataKey="potentialSavings" fill="#f59e0b" name="Potential Savings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Average Monthly Savings</span>
                <span className="text-lg font-bold text-slate-900">
                  ${savingsAnalysis.averageMonthlySavings.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Best Month</span>
                <span className="text-lg font-bold text-green-600">
                  ${savingsAnalysis.bestMonth.savings.toFixed(2)} ({savingsAnalysis.bestMonth.month})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Savings Growth Rate</span>
                <Badge variant={savingsAnalysis.growthRate > 0 ? "default" : "destructive"}>
                  {savingsAnalysis.growthRate > 0 ? '+' : ''}{savingsAnalysis.growthRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Efficiency Score</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {savingsAnalysis.efficiencyScore}/100
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Total Trading Volume</span>
                <span className="text-lg font-bold text-slate-900">
                  ${(savingsAnalysis.totalVolume / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}