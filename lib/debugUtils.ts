// Debug utilities for local development

export const debugStorage = () => {
  // This function is intentionally empty for production
  // Debug logging has been removed
}

export const clearStorage = () => {
  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.startsWith('teatime-')) {
      localStorage.removeItem(key)
    }
  })

  // Clear sessionStorage
  sessionStorage.clear()
}

export const testImageLoading = async (imageUrl: string) => {
  try {
    const response = await fetch(imageUrl)
    return response.ok
  } catch (error) {
    return false
  }
}

export const logPageLoad = () => {
  // This function is intentionally empty for production
  // Debug logging has been removed
}

export const logStorageChange = (event: StorageEvent) => {
  // This function is intentionally empty for production
  // Debug logging has been removed
} 