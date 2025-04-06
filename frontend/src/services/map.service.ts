import axios from 'axios';
import { EmergencyRequest } from '@/types';

const API_URL = `${import.meta.env.VITE_API_URL}`;

export interface MapLocation {
  serviceProvider: {
    location: {
      type: string;
      coordinates: [number, number];
    };
    name: string;
  };
  pendingRequests: EmergencyRequest[];
  acceptedRequests: EmergencyRequest[];
}

export const mapService = {
  getEmergencyLocations: async (): Promise<MapLocation> => {
    try {
      const response = await axios.get(`${API_URL}/emergency/map-locations`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch map locations');
    } catch (error) {
      console.error('Error fetching map locations:', error);
      throw error;
    }
  }
}; 