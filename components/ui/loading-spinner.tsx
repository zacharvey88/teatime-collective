'use client'

import AnimatedLogo from '../AnimatedLogo'

interface LoadingSpinnerProps {
  message?: string
  size?: number
  className?: string
}

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = 100,
  className = ""
}: LoadingSpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <AnimatedLogo 
        size={size} 
        autoSpin={true} 
        spinSpeed={15}
        className="mb-4"
      />
      <div className="text-orange text-lg font-medium">
        {message}
      </div>
    </div>
  )
}

export default LoadingSpinner
