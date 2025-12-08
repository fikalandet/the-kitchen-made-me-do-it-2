import React, { useState } from 'react';

interface HoroscopeCardProps {
  sign: string;
  symbol: string;
  prediction: string;
}

export const HoroscopeCard: React.FC<HoroscopeCardProps> = ({
  sign,
  symbol,
  prediction,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-48 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className="absolute w-full h-full backface-hidden rounded-2xl shadow-lg overflow-hidden">
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: '#f6f2e0' }}
          >
            <div className="text-6xl mb-3">{symbol}</div>
            <h3 className="font-lobster text-2xl text-gray-800">{sign}</h3>
          </div>
        </div>

        <div className="absolute w-full h-full backface-hidden rounded-2xl shadow-lg overflow-hidden rotate-y-180">
          <div
            className="w-full h-full flex items-center justify-center p-6"
            style={{ backgroundColor: '#56c5c5' }}
          >
            <p className="text-white text-sm text-center leading-relaxed">{prediction}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
