import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import { RequestTitle } from "@/types";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import axios from 'axios';

const vehicleTypes = ["bike", "car"];

const requestTitles: RequestTitle[] = [
  "Roadside Assistance Towing",
  "Flat-Tyre",
  "Battery-Jumpstart",
  "Starting Problem",
  "Key-Unlock-Assistance",
  "Fuel-Delivery",
  "Other"
];

const CreateServiceRequest = () => {
  const { createServiceRequest } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  
  // Form state
  const [title, setTitle] = useState<RequestTitle>(requestTitles[0]);
  const [problem, setProblem] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  
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
    console.log("submitted")
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
  
  return (
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
      
      <DialogFooter>
        <Button 
          type="button"
          variant="outline"
          className="close-dialog"
          data-dismiss="dialog"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || locationStatus !== 'success'}
        >
          {isSubmitting ? "Submitting..." : "Create Request"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CreateServiceRequest;
