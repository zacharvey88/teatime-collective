'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import CakeCard from '@/components/CakeCard'

// Cake data based on the flavors from the order page
const cakes = [
  {
    id: 'chocolate',
    name: 'Chocolate Cake',
    image: '/images/carousel-01.jpg',
    description: 'Rich and decadent chocolate cake, perfect for chocolate lovers.',
    flavors: ['Chocolate', 'Chocolate Orange', 'Chocolate Vanilla', 'Chocolate Hazelnut', 'Chocolate Peanut Butter'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  },
  {
    id: 'carrot-cake',
    name: 'Carrot Cake',
    image: '/images/carousel-02.jpg',
    description: 'Moist carrot cake with cream cheese frosting, a classic favorite.',
    flavors: ['Carrot Cake'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  },
  {
    id: 'coffee-walnut',
    name: 'Coffee & Walnut Cake',
    image: '/images/carousel-03.jpg',
    description: 'Delicate coffee-flavored cake with crunchy walnuts and coffee buttercream.',
    flavors: ['Coffee Walnut', 'Coffee Chocolate'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  },
  {
    id: 'lemon-raspberry',
    name: 'Lemon & Raspberry Cake',
    image: '/images/carousel-04.jpg',
    description: 'Zesty lemon cake layered with fresh raspberries and lemon buttercream.',
    flavors: ['Lemon Crumble', 'Lemon Raspberry', 'Vanilla Raspberry'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  },
  {
    id: 'toffee-biscoff',
    name: 'Toffee & Biscoff Cake',
    image: '/images/carousel-05.jpg',
    description: 'Indulgent toffee cake with Biscoff spread and caramel buttercream.',
    flavors: ['Toffee Popcorn', 'Toffee Biscoff', 'Toffee Banana'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  },
  {
    id: 'victoria-sponge',
    name: 'Victoria Sponge',
    image: '/images/mud-pie.jpg',
    description: 'Classic Victoria sponge with jam and cream, a British tradition.',
    flavors: ['Victoria Sponge'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  },
  {
    id: 'blackforest-gateau',
    name: 'Blackforest Gateau',
    image: '/images/carousel-01.jpg',
    description: 'Luxurious chocolate gateau with cherries and whipped cream.',
    flavors: ['Blackforest Gateau', 'Chocolate Gateau'],
    pricing: {
      regular: 'From £60'
    },
    availableSizes: ['regular' as const]
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu Cake',
    image: '/images/carousel-02.jpg',
    description: 'Coffee-flavored Italian dessert cake with mascarpone cream.',
    flavors: ['Tiramisu'],
    pricing: {
      regular: 'From £60'
    },
    availableSizes: ['regular' as const]
  },
  {
    id: 'almond-raspberry',
    name: 'Almond & Raspberry Cake',
    image: '/images/carousel-03.jpg',
    description: 'Delicate almond cake with fresh raspberries and almond buttercream.',
    flavors: ['Almond Raspberry', 'Almond Cherry'],
    pricing: {
      regular: 'From £55'
    },
    availableSizes: ['regular' as const]
  },
  {
    id: 'orange-pistachio',
    name: 'Orange & Pistachio Cake',
    image: '/images/carousel-04.jpg',
    description: 'Citrusy orange cake with pistachios and orange buttercream.',
    flavors: ['Orange Walnut', 'Raspberry Pistachio', 'Orange Pistachio'],
    pricing: {
      regular: 'From £55'
    },
    availableSizes: ['regular' as const]
  },
  {
    id: 'pumpkin-spice',
    name: 'Pumpkin Spice Cake',
    image: '/images/carousel-05.jpg',
    description: 'Warm spiced pumpkin cake perfect for autumn celebrations.',
    flavors: ['Pumpkin Spice'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  },
  {
    id: 'cookies-cream',
    name: 'Cookies & Cream Cake',
    image: '/images/mud-pie.jpg',
    description: 'Chocolate cake with crushed cookies and vanilla buttercream.',
    flavors: ['Cookies Cream'],
    pricing: {
      regular: 'From £50',
      frilly: 'From £70'
    },
    availableSizes: ['regular' as const, 'frilly' as const]
  }
]

export default function CakesPage() {
  return (
    <div className="min-h-screen bg-light-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-orange mb-4 font-lobster">
              Our Cakes
            </h1>
            <p className="text-lg text-gray max-w-2xl mx-auto">
              Discover our delicious selection of handcrafted vegan cakes, perfect for any occasion. 
              Each cake is made with love and the finest ingredients.
            </p>
          </div>

          {/* Cakes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake) => (
              <CakeCard
                key={cake.id}
                id={cake.id}
                name={cake.name}
                image={cake.image}
                description={cake.description}
                flavors={cake.flavors}
                pricing={cake.pricing}
                availableSizes={cake.availableSizes}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 