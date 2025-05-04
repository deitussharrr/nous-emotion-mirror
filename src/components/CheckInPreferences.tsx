
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface CheckInPreferencesProps {
  className?: string;
}

const CheckInPreferences: React.FC<CheckInPreferencesProps> = ({ className }) => {
  const [emailCheckins, setEmailCheckins] = useState(false);
  const [appNotifications, setAppNotifications] = useState(true);
  const [email, setEmail] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically save to a database
    // For now we'll just show a toast confirmation
    toast({
      title: "Preferences saved",
      description: emailCheckins 
        ? `You'll receive daily check-ins at ${email} in the ${timeOfDay}`
        : "App notifications enabled for check-ins",
    });
    
    // In a real app, we would save these preferences to localStorage or a database
    localStorage.setItem('emailCheckins', String(emailCheckins));
    localStorage.setItem('appNotifications', String(appNotifications));
    if (emailCheckins && email) {
      localStorage.setItem('checkinEmail', email);
      localStorage.setItem('checkinTime', timeOfDay);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold text-nousText-secondary">Daily Check-In Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="email-checkins" 
            checked={emailCheckins} 
            onCheckedChange={setEmailCheckins} 
          />
          <Label htmlFor="email-checkins">Email daily check-ins</Label>
        </div>
        
        {emailCheckins && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Your email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={emailCheckins}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Check-in time</Label>
              <select
                id="time"
                className="w-full border border-input bg-background rounded-md p-2"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              >
                <option value="morning">Morning (9 AM)</option>
                <option value="afternoon">Afternoon (2 PM)</option>
                <option value="evening">Evening (8 PM)</option>
              </select>
            </div>
          </>
        )}
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="app-notifications" 
            checked={appNotifications} 
            onCheckedChange={setAppNotifications} 
          />
          <Label htmlFor="app-notifications">App notifications</Label>
        </div>
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full"
      >
        Save Preferences
      </button>
    </form>
  );
};

export default CheckInPreferences;
