'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface AnimatedLogoProps {
  size?: number
  className?: string
  autoSpin?: boolean
  spinSpeed?: number
}

const AnimatedLogo = ({ 
  size = 200, 
  className = '', 
  autoSpin = true, 
  spinSpeed = 20 
}: AnimatedLogoProps) => {
  const [isSpinning, setIsSpinning] = useState(autoSpin)

  useEffect(() => {
    if (autoSpin) {
      setIsSpinning(true)
    }
  }, [autoSpin])

  const handleMouseEnter = () => {
    if (!autoSpin) {
      setIsSpinning(true)
    }
  }

  const handleMouseLeave = () => {
    if (!autoSpin) {
      setIsSpinning(false)
    }
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static center cake */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Image
          src="/images/logo-cake.png"
          alt="Teatime Collective Cake"
          width={size * 0.25}
          height={size * 0.25}
          className={`object-contain transform ${
            size >= 100 ? 'translate-x-1 -translate-y-1' : 'translate-x-0.4 -translate-y-0.4'
          }`}
        />
      </div>

      {/* Spinning outer ring */}
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          isSpinning ? 'animate-logo-spin' : ''
        }`}
        style={{
          animationDuration: `${spinSpeed}s`
        }}
      >
        <Image
          src="/images/logo-ring.png"
          alt="Teatime Collective Ring"
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
    </div>
  )
}

export default AnimatedLogo 