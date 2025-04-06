import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Mail, MapPin, Car, Building2 } from "lucide-react";

interface ServiceProvider {
  _id: string;
  type: "Hospital" | "Mechanical";
  name: string;
  contact: {
    mobile: string;
    email: string;
  };
  location: {
    state: string;
    district: string;
    city: string;
  };
  latlon: {
    coordinates: [number, number];
  };
  isAvailable: boolean;
  rating: number;
  service_count: number;
}

export default function AllProviders() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/service-providers`);
        if (response.data.success) {
          setProviders(response.data.data.serviceProviders);
        } else {
          setError('Failed to fetch service providers');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Service Providers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{provider.name}</CardTitle>
              <Badge variant={provider.isAvailable ? "default" : "destructive"}>
                {provider.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {provider.type === "Hospital" ? (
                    <Building2 className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Car className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="text-sm text-muted-foreground">{provider.type}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm">{provider.rating.toFixed(1)} ({provider.service_count} services)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{provider.contact.mobile}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">{provider.contact.email}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <span className="text-sm">
                    {provider.location.city}, {provider.location.district}, {provider.location.state}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
