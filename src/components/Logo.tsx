
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-nousPurple flex items-center justify-center">
        <span className="text-white text-xl">🧠</span>
      </div>
      <h1 className="text-2xl font-bold text-gradient">Nous</h1>
    </div>
  );
};

export default Logo;
