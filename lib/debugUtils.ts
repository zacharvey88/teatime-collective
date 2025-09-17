export const debugStorage = () => {
  // Intentionally empty for production
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
  // Intentionally empty for production
}

export const logStorageChange = (event: StorageEvent) => {
  // Intentionally empty for production
} 