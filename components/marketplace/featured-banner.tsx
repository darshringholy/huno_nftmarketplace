import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function FeaturedBanner() {
  const carImages = [
    "/images/car1.png",
    "/images/car2.png", 
    "/images/car3.png",
    "/images/car4.png"
  ]

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {carImages.map((image, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700 aspect-video overflow-hidden">
          <div className="w-full h-full relative">
            <Image
              src={image}
              alt={`Featured car ${index + 1}`}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
            />
          </div>
        </Card>
      ))}
    </section>
  )
}
