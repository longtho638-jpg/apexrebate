'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/auth-guard';
import Navbar from '@/components/navbar';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/payouts');
      const data = await response.json();
      
      if (data.success) {
        setPayouts(data.data.payouts);
      } else {
        setError('Failed to load payout data');
      }
    } catch (err) {
      setError('Error loading payouts');
      console.error('Payouts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutDetails = async (payoutId) => {
    try {
      const response = await fetch(`/api/dashboard/payouts?id=${payoutId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedPayout(data.data);
        setShowDetails(true);
      }
    } catch (err) {
      console.error('Payout details error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payout history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchPayouts}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Payout History</h1>
                  <p className="text-slate-600">Complete history of your rebate payouts</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Payouts</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${payouts.reduce((sum, payout) => sum + payout.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Payouts</p>
                  <p className="text-2xl font-bold text-slate-900">{payouts.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Average Payout</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${payouts.length > 0 ? (payouts.reduce((sum, payout) => sum + payout.amount, 0) / payouts.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div key={payout.id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-semibold text-slate-900">
                            ${payout.amount.toFixed(2)}
                          </p>
                          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                            {payout.status}
                          </Badge>
                          <Badge variant="outline">
                            {payout.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{payout.period}</p>
                        <p className="text-sm text-slate-600">
                          Broker: <span className="font-medium">{payout.broker}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {new Date(payout.processedAt).toLocaleDateString()}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => fetchPayoutDetails(payout.id)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Details Modal */}
        {showDetails && selectedPayout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Payout Details</h2>
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Overview */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Payout Amount</p>
                        <p className="text-lg font-semibold text-slate-900">
                          ${selectedPayout.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Status</p>
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          {selectedPayout.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Period</p>
                        <p className="text-slate-900">{selectedPayout.period}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Processed Date</p>
                        <p className="text-slate-900">
                          {new Date(selectedPayout.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Trading Volume</span>
                        <span className="font-medium">
                          ${(selectedPayout.breakdown.tradingVolume / 1000000).toFixed(2)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Fees</span>
                        <span className="font-medium">
                          ${selectedPayout.breakdown.totalFees.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Broker Rebate (40%)</span>
                        <span className="font-medium text-green-600">
                          +${selectedPayout.breakdown.brokerRebate.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">ApexRebate (10%)</span>
                        <span className="font-medium text-blue-600">
                          +${selectedPayout.breakdown.apexRebate.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bonus Amount</span>
                        <span className="font-medium text-purple-600">
                          +${selectedPayout.breakdown.bonusAmount.toFixed(2)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold">Effective Rate</span>
                        <span className="font-semibold text-green-600">
                          {(selectedPayout.breakdown.effectiveRate * 100).toFixed(3)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Transactions */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Transactions</h3>
                    <div className="space-y-3">
                      {selectedPayout.transactions.map((transaction, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-slate-900">
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </p>
                              <p className="text-sm text-slate-600">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-slate-600">
                                Method: {transaction.method.replace('_', ' ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                +${transaction.amount.toFixed(2)}
                              </p>
                              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                {transaction.status}
                              </Badge>
                              <p className="text-sm text-slate-600 mt-1">
                                Ref: {transaction.reference}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}