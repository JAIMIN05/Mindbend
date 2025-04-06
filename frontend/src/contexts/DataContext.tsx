import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceRequest, EmergencyRequest, Payment, Review, ServiceProvider, User, RequestStatus, RequestTitle } from '../types';
import { mockServiceRequests, mockEmergencyRequests, mockPayments, mockReviews, mockServiceProviders } from '../lib/mockData';
import { toast } from "@/lib/toast";
import { useAuth } from './AuthContext';

interface DataContextType {
  serviceRequests: ServiceRequest[];
  emergencyRequests: EmergencyRequest[];
  payments: Payment[];
  reviews: Review[];
  serviceProviders: ServiceProvider[];
  
  // Service request actions
  createServiceRequest: (requestData: Partial<ServiceRequest>) => Promise<ServiceRequest>;
  updateServiceRequestStatus: (id: string, status: RequestStatus) => Promise<void>;
  deleteServiceRequest: (id: string) => Promise<void>;
  acceptServiceRequest: (requestId: string, providerId: string) => Promise<void>;
  
  // Emergency request actions
  createEmergencyRequest: (requestData: Partial<EmergencyRequest>) => Promise<EmergencyRequest>;
  updateEmergencyRequestStatus: (id: string, status: RequestStatus) => Promise<void>;
  deleteEmergencyRequest: (id: string) => Promise<void>;
  acceptEmergencyRequest: (requestId: string, providerId: string) => Promise<void>;
  
  // Payment actions
  createPayment: (paymentData: Partial<Payment>) => Promise<Payment>;
  updatePaymentStatus: (id: string, status: "pending" | "paid" | "failed") => Promise<void>;
  
  // Review actions
  createReview: (reviewData: Partial<Review>) => Promise<Review>;
  
  // Helper methods
  getRequestById: (id: string) => ServiceRequest | undefined;
  getEmergencyRequestById: (id: string) => EmergencyRequest | undefined;
  getUserRequests: () => ServiceRequest[];
  getUserEmergencyRequests: () => EmergencyRequest[];
  getServiceProviderRequests: () => ServiceRequest[];
  getServiceProviderEmergencyRequests: () => EmergencyRequest[];
  getServiceProviderById: (id: string) => ServiceProvider | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>(mockEmergencyRequests);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(mockServiceProviders);

  // Service request actions
  const createServiceRequest = async (requestData: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    try {
      if (!currentUser || currentUser.role !== 'user') {
        throw new Error("Only users can create service requests");
      }
      
      if (!requestData.latlon || !requestData.title || !requestData.describe_problem || !requestData.vehical_info) {
        throw new Error("Missing required fields");
      }
      
      const newRequest: ServiceRequest = {
        id: Math.random().toString(36).substring(2, 15),
        title: requestData.title as RequestTitle,
        describe_problem: requestData.describe_problem,
        vehical_info: requestData.vehical_info,
        status: "pending",
        user: currentUser as User,
        service_provider: null,
        created_at: new Date()
      };
      
      setServiceRequests([...serviceRequests, newRequest]);
      toast.success("Service request created successfully!");
      return newRequest;
    } catch (error) {
      toast.error("Failed to create service request: " + (error as Error).message);
      throw error;
    }
  };
  
  const updateServiceRequestStatus = async (id: string, status: RequestStatus): Promise<void> => {
    try {
      const index = serviceRequests.findIndex(req => req.id === id);
      if (index === -1) {
        throw new Error("Request not found");
      }
      
      const updatedRequests = [...serviceRequests];
      updatedRequests[index] = { ...updatedRequests[index], status };
      setServiceRequests(updatedRequests);
      
      toast.success("Request status updated successfully!");
    } catch (error) {
      toast.error("Failed to update request status: " + (error as Error).message);
      throw error;
    }
  };
  
  const deleteServiceRequest = async (id: string): Promise<void> => {
    try {
      const updatedRequests = serviceRequests.filter(req => req.id !== id);
      setServiceRequests(updatedRequests);
      toast.success("Request deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete request: " + (error as Error).message);
      throw error;
    }
  };
  
  const acceptServiceRequest = async (requestId: string, providerId: string): Promise<void> => {
    try {
      const provider = serviceProviders.find(p => p._id === providerId);
      if (!provider) {
        throw new Error("Service provider not found");
      }
      
      const requestIndex = serviceRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) {
        throw new Error("Request not found");
      }
      
      const updatedRequests = [...serviceRequests];
      updatedRequests[requestIndex] = { 
        ...updatedRequests[requestIndex], 
        service_provider: provider,
        status: "accepted" 
      };
      
      setServiceRequests(updatedRequests);
      
      // Calculate advance payment
      const request = updatedRequests[requestIndex];
      const distance = calculateDistance(
        request.latlon.coordinates[0], 
        request.latlon.coordinates[1], 
        provider.location.coordinates?.[0] || 0, 
        provider.location.coordinates?.[1] || 0
      );
      
      const advanceAmount = Math.round(distance * 50); // 50 per kilometer
      
      // Create payment record
      const newPayment: Payment = {
        id: Math.random().toString(36).substring(2, 15),
        userId: request.user.id,
        serviceProviderId: provider._id,
        advance: advanceAmount,
        requestId: request.id,
        created_at: new Date(),
        status: "pending"
      };
      
      setPayments([...payments, newPayment]);
      toast.success("Request accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept request: " + (error as Error).message);
      throw error;
    }
  };
  
  // Emergency request actions
  const createEmergencyRequest = async (requestData: Partial<EmergencyRequest>): Promise<EmergencyRequest> => {
    try {
      if (!currentUser || currentUser.role !== 'user') {
        throw new Error("Only users can create emergency requests");
      }
      
      if (!requestData.latlon) {
        throw new Error("Missing location information");
      }
      
      const newRequest: EmergencyRequest = {
        id: Math.random().toString(36).substring(2, 15),
        latlon: requestData.latlon,
        status: "pending",
        user: currentUser as User,
        service_provider: null,
        created_at: new Date()
      };
      
      setEmergencyRequests([...emergencyRequests, newRequest]);
      toast.success("Emergency request created successfully!");
      return newRequest;
    } catch (error) {
      toast.error("Failed to create emergency request: " + (error as Error).message);
      throw error;
    }
  };
  
  const updateEmergencyRequestStatus = async (id: string, status: RequestStatus): Promise<void> => {
    try {
      const index = emergencyRequests.findIndex(req => req.id === id);
      if (index === -1) {
        throw new Error("Emergency request not found");
      }
      
      const updatedRequests = [...emergencyRequests];
      updatedRequests[index] = { ...updatedRequests[index], status };
      setEmergencyRequests(updatedRequests);
      
      toast.success("Emergency request status updated successfully!");
    } catch (error) {
      toast.error("Failed to update emergency request status: " + (error as Error).message);
      throw error;
    }
  };
  
  const deleteEmergencyRequest = async (id: string): Promise<void> => {
    try {
      const updatedRequests = emergencyRequests.filter(req => req.id !== id);
      setEmergencyRequests(updatedRequests);
      toast.success("Emergency request deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete emergency request: " + (error as Error).message);
      throw error;
    }
  };
  
  const acceptEmergencyRequest = async (requestId: string, providerId: string): Promise<void> => {
    try {
      const provider = serviceProviders.find(p => p._id === providerId);
      if (!provider) {
        throw new Error("Service provider not found");
      }
      
      const requestIndex = emergencyRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) {
        throw new Error("Emergency request not found");
      }
      
      const updatedRequests = [...emergencyRequests];
      updatedRequests[requestIndex] = { 
        ...updatedRequests[requestIndex], 
        service_provider: provider,
        status: "accepted" 
      };
      
      setEmergencyRequests(updatedRequests);
      
      // Calculate advance payment
      const request = updatedRequests[requestIndex];
      const distance = calculateDistance(
        request.latlon.coordinates[0], 
        request.latlon.coordinates[1], 
        provider.location.coordinates?.[0] || 0, 
        provider.location.coordinates?.[1] || 0
      );
      
      const advanceAmount = Math.round(distance * 50); // 50 per kilometer
      
      // Create payment record
      const newPayment: Payment = {
        id: Math.random().toString(36).substring(2, 15),
        userId: request.user.id,
        serviceProviderId: provider._id,
        advance: advanceAmount,
        requestId: request.id,
        created_at: new Date(),
        status: "pending"
      };
      
      setPayments([...payments, newPayment]);
      toast.success("Emergency request accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept emergency request: " + (error as Error).message);
      throw error;
    }
  };
  
  // Payment actions
  const createPayment = async (paymentData: Partial<Payment>): Promise<Payment> => {
    try {
      if (!paymentData.userId || !paymentData.serviceProviderId || !paymentData.advance || !paymentData.requestId) {
        throw new Error("Missing required payment information");
      }
      
      const newPayment: Payment = {
        id: Math.random().toString(36).substring(2, 15),
        userId: paymentData.userId,
        serviceProviderId: paymentData.serviceProviderId,
        advance: paymentData.advance,
        requestId: paymentData.requestId,
        created_at: new Date(),
        status: "pending"
      };
      
      setPayments([...payments, newPayment]);
      toast.success("Payment created successfully!");
      return newPayment;
    } catch (error) {
      toast.error("Failed to create payment: " + (error as Error).message);
      throw error;
    }
  };
  
  const updatePaymentStatus = async (id: string, status: "pending" | "paid" | "failed"): Promise<void> => {
    try {
      const index = payments.findIndex(payment => payment.id === id);
      if (index === -1) {
        throw new Error("Payment not found");
      }
      
      const updatedPayments = [...payments];
      updatedPayments[index] = { ...updatedPayments[index], status };
      setPayments(updatedPayments);
      
      // If payment is now paid, update the corresponding request status to accepted
      if (status === "paid") {
        const payment = updatedPayments[index];
        
        // Check service requests
        const serviceRequestIndex = serviceRequests.findIndex(req => req.id === payment.requestId);
        if (serviceRequestIndex !== -1) {
          const updatedRequests = [...serviceRequests];
          updatedRequests[serviceRequestIndex] = { 
            ...updatedRequests[serviceRequestIndex], 
            status: "accepted" 
          };
          setServiceRequests(updatedRequests);
        }
        
        // Check emergency requests
        const emergencyRequestIndex = emergencyRequests.findIndex(req => req.id === payment.requestId);
        if (emergencyRequestIndex !== -1) {
          const updatedRequests = [...emergencyRequests];
          updatedRequests[emergencyRequestIndex] = { 
            ...updatedRequests[emergencyRequestIndex], 
            status: "accepted" 
          };
          setEmergencyRequests(updatedRequests);
        }
      }
      
      toast.success("Payment status updated successfully!");
    } catch (error) {
      toast.error("Failed to update payment status: " + (error as Error).message);
      throw error;
    }
  };
  
  // Review actions
  const createReview = async (reviewData: Partial<Review>): Promise<Review> => {
    try {
      if (!currentUser || currentUser.role !== 'user') {
        throw new Error("Only users can create reviews");
      }
      
      if (!reviewData.serviceProviderId || !reviewData.requestId || !reviewData.rating) {
        throw new Error("Missing required review information");
      }
      
      const newReview: Review = {
        id: Math.random().toString(36).substring(2, 15),
        userId: currentUser.id,
        serviceProviderId: reviewData.serviceProviderId,
        requestId: reviewData.requestId,
        rating: reviewData.rating,
        comment: reviewData.comment || "",
        created_at: new Date()
      };
      
      setReviews([...reviews, newReview]);
      
      // Update service provider rating
      const provider = serviceProviders.find(p => p._id === reviewData.serviceProviderId);
      if (provider) {
        const providerReviews = [...reviews, newReview].filter(r => r.serviceProviderId === provider._id);
        const totalRating = providerReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = totalRating / providerReviews.length;
        
        const updatedProviders = serviceProviders.map(p => 
          p._id === provider._id ? { ...p, rating: parseFloat(newRating.toFixed(1)), service_count: p.service_count + 1 } : p
        );
        
        setServiceProviders(updatedProviders);
      }
      
      toast.success("Review submitted successfully!");
      return newReview;
    } catch (error) {
      toast.error("Failed to submit review: " + (error as Error).message);
      throw error;
    }
  };
  
  // Helper methods
  const getRequestById = (id: string) => serviceRequests.find(req => req.id === id);
  
  const getEmergencyRequestById = (id: string) => emergencyRequests.find(req => req.id === id);
  
  const getUserRequests = () => {
    if (!currentUser) return [];
    return serviceRequests.filter(req => req.user.id === currentUser.id);
  };
  
  const getUserEmergencyRequests = () => {
    if (!currentUser) return [];
    return emergencyRequests.filter(req => req.user.id === currentUser.id);
  };
  
  const getServiceProviderRequests = () => {
    if (!currentUser || currentUser.role !== 'service_provider') return [];
    return serviceRequests.filter(req => 
      req.service_provider?._id === currentUser._id || req.status === "pending"
    );
  };
  
  const getServiceProviderEmergencyRequests = () => {
    if (!currentUser || currentUser.role !== 'service_provider') return [];
    return emergencyRequests.filter(req => 
      req.service_provider?._id === currentUser._id || req.status === "pending"
    );
  };
  
  const getServiceProviderById = (id: string) => serviceProviders.find(provider => provider._id === id);

  // Helper function to calculate distance between two lat/lon points in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  return (
    <DataContext.Provider value={{
      serviceRequests,
      emergencyRequests,
      payments,
      reviews,
      serviceProviders,
      
      createServiceRequest,
      updateServiceRequestStatus,
      deleteServiceRequest,
      acceptServiceRequest,
      
      createEmergencyRequest,
      updateEmergencyRequestStatus,
      deleteEmergencyRequest,
      acceptEmergencyRequest,
      
      createPayment,
      updatePaymentStatus,
      
      createReview,
      
      getRequestById,
      getEmergencyRequestById,
      getUserRequests,
      getUserEmergencyRequests,
      getServiceProviderRequests,
      getServiceProviderEmergencyRequests,
      getServiceProviderById
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
