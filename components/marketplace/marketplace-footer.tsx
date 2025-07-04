import Link from "next/link"
import Image from "next/image"

export default function MarketplaceFooter() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12 md:py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 md:mb-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Image src="/images/logo.svg" alt="Hunos" width={32} height={32} />
              <span className="text-xl font-bold">Hunos</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Join Hunos community</p>
            <div className="flex items-center justify-center md:justify-start space-x-4 mt-2">
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {/* X (Twitter) icon */}
                <Image src="/images/twitter.svg" alt="Telegram" width={24} height={24} className="w-6 h-6" />
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {/* Telegram icon */}
                <Image src="/images/telegram.svg" alt="Telegram" width={24} height={24} className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {/* YouTube icon */}
                <Image src="/images/youtube.svg" alt="Telegram" width={24} height={24} className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link href="/marketplace" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Explore
              </Link>
              <Link href="/marketplace/activities" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Activities
              </Link>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              <Link href="/help" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Help Center
              </Link>
              <Link href="/faq" className="block text-gray-400 hover:text-white transition-colors text-sm">
                FAQ
              </Link>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Links</h3>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center md:text-left text-gray-400 text-sm">© Hunos, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
