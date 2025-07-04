import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const steps = [
  {
    step: "Step 1",
    title: "Mint",
    description: "Create your unique LiquidID by uploading your asset and setting custom attributes.",
    image: "/images/mint.svg",
    color: "text-green-400",
  },
  {
    step: "Step 2",
    title: "List",
    description: "Put your LiquidID on the marketplace or link it to a liquidity pool to make it tradable.",
    image: "/images/LID.svg",
    color: "text-orange-400",
  },
  {
    step: "Step 3",
    title: "Earn",
    description: "Collect dividends and trading rewards every time your LiquidID generates activity.",
    image: "/images/earn.svg",
    color: "text-yellow-400",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-24">
      <div className="container mx-auto text-center">

        <div className="mb-10 flex justify-center">
          <div className="inline-block px-2 py-2 bg-transparent rounded-full border border-gray-700">
            <div className="inline-block px-2 py-2 bg-transparent rounded-full border border-gray-700">
              <div className="relative">
                {/* Outer border */}
                <div className="absolute inset-0 rounded-full border-[3px] border-[#111] pointer-events-none" />
                {/* Middle border */}
                <div className="absolute inset-1 rounded-full border-[2px] border-[#222] pointer-events-none" />
                {/* Inner border */}
                <div className="absolute inset-2 rounded-full border border-[#333] pointer-events-none" />
                {/* Content */}
                <div className="relative z-10 px-4 py-2 min-w-[240px] flex items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #232323 0%, #181818 100%)",
                    boxShadow: "0 2px 24px 0 rgba(0,0,0,0.7), 0 0 0 1px #222 inset"
                  }}
                >
                  <span className="text-white text-md font-medium tracking-wide">SIMPLE STEPS TO START</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 md:mb-16">How It Works?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-16">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="bg-gray-900 border-gray-800 relative overflow-hidden group hover:border-green-500/50 transition-colors rounded-2xl"
            >
              <CardContent className="relative flex flex-col items-center justify-end p-0 min-h-[420px] bg-transparent">
                {/* Glowing background effect */}
                <div
                  className="absolute inset-0 z-0 rounded-lg"
                  style={{
                    background: "radial-gradient(ellipse at center, #1aff6c33 0%, #000 80%)",
                    boxShadow: "0 0 80px 10px #1aff6c33, 0 0 0 1px #222 inset",
                  }}
                />
                {/* Step badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: "rgba(30, 30, 30, 0.85)",
                      color: "#7CFF6B",
                      border: "1px solid #2e2e2e",
                    }}
                  >
                    {step.step}
                  </span>
                </div>
                {/* 3D image */}
                <div className="flex items-center justify-center mt-16 mb-8 z-10">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-64 h-64 object-contain drop-shadow-[0_0_40px_#1aff6c55]"
                    draggable={false}
                  />
                </div>
                {/* Card bottom overlay */}
                <div className="mx-4 px-6 py-8 rounded-2xl bg-[#A3A3A31A] backdrop-blur-md border border-gray-800 z-10 mb-4">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
