import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import PrivateRoute from "./components/PrivateRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import Navigation from "./components/Navigation";
import ServiceRequest from "./pages/ServiceRequest";
import AllProviders from "./pages/AllProviders";
import ShowRequestCard from "./components/ShowRequestCard";
import ServiceProvidersPage from "@/pages/ServiceProvidersPage";
// import ShowServiceProvider from "./components/ShowServiceProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map-view" element={<MapView />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/service-request" element={<ServiceRequest />} />
                <Route path="/service-providers" element={<ServiceProvidersPage />} />
                {/* <Route path="/show-provider" element={<ShowServiceProvider type={"Mechanical"} name={"jk"} mobile={"123456789"} email={"jk@gmail.com"} state={"karnataka"} district={"bangalore"} city={"bangalore"} rating={0} />} /> */}
                <Route path = "/show-provider" element = {<AllProviders />} />
                <Route path="/show-request" element={<ShowRequestCard />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
