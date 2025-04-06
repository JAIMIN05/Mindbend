
import React from "react";
import { ServiceRequest, EmergencyRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RequestDetailsPopupProps {
  request: ServiceRequest | EmergencyRequest;
  isEmergency: boolean;
  onAccept: () => void;
}

const RequestDetailsPopup: React.FC<RequestDetailsPopupProps> = ({ request, isEmergency, onAccept }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const serviceRequest = !isEmergency ? request as ServiceRequest : null;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-medium ${isEmergency ? "text-emergency" : ""}`}>
          {isEmergency ? "Emergency Request" : (serviceRequest?.title || "")}
        </h3>
        <Badge 
          className={
            request.status === "pending" 
              ? "bg-yellow-500" 
              : request.status === "accepted" 
              ? "bg-green-500" 
              : "bg-gray-500"
          }
        >
          {request.status}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Created: {formatDate(request.created_at)}
      </p>
      
      {serviceRequest && (
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Problem Description:</p>
            <p className="text-sm">{serviceRequest.describe_problem}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Vehicle Information:</p>
            <p className="text-sm">
              {serviceRequest.vehical_info.type.charAt(0).toUpperCase() + serviceRequest.vehical_info.type.slice(1)}: {serviceRequest.vehical_info.name}
            </p>
            <p className="text-sm">
              Vehicle Number: {serviceRequest.vehical_info.number}
            </p>
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-4 space-y-2">
        <p className="font-medium">User Details:</p>
        <p>{request.user.name}</p>
        <p className="text-sm">Phone: {request.user.mobile}</p>
        <p className="text-sm">
          Location: {request.user.location.city}, {request.user.location.state}
        </p>
      </div>
      
      <Button className="w-full" onClick={onAccept}>
        {isEmergency ? "Accept Emergency Request" : "Accept Request"}
      </Button>
    </div>
  );
};

export default RequestDetailsPopup;
