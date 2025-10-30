'use client'

import Link from 'next/link'
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
              <span className="font-bold text-xl">ApexRebate</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tối ưu hóa lợi nhuận cho trader nghiêm túc
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculator" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Hoàn phí
                </Link>
              </li>
              <li>
                <Link href="/apex-pro" className="text-slate-400 hover:text-white transition-colors text-sm">
                  ApexPro
                </Link>
              </li>
              <li>
                <Link href="/hang-soi" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Hang Sói
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Công ty</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Điều khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Đối tác</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                <span className="text-slate-400 text-sm">Binance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
                <span className="text-slate-400 text-sm">Bybit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
                <span className="text-slate-400 text-sm">OKX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3">Liên kết nhanh</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="text-slate-400 hover:text-white transition-colors text-sm">
                    Máy tính
                  </Link>
                </li>
                <li>
                  <Link href="/wall-of-fame" className="text-slate-400 hover:text-white transition-colors text-sm">
                    Danh vọng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-3">Dịch vụ</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/services/binance-rebate" className="text-slate-400 hover:text-white transition-colors text-sm">
                    Hoàn phí Binance
                  </Link>
                </li>
                <li>
                  <Link href="/services/bybit-rebate" className="text-slate-400 hover:text-white transition-colors text-sm">
                    Hoàn phí Bybit
                  </Link>
                </li>
                <li>
                  <Link href="/services/okx-rebate" className="text-slate-400 hover:text-white transition-colors text-sm">
                    Hoàn phí OKX
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3">Liên hệ</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-400 text-sm">support@apexrebate.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-400 text-sm">+84 123 456 789</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-slate-800">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2024 ApexRebate. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">
                Trang web này sử dụng cookie để cải thiện trải nghiệm của bạn.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="text-slate-400 hover:text-white"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Quay lên trên
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}