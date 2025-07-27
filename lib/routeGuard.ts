import { AuthService } from './auth'

export class RouteGuard {
  // Check if user can access admin routes
  static async canAccessAdmin(): Promise<boolean> {
    try {
      const session = await AuthService.getSession()
      if (!session) return false
      
      const isAdmin = await AuthService.isAdmin()
      return isAdmin
    } catch (error) {
      console.error('Route guard check failed:', error)
      return false
    }
  }

  // Redirect to admin login if not authenticated
  static async redirectIfNotAdmin(): Promise<void> {
    const canAccess = await this.canAccessAdmin()
    if (!canAccess) {
      // Clear any existing session
      try {
        await AuthService.signOut()
      } catch (error) {
        console.error('Error signing out:', error)
      }
      
      // Redirect to admin login
      window.location.href = '/admin'
    }
  }

  // Handle browser back/forward navigation
  static setupNavigationGuard(): () => void {
    const handlePopState = async () => {
      // Check authentication when navigating back/forward
      await this.redirectIfNotAdmin()
    }

    window.addEventListener('popstate', handlePopState)

    // Return cleanup function
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }
} 