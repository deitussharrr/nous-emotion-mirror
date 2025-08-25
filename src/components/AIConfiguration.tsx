import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Key, Settings, CheckCircle, AlertCircle } from 'lucide-react';

const AIConfiguration: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if OpenAI key is already configured
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenaiKey(savedKey);
      setIsConfigured(true);
    }
  }, []);

  const handleSaveKey = async () => {
    if (!openaiKey.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Save the key
        localStorage.setItem('openai_api_key', openaiKey);
        setIsConfigured(true);
        
        // Update environment variable for the session
        if (typeof window !== 'undefined') {
          (window as any).OPENAI_API_KEY = openaiKey;
        }
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      alert('Invalid OpenAI API key. Please check your key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('openai_api_key');
    setOpenaiKey('');
    setIsConfigured(false);
    
    if (typeof window !== 'undefined') {
      delete (window as any).OPENAI_API_KEY;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Configuration
        </CardTitle>
        <CardDescription>
          Configure AI-powered emotional responses for personalized interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              AI responses are enabled! Your conversations will now include personalized, 
              context-aware responses based on your emotions.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              AI responses are disabled. Add your OpenAI API key to enable personalized responses.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="openai-key" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            OpenAI API Key
          </Label>
          <Input
            id="openai-key"
            type="password"
            placeholder="sk-..."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            disabled={isConfigured}
          />
          <p className="text-xs text-muted-foreground">
            Get your API key from{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          {!isConfigured ? (
            <Button 
              onClick={handleSaveKey} 
              disabled={!openaiKey.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Testing...' : 'Enable AI Responses'}
            </Button>
          ) : (
            <Button 
              onClick={handleRemoveKey} 
              variant="outline"
              className="flex-1"
            >
              Disable AI
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Features enabled with AI:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Personalized emotional responses</li>
            <li>Context-aware conversations</li>
            <li>Emotion transition recognition</li>
            <li>Follow-up questions</li>
            <li>Language style adaptation</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>Privacy:</strong> Your API key is stored locally and never shared. 
          All AI interactions are processed through OpenAI's secure API.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConfiguration;
