import { motion } from 'framer-motion';
import { ArrowRight, Shield, Rocket, Zap } from 'lucide-react';
import type { ReactNode } from 'react';


type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#0A192F' }}>
      {/* Animated aura elements using teal accent */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30 filter blur-3xl" style={{ background: '#33D1B8' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 filter blur-3xl" style={{ background: '#48BB78' }} />
      </div>
      <div className="container mx-auto px-6 z-10 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: 'rgba(51, 209, 184, 0.1)', borderColor: 'rgba(51, 209, 184, 0.3)', color: '#33D1B8' }}>
              <Zap className="w-4 h-4" />
              Agentic UI · 5.1 – From prompt → polished MVP
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{ color: '#F7FAFC' }}
          >
            Ship investor-ready landing pages in a weekend
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl mb-10 leading-relaxed max-w-3xl mx-auto"
            style={{ color: '#A0AEC0' }}
          >
            Sử dụng thư viện UI 5.1 Visual Engine với hơn 120 block sẵn sàng sản xuất,
            tối ưu hiệu suất và tuân thủ quy chuẩn. Tích hợp cực nhanh, không cần kỹ năng thiết kế.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-medium shadow-md"
              style={{ backgroundColor: '#33D1B8', color: '#0A192F' }}
            >
              Bắt đầu ngay
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-medium border"
              style={{ borderColor: '#33D1B8', color: '#33D1B8' }}
            >
              Xem thư viện
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<Shield className="w-8 h-8" style={{ color: '#33D1B8' }} />}
              title="Production-safe defaults"
              description="Tối ưu sẵn cho hiệu suất, bảo mật và tuân thủ."
            />
            <FeatureCard
              icon={<Rocket className="w-8 h-8" style={{ color: '#48BB78' }} />}
              title="Copy → Paste → Merge"
              description="Tích hợp chỉ trong vài phút, không cần chỉnh sửa phức tạp."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" style={{ color: '#F56565' }} />}
              title="Founder-friendly layout"
              description="Thiết kế rõ ràng, dễ đọc, phù hợp pitch deck & investor."
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className="rounded-2xl p-6 transition-transform"
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#F7FAFC'
      }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p style={{ color: '#A0AEC0' }}>{description}</p>
    </div>
  );
}
