import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function NewsletterSection() {
  return (
    <section className="py-12 md:py-16">
      <Card className="bg-transparent border-none">
        <CardContent className="p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Get the latest Blocvault updates</h2>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 flex-1"
            />
            <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6">Subscribe</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
