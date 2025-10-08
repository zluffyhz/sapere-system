// Navigation service to handle programmatic navigation without page reloads
// This allows API calls and other services to trigger navigation without losing React state

interface NavigationService {
  navigate?: (path: string) => void;
  goToLogin?: (reason?: string) => void;
}

class NavigationManager {
  private navigationService: NavigationService = {};

  // Set the navigation function (called by App component)
  setNavigation(navigate: (path: string) => void) {
    this.navigationService.navigate = navigate;
    this.navigationService.goToLogin = (reason?: string) => {
      const path = reason ? `/login?reason=${reason}` : '/login';
      navigate(path);
    };
  }

  // Get navigation functions
  getNavigation() {
    return this.navigationService;
  }

  // Safe navigation that falls back to window.location if React Router not available
  navigateTo(path: string) {
    if (this.navigationService.navigate) {
      this.navigationService.navigate(path);
    } else {
      // Fallback to window.location only if React Router navigation is not available
      console.warn('React Router navigation not available, falling back to window.location');
      window.location.href = path;
    }
  }

  // Safe login redirect
  goToLogin(reason?: string) {
    if (this.navigationService.goToLogin) {
      this.navigationService.goToLogin(reason);
    } else {
      // Fallback
      const path = reason ? `/login?reason=${reason}` : '/login';
      window.location.href = path;
    }
  }
}

// Export singleton instance
export const navigationManager = new NavigationManager();