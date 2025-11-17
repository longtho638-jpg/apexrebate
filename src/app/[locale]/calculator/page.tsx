'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, DollarSign, BarChart3, Info } from 'lucide-react';

interface CalculationResult {
  monthlyFees: number;
  yearlyFees: number;
  monthlyRebates: number;
  yearlyRebates: number;
  netSavingsMonthly: number;
  netSavingsYearly: number;
  effectiveRate: number;
  vipLevel: string;
}

interface BrokerConfig {
  name: string;
  makerFee: number;
  takerFee: number;
  rebateRate: number;
  vipLevels: Array<{ level: string; minVolume: number; makerFee: number; takerFee: number; rebateRate: number }>;
}

const brokerConfigs: Record<string, BrokerConfig> = {
  binance: {
    name: 'Binance Futures',
    makerFee: 0.0002,
    takerFee: 0.0004,
    rebateRate: 0.04,
    vipLevels: [
      { level: 'VIP 0', minVolume: 0, makerFee: 0.0002, takerFee: 0.0004, rebateRate: 0.04 },
      { level: 'VIP 1', minVolume: 50000000, makerFee: 0.00016, takerFee: 0.0004, rebateRate: 0.05 },
      { level: 'VIP 2', minVolume: 250000000, makerFee: 0.00012, takerFee: 0.00035, rebateRate: 0.06 },
      { level: 'VIP 3', minVolume: 1000000000, makerFee: 0.00008, takerFee: 0.0003, rebateRate: 0.08 },
      { level: 'VIP 4', minVolume: 5000000000, makerFee: 0.00004, takerFee: 0.00025, rebateRate: 0.10 },
      { level: 'VIP 5', minVolume: 10000000000, makerFee: 0.00002, takerFee: 0.0002, rebateRate: 0.12 },
    ]
  },
  bybit: {
    name: 'Bybit Futures',
    makerFee: 0.0001,
    takerFee: 0.00055,
    rebateRate: 0.045,
    vipLevels: [
      { level: 'VIP 0', minVolume: 0, makerFee: 0.0001, takerFee: 0.00055, rebateRate: 0.045 },
      { level: 'VIP 1', minVolume: 100000000, makerFee: 0.00009, takerFee: 0.0005, rebateRate: 0.05 },
      { level: 'VIP 2', minVolume: 500000000, makerFee: 0.00008, takerFee: 0.00045, rebateRate: 0.055 },
      { level: 'VIP 3', minVolume: 2500000000, makerFee: 0.00007, takerFee: 0.0004, rebateRate: 0.06 },
      { level: 'VIP 4', minVolume: 10000000000, makerFee: 0.00006, takerFee: 0.00035, rebateRate: 0.07 },
      { level: 'VIP 5', minVolume: 20000000000, makerFee: 0.00005, takerFee: 0.0003, rebateRate: 0.08 },
    ]
  },
  okx: {
    name: 'OKX Futures',
    makerFee: 0.00015,
    takerFee: 0.0005,
    rebateRate: 0.042,
    vipLevels: [
      { level: 'VIP 0', minVolume: 0, makerFee: 0.00015, takerFee: 0.0005, rebateRate: 0.042 },
      { level: 'VIP 1', minVolume: 50000000, makerFee: 0.00013, takerFee: 0.00045, rebateRate: 0.048 },
      { level: 'VIP 2', minVolume: 250000000, makerFee: 0.00011, takerFee: 0.0004, rebateRate: 0.054 },
      { level: 'VIP 3', minVolume: 1000000000, makerFee: 0.00009, takerFee: 0.00035, rebateRate: 0.06 },
      { level: 'VIP 4', minVolume: 5000000000, makerFee: 0.00007, takerFee: 0.0003, rebateRate: 0.066 },
      { level: 'VIP 5', minVolume: 10000000000, makerFee: 0.00005, takerFee: 0.00025, rebateRate: 0.072 },
    ]
  }
};

export default function CalculatorPage() {
  const t = useTranslations('calculator');
  const [volume, setVolume] = useState('1000000');
  const [broker, setBroker] = useState('binance');
  const [tradeType, setTradeType] = useState('taker');
  const [tradesPerMonth, setTradesPerMonth] = useState('20');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const calculateSavings = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const volumeNum = parseFloat(volume) || 0;
      const tradesNum = parseInt(tradesPerMonth) || 20;
      
      if (volumeNum <= 0) {
        setError(t('description'));
        setResult(null);
        setIsLoading(false);
        return;
      }

      if (tradesNum <= 0) {
        setError(t('description'));
        setResult(null);
        setIsLoading(false);
        return;
      }

      const config = brokerConfigs[broker];
      const vipLevel = config.vipLevels
        .slice()
        .reverse()
        .find(level => volumeNum >= level.minVolume) || config.vipLevels[0];

      const feeRate = tradeType === 'maker' ? vipLevel.makerFee : vipLevel.takerFee;
      const monthlyFees = volumeNum * feeRate;
      const yearlyFees = monthlyFees * 12;
      
      const monthlyRebates = monthlyFees * vipLevel.rebateRate;
      const yearlyRebates = monthlyRebates * 12;
      
      const netSavingsMonthly = monthlyRebates;
      const netSavingsYearly = yearlyRebates;
      
      const effectiveRate = (feeRate * (1 - vipLevel.rebateRate)) * 100;

      setResult({
        monthlyFees,
        yearlyFees,
        monthlyRebates,
        yearlyRebates,
        netSavingsMonthly,
        netSavingsYearly,
        effectiveRate,
        vipLevel: vipLevel.level
      });
    } catch (error) {
      console.error('Calculation error:', error);
      setError('Error calculating');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateSavings();
  }, [volume, broker, tradeType, tradesPerMonth]);

  return (
    <>
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {t('title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="volume">{t('volume')}</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={volume}
                    onChange={(e) => {
                      setVolume(e.target.value);
                      setError('');
                    }}
                    placeholder="1,000,000"
                    className="mt-1"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="broker">{t('exchange')}</Label>
                  <Select value={broker} onValueChange={setBroker}>
                    <SelectTrigger className="mt-1" data-testid="exchange-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="binance" data-testid="exchange-option-binance">{t('binance')}</SelectItem>
                      <SelectItem value="bybit" data-testid="exchange-option-bybit">{t('bybit')}</SelectItem>
                      <SelectItem value="okx" data-testid="exchange-option-okx">{t('okx')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tradeType">{t('exchange')}</Label>
                  <Select value={tradeType} onValueChange={setTradeType}>
                    <SelectTrigger className="mt-1" data-testid="trade-type-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maker" data-testid="trade-type-option-maker">Maker</SelectItem>
                      <SelectItem value="taker" data-testid="trade-type-option-taker">Taker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button 
                  data-testid="calculate-button"
                  onClick={calculateSavings} 
                  disabled={isLoading || parseFloat(volume) <= 0}
                  className="w-full"
                >
                  {isLoading ? 'Calculating...' : t('calculate')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {(!error && result) ? (
              <div className="space-y-6">
                {/* VIP Level Badge */}
                <div className="text-center">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2">
                    {brokerConfigs[broker].name} - {result.vipLevel}
                  </Badge>
                </div>

                <Tabs defaultValue="savings" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="savings">Savings</TabsTrigger>
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="savings" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-600 mb-1">Monthly</p>
                              <p className="text-2xl font-bold text-green-700">
                                ${result.monthlyRebates.toFixed(2)}
                              </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-600 mb-1">Yearly</p>
                              <p className="text-2xl font-bold text-blue-700">
                                ${result.yearlyRebates.toFixed(2)}
                              </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="fees" className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Trading Fees</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Monthly</span>
                            <span className="font-medium">${result.monthlyFees.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Yearly</span>
                            <span className="font-medium">${result.yearlyFees.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center">
                          <Info className="w-5 h-5 mr-2" />
                          Performance
                        </h3>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    No results
                  </h3>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
