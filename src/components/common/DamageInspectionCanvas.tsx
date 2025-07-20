import React, { useRef, useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface DamageInspectionCanvasProps {
  carImage: string;
  initialData?: string;
  onSave: (imageData: string) => void;
  width?: number;
  height?: number; 
}

const DamageInspectionCanvas: React.FC<DamageInspectionCanvasProps> = ({
  carImage,
  initialData,
  onSave,
  width = 800,
  height = 500
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff0000'); // Default red color
  const [lineWidth, setLineWidth] = useState(3);
  const [canvasReady, setCanvasReady] = useState(false);

  // Initialize canvas with car image and possibly existing damage marks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // تنظیم ضخامت خط و رنگ
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const img = new Image();
    img.src = carImage;
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw car image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // If there's initial data, load it
      if (initialData) {
        const savedImg = new Image();
        savedImg.src = initialData || '';
        savedImg.onload = () => {
          ctx.drawImage(savedImg, 0, 0, canvas.width, canvas.height);
        };
      }
      
      setCanvasReady(true);
    };
    
    // ثبت لاگ برای دیباگ
    console.log('Canvas initialized with car image:', carImage);
    console.log('Initial damage data exists:', !!initialData);
    
  }, [carImage, initialData, width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    // Start new path
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      
      // Prevent scrolling when drawing
      e.preventDefault();
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    // Draw line
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // کاهش کیفیت تصویر برای کاهش حجم
    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    console.log('Saving damage inspection data:', imageData.substring(0, 50) + '...');
    onSave(imageData);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas and redraw only the car image
    const img = new Image();
    img.src = carImage;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex space-x-2 space-x-reverse">
        <div className="w-24">
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">رنگ</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value="#ff0000">قرمز</option>
            <option value="#0000ff">آبی</option>
            <option value="#00ff00">سبز</option>
            <option value="#ffff00">زرد</option>
            <option value="#000000">سیاه</option>
          </select>
        </div>
        <div className="w-24">
          <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">ضخامت</label>
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value="1">نازک</option>
            <option value="3">متوسط</option>
            <option value="5">ضخیم</option>
          </select>
        </div>
      </div>
      
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white touch-none"
        />
      </div>
      
      <div className="mt-3 flex space-x-3 space-x-reverse">
        <button
          onClick={handleSave}
          className="flex items-center space-x-1 space-x-reverse px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors"
          disabled={!canvasReady}
        >
          <Save className="w-4 h-4" />
          <span>ذخیره</span>
        </button>
        <button
          onClick={handleClear}
          className="flex items-center space-x-1 space-x-reverse px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
          disabled={!canvasReady}
        >
          <RotateCcw className="w-4 h-4" />
          <span>پاک کردن</span>
        </button>
      </div>
    </div>
  );
};

export default DamageInspectionCanvas;