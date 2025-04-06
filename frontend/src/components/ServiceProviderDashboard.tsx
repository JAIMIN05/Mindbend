import React, { useState, useEffect } from "react";
import axios from "axios";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceRequest, EmergencyRequest } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RequestDetailsCard from "@/components/RequestDetailsCard";

import DisplayMap from './DisplayMap';
import RouteMap from './RouteMap';
// API base URL - should match your backend
const API_URL = `${import.meta.env.VITE_API_URL}`;

import { MapPin, AlertTriangle, CheckCircle2, X, Loader2 } from "lucide-react";
import { emergencyService } from "@/services/emergency.service";
import { toast } from "sonner";

const ServiceProviderDashboard = () => {
  const { getServiceProviderRequests, updateServiceRequestStatus } = useData();
  
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [acceptedEmergencyRequests, setAcceptedEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [closedEmergencyRequests, setClosedEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedRouteEmergency, setSelectedRouteEmergency] = useState<EmergencyRequest | null>(null);
  const [selectedRequestType, setSelectedRequestType] = useState<string>("all");
  
  const requests = getServiceProviderRequests() || [];
  // Group requests by status
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  console.log(pendingRequests);

  // To programmatically switch tabs
  const [activeTab, setActiveTab] = useState<string>("active");

  // Add this state near your other state declarations
  const [acceptedServiceRequests, setAcceptedServiceRequests] = useState<any[]>([]);
  const [completedServiceRequests, setCompletedServiceRequests] = useState<any[]>([]);
  const [requestTypes, setRequestTypes] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<{[key: string]: {active: number, pending: number, closed: number}}>({});

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/request/provider/requests`, {
        withCredentials: true
      });
      console.log(response.data.data.requests);
      
      if (response.data.success) {
        // Make sure we're setting an array
        const requests = response.data.data.requests;
        if (requests && typeof requests === 'object') {
          // Check if it's an object with properties like pending, accepted, etc.
          if (requests.pending && Array.isArray(requests.pending)) {
            setPendingRequests(requests.pending);
          } else if (Array.isArray(requests)) {
            setPendingRequests(requests);
          } else {
            console.error('Unexpected request format:', requests);
            setPendingRequests([]);
          }
        } else {
          setPendingRequests([]);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch pending requests');
      } else {
        setError('An unexpected error occurred');
      }
      setPendingRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to fetch accepted requests
  const fetchAcceptedServiceRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/request/checkacceptedrequest`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        console.log('Accepted service requests:', response.data.data.requests);
        setAcceptedServiceRequests(response.data.data.requests || []);
      } else {
        setAcceptedServiceRequests([]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch accepted requests');
      } else {
        setError('An unexpected error occurred');
      }
      setAcceptedServiceRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to fetch completed requests
  const fetchCompletedServiceRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Get requests where status is closed
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/request/provider/requests`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const requests = response.data.data.requests;
        if (requests && typeof requests === 'object' && requests.closed && Array.isArray(requests.closed)) {
          setCompletedServiceRequests(requests.closed);
        } else {
          setCompletedServiceRequests([]);
        }
      } else {
        setCompletedServiceRequests([]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch completed requests');
      } else {
        setError('An unexpected error occurred');
      }
      setCompletedServiceRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update your handleTabClick function to fetch both types of requests
  const handleTabClick = (value: string) => {
    setActiveTab(value);
    if (value === 'pending') {
      fetchPendingRequests();
    } else if (value === 'active') {
      fetchAcceptedServiceRequests();
      fetchAllData(); // Keep this to fetch emergency data
    } else if (value === 'completed') {
      fetchCompletedServiceRequests();
      fetchAllData(); // Also fetch emergency data for the completed tab
    }
  };
   
  const acceptedRequests = requests?.filter(req => req?.status === "accepted") || [];
  const closedRequests = requests?.filter(req => req?.status === "closed" || req?.status === "deleted_by_user") || [];
    
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [emergencyRes, acceptedRes, doneRes] = await Promise.all([
        emergencyService.getEmergencyRequests(),
        emergencyService.getAcceptedEmergencies(),
        emergencyService.getDoneEmergencies()
      ]);

      if (emergencyRes?.success) {
        setEmergencyRequests(emergencyRes.data?.filter(Boolean) || []);
      }
      if (acceptedRes?.success) {
        setAcceptedEmergencyRequests(acceptedRes.data?.filter(Boolean) || []);
      }
      if (doneRes?.success) {
        setClosedEmergencyRequests(doneRes.data?.filter(Boolean) || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  useEffect(() => {
    fetchAllData();
    fetchPendingRequests();
    fetchAcceptedServiceRequests();
    fetchCompletedServiceRequests();
    // Set up polling interval
    // const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds

    // return () => clearInterval(interval);
  }, []);

  const handleAcceptEmergency = async (requestId: string) => {
    try {
      const response = await emergencyService.acceptEmergency(requestId);
      if (response.success) {
        toast.success("Emergency request accepted successfully");
        await fetchAllData(); // Refresh all data
      }
    } catch (error) {
      console.error("Error accepting emergency:", error);
      toast.error("Failed to accept emergency request");
    }
  };

  const handleCloseRequest = async (id: string, isEmergency: boolean) => {
    try {
      if (isEmergency) {
        const response = await emergencyService.markEmergencyAsDone(id);
        if (response.success) {
          toast.success("Emergency request closed successfully");
          await fetchAllData(); // Refresh all data
        }
      } else {
        // Call the new complete-request endpoint
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/request/complete-request`, {
          requestId: id
        }, {
          withCredentials: true
        });
        
        if (response.data.success) {
          toast.success("Request closed successfully");
          // Refresh the service requests data
          fetchAcceptedServiceRequests();
          fetchCompletedServiceRequests();
          // Switch to the completed tab
          setActiveTab("completed");
        } else {
          toast.error(response.data.message || "Failed to close request");
        }
      }
    } catch (error) {
      console.error("Error closing request:", error);
      toast.error("Failed to close request");
    }
  };

  // Add a safeguard for rendering arrays
  const safeMap = <T extends any>(arr: T[] | null | undefined, callback: (item: T) => React.ReactNode) => {
    if (!Array.isArray(arr)) return null;
    return arr.filter(Boolean).map(callback);
  };

  // New function to handle request type filtering
  const handleRequestTypeChange = (type: string) => {
    setSelectedRequestType(type);
  };

  // Filter by request type
  const filterByType = (requests: any[], type: string) => {
    if (type === "all") return requests;
    return requests.filter(req => req?.title === type);
  };

  // Function to calculate statistics
  const calculateStatistics = () => {
    const stats: {[key: string]: {active: number, pending: number, closed: number}} = {
      all: {active: 0, pending: 0, closed: 0}
    };
    
    // Get unique request types
    const types = new Set<string>();
    
    // Calculate stats for service requests
    [...pendingRequests, ...acceptedServiceRequests, ...completedServiceRequests].forEach(req => {
      if (req?.title) {
        // Add to types
        types.add(req.title);
        
        // Initialize stats for this type if not exists
        if (!stats[req.title]) {
          stats[req.title] = {active: 0, pending: 0, closed: 0};
        }
        
        // Update counts
        if (req.status === 'pending') {
          stats.all.pending++;
          stats[req.title].pending++;
        } else if (req.status === 'accepted') {
          stats.all.active++;
          stats[req.title].active++;
        } else if (req.status === 'closed' || req.status === 'deleted_by_user') {
          stats.all.closed++;
          stats[req.title].closed++;
        }
      }
    });
    
    // Add emergency stats to "all" category
    stats.all.active += acceptedEmergencyRequests.length;
    stats.all.pending += emergencyRequests.filter(req => req?.status === "pending").length;
    stats.all.closed += closedEmergencyRequests.length;
    
    // Add "Emergency" type if there are emergency requests
    if (emergencyRequests.length > 0 || acceptedEmergencyRequests.length > 0 || closedEmergencyRequests.length > 0) {
      types.add("Emergency");
      stats["Emergency"] = {
        active: acceptedEmergencyRequests.length,
        pending: emergencyRequests.filter(req => req?.status === "pending").length,
        closed: closedEmergencyRequests.length
      };
    }
    
    setRequestTypes(Array.from(types));
    setStatistics(stats);
  };

  useEffect(() => {
    calculateStatistics();
  }, [pendingRequests, acceptedServiceRequests, completedServiceRequests, emergencyRequests, acceptedEmergencyRequests, closedEmergencyRequests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={fetchAllData}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // Safely process completed emergency requests
  const processedClosedEmergencies = closedEmergencyRequests
    .filter(er => er && er.user) // Make sure user object exists
    .map(er => ({
      ...er,
      title: "Emergency Request",
      describe_problem: "Emergency assistance",
      vehical_info: { type: "Emergency", name: "N/A", number: "N/A" },
      isEmergency: true,
      // Add a safety check for the user object
      user: er.user || { name: "Unknown User", location: { city: "Unknown Location" } }
    }));

  return (
    <>
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="bg-blue-50 pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
              Service Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Filter by Type:</h4>
              <select 
                className="text-sm p-1 border rounded"
                value={selectedRequestType}
                onChange={(e) => handleRequestTypeChange(e.target.value)}
              >
                <option value="all">All Types</option>
                {requestTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/40 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold">
                  {statistics[selectedRequestType]?.active || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold">
                  {statistics[selectedRequestType]?.pending || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-lg text-center col-span-2">
                <p className="text-2xl font-bold">
                  {statistics[selectedRequestType]?.closed || 0}
                </p>
                <p className="text-sm text-muted-foreground">Closed</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsMapOpen(true)}
            >
              View Map
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="bg-red-50 pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-emergency" />
              Emergency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[180px] overflow-auto">
            {!emergencyRequests?.length || !emergencyRequests.filter(req => req?.status === "pending").length ? (
              <div className="text-center text-muted-foreground p-4">
                No emergency alerts at this time
              </div>
            ) : (
              <div className="space-y-3">
                {safeMap(
                  emergencyRequests.filter(req => req?.status === "pending"),
                  request => (
                    <div 
                      key={request._id || request.id} 
                      className="border border-emergency rounded-md p-3 cursor-pointer hover:bg-red-50"
                      onClick={() => {
                        setSelectedEmergency(request);
                        setSelectedRequest(null);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-emergency flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" /> 
                            Emergency Alert
                          </p>
                          <p className="text-sm">{request.user?.name || 'Unknown User'}</p>
                          <p className="text-xs flex items-center">
                            <MapPin className="h-3 w-3 mr-1" /> 
                            {request.user?.location?.city || 'Location unavailable'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className="bg-emergency">
                            {request.created_at ? new Date(request.created_at).toLocaleTimeString() : 'Time unavailable'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptEmergency(request._id || request.id);
                            }}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} className="w-full" onValueChange={handleTabClick}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="cursor-pointer">
            {isLoading ? "Loading..." : "Pending Requests"}
            {error && <span className="text-red-500 ml-2">!</span>}
          </TabsTrigger>
          <TabsTrigger value="active" >Active Requests</TabsTrigger>
          <TabsTrigger value="completed">Closed Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Loading pending requests...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : filterByType(pendingRequests, selectedRequestType).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No pending service requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safeMap(filterByType(pendingRequests, selectedRequestType), (request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="bg-blue-50 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <Badge variant="secondary">New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Problem Description */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Problem Description</h4>
                      <p className="text-sm text-muted-foreground">{request.describe_problem}</p>
                    </div>

                    {/* Vehicle Information */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Vehicle Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p>{request.vehical_info.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p>{request.vehical_info.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Number</p>
                          <p>{request.vehical_info.number}</p>
                        </div>
                      </div>
                    </div>

                    {/* User Information */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">User Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p>{request.user.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p>{request.user.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mobile</p>
                          <p>{request.user.mobile}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p>{request.user.location.city}, {request.user.location.district}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Coordinates */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Location Coordinates</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Latitude</p>
                          <p>{request.latlon.coordinates[1]}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Longitude</p>
                          <p>{request.latlon.coordinates[0]}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button 
                      className="w-full"
                      onClick={async () => {
                        try {
                          console.log("Accepting request:", request.id);
                          
                          const response = await axios.post(`${import.meta.env.VITE_API_URL}/request/accept-request`, {
                            requestId: request.id
                          }, {
                            withCredentials: true
                          });
                          
                          console.log("Response:", response.data);
                          if (response.data.success) {
                            // Refresh the pending requests
                            fetchPendingRequests();
                            // Also refresh accepted requests
                            fetchAcceptedServiceRequests();
                            // Also refresh all other data
                            fetchAllData();
                            toast.success("Request accepted successfully");
                            // Switch to active tab
                            setActiveTab("active");
                          } else {
                            console.error('Failed to accept request:', response.data.message);
                            toast.error("Failed to accept request");
                          }
                        } catch (error) {
                          console.error('Error accepting request:', error);
                        }
                      }}
                    >
                      Accept Request
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {!filterByType(acceptedEmergencyRequests, selectedRequestType === "Emergency" || selectedRequestType === "all" ? selectedRequestType : "none").length && 
           !filterByType(acceptedServiceRequests, selectedRequestType).length ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No active requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedRequestType === "Emergency" || selectedRequestType === "all") && 
                safeMap(acceptedEmergencyRequests, request => (
                  <Card 
                    key={request._id || request.id} 
                    className={`overflow-hidden ${
                      request.status === 'deleted_by_user' ? 'border-yellow-500 bg-yellow-50/50' : 'border-emergency'
                    }`}
                  >
                    <CardHeader className={`pb-2 ${
                      request.status === 'deleted_by_user' ? 'bg-yellow-100/50' : 'bg-red-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <CardTitle className={`text-lg ${
                          request.status === 'deleted_by_user' ? 'text-yellow-700' : 'text-emergency'
                        } flex items-center`}>
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Emergency
                        </CardTitle>
                        <Badge className={
                          request.status === 'deleted_by_user' 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }>
                          {request.status === 'deleted_by_user' ? 'Deleted by User' : 'Active'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">User</p>
                          <p>{request.user?.name || 'Unknown User'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">Contact</p>
                          <p>{request.user?.mobile || 'No contact'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">Location</p>
                          <p>{request.user?.location?.city || 'Location unavailable'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">
                            {request.status === 'deleted_by_user' ? 'Deleted At' : 'Accepted At'}
                          </p>
                          <p>{request.created_at ? new Date(request.created_at).toLocaleTimeString() : 'Time unavailable'}</p>
                        </div>
                      </div>
                      {request.status === 'deleted_by_user' && (
                        <div className="mt-4 p-3 bg-yellow-100/50 rounded-md border border-yellow-200">
                          <p className="text-sm text-yellow-700 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            This request was cancelled by the user. No further action is required.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex gap-2">
                      <Button 
                        className="flex-1"
                        variant="outline"
                        onClick={() => setSelectedRouteEmergency(request)}
                      >
                        View Map
                      </Button>
                      {request.status !== 'deleted_by_user' && (
                        <Button 
                          className="flex-1"
                          variant="destructive"
                          onClick={() => handleCloseRequest(request._id || request.id, true)}
                        >
                          Close
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              
              {safeMap(filterByType(acceptedServiceRequests, selectedRequestType), request => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="bg-blue-50 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.title || 'Untitled Request'}</CardTitle>
                      <Badge className="bg-green-500">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="line-clamp-2 text-sm mb-2">{request.describe_problem || 'No description'}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">Vehicle</p>
                        <p>{request.vehical_info?.type || 'N/A'} - {request.vehical_info?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">Number</p>
                        <p>{request.vehical_info?.number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">User</p>
                        <p>{request.user?.name || 'Unknown User'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">Contact</p>
                        <p>{request.user?.mobile || 'No contact'}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex gap-2">
                    <Button 
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setSelectedEmergency(null);
                      }}
                    >
                      Details
                    </Button>
                    <Button 
                      className="flex-1"
                      variant="default"
                      onClick={() => handleCloseRequest(request.id, false)}
                    >
                      Close
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {filterByType(closedRequests, selectedRequestType).length === 0 && 
           (selectedRequestType !== "Emergency" && selectedRequestType !== "all" ? true : processedClosedEmergencies.length === 0) && 
           filterByType(completedServiceRequests, selectedRequestType).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No closed requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ...filterByType(closedRequests.filter(req => req && req.user), selectedRequestType),
                ...(selectedRequestType === "Emergency" || selectedRequestType === "all" ? processedClosedEmergencies : []),
                ...filterByType(completedServiceRequests, selectedRequestType)
              ]
                .map((request: any, index) => (
                  <Card key={index} className={`overflow-hidden opacity-80 ${
                    request.status === 'deleted_by_user' ? 'border-yellow-500/50' : ''
                  }`}>
                    <CardHeader className={`pb-2 ${
                      request.status === 'deleted_by_user' 
                        ? 'bg-yellow-50' 
                        : request.isEmergency 
                          ? 'bg-red-50' 
                          : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <CardTitle className={`text-lg ${
                          request.status === 'deleted_by_user'
                            ? 'text-yellow-700'
                            : request.isEmergency 
                              ? 'text-emergency' 
                              : ''
                        }`}>
                          {request.title || 'Untitled Request'}
                        </CardTitle>
                        <Badge variant={request.status === 'deleted_by_user' ? 'default' : 'outline'}>
                          {request.status === 'deleted_by_user' ? 'Deleted by User' : 'Closed'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="line-clamp-2 text-sm mb-2">{request.describe_problem || 'No description'}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">User</p>
                          <p>{request.user?.name || 'Unknown User'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">Location</p>
                          <p>{request.user?.location?.city || 'Unknown Location'}</p>
                        </div>
                      </div>
                      {request.status === 'deleted_by_user' && (
                        <p className="text-sm text-yellow-600 mt-4 bg-yellow-100/50 p-2 rounded">
                          This request was cancelled by the user
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      {/* <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          if (request.isEmergency) {
                            setSelectedEmergency(request as EmergencyRequest);
                            setSelectedRequest(null);
                          } else {
                            setSelectedRequest(request as ServiceRequest);
                            setSelectedEmergency(null);
                          }
                        }}
                      >
                        View Details
                      </Button> */}
                    </CardFooter>
                  </Card>
                ))}
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
              onClose={() => handleCloseRequest(selectedRequest.id, false)}
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
              onClose={() => handleCloseRequest(selectedEmergency._id || selectedEmergency.id, true)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add DisplayMap component */}
      <DisplayMap
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      {/* Add RouteMap component */}
      {selectedRouteEmergency && (
        <RouteMap
          isOpen={!!selectedRouteEmergency}
          onClose={() => setSelectedRouteEmergency(null)}
          emergency={selectedRouteEmergency}
        />
      )}
    </div>
    </>
  );
};

export default ServiceProviderDashboard;