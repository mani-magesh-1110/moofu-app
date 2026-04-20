import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { mockParkingLots } from "../data/mockData";

// Configure Base URL - Update this based on your backend deployment
// For local development on Android emulator: http://10.0.2.2:5000/api
// For local development on iOS simulator: http://localhost:5000/api  
// For production: https://your-api.com/api
const getAPIBaseURL = () => {
  // For production, set MOOFU_API_URL environment variable
  if (__DEV__) {
    // Development: Use different URL for Android emulator vs iOS simulator
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000/api";
    } else {
      return "http://localhost:5000/api";
    }
  }
  // Production - Update this with your production API URL
  return "https://moofu-api.onrender.com/api";
};

const API_BASE_URL = getAPIBaseURL();
const TOKEN_STORAGE_KEY = "moofu_auth_token";
const USE_MOCK_DATA = true; // Set to true for development without backend

type ApiError = {
  status: number;
  message: string;
  data?: any;
};

class ApiClient {
  private baseURL: string;
  private tokenKey: string;

  constructor(baseURL: string, tokenKey: string) {
    this.baseURL = baseURL;
    this.tokenKey = tokenKey;
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get("content-type");
      let body: any;

      if (contentType?.includes("application/json")) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          body?.message || body?.error || "An error occurred";
        const error: ApiError = {
          status: response.status,
          message: errorMessage,
          data: body,
        };
        throw error;
      }

      return { data: body.data, status: response.status };
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        message: error.message || "Network error",
        data: error,
      } as ApiError;
    }
  }

  public async get<T>(endpoint: string): Promise<T> {
    const { data } = await this.request<T>(endpoint, { method: "GET" });
    return data;
  }

  public async post<T>(
    endpoint: string,
    body?: Record<string, any>
  ): Promise<T> {
    const { data } = await this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    return data;
  }

  public async put<T>(
    endpoint: string,
    body?: Record<string, any>
  ): Promise<T> {
    const { data } = await this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
    return data;
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const { data } = await this.request<T>(endpoint, { method: "DELETE" });
    return data;
  }

  public async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.tokenKey, token);
  }

  public async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(this.tokenKey);
  }
}

const api = new ApiClient(API_BASE_URL, TOKEN_STORAGE_KEY);

// ============================================================================
// AUTH API CALLS
// ============================================================================

export const authAPI = {
  /**
   * Request OTP for phone number
   * POST /auth/otp/request
   */
  requestOTP: async (phoneNumber: string) => {
    if (USE_MOCK_DATA) {
      // Mock response for development
      return { message: "OTP sent to +91" + phoneNumber };
    }
    return api.post<{ message: string }>("/auth/otp/request", {
      phoneNumber,
    });
  },

  /**
   * Verify OTP and get authentication token
   * POST /auth/otp/verify
   * Response: { user: User, token: string }
   */
  verifyOTP: async (phoneNumber: string, otp: string) => {
    if (USE_MOCK_DATA) {
      // Mock response for development
      const mockToken = "mock_token_" + Math.random().toString(36).substr(2, 9);
      await api.saveToken(mockToken);
      return {
        user: {
          id: "user_" + phoneNumber,
          name: "MOOFU User",
          phone: phoneNumber,
          location: "New Delhi",
          vehicleNumber: "DL01AB1234",
        },
        token: mockToken,
      };
    }
    
    const response = await api.post<{
      user: any;
      token: string;
    }>("/auth/otp/verify", {
      phoneNumber,
      otp,
    });
    // Save token to storage for future requests
    if (response.token) {
      await api.saveToken(response.token);
    }
    // Map backend response to frontend User model
    return {
      user: {
        id: response.user.id,
        name: response.user.name,
        phone: response.user.phoneNumber, // Map phoneNumber to phone
        location: response.user.location,
        vehicleNumber: response.user.vehicleNumber,
      },
      token: response.token,
    };
  },

  /**
   * Get current authenticated user profile
   * GET /auth/me
   * Requires: Authorization header with JWT token
   */
  getProfile: async () => {
    if (USE_MOCK_DATA) {
      return {
        id: "user_1234567890",
        name: "MOOFU User",
        phone: "1234567890",
        location: "New Delhi",
        vehicleNumber: "DL01AB1234",
      };
    }
    
    const user = await api.get<any>("/auth/me");
    // Map backend response to frontend User model
    return {
      id: user.id,
      name: user.name,
      phone: user.phoneNumber, // Map phoneNumber to phone
      location: user.location,
      vehicleNumber: user.vehicleNumber,
    };
  },

  /**
   * Update user profile
   * PUT /auth/profile
   * Requires: Authorization header with JWT token
   */
  updateProfile: async (updates: {
    name?: string;
    location?: string;
    vehicleNumber?: string;
  }) => {
    if (USE_MOCK_DATA) {
      // Mock response - just return the updated data
      return {
        id: "user_1234567890",
        name: updates.name || "MOOFU User",
        phone: "1234567890",
        location: updates.location || "New Delhi",
        vehicleNumber: updates.vehicleNumber || "DL01AB1234",
      };
    }
    
    const user = await api.put<any>("/auth/profile", updates);
    // Map backend response to frontend User model
    return {
      id: user.id,
      name: user.name,
      phone: user.phoneNumber, // Map phoneNumber to phone
      location: user.location,
      vehicleNumber: user.vehicleNumber,
    };
  },

  /**
   * Logout - clear token from storage
   */
  logout: async () => {
    await api.clearToken();
  },
};

// ============================================================================
// PARKING API CALLS
// ============================================================================

export const parkingAPI = {
  /**
   * Get all parking spaces
   * GET /parking
   * Response: { spaces: ParkingSpace[] }
   */
  getAllParkings: async () => {
    if (USE_MOCK_DATA) {
      // Return mock parking lots
      return { spaces: mockParkingLots };
    }
    return api.get<{ spaces: any[] }>("/parking");
  },

  /**
   * Get parking space by ID
   * GET /parking/:id
   * Response: { space: ParkingSpace }
   */
  getParkingById: async (id: string) => {
    if (USE_MOCK_DATA) {
      const space = mockParkingLots.find(p => p.id === id);
      return { space: space || mockParkingLots[0] };
    }
    return api.get<{ space: any }>(`/parking/${id}`);
  },

  /**
   * Search parking spaces by area
   * GET /parking/search/area
   * Response: { spaces: ParkingSpace[] }
   */
  searchByArea: async (area: string) => {
    if (USE_MOCK_DATA) {
      const spaces = mockParkingLots.filter(p => 
        p.area.toLowerCase().includes(area.toLowerCase())
      );
      return { spaces: spaces.length > 0 ? spaces : mockParkingLots };
    }
    return api.get<{ spaces: any[] }>(`/parking/search/area?area=${area}`);
  },
};

// ============================================================================
// BOOKING API CALLS
// ============================================================================

export const bookingAPI = {
  /**
   * Create a new booking
   * POST /booking
   * Requires: Authorization header with JWT token
   */
  createBooking: async (bookingData: {
    parkingId: string;
    vehicleType: string;
    vehicleNumber: string;
    arrivalDateISO: string | null;
    arrivalTimeLabel: string | null;
    departureDateISO: string | null;
    departureTimeLabel: string | null;
    durationHours: number;
    selectedMonthlyPlanId: string | null;
    estimatedSubtotal: number;
    convenienceFee: number;
    totalAmount: number;
    paymentMethodId: string;
  }) => {
    if (USE_MOCK_DATA) {
      // Mock response
      const booking = {
        id: "booking_" + Math.random().toString(36).substr(2, 9),
        tokenNo: "TOK" + Math.floor(Math.random() * 10000),
        ...bookingData,
        createdAtISO: new Date().toISOString(),
      };
      return booking;
    }
    return api.post<any>("/booking", bookingData);
  },

  /**
   * Get user's booking history
   * GET /booking/history/user
   * Requires: Authorization header with JWT token
   * Response: { bookings: Booking[] }
   */
  getBookings: async () => {
    if (USE_MOCK_DATA) {
      // Return empty bookings for mock mode
      return { bookings: [] };
    }
    return api.get<{ bookings: any[] }>("/booking/history/user");
  },

  /**
   * Get booking by ID
   * GET /booking/:id
   * Requires: Authorization header with JWT token
   */
  getBookingById: async (id: string) => {
    if (USE_MOCK_DATA) {
      // Mock response
      return {
        id: id,
        tokenNo: "TOK123",
        parkingId: "lot_1",
        vehicleType: "car",
        vehicleNumber: "DL01AB1234",
        arrivalDateISO: new Date().toISOString().split('T')[0],
        arrivalTimeLabel: "10:00 AM",
        departureDateISO: new Date().toISOString().split('T')[0],
        departureTimeLabel: "02:00 PM",
        durationHours: 4,
        selectedMonthlyPlanId: null,
        estimatedSubtotal: 200,
        convenienceFee: 10,
        totalAmount: 210,
        paymentMethodId: "google_pay",
        createdAtISO: new Date().toISOString(),
      };
    }
    return api.get<any>(`/booking/${id}`);
  },

  /**
   * Cancel a booking
   * DELETE /booking/:id
   * Requires: Authorization header with JWT token
   */
  cancelBooking: async (id: string) => {
    if (USE_MOCK_DATA) {
      // Mock response
      return { message: "Booking cancelled successfully" };
    }
    return api.delete<any>(`/booking/${id}`);
  },
};

export default api;
