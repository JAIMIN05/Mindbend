import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from 'axios';

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    password: '',
    mobile: '',
    email: '',
    state: '',
    district: '',
    city: '',
    latitude: '',
    longitude: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/add-service-provider`, {
        type: formData.type,
        name: formData.name,
        password: formData.password,
        contact: {
          mobile: formData.mobile,
          email: formData.email
        },
        location: {
          state: formData.state,
          district: formData.district,
          city: formData.city
        },
        latlon: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        }
      }, {
        withCredentials: true
      });
      
      if (response.status === 201) {
        alert('Service provider added successfully');
        // Reset form
        setFormData({
          type: '',
          name: '',
          password: '',
          mobile: '',
          email: '',
          state: '',
          district: '',
          city: '',
          latitude: '',
          longitude: ''
        });
      } else {
        alert('Failed to add service provider');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding service provider');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Add Service Provider</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Provider Type</Label>
            <Select 
              onValueChange={(value) => setFormData({...formData, type: value})}
              value={formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mechanical">Mechanic</SelectItem>
                <SelectItem value="Hospital">Hospital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">Add Service Provider</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard; 