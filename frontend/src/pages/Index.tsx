import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Wrench, Truck, Battery, Disc2, FileCheck, ArrowRight, Star, Shield, Clock } from "lucide-react";

const Index = () => {
  console.log(import.meta.env.VITE_API_URL)
  const { currentUser } = useAuth();
  
  const testimonials = [
    { name: "John Doe", comment: "Got my car fixed in no time. Great service!", rating: 5 },
    { name: "Jane Smith", comment: "Their bike repair service is top-notch. Highly recommended!", rating: 5 },
    { name: "Mike Johnson", comment: "Professional team, excellent service, fair pricing.", rating: 4 }
  ];
  
  const stats = [
    { count: "3 Million+", label: "Happy Customers", icon: <Star className="w-6 h-6 text-yellow-500" /> },
    { count: "5000+", label: "Expert Technicians", icon: <Shield className="w-6 h-6 text-blue-500" /> },
    { count: "40+", label: "Cities", icon: <Truck className="w-6 h-6 text-green-500" /> },
    { count: "4.8", label: "Rating", icon: <Star className="w-6 h-6 text-yellow-500" /> }
  ];
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center relative">
          <div className="md:w-1/2 mb-8 md:mb-0 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Your Trusted<br />Auto Care Partner
            </h1>
            <p className="text-xl mb-8 max-w-lg text-blue-100">
              Qualified technicians to get your vehicle back on the road. Fast, reliable service at your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400 transition-all transform hover:scale-105 duration-200 shadow-lg" size="lg">
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button className="bg-yellow-500 text-black hover:bg-yellow-400 transition-all transform hover:scale-105 duration-200 shadow-lg" size="lg">
                      Start Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="bg-yellow-500 text-black hover:bg-yellow-400 transition-all transform hover:scale-105 duration-200 shadow-lg" size="lg">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2 animate-float relative z-0">
            <img 
              src="/images/home_banner.png" 
              alt="Roadside Assistance" 
              className="w-[600px] max-w-md mx-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="container mx-auto px-6 pb-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl hover:bg-white/5 transition-colors">
                {stat.icon}
                <h3 className="text-3xl font-bold mt-2">{stat.count}</h3>
                <p className="text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Services Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Our Premium Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Car className="w-12 h-12" />, title: "Car Service", desc: "Complete car care solution" },
              { icon: <Wrench className="w-12 h-12" />, title: "Repair Work", desc: "Expert repair services" },
              { icon: <Battery className="w-12 h-12" />, title: "Battery Care", desc: "24/7 battery assistance" },
              { icon: <Disc2 className="w-12 h-12" />, title: "Tyre Service", desc: "All tyre solutions" },
              { icon: <Clock className="w-12 h-12" />, title: "Quick Service", desc: "Rapid response team" },
              { icon: <Shield className="w-12 h-12" />, title: "Full Protection", desc: "Comprehensive coverage" },
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car Inspection Card */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-2/3">
              <h3 className="text-3xl font-bold mb-6">Professional Car Inspection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  "Full vehicle inspection",
                  "150+ check list items",
                  "Expert recommendations",
                  "Digital report",
                  "Same day service",
                  "Warranty assured"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-xl p-4">
                    <FileCheck className="w-6 h-6 text-yellow-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 transition-all transform hover:scale-105 duration-200">
                Book Inspection Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="md:w-1/3">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <img src="/images/car.jpg" alt="Professional Mechanic" className="w-64 h-64 object-cover rounded-full" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <FileCheck className="w-8 h-8 text-black" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center animate-pulse">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.comment}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-24 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Network of Expert Technicians</h2>
            <p className="text-xl mb-8 text-yellow-100">
              Be part of our growing family of professional technicians. Access a wide customer base and grow your business with us.
            </p>
            <Button className="bg-white text-yellow-600 hover:bg-yellow-50 transition-all transform hover:scale-105 duration-200">
              Become a Partner <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h4 className="text-2xl font-bold mb-6">ReadyAssist</h4>
              <p className="text-gray-400">Your trusted partner for all vehicle repair and maintenance needs.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Services</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Roadside Assistance</li>
                <li className="hover:text-white transition-colors cursor-pointer">Vehicle Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Battery Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Tyre Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Support</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} ReadyAssist. All Rights Reserved</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Index;
