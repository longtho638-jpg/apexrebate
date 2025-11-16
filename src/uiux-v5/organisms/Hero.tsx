import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Rocket, Zap } from 'lucide-react';
import Button from '../atoms/Button';
import colors from '../tokens/colors';

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: <Shield className="w-8 h-8" color={colors.secondary.alertGreen} />, 
    title: 'Production Ready',
    description: 'All blocks are tested and optimized for performance',
  },
  {
    icon: <Rocket className="w-8 h-8" color={colors.secondary.warningRed} />,
    title: 'Lightning Fast',
    description: 'Copy-paste integration in under 5 minutes',
  },
  {
    icon: <Zap className="w-8 h-8" color={colors.primary.intelligentTeal} />,
    title: 'Fully Customizable',
    description: 'Easy to modify with TailwindCSS classes',
  },
];

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold" style={{ color: colors.neutral.offWhite }}>{title}</h3>
      <p style={{ color: colors.neutral.lightGray }}>{description}</p>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: colors.primary.midnightBlue }}
    >
      {/* background aura */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full filter blur-3xl opacity-30"
        style={{ backgroundColor: colors.primary.intelligentTeal }}
      />
      <div className="container mx-auto px-6 z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: `${colors.primary.intelligentTeal}33`,
              color: colors.primary.intelligentTeal,
              border: `1px solid ${colors.primary.intelligentTeal}55`,
            }}
          >
            <Zap className="w-4 h-4" color={colors.primary.intelligentTeal} />
            Build MVP in Minutes, Not Weeks
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{ color: colors.neutral.offWhite }}
          >
            Launch Your{' '}
            <span
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary.intelligentTeal}, ${colors.secondary.alertGreen})`,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Startup
            </span>{' '}
            Faster
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl mb-10 leading-relaxed"
            style={{ color: colors.neutral.lightGray }}
          >
            100+ production-ready UI blocks. Copy, paste, and ship. No design skills needed. Save 40+ hours of development.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Button>
              Get Started Free
            </Button>
            <Button variant="outline">
              View Docs
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feat, idx) => (
              <FeatureCard key={idx} {...feat} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
