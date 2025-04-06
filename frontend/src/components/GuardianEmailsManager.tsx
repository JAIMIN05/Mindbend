import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const GuardianEmailsManager: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [guardianEmails, setGuardianEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize with current guardian emails if available
    if (currentUser?.guardian_emails) {
      setGuardianEmails(currentUser.guardian_emails);
    }
  }, [currentUser]);

  const handleAddEmail = () => {
    if (!newEmail || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (guardianEmails.includes(newEmail)) {
      toast.error('This email address is already added');
      return;
    }

    if (guardianEmails.length >= 5) {
      toast.error('You can add at most 5 guardian emails');
      return;
    }

    const newList = [...guardianEmails, newEmail];
    setGuardianEmails(newList);
    setNewEmail('');
  };

  const handleRemoveEmail = (index: number) => {
    const newList = guardianEmails.filter((_, i) => i !== index);
    setGuardianEmails(newList);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Use the correct URL based on your app.js routes and include an empty object
      // for the required fields to avoid validation errors
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        { 
          guardian_emails: guardianEmails,
          // Include these empty values to avoid validation errors
          name: currentUser.name,
          mobile: currentUser.mobile,
          location: currentUser.location
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Guardian emails updated successfully');
        
        // Update the user state in the context
        if (updateUserProfile) {
          await updateUserProfile({
            ...currentUser,
            guardian_emails: guardianEmails
          });
        }
      } else {
        toast.error(response.data.message || 'Failed to update guardian emails');
      }
    } catch (error) {
      console.error('Error updating guardian emails:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to update guardian emails');
        }
      } else {
        toast.error('Failed to update guardian emails');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Add Guardian Email</label>
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email address"
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleAddEmail} disabled={isLoading || !newEmail}>
          Add
        </Button>
      </div>

      {guardianEmails.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Guardian Emails</h3>
          <div className="border rounded-md divide-y">
            {guardianEmails.map((email, index) => (
              <div key={index} className="flex justify-between items-center p-2">
                <span>{email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEmail(index)}
                  disabled={isLoading}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No guardian emails added yet
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Guardian emails will receive notifications during emergencies.</p>
        <p>You can add up to 5 email addresses.</p>
      </div>
    </div>
  );
};

export default GuardianEmailsManager;
