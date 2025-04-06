import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import RequestDetailsPopup from "@/components/RequestDetailsPopup";
import { Navigate } from "react-router-dom";
import { ServiceRequest, EmergencyRequest } from "@/types";

const MapView = () => {
  const { currentUser } = useAuth();
  const { 
    serviceRequests, 
    emergencyRequests, 
    acceptServiceRequest,
    acceptEmergencyRequest
  } = useData();
  
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role !== 'service_provider') {
    return <Navigate to="/dashboard" replace />;
  }
  
  const pendingServiceRequests = serviceRequests.filter(req => req.status === "pending");
  const pendingEmergencyRequests = emergencyRequests.filter(req => req.status === "pending");
  
  const handleAcceptRequest = async (id: string, isEmergency: boolean) => {
    try {
      if (isEmergency) {
        await acceptEmergencyRequest(id, currentUser._id);
      } else {
        await acceptServiceRequest(id, currentUser._id);
      }
      toast.success(`${isEmergency ? "Emergency" : "Service"} request accepted successfully!`);
      setSelectedRequest(null);
      setSelectedEmergency(null);
    } catch (error) {
      toast.error("Failed to accept request: " + (error as Error).message);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary-foreground">Map View</h1>
        <div className="flex items-center">
          <span className="text-primary-foreground mr-3">
            {pendingServiceRequests.length} pending requests
          </span>
          <Button variant="secondary" size="sm" disabled>
            Live Map
          </Button>
        </div>
      </div>
      
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-lg font-medium mb-4">Pending Requests</h2>
            
            {pendingEmergencyRequests.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-emergency font-medium">Emergency Requests</h3>
                {pendingEmergencyRequests.map(request => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-secondary border-emergency"
                    onClick={() => {
                      setSelectedEmergency(request);
                      setSelectedRequest(null);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-emergency animate-pulse-emergency">EMERGENCY</p>
                        <p className="text-sm">{request.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.user.location.city}, {request.user.location.state}
                        </p>
                      </div>
                      <p className="text-xs bg-emergency text-white px-2 py-1 rounded-full">
                        {new Date(request.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {pendingServiceRequests.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Service Requests</h3>
                {pendingServiceRequests.map(request => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-secondary"
                    onClick={() => {
                      setSelectedRequest(request);
                      setSelectedEmergency(null);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm">{request.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.vehical_info.type}: {request.vehical_info.name}
                        </p>
                      </div>
                      <p className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                        {new Date(request.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {pendingServiceRequests.length === 0 && pendingEmergencyRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending requests at this time.
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-gray-200 rounded-lg h-[60vh] p-4 flex flex-col justify-center items-center">
              <p className="text-lg text-gray-500">Map View</p>
              <p className="text-sm text-gray-400">
                Google Maps integration would be here in a real application
              </p>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  For this demo, please use the sidebar to select requests
                </p>
              </div>
            </div>
            
            {(selectedRequest || selectedEmergency) && (
              <div className="mt-4 border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">
                  {selectedEmergency ? (
                    <span className="text-emergency">Emergency Request Details</span>
                  ) : (
                    "Service Request Details"
                  )}
                </h3>
                
                {selectedRequest && (
                  <RequestDetailsPopup
                    request={selectedRequest}
                    isEmergency={false}
                    onAccept={() => handleAcceptRequest(selectedRequest.id, false)}
                  />
                )}
                
                {selectedEmergency && (
                  <RequestDetailsPopup
                    request={selectedEmergency}
                    isEmergency={true}
                    onAccept={() => handleAcceptRequest(selectedEmergency.id, true)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
