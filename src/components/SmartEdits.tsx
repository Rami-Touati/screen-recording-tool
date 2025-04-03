import React, { useState } from 'react';

interface SmartEditsProps {
  onFeatureToggle: (feature: string, enabled: boolean) => void;
}

interface SmartFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

const smartFeatures: SmartFeature[] = [
  {
    id: 'auto-zoom',
    name: 'Auto Zoom',
    description: 'Automatically zoom in on important content',
    icon: '🔍',
    comingSoon: true
  },
  {
    id: 'cursor-tracking',
    name: 'Smart Cursor',
    description: 'Highlight cursor movements for better visibility',
    icon: '👆',
    comingSoon: true
  },
  {
    id: 'noise-reduction',
    name: 'Noise Reduction',
    description: 'Reduce background noise in audio',
    icon: '🔊',
    comingSoon: true
  },
  {
    id: 'auto-captions',
    name: 'Auto Captions',
    description: 'Generate captions from speech',
    icon: '💬',
    comingSoon: true
  }
];

const SmartEdits: React.FC<SmartEditsProps> = ({ onFeatureToggle }) => {
  const [enabledFeatures, setEnabledFeatures] = useState<{[key: string]: boolean}>({});

  const handleToggle = (featureId: string) => {
    const newState = !enabledFeatures[featureId];
    
    setEnabledFeatures({
      ...enabledFeatures,
      [featureId]: newState
    });
    
    onFeatureToggle(featureId, newState);
  };

  return (
    <div className="smart-edits-panel">
      <div className="smart-panel-header">
        <h3>Smart Edits</h3>
        <span className="ai-badge">AI</span>
      </div>
      
      <p className="panel-description">
        AI-powered features to enhance your recordings
      </p>
      
      <div className="features-list">
        {smartFeatures.map(feature => (
          <div key={feature.id} className="feature-item">
            <div className="feature-info">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-details">
                <div className="feature-title">
                  <span>{feature.name}</span>
                  {feature.comingSoon && (
                    <span className="coming-soon-badge">Coming Soon</span>
                  )}
                </div>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
            
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={!!enabledFeatures[feature.id]}
                onChange={() => handleToggle(feature.id)}
                disabled={feature.comingSoon}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
      
      <div className="smart-panel-footer">
        <button className="auto-enhance-btn">
          <span className="btn-icon">✨</span>
          <span>Auto Enhance (Coming Soon)</span>
        </button>
      </div>

      <style>
        {`
          .smart-edits-panel {
            padding: 16px;
            background-color: #1c1c1c;
            border-radius: 8px;
            width: 100%;
            max-width: 300px;
          }
          
          .smart-panel-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          
          .smart-panel-header h3 {
            margin: 0;
            color: white;
            font-size: 18px;
          }
          
          .ai-badge {
            font-size: 12px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            background: linear-gradient(90deg, #7e22ce 0%, #4f46e5 100%);
            color: white;
          }
          
          .panel-description {
            color: #aaa;
            font-size: 14px;
            margin-top: 0;
            margin-bottom: 16px;
          }
          
          .features-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .feature-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #252525;
            padding: 12px;
            border-radius: 6px;
          }
          
          .feature-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .feature-icon {
            font-size: 20px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #333;
            border-radius: 6px;
          }
          
          .feature-details {
            display: flex;
            flex-direction: column;
          }
          
          .feature-title {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-weight: 500;
          }
          
          .coming-soon-badge {
            font-size: 10px;
            padding: 2px 4px;
            background-color: #333;
            color: #aaa;
            border-radius: 4px;
          }
          
          .feature-description {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #aaa;
          }
          
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 22px;
          }
          
          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #333;
            transition: .4s;
            border-radius: 34px;
          }
          
          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          
          input:checked + .toggle-slider {
            background-color: #4f46e5;
          }
          
          input:checked + .toggle-slider:before {
            transform: translateX(16px);
          }
          
          input:disabled + .toggle-slider {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .smart-panel-footer {
            margin-top: 20px;
          }
          
          .auto-enhance-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px;
            border-radius: 6px;
            background: linear-gradient(90deg, #7e22ce 0%, #4f46e5 100%);
            border: none;
            color: white;
            font-weight: 500;
            cursor: pointer;
            opacity: 0.7;
          }
        `}
      </style>
    </div>
  );
};

export default SmartEdits; 