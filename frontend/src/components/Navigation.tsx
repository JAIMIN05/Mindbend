import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu"; 
import { cn } from "@/lib/utils";
import { 
  Car, Wrench, Truck, Battery, Disc2, Key, Fuel, 
  Camera, MonitorPlay, Sofa, FileCheck 
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  if (!currentUser) {
    return null; // Don't show navigation if user is not logged in
  }

  const serviceCategories = [
    {
      title: "CareCrew",
      services: [
        { name: "Towing", icon: <Truck className="h-5 w-5 mr-2" />, description: "Anything from flatbed to safe lifting" },
        { name: "Flat-Tyre", icon: <Disc2 className="h-5 w-5 mr-2" />, description: "Tube or Tubeless puncture repair" },
        { name: "Battery-Jumpstart", icon: <Battery className="h-5 w-5 mr-2" />, description: "Get jumpstart from professionals" },
        { name: "Starting Problem", icon: <Wrench className="h-5 w-5 mr-2" />, description: "Make your vehicle moving" },
        { name: "Key-Unlock-Assistance", icon: <Key className="h-5 w-5 mr-2" />, description: "One-stop unlock assistance" },
        { name: "Fuel-Delivery", icon: <Fuel className="h-5 w-5 mr-2" />, description: "Petrol/Diesel delivered faster" },
      ]
    }
  ];

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl flex items-center">
              <div className="bg-yellow-400 p-2 rounded-md mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-16h-9l1-4z" />
                </svg>
              </div>
              ReadyAssist
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`font-medium ${
                isActive("/") 
                  ? "text-blue-600 font-semibold" 
                  : "text-gray-800 hover:text-blue-600"
              }`}
            >
              Home
            </Link>
            

            {/* Only show Services menu if user is not admin */}
            {currentUser?.role === 'user' && (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/services") ? "text-primary font-bold" : ""
                    }`}>Services</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[400px] p-4 bg-white rounded-lg shadow-lg">
                        {serviceCategories.map((category, i) => (
                          <div key={i} className="space-y-3">
                            <h3 className="font-medium text-lg border-b pb-2">{category.title}</h3>
                            <ul className="space-y-2">
                              {category.services.map((service, j) => (
                                <li key={j}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={`/service-request?type=${service.name}`}
                                      className={cn(
                                        "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                        "flex items-center gap-2"
                                      )}
                                    >
                                      {service.icon}
                                      <div>
                                        <div className="text-sm font-medium leading-none mb-1">{service.name}</div>
                                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                          {service.description}
                                        </p>
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}


            <Link
              to="/dashboard"
              className={`font-medium ${
                isActive("/dashboard") 
                  ? "text-blue-600 font-semibold" 
                  : "text-gray-800 hover:text-blue-600"
              }`}
            >
              Dashboard
            </Link>
            
            <Link
              to="/profile"
              className={`font-medium ${
                isActive("/profile") 
                  ? "text-blue-600 font-semibold" 
                  : "text-gray-800 hover:text-blue-600"
              }`}
            >
              Profile
            </Link>
            
            <Button 
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
          
          <div className="md:hidden">
            <button 
              className="text-gray-800 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 mt-4">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md font-medium ${
                isActive("/") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-800 hover:bg-blue-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>


            {/* Only show Services in mobile menu if user is not admin */}
            {currentUser?.role !== 'admin' && (
              <div className="space-y-4">
                {serviceCategories.map((category, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="font-medium text-lg px-3">{category.title}</h3>
                    <div className="space-y-1">
                      {category.services.map((service, j) => (
                        <Link
                          key={j}
                          to={`/service-request?type=${service.name}`}
                          className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-primary-foreground/10"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {service.icon}
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <p className="text-xs text-gray-500">{service.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}

            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md font-medium ${
                isActive("/dashboard") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-800 hover:bg-blue-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md font-medium ${
                isActive("/profile") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-800 hover:bg-blue-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;