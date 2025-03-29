import React, { useState, useEffect } from 'react';
import { Fan, Power, Gauge } from 'lucide-react';

// Get ESP32 IP from environment variable or use a default for development
const ESP32_IP = import.meta.env.VITE_ESP32_IP || '192.168.1.100';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // ESP32 communication
  const sendCommandToESP32 = async (speedLevel: number) => {
    try {
      setConnectionError(null);
      let command = 'OFF';
      if (speedLevel > 0) {
        if (speedLevel <= 2) command = 'LOW';
        else if (speedLevel <= 4) command = 'MEDIUM';
        else command = 'HIGH';
      }

      const response = await fetch(`http://${ESP32_IP}/set?speed=${command}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error communicating with ESP32:', error);
      setConnectionError(`Cannot connect to fan controller at ${ESP32_IP}. Make sure the device is powered on and connected to your network.`);
    }
  };

  // Rotate the fan when it's on
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      const baseSpeed = 4;
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

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeed(newSpeed);
    if (newSpeed > 0 && !isOn) {
      setIsOn(true);
    }
    await sendCommandToESP32(newSpeed);
  };

  const togglePower = async () => {
    const newPowerState = !isOn;
    setIsOn(newPowerState);
    if (!newPowerState) {
      setSpeed(0);
      await sendCommandToESP32(0);
    } else {
      setSpeed(1);
      await sendCommandToESP32(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center space-y-8">
          
          <div className={`relative w-32 h-32 ${isOn ? 'text-blue-600' : 'text-gray-400'} transition-colors duration-300`}>
            <Fan 
              size={128} 
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: speed === 0 ? 'transform 0.5s ease-out' : 'none'
              }} 
            />
          </div>

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

          {/* Status and Error Messages */}
          <div className="text-center">
            <p className={`text-lg font-medium ${isOn ? 'text-blue-600' : 'text-gray-400'}`}>
              {isOn ? 'Fan is running' : 'Fan is off'}
            </p>
            {isOn && (
              <p className="text-sm text-gray-500">
                Current speed: Level {speed}
              </p>
            )}
            {connectionError && (
              <p className="mt-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {connectionError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;