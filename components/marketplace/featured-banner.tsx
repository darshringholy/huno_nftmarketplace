import { Card } from "@/components/ui/card"

export default function FeaturedBanner() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700 aspect-video">
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
            {/* Insert Image */}
          </div>
        </Card>
      ))}
    </section>
  )
}
