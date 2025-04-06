
import React, { useState } from "react";
import { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/contexts/DataContext";

interface PaymentFormProps {
  payment: Payment;
  onPaymentComplete: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onPaymentComplete }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { getServiceProviderById } = useData();
  
  const serviceProvider = getServiceProviderById(payment.serviceProviderId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      onPaymentComplete();
    }, 1500);
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length > 0 ? parts.join(' ') : value;
  };
  
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    
    return v;
  };
  
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Amount to Pay:</span>
          <span className="font-bold text-lg">₹{payment.advance}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Service Provider: {serviceProvider?.name}</p>
          <p>Payment ID: #{payment.id.substring(0, 8)}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing Payment..." : `Pay ₹${payment.advance}`}
          </Button>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            This is a demo payment form. No actual payment will be processed.
          </p>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
