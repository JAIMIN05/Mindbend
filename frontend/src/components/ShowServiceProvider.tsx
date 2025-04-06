import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Star } from "lucide-react";
import axios from "axios";

interface ServiceProviderContact {
  mobile: string;
  email: string;
}

interface ServiceProvider {
  _id: string;
  type: string;
  name: string;
  contact: ServiceProviderContact;
  location: {
    state: string;
    district: string;
    city: string;
  };
  rating?: number;
  isAvailable?: boolean;
}

interface VehicleInfo {
  type: "bike" | "car";
  number: string;
  name: string;
}

interface ShowServiceProviderProps {
  providers: ServiceProvider[];
  title?: string;
  requestVehicle?: VehicleInfo;
  serviceId?: string;
  onProviderSelected?: (providerId: string) => void;
}

export default function ShowServiceProvider({ 
  providers, 
  title = "Service Providers", 
  requestVehicle, 
  serviceId,
  onProviderSelected 
}: ShowServiceProviderProps) {
  const handleMakeRequest = async (providerId: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/request/accept-provider`, {
        serviceId,
        providerId
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Handle success (you might want to show a success message or redirect)
        console.log('Provider accepted successfully');
        // Call the callback to remove this provider from the list
        if (onProviderSelected) {
          onProviderSelected(providerId);
        }
      } else {
        // Handle error
        console.error('Failed to accept provider:', response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error accepting provider:', error.response?.data?.message || error.message);
      } else {
        console.error('Error accepting provider:', error);
      }
    }
  };

  if (!providers || providers.length === 0) {
    return null;
  }
  console.log(providers);
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card key={provider._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                {provider.type} - {provider.name}
              </CardTitle>
              {provider.isAvailable !== undefined && (
                <Badge variant={provider.isAvailable ? "default" : "destructive"}>
                  {provider.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Service ID Display */}
                {serviceId && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Service ID:</span>
                    <span className="text-sm text-gray-600">{serviceId}</span>
                  </div>
                )}

                {/* Vehicle Information */}
                {requestVehicle && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Vehicle:</span>
                    <span className="text-sm">
                      {requestVehicle.name} ({requestVehicle.number})
                    </span>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{provider.contact.mobile}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{provider.contact.email}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-sm">
                    {provider.location.city}, {provider.location.district}, {provider.location.state}
                  </span>
                </div>

                {/* Rating */}
                {provider.rating !== undefined && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{provider.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => handleMakeRequest(provider._id)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                  Make Request
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
