import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12 md:py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 md:mb-12">
          {/* Logo and Tagline */}
          <div className="space-y-4 text-center md:text-left flex flex-col justify-center">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Image src="/images/logo.svg" alt="Hunos" width={32} height={32} />
              <span className="text-2xl font-bold">Hunos</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              LiquidID Tokenize, Trade, and Earn from Real-World Assets. Fully On-Chain. Instantly Liquid.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                About
              </Link>
              <Link href="/features" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Features
              </Link>
              <Link href="/roadmap" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Roadmap
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Social Network */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Social network</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">X</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Telegram</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">LinkedIn</a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="text-center md:text-left flex flex-col justify-center">
            <h3 className="font-semibold mb-4">Sign up to our newsletter</h3>
            <form className="flex items-center justify-center md:justify-start">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-[#181818] border border-[#333] rounded-l-lg px-4 py-2 text-sm text-gray-200 focus:outline-none w-64 h-12"
                style={{ borderRight: "none" }}
              />
              <button
                type="submit"
                className="bg-[#B6F94C] hover:bg-[#A0E63A] rounded-r-lg px-2 h-12 flex items-center justify-center transition-colors"
                aria-label="Subscribe"
                style={{ border: "1px solid #333", borderLeft: "none" }}
              >
                <img src="/images/send.svg" alt="Send" width={28} height={28} />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">© 2025 Hunos. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}