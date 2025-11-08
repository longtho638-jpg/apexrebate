import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UIShowcasePage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-100 mb-8">UI Showcase 2025</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-200 mb-6">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="neon">Neon</Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-200 mb-6">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Standard card with default styling.</p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Glassmorphism effect with backdrop blur.</p>
              </CardContent>
            </Card>

            <Card variant="neon">
              <CardHeader>
                <CardTitle>Neon Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Neon glow effect with wolf colors.</p>
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Subtle gradient background.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-200 mb-6">Modern Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="backdrop-blur-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-wolf-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Performance</h3>
                  <p className="text-zinc-300">Lightning fast with modern optimizations.</p>
                </div>
              </CardContent>
            </Card>

            <Card variant="neon" className="border-2 border-wolf-500">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-wolf-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_theme(colors.wolf.500)]">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Innovation</h3>
                  <p className="text-zinc-300">Cutting-edge design with Catalyst UI.</p>
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient" className="from-purple-600/20 to-blue-600/20">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Creativity</h3>
                  <p className="text-zinc-300">Beautiful gradients and modern aesthetics.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
