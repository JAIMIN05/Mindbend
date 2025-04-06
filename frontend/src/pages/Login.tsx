import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, 
        { email, password },
        { withCredentials: true }
      );
      console.log(response);
      
      if (response.data.success) {
        await login(email, password, response.data.data.user.role);
        
        toast({
          title: "Success",
          description: "You've been logged in!",
          variant: "default",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to log in",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      let errorMessage = "Failed to log in. Please check your credentials.";
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-800 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
      
      <Card className="w-full max-w-md relative z-10 overflow-hidden shadow-2xl border-blue-100">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-0"></div>
        
        <CardHeader className="relative z-10 pb-8">
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-white/50 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 relative z-10 pt-6">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all transform hover:scale-[1.02] duration-200 shadow-md h-11"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
            
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Add the same style block as in UserDashboard */}
      <style>{`
        @keyframes pulse-emergency {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        
        .text-emergency {
          color: #ef4444;
        }
        
        .border-emergency {
          border-color: #ef4444;
        }

        .bg-gradient-overlay {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(37, 99, 235, 0.1) 100%
          );
        }
      `}</style>
    </div>
  );
};

export default Login;
