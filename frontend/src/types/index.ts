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

export interface User {
  id: string;
  _id?: string;
  name: string;
  mobile: string;
  email?: string;
  location: {
    city: string;
    state: string;
    district?: string;
    address?: string;
    coordinates?: [number, number];
  };
  latlon?: {
    latitude: number;
    longitude: number;
  };
  guardian_emails?: string[];
  other_contact?: string[];
}

export interface ServiceRequest {
  id: string;
  title: string;
  describe_problem: string;
  vehical_info: {
    type: string;
    name: string;
    number: string;
  };
  status: 'pending' | 'accepted' | 'closed' | 'deleted_by_user';
  created_at: Date;
  user: User;
  service_provider?: ServiceProvider;
}

export interface EmergencyRequest {
  _id?: string;
  id: string;
  status: 'pending' | 'accepted' | 'closed' | 'deleted_by_user';
  user: User;
  created_at: Date;
  latlon: {
    type: 'Point';
    coordinates: [number, number];
  };
  service_provider?: ServiceProvider;
  isEmergency?: boolean;
}

export type RequestStatus = "pending" | "accepted" | "closed";

export type RequestTitle = 
  | "Towing" 
  | "Flat-Tyre" 
  | "Battery-Jumpstart" 
  | "Starting Problem" 
  | "Key-Unlock-Assistance" 
  | "Fuel-Delivery" 
  | "Other";

export interface Payment {
  id: string;
  userId: string;
  serviceProviderId: string;
  advance: number;
  requestId: string;
  created_at: Date;
  status: "pending" | "paid" | "failed";
}

export interface Review {
  id: string;
  userId: string;
  serviceProviderId: string;
  requestId: string;
  rating: number;
  comment: string;
  created_at: Date;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin";
  password?: string; // Optional since we don't want to expose it in frontend
}

// Update the existing types to include admin
type AdminAuthUser = Admin & {
  role: 'admin';
};

// Add this to your existing types
export type AuthUserType = 'user' | 'service_provider' | 'admin';
