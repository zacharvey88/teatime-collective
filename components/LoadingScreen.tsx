'use client'

import { useState, useEffect } from 'react'
import AnimatedLogo from './AnimatedLogo'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Check if the app is ready to load
    const checkIfReady = () => {
      // You can add additional checks here if needed
      // For now, we'll just wait for the DOM to be ready
      if (document.readyState === 'complete') {
        setIsFading(true)
        
        // Fade out animation
        setTimeout(() => {
          setIsVisible(false)
          onLoadingComplete()
        }, 500) // 500ms fade out duration
      } else {
        // If not ready, check again in a short time
        setTimeout(checkIfReady, 100)
      }
    }

    checkIfReady()
  }, [onLoadingComplete])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-[9999] bg-cream flex items-center justify-center transition-opacity duration-500 ${
      isFading ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center">
        <AnimatedLogo 
          size={200} 
          autoSpin={true} 
          spinSpeed={15}
          className="mb-8"
        />
        <div className="text-orange text-lg font-medium">
          Mixing ingredients...
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen 