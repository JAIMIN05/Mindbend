import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  // Location details
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianEmails, setGuardianEmails] = useState<string[]>([]);

  const { register, currentUser } = useAuth();

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationStatus('success');
          toast.success("Location obtained successfully!");
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
  };

  useEffect(() => {
    // Try to get user location when step 2 is activated
    if (step === 2 && locationStatus === 'idle') {
      getUserLocation();
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate first step fields
      if (!name || !email || !password || !mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        toast.error("Please fill all required fields correctly.");
        return;
      }
      setStep(2);
      return;
    }
    
    // For final submission, validate location
    if (!state || !district || !city || !address) {
      toast.error("Please provide your location details.");
      return;
    }
    
    if (!userLocation) {
      toast.error("We need your location to provide better service. Please allow location access.");
      return;
    }
    
    setIsLoading(true);

    try {
      // Create a formatted location object that matches the backend expectations
      const userData = {
        name,
        email,
        password,
        mobile,
        location: {
          state,
          district,
          city,
          address
        },
        latlon: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        other_contact: [] // Just include other_contact, remove guardian_emails for now
      };
      // Make API call to backend using axios
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, userData, {
        withCredentials: true // Important for cookies to be sent/received
      });

      if (response.data.success) {
        toast.success("Registration successful!");
        // The register function from the auth context should now handle the user state
        await register(userData);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error) && error.response) {
        // Handle server error responses
        toast.error("Registration failed: " + (error.response.data.message || error.message));
      } else {
        toast.error("Registration failed: " + (error as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addGuardianEmail = () => {
    if (guardianEmail && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(guardianEmail) && guardianEmails.length < 5) {
      setGuardianEmails([...guardianEmails, guardianEmail]);
      setGuardianEmail("");
    } else if (guardianEmails.length >= 5) {
      toast.error("You can add at most 5 guardian emails");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const removeGuardianEmail = (index: number) => {
    setGuardianEmails(guardianEmails.filter((_, i) => i !== index));
  };

  // If user is already logged in, redirect to home
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hero to-accent1/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? "Enter your details to create an account" : "Complete your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Input
                    id="name"
                    placeholder="Full Name"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="mobile"
                    placeholder="Mobile Number (10 digits)"
                    type="tel"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    maxLength={10}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    id="state"
                    placeholder="State"
                    type="text"
                    disabled={isLoading}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="district"
                    placeholder="District"
                    type="text"
                    disabled={isLoading}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="city"
                    placeholder="City"
                    type="text"
                    disabled={isLoading}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="address"
                    placeholder="Full Address"
                    type="text"
                    disabled={isLoading}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                
                {/* Location status section */}
                <div className={`p-3 rounded-md ${
                  locationStatus === 'loading' ? 'bg-blue-50 border border-blue-200' :
                  locationStatus === 'success' ? 'bg-green-50 border border-green-200' :
                  locationStatus === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <p className="text-sm font-medium mb-1">Your Location</p>
                  
                  {locationStatus === 'idle' && (
                    <p className="text-sm">We need your location to provide better service.</p>
                  )}
                  
                  {locationStatus === 'loading' && (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                      <p className="text-sm">Getting your location...</p>
                    </div>
                  )}
                  
                  {locationStatus === 'success' && (
                    <p className="text-sm text-green-600">Location successfully obtained!</p>
                  )}
                  
                  {locationStatus === 'error' && (
                    <div>
                      <p className="text-sm text-red-600 mb-2">Failed to get your location.</p>
                    </div>
                  )}
                  
                  {(locationStatus === 'error' || locationStatus === 'idle') && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      className="mt-1" 
                      onClick={getUserLocation}
                    >
                      {locationStatus === 'error' ? 'Try Again' : 'Share Location'}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      id="guardianEmail"
                      placeholder="Guardian Email Address"
                      type="email"
                      disabled={isLoading || guardianEmails.length >= 5}
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      onClick={addGuardianEmail} 
                      disabled={isLoading || guardianEmails.length >= 5}
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Add up to 5 guardian email addresses for emergency notifications
                  </div>
                </div>
                {guardianEmails.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Guardian Emails:</p>
                    <ul className="space-y-1">
                      {guardianEmails.map((email, index) => (
                        <li key={index} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                          <span>{email}</span>
                          <Button 
                            type="button" 
                            onClick={() => removeGuardianEmail(index)} 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            ✕
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading || (step === 2 && locationStatus !== 'success')}>
              {isLoading 
                ? "Creating Account..." 
                : step === 1 
                  ? "Continue" 
                  : "Create Account"
              }
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline text-primary">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
