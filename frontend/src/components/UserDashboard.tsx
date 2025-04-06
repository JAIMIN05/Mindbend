import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceRequest, EmergencyRequest } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateServiceRequest from "@/components/CreateServiceRequest";
import CreateEmergencyRequest from "@/components/CreateEmergencyRequest";
import RequestDetailsCard from "@/components/RequestDetailsCard";
import { AlertTriangle, Car, Clock, MapPin, Mail, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AIChatClient from "@/components/AIChatClient";
import ShowRequestCard from "./ShowRequestCard";
import { emergencyService } from "@/services/emergency.service";
import { toast } from "sonner";
import GuardianEmailsManager from "./GuardianEmailsManager";

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { getUserRequests, updateServiceRequestStatus } = useData();
  
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createEmergencyDialogOpen, setCreateEmergencyDialogOpen] = useState(false);
  const [showGuardianEmailsDialog, setShowGuardianEmailsDialog] = useState(false);
  
  // Get user requests
  const requests = getUserRequests();

  useEffect(() => {
    fetchEmergencyRequests();
  }, []);

  const fetchEmergencyRequests = async () => {
    try {
      setLoading(true);
      const response = await emergencyService.getUserEmergencies();
      if (response.success) {
        setEmergencyRequests(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching emergency requests:", error);
      toast.error("Failed to fetch emergency requests");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const handleCloseRequest = async (id: string, isEmergency: boolean) => {
    try {
      if (isEmergency) {
        const response = await emergencyService.markEmergencyAsDone(id);
        if (response.success) {
          toast.success("Emergency request marked as resolved");
          fetchEmergencyRequests(); // Refresh the list
        }
      } else {
        await updateServiceRequestStatus(id, "closed");
      }
    } catch (error) {
      console.error("Error closing request:", error);
      toast.error("Failed to update request status");
    }
  };
  
  const handleDeleteEmergency = async (requestId: string, isAccepted: boolean) => {
    try {
      await emergencyService.deleteEmergency(requestId);
      toast.success(isAccepted ? "Request marked as deleted" : "Request cancelled successfully");
      fetchEmergencyRequests(); // Refresh the list
    } catch (error) {
      console.error("Error deleting emergency:", error);
      toast.error("Failed to delete emergency request");
    }
  };
  
  const handleCreateEmergency = async (data: { latitude: number; longitude: number }) => {
    try {
      if (!currentUser) {
        toast.error("User not authenticated");
        return;
      }

      console.log("Current user object:", currentUser); // Debug log
      
      // Extract user ID, checking all possible properties
      let userId;
      if ('_id' in currentUser && currentUser._id) {
        userId = currentUser._id;
      } else if ('id' in currentUser && currentUser.id) {
        userId = currentUser.id;
      }

      if (!userId) {
        toast.error("User ID not found. Please log out and log in again.");
        return;
      }

      console.log("Using user ID for emergency request:", userId);
      
      const response = await emergencyService.saveEmergency(
        data.latitude,
        data.longitude,
        userId
      );

      if (response.success) {
        toast.success("Emergency request created successfully");
        setCreateEmergencyDialogOpen(false);
        fetchEmergencyRequests();
      } else {
        toast.error(response.message || "Failed to create emergency request");
      }
    } catch (error) {
      console.error("Error creating emergency request:", error);
      toast.error("Failed to create emergency request");
    }
  };
  
  // Count active requests
  const activeRequests = requests.filter(req => req.status !== "closed").length;
  const activeEmergencyRequests = emergencyRequests.filter(req => req.status !== "closed").length;
  
  // Get time of day for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome Header with Guardian Email Button */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{getGreeting()}, {currentUser?.name}!</h1>
            <p className="text-muted-foreground mt-1">Welcome to your roadside assistance dashboard</p>
          </div>
          
          <Dialog open={showGuardianEmailsDialog} onOpenChange={setShowGuardianEmailsDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" variant="outline">
                <Mail className="h-4 w-4" />
                Manage Guardian Emails
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Manage Guardian Emails</DialogTitle>
                <DialogDescription>
                  Add email addresses that will receive notifications in case of emergency
                </DialogDescription>
              </DialogHeader>
              <GuardianEmailsManager />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm hover:shadow transition-shadow duration-200">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Car className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Active Service Requests</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow duration-200">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <AlertTriangle className="h-6 w-6 text-emergency" />
                </div>
                <p className="text-2xl font-bold">{activeEmergencyRequests}</p>
                <p className="text-sm text-muted-foreground">Active Emergency Requests</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow duration-200">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-2xl font-bold">
                  {requests.filter(req => req.status === "closed").length + 
                   emergencyRequests.filter(req => req.status === "closed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed Requests</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Card className="md:w-1/4 shadow-sm hover:shadow transition-shadow duration-200">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-lg flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">New Service Request</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Service Request</DialogTitle>
                  <DialogDescription>
                    Fill in the details to request roadside assistance
                  </DialogDescription>
                </DialogHeader>
                <CreateServiceRequest />
              </DialogContent>
            </Dialog>
            
            <Dialog open={createEmergencyDialogOpen} onOpenChange={setCreateEmergencyDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Emergency Request</DialogTitle>
                  <DialogDescription>
                    Submit an emergency request for immediate assistance
                  </DialogDescription>
                </DialogHeader>
                <CreateEmergencyRequest onSubmit={handleCreateEmergency} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="active">Active Requests</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {requests.filter(req => req.status !== "closed").length === 0 ? (
            <Card>
              <ShowRequestCard />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests
                .filter(req => req.status !== "closed")
                .map(request => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
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
                      <CardDescription>{formatDate(request.created_at)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="line-clamp-2 text-sm">{request.describe_problem}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium flex items-center">
                          <Car className="h-4 w-4 mr-1" />
                          {request.vehical_info.type} - {request.vehical_info.name}
                        </p>
                        {request.service_provider && (
                          <p className="text-sm flex items-center text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {request.service_provider.name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        View Details
                      </Button> */}
                      
                      {request.status === "accepted" && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleCloseRequest(request.id, false)}
                        >
                          Mark as Closed
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              }
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="emergency" className="space-y-4">
          {emergencyRequests.filter(req => req.status !== "closed" && req.status !== "deleted_by_user").length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No active emergency requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyRequests
                .filter(req => req.status !== "closed" && req.status !== "deleted_by_user")
                .map(request => (
                  <Card key={request.id} className="overflow-hidden border-emergency">
                    <CardHeader className="pb-2 bg-red-50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-emergency flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Emergency
                        </CardTitle>
                        <Badge 
                          className={
                            request.status === "pending" 
                              ? "bg-emergency" 
                              : request.status === "accepted" 
                              ? "bg-green-500" 
                              : "bg-gray-500"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <CardDescription>{formatDate(request.created_at)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="text-sm">
                            {request.user.location.city}, {request.user.location.state}
                          </p>
                        </div>
                        
                        {request.service_provider && (
                          <div>
                            <p className="text-sm font-medium">Responder:</p>
                            <p className="text-sm">{request.service_provider.name}</p>
                            <p className="text-sm">
                              {request.service_provider.type} • {request.service_provider.rating}/5 ⭐
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4 gap-2">
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedEmergency(request)}
                      >
                        View Details
                      </Button> */}
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteEmergency(request._id || request.id, request.status === "accepted")}
                      >
                        {request.status === "pending" ? "Cancel Request" : "Delete Request"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              }
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {requests.filter(req => req.status === "closed").length === 0 && 
           emergencyRequests.filter(req => req.status === "closed").length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No request history</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Service requests history */}
              {requests
                .filter(req => req.status === "closed")
                .map(request => (
                  <Card key={request.id} className="overflow-hidden opacity-80">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge variant="outline">Closed</Badge>
                      </div>
                      <CardDescription>{formatDate(request.created_at)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="line-clamp-1 text-sm">{request.describe_problem}</p>
                      <div className="mt-2">
                        <p className="text-sm flex items-center">
                          <Car className="h-4 w-4 mr-1" />
                          {request.vehical_info.type} - {request.vehical_info.name}
                        </p>
                        {request.service_provider && (
                          <p className="text-sm text-muted-foreground">
                            Serviced by: {request.service_provider.name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedRequest(request)}
                      >
                        View Details
                      </Button> */}
                    </CardFooter>
                  </Card>
                ))
              }
              
              {/* Emergency requests history */}
              {emergencyRequests
                .filter(req => req.status === "closed")
                .map(request => (
                  <Card key={request.id} className="overflow-hidden opacity-80">
                    <CardHeader className="pb-2 bg-red-50/50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-emergency/70 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Emergency
                        </CardTitle>
                        <Badge variant="outline">Closed</Badge>
                      </div>
                      <CardDescription>{formatDate(request.created_at)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="text-sm">
                            {request.user.location.city}, {request.user.location.state}
                          </p>
                        </div>
                        
                        {request.service_provider && (
                          <p className="text-sm text-muted-foreground">
                            Assisted by: {request.service_provider.name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedEmergency(request)}
                      >
                        View Details
                      </Button> */}
                    </CardFooter>
                  </Card>
                ))
              }
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Request Detail Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>
            <RequestDetailsCard 
              request={selectedRequest} 
              isEmergency={false}
              onClose={selectedRequest.status !== "closed" ? 
                () => handleCloseRequest(selectedRequest.id, false) : 
                undefined}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Emergency Detail Dialog */}
      {selectedEmergency && (
        <Dialog open={!!selectedEmergency} onOpenChange={() => setSelectedEmergency(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-emergency">Emergency Request Details</DialogTitle>
            </DialogHeader>
            <RequestDetailsCard 
              request={selectedEmergency} 
              isEmergency={true}
              onClose={selectedEmergency.status !== "closed" ? 
                () => handleCloseRequest(selectedEmergency.id, true) : 
                undefined}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* AI Chat Client */}
      <AIChatClient 
        isExpanded={chatExpanded} 
        setIsExpanded={setChatExpanded} 
      />
    </div>
  );
};

export default UserDashboard;
