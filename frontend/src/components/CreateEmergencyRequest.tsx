import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateEmergencyRequestProps {
  onSubmit: (data: { latitude: number; longitude: number }) => Promise<void>;
}

const CreateEmergencyRequest: React.FC<CreateEmergencyRequestProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    latitude: "",
    longitude: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.latitude || !location.longitude) {
      toast.error("Please provide both latitude and longitude");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      });
    } catch (error) {
      console.error("Error creating emergency request:", error);
      toast.error("Failed to create emergency request");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        });
        toast.success("Location fetched successfully");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get your location");
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="latitude">Latitude</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={getCurrentLocation}
          >
            Get Current Location
          </Button>
        </div>
        <Input
          id="latitude"
          type="text"
          placeholder="Enter latitude"
          value={location.latitude}
          onChange={(e) => setLocation(prev => ({ ...prev, latitude: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="longitude">Longitude</Label>
        <Input
          id="longitude"
          type="text"
          placeholder="Enter longitude"
          value={location.longitude}
          onChange={(e) => setLocation(prev => ({ ...prev, longitude: e.target.value }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        variant="destructive"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Request...
          </>
        ) : (
          "Send Emergency Request"
        )}
      </Button>
    </form>
  );
};

export default CreateEmergencyRequest;
