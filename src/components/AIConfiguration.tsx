import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Key, Settings, CheckCircle, AlertCircle } from 'lucide-react';

const AIConfiguration: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [model, setModel] = useState<string>(localStorage.getItem('openrouter_model') || (import.meta as any)?.env?.VITE_OPENROUTER_MODEL || 'mistralai/mistral-small-3.2-24b-instruct:free');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hfModel, setHfModel] = useState<string>(localStorage.getItem('hf_response_model') || (import.meta as any)?.env?.VITE_HF_RESPONSE_MODEL || 'CohereLabs/command-a-reasoning-08-2025');
  const [hfKey, setHfKey] = useState<string>(localStorage.getItem('hf_api_key') || '');

  useEffect(() => {
    // Check if OpenRouter key is already configured
    const savedKey = localStorage.getItem('openrouter_api_key');
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
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window?.location?.origin || 'http://localhost:3000',
          'X-Title': 'Nous Emotion Mirror'
        }
      });

      if (response.ok) {
        // Save the key
        localStorage.setItem('openrouter_api_key', openaiKey);
        setIsConfigured(true);
        
        // Update environment variable for the session
        if (typeof window !== 'undefined') {
          (window as any).OPENROUTER_API_KEY = openaiKey;
        }
        alert('OpenRouter API key saved locally for this browser.');
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      alert('Invalid OpenRouter API key. Please check your key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('openrouter_api_key');
    setOpenaiKey('');
    setIsConfigured(false);
    
    if (typeof window !== 'undefined') {
      delete (window as any).OPENROUTER_API_KEY;
    }
  };

  const handleSaveModel = () => {
    const value = model.trim();
    if (!value) return;
    localStorage.setItem('openrouter_model', value);
    alert('Response model saved.');
  };

  const handleSaveHf = () => {
    if (hfKey.trim()) {
      localStorage.setItem('hf_api_key', hfKey.trim());
    }
    if (hfModel.trim()) {
      localStorage.setItem('hf_response_model', hfModel.trim());
    }
    alert('Hugging Face settings saved.');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
                 <CardTitle className="flex items-center gap-2">
           <Brain className="w-5 h-5" />
           AI Configuration (OpenRouter + Mistral)
         </CardTitle>
         <CardDescription>
           Configure AI-powered emotional responses using OpenRouter with Mistral model
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
                     <Label htmlFor="openrouter-key" className="flex items-center gap-2">
             <Key className="w-4 h-4" />
             OpenRouter API Key
           </Label>
           <Input
             id="openrouter-key"
             type="password"
             placeholder="sk-or-v1-..."
             value={openaiKey}
             onChange={(e) => setOpenaiKey(e.target.value)}
             disabled={isConfigured}
           />
           <p className="text-xs text-muted-foreground">
             Get your API key from{' '}
             <a 
               href="https://openrouter.ai/keys" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-blue-600 hover:underline"
             >
               OpenRouter Platform
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

        <div className="space-y-2">
          <Label htmlFor="model">Response Model</Label>
          <div className="flex gap-2">
            <Input
              id="model"
              placeholder="meta-llama/llama-3.1-70b-instruct:free"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <Button variant="secondary" onClick={handleSaveModel}>Save</Button>
          </div>
          <p className="text-xs text-muted-foreground">Set any OpenRouter model slug. Examples: meta-llama/..., google/gemma-..., anthropic/claude-...</p>
        </div>

        <div className="space-y-2 pt-2">
          <Label>Hugging Face (Preferred if configured)</Label>
          <Input
            placeholder="hf_..."
            type="password"
            value={hfKey}
            onChange={(e) => setHfKey(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="CohereLabs/command-a-reasoning-08-2025"
              value={hfModel}
              onChange={(e) => setHfModel(e.target.value)}
            />
            <Button variant="secondary" onClick={handleSaveHf}>Save</Button>
          </div>
          <p className="text-xs text-muted-foreground">Responses will use this HF model when a key is set. Falls back to OpenRouter otherwise.</p>
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
           <p><strong>Model:</strong> Using Mistral Small 3.2B (24B Instruct) via OpenRouter</p>
           <p><strong>Privacy:</strong> Your API key is stored locally and never shared. 
           All AI interactions are processed through OpenRouter's secure API.</p>
         </div>
      </CardContent>
    </Card>
  );
};

export default AIConfiguration;
