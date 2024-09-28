import React, { useState, useEffect } from 'react';
import './App.css';

import {Amplify} from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';


Amplify.configure(awsExports);

function App() {
  const sensorNames = [
    'Engine RPM', 'Mass Airflow Sensor', 'Battery Consumption Average', 'Battery End of life Sensor',
    'Oxygen Sensor', 'Transmission Status', 'Engine Load', 'Ignition Timing', 'Fuel Consumption Rate', 'Fuel Pressure',
    'Fuel Level', 'Vehicle Speed', 'Suspension Status', 'Particulate filter sensor', 'Air Wheels Sensor', 'Oil Level', 
    'Oil Pressure', 'Oil Temperature', 'Ambien Light Sensor', 'Exterior Light Sensor', 'Clima Enviorment Sensor', 
    'Sound System Sensor'
  ];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];

  const [sensorValues, setSensorValues] = useState(Array(22).fill({ active: false, value: 50 }));
  const [performancePreview, setPerformancePreview] = useState(Array(22).fill(`0xA4 (Inactive)`));

  // Initialize sensors
  useEffect(() => {
    const newPerformancePreview = sensorValues.map((sensor, index) =>
      getPerformanceCode(letters[index], sensor.value, !sensor.active)
    );
    setPerformancePreview(newPerformancePreview);
  }, []);

  // Function to handle sensor value and activation changes
  const handleSensorChange = (index, type, value) => {
    const newSensorValues = [...sensorValues];
    newSensorValues[index] = { ...newSensorValues[index], [type]: value };

    const updatedPerformancePreview = [...performancePreview];
    const { active, value: sensorValue } = newSensorValues[index];
    updatedPerformancePreview[index] = getPerformanceCode(letters[index], sensorValue, !active);
    setPerformancePreview(updatedPerformancePreview);

    setSensorValues(newSensorValues);
  };

  // Function to generate performance code based on sensor value and activation
  const getPerformanceCode = (letter, value, isInactive) => {
    if (isInactive) {
      return `0x${letter}4 (Inactive)`;
    } else if (value > 70) {
      return `0x${letter}1 (High Performance)`;
    } else if (value >= 40 && value <= 70) {
      return `0x${letter}2 (Medium Performance)`;
    } else {
      return `0x${letter}3 (Low Performance)`;
    }
  };

  // Function to generate CSV
  const generateCSV = () => {
    let csvContent = `Sensor,Performance\n`;

    sensorValues.forEach((sensor, index) => {
      const letter = letters[index];
      const performanceCode = getPerformanceCode(letter, sensor.value, !sensor.active);
      csvContent += `${sensorNames[index]},${performanceCode}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'car-sensor-report.csv';
    link.click();
  };

  return (
    <div className="container">
      <div className="left-section">
        <h1>Car Sensors</h1>
        <div id="sensor-container">
          {sensorNames.map((sensor, index) => (
            <div key={index} className="sensor">
              <div className="sensor-controls">
                <input
                  type="checkbox"
                  id={`sensor${index + 1}-active`}
                  checked={sensorValues[index].active}
                  onChange={(e) => handleSensorChange(index, 'active', e.target.checked)}
                />
                <label htmlFor={`sensor${index + 1}`}>{sensor}</label>
              </div>
              <input
                type="range"
                id={`sensor${index + 1}`}
                name={`sensor${index + 1}`}
                min="0"
                max="100"
                value={sensorValues[index].value}
                disabled={!sensorValues[index].active}
                onChange={(e) => handleSensorChange(index, 'value', e.target.value)}
              />
            </div>
          ))}
        </div>
        <button className="submit-btn" onClick={generateCSV}>Submit</button>
      </div>

      <div className="right-section">
        <h2>Performance Preview</h2>
        <div id="performance-preview" className="right-content">
          {sensorNames.map((sensor, index) => (
            <div key={index} className="preview-item">
              <span>{sensor}:</span> <span>{performancePreview[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
