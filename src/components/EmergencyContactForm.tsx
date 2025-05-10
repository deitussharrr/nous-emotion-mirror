
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface EmergencyContact {
  name: string;
  email: string;
  phone?: string;
  enabled: boolean;
}

const EmergencyContactForm: React.FC = () => {
  const [contact, setContact] = useState<EmergencyContact>({
    name: '',
    email: '',
    phone: '',
    enabled: false
  });
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    // Load saved contact info from localStorage
    const savedContact = localStorage.getItem('emergencyContact');
    if (savedContact) {
      setContact(JSON.parse(savedContact));
    }
    
    const savedWebhook = localStorage.getItem('n8nWebhookUrl');
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('emergencyContact', JSON.stringify(contact));
    localStorage.setItem('n8nWebhookUrl', webhookUrl);
    setSaved(true);
    
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-nousText-secondary mb-4">Emergency Response Settings</h2>
        <p className="text-nousText-muted mb-6">
          Set up an emergency contact who will be notified if the system detects extremely negative emotions in your journal entries.
        </p>
        
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This feature should not replace professional help. If you're experiencing a mental health emergency, please contact a mental health professional or emergency services immediately.
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-alerts" className="text-base font-medium">Enable Emergency Alerts</Label>
          <Switch 
            id="enable-alerts" 
            checked={contact.enabled}
            onCheckedChange={(checked) => setContact({...contact, enabled: checked})}
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Emergency Contact Name</Label>
            <Input 
              id="name" 
              placeholder="Full name"
              value={contact.name}
              onChange={(e) => setContact({...contact, name: e.target.value})}
              disabled={!contact.enabled}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="email@example.com"
              value={contact.email}
              onChange={(e) => setContact({...contact, email: e.target.value})}
              disabled={!contact.enabled}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input 
              id="phone" 
              placeholder="+1 123 456 7890"
              value={contact.phone || ''}
              onChange={(e) => setContact({...contact, phone: e.target.value})}
              disabled={!contact.enabled}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="webhook">n8n Webhook URL</Label>
        <Input 
          id="webhook" 
          placeholder="https://your-n8n-instance.com/webhook/..."
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          disabled={!contact.enabled}
        />
        <p className="text-xs text-nousText-muted">
          Enter the webhook URL from your n8n workflow that will process emergency alerts.
        </p>
      </div>
      
      <Button 
        onClick={handleSave} 
        disabled={!contact.enabled || !contact.name || !contact.email || !webhookUrl}
        className="w-full"
      >
        Save Emergency Settings
      </Button>
      
      {saved && (
        <p className="text-green-500 text-center">Settings saved successfully!</p>
      )}
    </div>
  );
};

export default EmergencyContactForm;
