// Get authentication token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Set authentication token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

// Remove authentication token from localStorage
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Get user data from localStorage
export function getUserData(): any | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Set user data in localStorage
export function setUserData(userData: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userData', JSON.stringify(userData));
}

// Remove user data from localStorage
export function removeUserData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userData');
}

// Clear all authentication data
export function clearAuth(): void {
  removeAuthToken();
  removeUserData();
}
