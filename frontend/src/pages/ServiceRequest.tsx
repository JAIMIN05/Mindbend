
import React, { useState, useEffect } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { RequestTitle } from "@/types";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import axios from "axios";
const vehicleTypes = ["bike", "car"];

const requestTitles: RequestTitle[] = [
  "Towing",
  "Flat-Tyre",
  "Battery-Jumpstart",
  "Starting Problem",
  "Key-Unlock-Assistance",
  "Fuel-Delivery",
  "Other"
];

const ServiceRequest = () => {
  const [searchParams] = useSearchParams();
  const requestType = searchParams.get('type');
  const { currentUser } = useAuth();
  const { createServiceRequest } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState<RequestTitle>("Towing");
  const [problem, setProblem] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  
  // Set initial title based on URL parameter if it exists
  useEffect(() => {
    if (requestType) {
      // Map the service type from URL to a RequestTitle
      const mappings: Record<string, RequestTitle> = {
        "Towing": "Towing",
        "Flat-Tyre": "Flat-Tyre",
        "Battery-Jumpstart": "Battery-Jumpstart",
        "Starting Problem": "Starting Problem",
        "Key-Unlock-Assistance": "Key-Unlock-Assistance",
        "Fuel-Delivery": "Fuel-Delivery",
        "Fitment Service": "Other",
        "Car Inspection": "Other",
        "Bike Express Services": "Other"
      };
      
      if (requestType in mappings) {
        setTitle(mappings[requestType as keyof typeof mappings]);
        setProblem(`Need assistance with ${requestType}`);
      }
    }
  }, [requestType]);
  
  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
          toast.error("Failed to get your location. Please allow location access.");
        }
      );
    } else {
      setLocationStatus('error');
      toast.error("Geolocation is not supported by this browser.");
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast.error("Unable to submit without location data.");
      return;
    }
    
    if (!title || !problem || !vehicleType || !vehicleName || !vehicleNumber) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/request/createRequest`,
        {
          latitude: location.lat,
          longitude: location.lon,
          title: title,
          describe_problem: problem,
          vehical_info: {
            type: vehicleType,
            name: vehicleName,
            number: vehicleNumber
          },
          advance: 0 // Optional field, setting default to 0
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
        
      );
      console.log(response);
      navigate("/dashboard");
      toast.success("Service request created successfully!");
      
      // Close the dialog automatically
      const closeButton = document.querySelector('[data-state="open"] button.close-dialog');
      if (closeButton) {
        (closeButton as HTMLButtonElement).click();
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Failed to create service request: " + (error.response?.data?.message || error.message));
      } else {
        toast.error("Failed to create service request: " + (error as Error).message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Request Service</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Request Form</CardTitle>
            <CardDescription>
              Please fill out the details below to request assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="requestType" className="text-sm font-medium">Request Type</label>
                <Select value={title} onValueChange={(value) => setTitle(value as RequestTitle)}>
                  <SelectTrigger id="requestType" disabled={isSubmitting}>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTitles.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="problem" className="text-sm font-medium">Describe Your Problem</label>
                <Textarea 
                  id="problem"
                  placeholder="Please describe your issue in detail"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="vehicleType" className="text-sm font-medium">Vehicle Type</label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger id="vehicleType" disabled={isSubmitting}>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicleName" className="text-sm font-medium">Vehicle Make & Model</label>
                  <Input 
                    id="vehicleName"
                    placeholder="e.g. Toyota Camry"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="vehicleNumber" className="text-sm font-medium">Vehicle Number</label>
                  <Input 
                    id="vehicleNumber"
                    placeholder="e.g. ABC 1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              {locationStatus === 'loading' && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                  <p>Obtaining your location...</p>
                </div>
              )}
              
              {locationStatus === 'error' && (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-center">
                  <p className="text-sm">Unable to get your location. Please enable location services.</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => {
                      setLocationStatus('loading');
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setLocation({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                          });
                          setLocationStatus('success');
                          toast.success("Location obtained successfully!");
                        },
                        () => {
                          setLocationStatus('error');
                          toast.error("Failed to get your location.");
                        }
                      );
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              {locationStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-700">Location obtained successfully!</p>
                </div>
              )}
              
              <CardFooter className="flex justify-end p-0 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || locationStatus !== 'success'}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceRequest;
