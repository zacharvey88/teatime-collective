'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface CakeCardProps {
  id: string
  name: string
  image: string
  description: string
  flavors: string[]
  pricing: {
    regular?: string
    frilly?: string
    wedding?: string
  }
  availableSizes: ('regular' | 'frilly' | 'wedding')[]
}

export default function CakeCard({ id, name, image, description, flavors, pricing, availableSizes }: CakeCardProps) {
  const router = useRouter()

  const handleOrderNow = () => {
    router.push(`/order?flavour=${id}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-orange/20 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title and Description */}
        <h3 className="text-2xl font-bold text-gray mb-2 font-lobster">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>

        {/* Flavors */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray mb-2">Available Flavors:</h4>
          <div className="flex flex-wrap gap-1">
            {flavors.map((flavor, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange/10 text-orange text-xs rounded-full border border-orange/20"
              >
                {flavor}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray mb-2">Pricing:</h4>
          <div className="space-y-1">
            {availableSizes.includes('regular') && pricing.regular && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Regular:</span>
                <span className="font-semibold text-gray">{pricing.regular}</span>
              </div>
            )}
            {availableSizes.includes('frilly') && pricing.frilly && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frilly:</span>
                <span className="font-semibold text-gray">{pricing.frilly}</span>
              </div>
            )}
            {availableSizes.includes('wedding') && pricing.wedding && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wedding:</span>
                <span className="font-semibold text-gray">{pricing.wedding}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Button - pushed to bottom */}
        <div className="mt-auto">
          <Button
            onClick={handleOrderNow}
            className="w-full bg-orange hover:bg-orange-900 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            Order Now
          </Button>
        </div>
      </div>
    </div>
  )
} 