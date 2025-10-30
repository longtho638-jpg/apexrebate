import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { GamificationDashboard } from '@/components/gamification/gamification-dashboard';
import { ReferralSystem } from '@/components/gamification/referral-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    default: 'Game hóa - ApexRebate',
    template: '%s | ApexRebate'
  },
  description: 'Hệ thống game hóa của ApexRebate với thành tựu, hạng mục và phần thưởng giới thiệu. Nâng cao trải nghiệm trading của bạn.',
  keywords: [
    'game hóa trading',
    'thành tựu trader',
    'hạng mục trading',
    'điểm thưởng trading',
    'giới thiệu trader',
    'ApexRebate rewards',
    'trading gamification',
    'trader achievements',
    'referral system'
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/gamification',
    title: 'Game hóa Trading - ApexRebate',
    description: 'Nâng cao trải nghiệm trading với hệ thống thành tựu và phần thưởng',
    siteName: 'ApexRebate',
  },
};

export default async function GamificationPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Game hóa Trading
          </h1>
          <p className="text-muted-foreground">
            Nâng cao trải nghiệm trading của bạn với thành tựu, hạng mục và phần thưởng giới thiệu
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Giới thiệu</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Thành tựu</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <GamificationDashboard />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralSystem />
          </TabsContent>

          <TabsContent value="achievements">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Thành tựu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GamificationDashboard />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}