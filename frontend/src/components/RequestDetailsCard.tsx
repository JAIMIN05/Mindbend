
import React, { useState } from "react";
import { ServiceRequest, EmergencyRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReviewForm from "./ReviewForm";

interface RequestDetailsCardProps {
  request: ServiceRequest | EmergencyRequest;
  isEmergency: boolean;
  onClose: () => void;
}

const RequestDetailsCard: React.FC<RequestDetailsCardProps> = ({ request, isEmergency, onClose }) => {
  const { currentUser } = useAuth();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const serviceRequest = !isEmergency ? request as ServiceRequest : null;
  
  return (
    <div className="space-y-4">
      <div>
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
      </div>
      
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
      
      {request.service_provider && (
        <div className="border rounded-lg p-4 space-y-2">
          <p className="font-medium">Service Provider:</p>
          <p>{request.service_provider.name}</p>
          <p className="text-sm">Type: {request.service_provider.type}</p>
          <p className="text-sm">
            Rating: {request.service_provider.rating} / 5 
            ({request.service_provider.service_count} services)
          </p>
          <div className="space-y-1">
            <p className="text-sm font-medium">Contact:</p>
            <p className="text-sm">
              {request.service_provider.contact.mobile.join(", ")}
            </p>
            <p className="text-sm">{request.service_provider.contact.email}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        {currentUser?.userType === 'user' && request.status === "accepted" && (
          <Button variant="outline" onClick={() => setShowReviewDialog(true)}>
            Leave Review
          </Button>
        )}
        
        {currentUser?.userType === 'user' && request.status === "accepted" && (
          <Button onClick={onClose}>
            Close Request
          </Button>
        )}
        
        {currentUser?.userType === 'user' && request.status === "pending" && (
          <Button onClick={onClose} variant="destructive">
            Cancel Request
          </Button>
        )}
      </div>
      
      {/* Review Dialog */}
      {showReviewDialog && request.service_provider && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Leave a Review</DialogTitle>
            </DialogHeader>
            <ReviewForm 
              serviceProviderId={request.service_provider.id} 
              requestId={request.id}
              onReviewSubmitted={() => {
                setShowReviewDialog(false);
                onClose();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RequestDetailsCard;
