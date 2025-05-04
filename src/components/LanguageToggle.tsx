
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface LanguageToggleProps {
  useGenZ: boolean;
  setUseGenZ: (value: boolean) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ useGenZ, setUseGenZ }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Switch 
        id="gen-z-mode" 
        checked={useGenZ}
        onCheckedChange={setUseGenZ}
      />
      <Label htmlFor="gen-z-mode" className="text-nousText-secondary cursor-pointer">
        {useGenZ ? 'Gen Z Mode: On' : 'Gen Z Mode: Off'}
      </Label>
    </div>
  );
};

export default LanguageToggle;
