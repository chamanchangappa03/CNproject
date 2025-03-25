import React, { useState, useEffect } from 'react';
import { Fan, Power, Gauge } from 'lucide-react';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Rotate the fan when it's on
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      // Use a base rotation speed and multiply by the current speed level (1-5)
      const baseSpeed = 4; // Base rotation speed
      setRotation(prev => (prev + (baseSpeed * speed)) % 360);
      animationFrame = requestAnimationFrame(animate);
    };

    if (isOn && speed > 0) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isOn, speed]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (newSpeed > 0 && !isOn) {
      setIsOn(true);
    }
  };

  const togglePower = () => {
    setIsOn(!isOn);
    if (!isOn) {
      setSpeed(1); // Default speed when turning on
    } else {
      setSpeed(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center space-y-8">
          {/* Fan Icon */}
          <div className={`relative w-32 h-32 ${isOn ? 'text-blue-600' : 'text-gray-400'} transition-colors duration-300`}>
            <Fan 
              size={128} 
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: speed === 0 ? 'transform 0.5s ease-out' : 'none'
              }} 
            />
          </div>

          {/* Power Button */}
          <button
            onClick={togglePower}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOn 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-300' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Power size={32} />
          </button>

          {/* Speed Control */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 flex items-center gap-2">
                <Gauge size={20} />
                Fan Speed
              </span>
              <span className="text-blue-600 font-semibold">Level {speed}</span>
            </div>
            
            {/* Speed Buttons */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleSpeedChange(level)}
                  className={`py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    speed === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className={`text-lg font-medium ${isOn ? 'text-blue-600' : 'text-gray-400'}`}>
              {isOn ? 'Fan is running' : 'Fan is off'}
            </p>
            {isOn && (
              <p className="text-sm text-gray-500">
                Current speed: Level {speed}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;