
import { ServiceProvider, User, ServiceRequest, EmergencyRequest, Payment, Review, RequestTitle } from '../types';

// Helper to generate IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Mock service providers
export const mockServiceProviders: ServiceProvider[] = [
  {
    id: generateId(),
    type: "Mechanical",
    name: "QuickFix Auto Services",
    contact: {
      mobile: ["9876543210", "9876543211"],
      email: "service@quickfix.com",
    },
    location: {
      state: "Karnataka",
      district: "Bangalore Urban",
      city: "Bangalore",
      address: "123 MG Road, Indiranagar"
    },
    latlon: {
      lat: 12.9716,
      lon: 77.5946
    },
    rating: 4.5,
    service_count: 120,
    email: "service@quickfix.com"
  },
  {
    id: generateId(),
    type: "Mechanical",
    name: "Highway Helpers",
    contact: {
      mobile: ["8765432109", "8765432108"],
      email: "help@highwayhelpers.com",
    },
    location: {
      state: "Maharashtra",
      district: "Mumbai",
      city: "Mumbai",
      address: "45 Marine Drive"
    },
    latlon: {
      lat: 19.0760,
      lon: 72.8777
    },
    rating: 4.2,
    service_count: 85,
    email: "help@highwayhelpers.com"
  },
  {
    id: generateId(),
    type: "Private hospital",
    name: "City Emergency Care",
    contact: {
      mobile: ["7654321098", "7654321097"],
      email: "care@cityemergency.com",
    },
    location: {
      state: "Delhi",
      district: "New Delhi",
      city: "New Delhi",
      address: "56 Connaught Place"
    },
    latlon: {
      lat: 28.6139,
      lon: 77.2090
    },
    rating: 4.7,
    service_count: 210,
    email: "care@cityemergency.com"
  },
  {
    id: generateId(),
    type: "Private hospital",
    name: "Life First Medical Center",
    contact: {
      mobile: ["6543210987", "6543210986"],
      email: "help@lifefirst.com",
    },
    location: {
      state: "Tamil Nadu",
      district: "Chennai",
      city: "Chennai",
      address: "78 Anna Nagar"
    },
    latlon: {
      lat: 13.0827,
      lon: 80.2707
    },
    rating: 4.3,
    service_count: 150,
    email: "help@lifefirst.com"
  },
  {
    id: generateId(),
    type: "Mechanical",
    name: "Roadside Rescue",
    contact: {
      mobile: ["5432109876", "5432109875"],
      email: "rescue@roadside.com",
    },
    location: {
      state: "Telangana",
      district: "Hyderabad",
      city: "Hyderabad",
      address: "90 Jubilee Hills"
    },
    latlon: {
      lat: 17.3850,
      lon: 78.4867
    },
    rating: 4.0,
    service_count: 95,
    email: "rescue@roadside.com"
  }
];

// Mock users
export const mockUsers: User[] = [
  {
    id: generateId(),
    email: "user1@example.com",
    name: "Rahul Sharma",
    mobile: "9988776655",
    location: {
      state: "Karnataka",
      district: "Bangalore Urban",
      city: "Bangalore"
    },
    latlon: {
      lat: 12.9716,
      lon: 77.5946
    },
    other_contact: ["8877665544", "7766554433"]
  },
  {
    id: generateId(),
    email: "user2@example.com",
    name: "Priya Patel",
    mobile: "8877665544",
    location: {
      state: "Maharashtra",
      district: "Mumbai",
      city: "Mumbai"
    },
    latlon: {
      lat: 19.0760,
      lon: 72.8777
    },
    other_contact: ["7766554433"]
  }
];

// Mock service requests
export const mockServiceRequests: ServiceRequest[] = [
  {
    id: generateId(),
    latlon: {
      lat: 12.9352,
      lon: 77.6245
    },
    title: "Flat-Tyre" as RequestTitle,
    describe_problem: "Left front tyre is flat and I don't have tools to change it",
    vehical_info: {
      type: "car",
      number: "KA 01 AB 1234",
      name: "Honda City"
    },
    status: "pending",
    user: mockUsers[0],
    service_provider: null,
    created_at: new Date(Date.now() - 30 * 60000) // 30 minutes ago
  },
  {
    id: generateId(),
    latlon: {
      lat: 19.1136,
      lon: 72.8697
    },
    title: "Battery-Jumpstart" as RequestTitle,
    describe_problem: "Car won't start, battery seems dead",
    vehical_info: {
      type: "car",
      number: "MH 02 CD 5678",
      name: "Maruti Swift"
    },
    status: "accepted",
    user: mockUsers[1],
    service_provider: mockServiceProviders[1],
    created_at: new Date(Date.now() - 60 * 60000) // 1 hour ago
  }
];

// Mock emergency requests
export const mockEmergencyRequests: EmergencyRequest[] = [
  {
    id: generateId(),
    latlon: {
      lat: 12.9426,
      lon: 77.6177
    },
    status: "pending",
    user: mockUsers[0],
    service_provider: null,
    created_at: new Date(Date.now() - 15 * 60000) // 15 minutes ago
  }
];

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: generateId(),
    userId: mockUsers[1].id,
    serviceProviderId: mockServiceProviders[1].id,
    advance: 250, // 5 kilometers * 50 per km
    requestId: mockServiceRequests[1].id,
    created_at: new Date(Date.now() - 55 * 60000), // 55 minutes ago
    status: "paid"
  }
];

// Mock reviews
export const mockReviews: Review[] = [
  {
    id: generateId(),
    userId: mockUsers[1].id,
    serviceProviderId: mockServiceProviders[1].id,
    requestId: mockServiceRequests[1].id,
    rating: 4,
    comment: "Quick response and professional service. Helped me get back on the road quickly.",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60000) // 30 days ago
  }
];

export const getRequestTitles = (): RequestTitle[] => [
  "Roadside Assistance Towing",
  "Flat-Tyre",
  "Battery-Jumpstart",
  "Starting Problem",
  "Key-Unlock-Assistance",
  "Fuel-Delivery",
  "Other"
];
