import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const getAPIBaseURL = () => {
  if (__DEV__) {
    return Platform.OS === "android"
      ? "http://10.0.2.2:5000/api"
      : "http://localhost:5000/api";
  }

  return "https://moofu-api.onrender.com/api";
};

const API_BASE_URL = getAPIBaseURL();
const TOKEN_STORAGE_KEY = "moofu_auth_token";

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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
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
      const body = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw {
          status: response.status,
          message: body?.message || body?.error || "An error occurred",
          data: body,
        } as ApiError;
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

export const authAPI = {
  requestOTP: async (phoneNumber: string) => {
    return api.post<{ message: string; expiresAt?: string }>("/auth/otp/request", {
      phoneNumber,
    });
  },

  verifyOTP: async (phoneNumber: string, otp: string) => {
    const response = await api.post<{
      user: any;
      token: string;
    }>("/auth/otp/verify", {
      phoneNumber,
      otp,
    });

    if (response.token) {
      await api.saveToken(response.token);
    }

    return {
      user: {
        id: response.user.id,
        name: response.user.name,
        phone: response.user.phoneNumber,
        location: response.user.location,
        vehicleNumber: response.user.vehicleNumber,
      },
      token: response.token,
    };
  },

  getProfile: async () => {
    const user = await api.get<any>("/auth/me");
    return {
      id: user.id,
      name: user.name,
      phone: user.phoneNumber,
      location: user.location,
      vehicleNumber: user.vehicleNumber,
    };
  },

  updateProfile: async (updates: {
    name?: string;
    location?: string;
    vehicleNumber?: string;
  }) => {
    const user = await api.put<any>("/auth/profile", updates);
    return {
      id: user.id,
      name: user.name,
      phone: user.phoneNumber,
      location: user.location,
      vehicleNumber: user.vehicleNumber,
    };
  },

  logout: async () => {
    await api.clearToken();
  },
};

export const parkingAPI = {
  getAllParkings: async () => {
    return api.get<{ spaces: any[] }>("/parking");
  },

  getParkingById: async (id: string) => {
    return api.get<{ space: any }>(`/parking/${id}`);
  },

  searchByArea: async (area: string) => {
    return api.get<{ spaces: any[] }>(`/parking/search/area?area=${encodeURIComponent(area)}`);
  },
};

export const bookingAPI = {
  createBooking: async (bookingData: {
    parkingId: string;
    vehicleType: string;
    vehicleNumber: string;
    startTime: string;
    endTime: string;
    paymentMethodId: string;
  }) => {
    return api.post<any>("/booking", bookingData);
  },

  getBookings: async () => {
    return api.get<{ bookings: any[] }>("/booking/history/user");
  },

  getBookingById: async (id: string) => {
    return api.get<any>(`/booking/${id}`);
  },

  cancelBooking: async (id: string) => {
    return api.delete<any>(`/booking/${id}`);
  },
};

export const slotAPI = {
  getAvailability: async (stationId: string, params: {
    vehicleType?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.vehicleType) query.set("vehicleType", params.vehicleType);
    if (params.startTime) query.set("startTime", params.startTime);
    if (params.endTime) query.set("endTime", params.endTime);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return api.get<any>(`/slots/${stationId}/availability${suffix}`);
  },
};

export default api;
