'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, Users, Shield, CheckCircle, ArrowRight, Trophy } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function Home() {
  const t = useTranslations();
  
  const [savings, setSavings] = useState({ monthly: 0, yearly: 0 });
  const [volume, setVolume] = useState('1000000');
  const [broker, setBroker] = useState('binance');
  const [wallOfFame, setWallOfFame] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [isLoadingWallOfFame, setIsLoadingWallOfFame] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    tradingVolume: '',
    preferredBroker: '',
    experience: '',
    referralSource: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Calculate potential savings using API
  useEffect(() => {
    const calculateSavings = async () => {
      const volumeNum = parseFloat(volume) || 0;
      if (volumeNum <= 0) {
        setSavings({ monthly: 0, yearly: 0 });
        return;
      }

      try {
        const response = await fetch(
          `/api/calculator?volume=${volumeNum}&broker=${broker}&tradeType=taker&tradesPerMonth=20`
        );
        const data = await response.json();
        
        if (data.success) {
          setSavings({
            monthly: data.data.rebates.monthly,
            yearly: data.data.rebates.yearly,
          });
        } else {
          // Fallback to simple calculation
          const monthlyFees = volumeNum * 0.0004; // Default rate
          const monthlySavings = monthlyFees * 0.04; // 4% effective rebate
          const yearlySavings = monthlySavings * 12;
          setSavings({ monthly: monthlySavings, yearly: yearlySavings });
        }
      } catch (error) {
        console.error('Failed to calculate savings:', error);
        // Fallback to simple calculation
        const monthlyFees = volumeNum * 0.0004;
        const monthlySavings = monthlyFees * 0.04;
        const yearlySavings = monthlySavings * 12;
        setSavings({ monthly: monthlySavings, yearly: yearlySavings });
      }
    };

    calculateSavings();
  }, [volume, broker]);

  // Load Wall of Fame
  useEffect(() => {
    const fetchWallOfFame = async () => {
      setIsLoadingWallOfFame(true);
      try {
        const response = await fetch('/api/wall-of-fame');
        const data = await response.json();
        if (data.success) {
          setWallOfFame(data.data);
          setTotalSaved(data.totalSaved);
        }
      } catch (error) {
        console.error('Failed to fetch wall of fame:', error);
        // Fallback to mock data
        const mockWallOfFame = [
          { id: '1', anonymousName: 'Trader Alpha', totalSavings: 2847, broker: 'Binance', memberSince: '2024-01-15' },
          { id: '2', anonymousName: 'Trader Beta', totalSavings: 1923, broker: 'Bybit', memberSince: '2024-01-20' },
          { id: '3', anonymousName: 'Trader Gamma', totalSavings: 1567, broker: 'OKX', memberSince: '2024-02-01' },
          { id: '4', anonymousName: 'Trader Delta', totalSavings: 1234, broker: 'Binance', memberSince: '2024-02-10' },
          { id: '5', anonymousName: 'Trader Epsilon', totalSavings: 987, broker: 'Bybit', memberSince: '2024-02-15' }
        ];
        setWallOfFame(mockWallOfFame);
        setTotalSaved(mockWallOfFame.reduce((sum, user) => sum + user.totalSavings, 0));
      } finally {
        setIsLoadingWallOfFame(false);
      }
    };

    fetchWallOfFame();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/submit-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('✅ Application received. Concierge team will contact within 24 hours.');
        setFormData({
          email: '',
          tradingVolume: '',
          preferredBroker: '',
          experience: '',
          referralSource: ''
        });
      } else {
        setSubmitMessage(`❌ ${data.error || 'An error occurred. Please try again.'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage('❌ An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Shield className="w-4 h-4 mr-2" />
              For "Lone Wolf Traders"
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base min-h-[44px] sm:min-h-[48px] active:scale-95 transition-transform"
                onClick={() => document.getElementById('intake-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="flex items-center">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base min-h-[44px] sm:min-h-[48px] active:scale-95 transition-transform"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="flex items-center">
                  <Calculator className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  {t('calculator.title')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section id="calculator" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t('calculator.title')}
            </h2>
            <p className="text-slate-600">
              {t('calculator.description')}
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="volume" className="text-sm font-medium text-slate-700">
                      {t('calculator.monthlyVolume')}
                    </Label>
                    <Input
                      id="volume"
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="mt-2 h-11 sm:h-12 text-base"
                      placeholder="1,000,000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="broker" className="text-sm font-medium text-slate-700">
                      {t('calculator.selectBroker')}
                    </Label>
                    <Select value={broker} onValueChange={setBroker}>
                      <SelectTrigger className="mt-2 h-11 sm:h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binance">{t('broker.binance')} (Futures)</SelectItem>
                        <SelectItem value="bybit">{t('broker.bybit')} (Futures)</SelectItem>
                        <SelectItem value="okx">{t('broker.okx')} (Futures)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {t('calculator.estimatedRebate')}
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-sm text-slate-600">{t('time.now')} {t('calculator.perMonth')}</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        ${savings.monthly.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{t('time.now')} {t('calculator.perYear')}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                        ${savings.yearly.toFixed(2)}
                      </p>
                    </div>
                    <Separator />
                    <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                      <p>✅ {t('common.success')} transparent rebates</p>
                      <p>✅ Manual concierge service</p>
                      <p>✅ Elite trader community</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose ApexRebate?
            </h2>
            <p className="text-slate-600">
              Built for serious traders who demand excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">
                  {t('features.cashback.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {t('features.cashback.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">
                  {t('features.apexPro.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {t('features.apexPro.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">
                  {t('features.community.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {t('features.community.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wall of Fame */}
      <section id="wall-of-fame" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t('wallOfFame.title')}
            </h2>
            <p className="text-slate-600 mb-6">
              {t('wallOfFame.description')}
            </p>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-blue-600 mb-1">Total Savings</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${totalSaved.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-green-600 mb-1">Active Members</p>
                <p className="text-2xl font-bold text-green-900">
                  {wallOfFame.length}
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-purple-600 mb-1">Avg Savings</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${wallOfFame.length > 0 ? Math.round(totalSaved / wallOfFame.length) : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Wall of Fame Table */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                {t('wallOfFame.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWallOfFame ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-600 mt-4">{t('common.loading')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">{t('wallOfFame.rank')}</th>
                        <th className="text-left py-3 px-4">{t('wallOfFame.trader')}</th>
                        <th className="text-left py-3 px-4">{t('wallOfFame.totalRebate')}</th>
                        <th className="text-left py-3 px-4">{t('wallOfFame.joinDate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wallOfFame.map((trader, index) => (
                        <tr key={trader.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {index < 3 && (
                                <Trophy className={`w-4 h-4 mr-2 ${
                                  index === 0 ? 'text-yellow-500' : 
                                  index === 1 ? 'text-gray-400' : 'text-orange-600'
                                }`} />
                              )}
                              #{index + 1}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{trader.anonymousName}</td>
                          <td className="py-3 px-4">
                            <span className="text-green-600 font-semibold">
                              ${trader.totalSavings.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(trader.memberSince).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section id="intake-form" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your Journey
            </h2>
            <p className="text-blue-100">
              Join the elite community of serious traders
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      {t('auth.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-2"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tradingVolume" className="text-sm font-medium text-slate-700">
                      {t('calculator.monthlyVolume')}
                    </Label>
                    <Input
                      id="tradingVolume"
                      type="text"
                      value={formData.tradingVolume}
                      onChange={(e) => handleInputChange('tradingVolume', e.target.value)}
                      className="mt-2"
                      placeholder="e.g., $1,000,000"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="preferredBroker" className="text-sm font-medium text-slate-700">
                      {t('calculator.selectBroker')}
                    </Label>
                    <Select value={formData.preferredBroker} onValueChange={(value) => handleInputChange('preferredBroker', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select broker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binance">{t('broker.binance')}</SelectItem>
                        <SelectItem value="bybit">{t('broker.bybit')}</SelectItem>
                        <SelectItem value="okx">{t('broker.okx')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium text-slate-700">
                      Trading Experience
                    </Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (&lt;1 year)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                        <SelectItem value="expert">Expert (&gt;5 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="referralSource" className="text-sm font-medium text-slate-700">
                    How did you hear about us?
                  </Label>
                  <Textarea
                    id="referralSource"
                    value={formData.referralSource}
                    onChange={(e) => handleInputChange('referralSource', e.target.value)}
                    className="mt-2"
                    placeholder="e.g., Twitter, TradingView, friend recommendation..."
                    rows={3}
                  />
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-lg ${
                    submitMessage.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg min-h-[48px]"
                >
                  {isSubmitting ? t('common.loading') : t('hero.cta')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}