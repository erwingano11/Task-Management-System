// API Configuration and health check
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

console.log("API Base URL:", API_BASE_URL);

export const apiConfig = {
  baseURL: API_BASE_URL,
};

// Test API connection
export async function testApiConnection() {
  try {
    // Use proxy route for health check
    const response = await fetch("/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Health check failed:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("✅ API Connection Healthy:", data);
    return true;
  } catch (error) {
    console.error("❌ API Connection Error:", error.message);
    console.error(
      "Make sure the backend server is running on http://localhost:5000",
    );
    return false;
  }
}

// Generic fetch wrapper with error handling
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API Call Failed [${endpoint}]:`, error.message);
    return { success: false, error: error.message };
  }
}
