import React, { useState } from 'react';

interface BackgroundPanelProps {
  onBackgroundChange: (background: Background) => void;
}

export interface Background {
  type: 'color' | 'gradient' | 'image';
  value: string;
  blur: number;
  dim: number;
}

const backgrounds = {
  gradients: [
    { id: 'gradient1', value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
    { id: 'gradient2', value: 'linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%)' },
    { id: 'gradient3', value: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)' },
    { id: 'gradient4', value: 'linear-gradient(to right, #243949 0%, #517fa4 100%)' },
    { id: 'gradient5', value: 'linear-gradient(to right, #ff6e7f 0%, #bfe9ff 100%)' },
    { id: 'gradient6', value: 'linear-gradient(to right, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  ],
  landscapes: [
    { id: 'landscape1', value: '/assets/backgrounds/landscape1.jpg' },
    { id: 'landscape2', value: '/assets/backgrounds/landscape2.jpg' },
    { id: 'landscape3', value: '/assets/backgrounds/landscape3.jpg' },
    { id: 'landscape4', value: '/assets/backgrounds/landscape4.jpg' },
    { id: 'landscape5', value: '/assets/backgrounds/landscape5.jpg' },
    { id: 'landscape6', value: '/assets/backgrounds/landscape6.jpg' },
  ],
  abstract: [
    { id: 'abstract1', value: '/assets/backgrounds/abstract1.jpg' },
    { id: 'abstract2', value: '/assets/backgrounds/abstract2.jpg' },
    { id: 'abstract3', value: '/assets/backgrounds/abstract3.jpg' },
    { id: 'abstract4', value: '/assets/backgrounds/abstract4.jpg' },
    { id: 'abstract5', value: '/assets/backgrounds/abstract5.jpg' },
    { id: 'abstract6', value: '/assets/backgrounds/abstract6.jpg' },
  ],
  solid: [
    { id: 'black', value: '#000000' },
    { id: 'dark-gray', value: '#222222' },
    { id: 'blue', value: '#0f172a' },
    { id: 'purple', value: '#2e1065' },
    { id: 'green', value: '#064e3b' },
    { id: 'red', value: '#450a0a' },
  ]
};

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ onBackgroundChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<'gradients' | 'landscapes' | 'abstract' | 'solid'>('gradients');
  const [selectedBackground, setSelectedBackground] = useState<string>(backgrounds.gradients[0].id);
  const [blur, setBlur] = useState(0);
  const [dim, setDim] = useState(0);

  const handleBackgroundSelect = (category: 'gradients' | 'landscapes' | 'abstract' | 'solid', id: string) => {
    setSelectedCategory(category);
    setSelectedBackground(id);
    
    const background = backgrounds[category].find(bg => bg.id === id);
    if (background) {
      onBackgroundChange({
        type: category === 'gradients' || category === 'solid' ? 'color' : 'image',
        value: background.value,
        blur,
        dim
      });
    }
  };

  const handleBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBlur = parseInt(e.target.value);
    setBlur(newBlur);
    
    const background = backgrounds[selectedCategory].find(bg => bg.id === selectedBackground);
    if (background) {
      onBackgroundChange({
        type: selectedCategory === 'gradients' || selectedCategory === 'solid' ? 'color' : 'image',
        value: background.value,
        blur: newBlur,
        dim
      });
    }
  };

  const handleDimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDim = parseInt(e.target.value);
    setDim(newDim);
    
    const background = backgrounds[selectedCategory].find(bg => bg.id === selectedBackground);
    if (background) {
      onBackgroundChange({
        type: selectedCategory === 'gradients' || selectedCategory === 'solid' ? 'color' : 'image',
        value: background.value,
        blur,
        dim: newDim
      });
    }
  };

  return (
    <div className="background-panel">
      <h3>Background</h3>
      
      <div className="category-tabs">
        <button 
          className={selectedCategory === 'gradients' ? 'active' : ''} 
          onClick={() => setSelectedCategory('gradients')}
        >
          Gradient
        </button>
        <button 
          className={selectedCategory === 'landscapes' ? 'active' : ''} 
          onClick={() => setSelectedCategory('landscapes')}
        >
          Landscape
        </button>
        <button 
          className={selectedCategory === 'abstract' ? 'active' : ''} 
          onClick={() => setSelectedCategory('abstract')}
        >
          Abstract
        </button>
        <button 
          className={selectedCategory === 'solid' ? 'active' : ''} 
          onClick={() => setSelectedCategory('solid')}
        >
          Solid
        </button>
      </div>
      
      <div className="background-grid">
        {backgrounds[selectedCategory].map((bg) => (
          <div 
            key={bg.id}
            className={`background-option ${selectedBackground === bg.id ? 'selected' : ''}`}
            onClick={() => handleBackgroundSelect(selectedCategory, bg.id)}
          >
            <div 
              className="bg-preview" 
              style={{
                background: selectedCategory === 'gradients' || selectedCategory === 'solid' 
                  ? bg.value 
                  : `url(${bg.value})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
            />
          </div>
        ))}
      </div>
      
      <div className="adjustment-controls">
        <div className="control-group">
          <label htmlFor="blur-slider">Blur</label>
          <input 
            id="blur-slider"
            type="range" 
            min="0" 
            max="20" 
            value={blur} 
            onChange={handleBlurChange}
          />
          <span className="value-display">{blur}</span>
        </div>
        
        <div className="control-group">
          <label htmlFor="dim-slider">Dim</label>
          <input 
            id="dim-slider"
            type="range" 
            min="0" 
            max="90" 
            value={dim} 
            onChange={handleDimChange}
          />
          <span className="value-display">{dim}%</span>
        </div>
      </div>

      <style>
        {`
          .background-panel {
            padding: 16px;
            background-color: #1c1c1c;
            border-radius: 8px;
            width: 100%;
            max-width: 300px;
          }
          
          .background-panel h3 {
            margin-top: 0;
            margin-bottom: 16px;
            color: #fff;
            font-size: 18px;
          }
          
          .category-tabs {
            display: flex;
            margin-bottom: 16px;
            border-bottom: 1px solid #333;
          }
          
          .category-tabs button {
            flex: 1;
            background: none;
            border: none;
            padding: 8px 0;
            color: #aaa;
            cursor: pointer;
            font-size: 14px;
          }
          
          .category-tabs button.active {
            color: #fff;
            border-bottom: 2px solid #2563eb;
          }
          
          .background-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 16px;
          }
          
          .background-option {
            position: relative;
            padding-top: 75%; /* 4:3 aspect ratio */
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
          }
          
          .background-option.selected {
            outline: 2px solid #2563eb;
          }
          
          .bg-preview {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          
          .adjustment-controls {
            margin-top: 20px;
          }
          
          .control-group {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .control-group label {
            width: 50px;
            color: #ddd;
            font-size: 14px;
          }
          
          .control-group input {
            flex: 1;
            margin: 0 10px;
          }
          
          .value-display {
            color: #ddd;
            font-size: 14px;
            width: 40px;
            text-align: right;
          }
        `}
      </style>
    </div>
  );
};

export default BackgroundPanel; 