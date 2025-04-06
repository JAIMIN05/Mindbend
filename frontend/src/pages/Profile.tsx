import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { User, ServiceProvider } from "@/types";
import { toast } from "@/lib/toast";
import axios from "axios";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Star, 
  Award, 
  Settings, 
  Building2, 
  Wrench,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { Label } from "@/components/ui/label";

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    mobile: '',
    location: {
      state: '',
      district: '',
      city: '',
      address: ''
    },
    other_contact: []
  });
  const [newContact, setNewContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when currentUser changes
  useEffect(() => {
    if (currentUser && !isServiceProvider) {
      const user = currentUser as User;
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        location: {
          state: user.location?.state || '',
          district: user.location?.district || '',
          city: user.location?.city || '',
          address: user.location?.address || ''
        },
        other_contact: user.other_contact || []
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-800 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  // Add type guards to properly handle user vs service provider types
  const isServiceProvider = currentUser.role === 'service_provider';
  
  const handleEditToggle = () => {
    if (!isEditing && currentUser && !isServiceProvider) {
      // Initialize form data when entering edit mode
      const user = currentUser as User;
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        location: {
          state: user.location?.state || '',
          district: user.location?.district || '',
          city: user.location?.city || '',
          address: user.location?.address || ''
        },
        other_contact: user.other_contact || []
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "city" || name === "district" || name === "state" || name === "address") {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddContact = () => {
    if (!formData.other_contact) {
      formData.other_contact = [];
    }
    
    if (newContact && /^\d{10}$/.test(newContact) && formData.other_contact.length < 5) {
      setFormData(prev => ({
        ...prev,
        other_contact: [...(prev.other_contact || []), newContact]
      }));
      setNewContact("");
    } else {
      toast.error("Please enter a valid 10-digit contact number");
    }
  };

  const handleRemoveContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      other_contact: prev.other_contact?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (currentUser.role !== 'user') {
        throw new Error("Only users can update their profile");
      }
      
      // Validate mobile number
      if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
        throw new Error("Mobile number must be 10 digits");
      }

      // Validate required fields
      if (!formData.name || !formData.mobile || !formData.location?.state || 
          !formData.location?.district || !formData.location?.city) {
        throw new Error("Please fill in all required fields");
      }
      
      // Make API call to update user profile
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        {
          name: formData.name,
          mobile: formData.mobile,
          location: {
            state: formData.location.state,
            district: formData.location.district,
            city: formData.location.city
          },
          other_contact: formData.other_contact || []
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // Important for sending cookies
        }
      );

      if (response.data.success) {
        // Update local state with the response data
        const updatedUser = {
          ...currentUser,
          ...response.data.data.user
        };
        
        // Update the user data in AuthContext
        await updateUserProfile(updatedUser);
        
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-800 p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>

      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="text-center text-white space-y-2">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-blue-100">Manage your account information</p>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1">
          <div>
            {!isEditing ? (
              <Card className="overflow-hidden shadow-2xl border-blue-100 max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-0"></div>
                
                <CardHeader className="relative z-10 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                        {currentUser.name || 'No name provided'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        {currentUser.role === 'admin' ? "Admin" : 
                         currentUser.role === 'service_provider' ? "Service Provider" : 
                         "User"} • Member since {new Date().getFullYear()}
                      </CardDescription>
                    </div>
                    {currentUser.role === 'user' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleEditToggle}
                        className="border-blue-200 hover:bg-blue-50 text-blue-600"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-blue-600 flex items-center gap-2 mb-3">
                        <UserIcon className="h-4 w-4" />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {currentUser.email || 'Not provided'}
                        </div>
                        {currentUser.role === 'user' && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {(currentUser as User).mobile || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>

                    {currentUser.role === 'service_provider' && (
                      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <h3 className="font-medium text-blue-600 flex items-center gap-2 mb-3">
                          <Wrench className="h-4 w-4" />
                          Service Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            Type: {(currentUser as ServiceProvider).type || 'Not specified'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Star className="h-4 w-4 text-yellow-400" />
                            Rating: {(currentUser as ServiceProvider).rating || 0}/5
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Award className="h-4 w-4 text-green-400" />
                            Services: {(currentUser as ServiceProvider).service_count || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-600 flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4" />
                      Location Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">State</p>
                        <p className="text-gray-700">
                          {currentUser.role === 'service_provider' 
                            ? (currentUser as ServiceProvider).location?.state 
                            : (currentUser as User).location?.state || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">District</p>
                        <p className="text-gray-700">
                          {currentUser.role === 'service_provider'
                            ? (currentUser as ServiceProvider).location?.district
                            : (currentUser as User).location?.district || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="text-gray-700">
                          {currentUser.role === 'service_provider'
                            ? (currentUser as ServiceProvider).location?.city
                            : (currentUser as User).location?.city || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentUser.role === 'user' && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-blue-600 flex items-center gap-2 mb-3">
                        <Phone className="h-4 w-4" />
                        Emergency Contacts
                      </h3>
                      {(currentUser as User).other_contact?.length > 0 ? (
                        <div className="space-y-2">
                          {(currentUser as User).other_contact.map((contact, index) => (
                            <div key={index} className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {contact}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No emergency contacts provided</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden shadow-2xl border-blue-100 max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-0"></div>
                
                <CardHeader className="relative z-10 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-600" />
                    Edit Profile
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                  <CardContent className="relative z-10 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-blue-500" />
                          Name
                        </Label>
                        <div className="relative">
                          <Input
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            placeholder="Your name"
                            className="pl-10 bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                          />
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-500" />
                          Mobile
                        </Label>
                        <div className="relative">
                          <Input
                            name="mobile"
                            value={formData.mobile || ''}
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            className="pl-10 bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                          />
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <MapPin className="h-5 w-5" />
                        <h3 className="font-semibold">Location Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">City</Label>
                          <Input
                            name="city"
                            value={formData.location?.city || ''}
                            onChange={handleInputChange}
                            placeholder="City"
                            className="bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">District</Label>
                          <Input
                            name="district"
                            value={formData.location?.district || ''}
                            onChange={handleInputChange}
                            placeholder="District"
                            className="bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">State</Label>
                          <Input
                            name="state"
                            value={formData.location?.state || ''}
                            onChange={handleInputChange}
                            placeholder="State"
                            className="bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Phone className="h-5 w-5" />
                        <h3 className="font-semibold">Emergency Contacts</h3>
                      </div>
                      
                      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              value={newContact}
                              onChange={(e) => setNewContact(e.target.value)}
                              placeholder="10-digit mobile number"
                              maxLength={10}
                              className="pl-10 bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          </div>
                          <Button 
                            type="button" 
                            onClick={handleAddContact}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        
                        {formData.other_contact && formData.other_contact.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {formData.other_contact.map((contact, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                                <span className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-blue-500" />
                                  {contact}
                                </span>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveContact(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="relative z-10 flex justify-between border-t border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50 p-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleEditToggle}
                      className="border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all transform hover:scale-[1.02] duration-200 shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-emergency {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        .bg-gradient-overlay {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(37, 99, 235, 0.1) 100%
          );
        }

        .form-transition {
          transition: all 0.3s ease-in-out;
        }

        .form-enter {
          opacity: 0;
          transform: translateY(10px);
        }

        .form-enter-active {
          opacity: 1;
          transform: translateY(0);
        }

        .form-exit {
          opacity: 1;
          transform: translateY(0);
        }

        .form-exit-active {
          opacity: 0;
          transform: translateY(-10px);
        }
      `}</style>
    </div>
  );
};

export default Profile;
