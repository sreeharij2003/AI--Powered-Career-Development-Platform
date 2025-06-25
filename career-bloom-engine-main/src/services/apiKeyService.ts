// Service to handle API key storage and retrieval

// Store API key in localStorage
export const storeApiKey = (key: string): void => {
  localStorage.setItem('linkedin-api-key', key);
};

// Get API key from localStorage
export const getApiKey = (): string | null => {
  return localStorage.getItem('linkedin-api-key');
};

// Remove API key from localStorage
export const removeApiKey = (): void => {
  localStorage.removeItem('linkedin-api-key');
};

// Check if API key exists
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

// Auto-initialize with a provided API key (useful if you want to set a default key)
export const initializeWithApiKey = (key: string): void => {
  if (!getApiKey() && key) {
    storeApiKey(key);
  }
}; 