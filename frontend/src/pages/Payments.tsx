
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaymentForm from "@/components/PaymentForm";

const Payments = () => {
  const { currentUser } = useAuth();
  const { payments, updatePaymentStatus } = useData();
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Filter payments based on user type
  const userPayments = currentUser.userType === 'user'
    ? payments.filter(payment => payment.userId === currentUser.id)
    : payments.filter(payment => payment.serviceProviderId === currentUser.id);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const handlePayment = async (payment: Payment) => {
    try {
      await updatePaymentStatus(payment.id, "paid");
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Manage your {currentUser.userType === 'user' ? 'payments' : 'earnings'}
          </p>
        </div>
        
        {userPayments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No payments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPayments.map((payment) => (
              <Card key={payment.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Payment #{payment.id.substring(0, 8)}</CardTitle>
                    <Badge 
                      className={
                        payment.status === "pending" 
                          ? "bg-yellow-500" 
                          : payment.status === "paid" 
                          ? "bg-green-500" 
                          : "bg-red-500"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <CardDescription>{formatDate(payment.created_at)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Advance Amount:</span>
                      <span className="font-medium">₹{payment.advance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <span className={`font-medium ${
                        payment.status === "pending" 
                          ? "text-yellow-500" 
                          : payment.status === "paid" 
                          ? "text-green-500" 
                          : "text-red-500"
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                    
                    {currentUser.userType === 'user' && payment.status === "pending" && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Payment Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm 
              payment={selectedPayment}
              onPaymentComplete={() => handlePayment(selectedPayment)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Payments;
