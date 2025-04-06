import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/emergency`;

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export interface EmergencyLocation {
  latitude: number;
  longitude: number;
}

export interface ServiceProvider {
  _id: string;
  name: string;
  type: string;
  rating: number;
  contact: {
    mobile: string;
    email: string;
  };
  location: {
    state: string;
    district: string;
    city: string;
  };
}

export const emergencyService = {
  // Save emergency request
  saveEmergency: async (latitude: number, longitude: number, userid: string) => {
    const response = await axios.post(`${API_URL}/save-emergency`, {
      latitude,
      longitude,
      userid
    });
    return response.data;
  },

  // Get emergency requests for service provider
  getEmergencyRequests: async () => {
    try {
      console.log('Fetching emergency requests...');
      const response = await axios.get(`${API_URL}/show-emergency`);
      console.log('Emergency requests response:', response.data);
      
      if (!response.data.data) {
        console.warn('No data field in response:', response.data);
      }
      
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error("Error fetching emergency requests:", error.response || error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch emergency requests"
      };
    }
  },

  // Get user's emergency requests
  getUserEmergencies: async () => {
    try {
      const response = await axios.get(`${API_URL}/user-emergencies`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, data: [] };
      }
      throw error;
    }
  },

  // Accept emergency request
  acceptEmergency: async (requestId: string) => {
    const response = await axios.post(`${API_URL}/accept-emergency`, {
      requestId
    });
    return response.data;
  },

  // Get accepted emergency requests
  getAcceptedEmergencies: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-accepted-emergency`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, data: [] }; // Return empty array if no requests found
      }
      throw error;
    }
  },

  // Mark emergency as done
  markEmergencyAsDone: async (requestId: string) => {
    const response = await axios.post(`${API_URL}/mark-as-done`, {
      requestId
    });
    return response.data;
  },

  // Get completed emergency requests
  getDoneEmergencies: async () => {
    try {
      const response = await axios.get(`${API_URL}/done-emergencies`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, data: [] }; // Return empty array if no requests found
      }
      throw error;
    }
  },

  deleteEmergency: async (requestId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-emergency/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting emergency:', error);
      throw error;
    }
  },
};

// export { emergencyService }; 