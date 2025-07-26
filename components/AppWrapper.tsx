'use client'

import { useState, useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

interface AppWrapperProps {
  children: React.ReactNode
}

const AppWrapper = ({ children }: AppWrapperProps) => {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <div className={isLoading ? 'hidden' : ''}>
        {children}
      </div>
    </>
  )
}

export default AppWrapper 