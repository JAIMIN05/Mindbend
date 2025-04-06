import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Loader2, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface Message {
  text: string;
  type: "user" | "response";
}

interface AIChatClientProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const AIChatClient: React.FC<AIChatClientProps> = ({ isExpanded, setIsExpanded }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeMessageShownRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chat is opened
  useEffect(() => {
    if (isExpanded && !welcomeMessageShownRef.current) {
      setMessages([
        {
          text: "Hello, I am your AI assistant to help you with your roadside assistance needs. How can I help you today?",
          type: "response",
        },
      ]);
      welcomeMessageShownRef.current = true;
    }
  }, [isExpanded]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      setMessages((prev) => [...prev, { text: inputMessage, type: "user" }]);

      // Replace with your actual API endpoint
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/request/chat`, {
        input_value: inputMessage
      });

      if (response.status !== 200) {
        throw new Error("Failed to send message");
      }
      
      setMessages((prev) => [...prev, { text: response.data.message || "Sorry, I couldn't process your request.", type: "response" }]);
      setInputMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => [...prev, { 
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.", 
        type: "response" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          size="lg"
          className="rounded-full w-14 h-14 bg-emergency shadow-lg hover:shadow-xl transition-all duration-300">
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <div className="relative">
          <Card className="w-[350px] shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-emergency text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold">
                AI Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0 text-white hover:bg-red-700">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                          message.type === "user"
                            ? "bg-emergency text-white"
                            : "bg-gray-100"
                        }`}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground p-2 bg-gray-50 rounded-lg">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {error && (
                  <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 bg-gray-50 p-2 rounded-lg">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    className="flex-1 bg-white"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                    className="bg-emergency hover:bg-red-700 transition-colors">
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIChatClient; 