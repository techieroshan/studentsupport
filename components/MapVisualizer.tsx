import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, User, Navigation, ArrowRight, Plus, Minus, Move, RotateCcw } from 'lucide-react';
import { MealRequest, MealOffer, UserRole } from '../types';

interface Props {
  items: (MealRequest | MealOffer)[];
  centerCity: string;
  radius: number;
  userRole: UserRole | 'GUEST';
  onSelect: (item: MealRequest | MealOffer) => void;
  onVisibleItemsChange?: (items: (MealRequest | MealOffer)[]) => void;
}

const MapVisualizer: React.FC<Props> = ({ items, centerCity, radius, userRole, onSelect, onVisibleItemsChange }) => {
  const [activePin, setActivePin] = useState<string | null>(null);
  
  // Viewport State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // Offset in percentage

  // 1. Generate stable coordinates for all items
  const itemCoordinates = useMemo(() => {
    const coords = new Map<string, { x: number, y: number }>();
    items.forEach(item => {
      // Deterministic hash for stable positioning
      const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // We want items distributed but clustered somewhat centrally for the demo
      // Angle: 0-360 based on hash
      const angle = (hash % 360) * (Math.PI / 180);
      
      // Distance: 5% to 45% from center (0-50 radius)
      // Modulo logic to vary distance
      const distance = 5 + (hash % 40); 
      
      const x = 50 + Math.cos(angle) * distance;
      const y = 50 + Math.sin(angle) * distance;
      
      coords.set(item.id, { x, y });
    });
    return coords;
  }, [items]);

  // 2. Calculate Visible Items based on Zoom/Pan
  useEffect(() => {
    if (!onVisibleItemsChange) return;

    // Viewport boundaries in percentage (0-100 coordinate space)
    // The visual window is 100x100.
    // When zoomed, the "visible" slice of the coordinate space is smaller.
    // Visible Width = 100 / zoom
    
    // We need to map the "Container Viewport" back to "Content Coordinates"
    // Center of view is (50, 50) + pan relative to the scaled content? No.
    // Let's think: We apply transform: translate(pan.x%, pan.y%) scale(zoom) center(50% 50%)
    
    // Logic: An item is visible if, after transform, it is within 0-100% of the container.
    // Easier approach: Calculate the bounding box of the content that is currently shown.
    
    const visibleResults = items.filter(item => {
      const pos = itemCoordinates.get(item.id);
      if (!pos) return false;

      // Apply the same transform logic to the point
      // Origin is 50,50
      const dx = pos.x - 50;
      const dy = pos.y - 50;
      
      // Scale
      const scaledDx = dx * zoom;
      const scaledDy = dy * zoom;
      
      // Pan
      const finalX = 50 + scaledDx + pan.x;
      const finalY = 50 + scaledDy + pan.y;

      // Check if it lands within the 0-100 container
      // Adding a small buffer (5%) so pins don't disappear instantly at edges
      return finalX >= -5 && finalX <= 105 && finalY >= -5 && finalY <= 105;
    });

    onVisibleItemsChange(visibleResults);
  }, [items, zoom, pan, itemCoordinates, onVisibleItemsChange]);

  // Controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  
  const handlePan = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const step = 20;
    setPan(prev => {
      switch(direction) {
        case 'UP': return { ...prev, y: prev.y + step };
        case 'DOWN': return { ...prev, y: prev.y - step };
        case 'LEFT': return { ...prev, x: prev.x + step };
        case 'RIGHT': return { ...prev, x: prev.x - step };
        default: return prev;
      }
    });
  };

  return (
    <div className="relative w-full h-[500px] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner group">
      
      {/* --- Map Container (Transforms applied here) --- */}
      <div 
        className="absolute inset-0 transition-transform duration-500 ease-out origin-center will-change-transform"
        style={{
          transform: `translate(${pan.x}%, ${pan.y}%) scale(${zoom})`
        }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-[-100%] w-[300%] h-[300%] opacity-10 pointer-events-none" 
          style={{
            backgroundImage: `
              linear-gradient(#94a3b8 1px, transparent 1px),
              linear-gradient(90deg, #94a3b8 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* River/Road simulation (Static Decorative) */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none overflow-visible">
          <path d="M-100,200 C150,400 300,50 450,150 C600,250 900,100 1200,300" stroke="#3b82f6" strokeWidth="20" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Center User Marker (Always at 50,50 of the content space) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative group/user">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping"></div>
            {/* Inverse scale the marker so it stays same visual size regardless of zoom */}
            <div style={{ transform: `scale(${1/zoom})` }} className="relative z-10 bg-brand-600 text-white p-2 rounded-full shadow-lg border-2 border-white transition-transform">
              <Navigation className="h-5 w-5 fill-current" />
            </div>
            {/* Label */}
            <div 
              style={{ transform: `scale(${1/zoom}) translate(-50%, 0)` }}
              className="absolute top-full left-1/2 mt-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm pointer-events-none opacity-0 group-hover/user:opacity-100 transition-opacity"
            >
              {centerCity} (You)
            </div>
          </div>
        </div>

        {/* Radius Indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-brand-300 rounded-full w-[80%] h-[80%] opacity-20 pointer-events-none"></div>

        {/* Item Pins */}
        {items.map((item) => {
          const isRequest = 'seekerId' in item;
          const pos = itemCoordinates.get(item.id) || { x: 50, y: 50 };
          const isActive = activePin === item.id;

          return (
            <div 
              key={item.id}
              className="absolute z-20 cursor-pointer transition-all duration-300"
              style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent map click if we add one
                setActivePin(isActive ? null : item.id);
              }}
            >
              <div 
                 style={{ transform: `translate(-50%, -50%) scale(${isActive ? (1.3/zoom) : (1/zoom)})` }}
                 className={`relative p-1.5 rounded-full shadow-md border-2 border-white transition-all ${
                  isRequest ? 'bg-accent-500 hover:bg-accent-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isRequest ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <MapPin className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Tooltip Card (Needs to counter-scale heavily to stay readable) */}
              {(isActive) && (
                <div 
                  style={{ transform: `translate(-50%, -130%) scale(${1/zoom})` }}
                  className="absolute left-0 bottom-0 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-3 z-50 text-left cursor-default origin-bottom"
                >
                  <div className="flex items-center mb-2">
                     <div className={`w-2 h-2 rounded-full mr-2 ${isRequest ? 'bg-accent-500' : 'bg-emerald-500'}`}></div>
                     <span className="text-xs font-bold text-slate-700 uppercase">
                       {isRequest ? 'Student Request' : 'Meal Offer'}
                     </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
                    {item.description}
                  </p>
                  <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                    <span>{item.city}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                      }}
                      className="text-brand-600 font-bold flex items-center hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
                    >
                      View <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                  {/* Arrow Tip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- HUD Controls (Static, not transformed) --- */}
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
         <button onClick={handleZoomIn} className="bg-white p-2 rounded-lg shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition active:scale-95" title="Zoom In">
           <Plus className="h-5 w-5" />
         </button>
         <button onClick={handleReset} className="bg-white p-2 rounded-lg shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition active:scale-95" title="Reset View">
           <RotateCcw className="h-5 w-5" />
         </button>
         <button onClick={handleZoomOut} className="bg-white p-2 rounded-lg shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition active:scale-95" title="Zoom Out">
           <Minus className="h-5 w-5" />
         </button>
      </div>

      {/* Pan Controls */}
      <div className="absolute bottom-6 left-6 grid grid-cols-3 gap-1 bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg border border-slate-200">
        <div className="col-start-2">
           <button onClick={() => handlePan('DOWN')} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ArrowRight className="h-4 w-4 -rotate-90" /></button>
        </div>
        <div className="col-start-1 row-start-2">
           <button onClick={() => handlePan('RIGHT')} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ArrowRight className="h-4 w-4 rotate-180" /></button>
        </div>
        <div className="col-start-2 row-start-2 flex items-center justify-center">
            <Move className="h-4 w-4 text-slate-400" />
        </div>
        <div className="col-start-3 row-start-2">
           <button onClick={() => handlePan('LEFT')} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="col-start-2 row-start-3">
           <button onClick={() => handlePan('UP')} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ArrowRight className="h-4 w-4 rotate-90" /></button>
        </div>
      </div>
      
      {/* Map Key */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg text-xs text-slate-600 border border-slate-200">
         <p className="font-bold text-slate-900 mb-1.5 border-b border-slate-200 pb-1">Legend</p>
         <div className="flex flex-col space-y-1.5">
            <div className="flex items-center">
               <div className="w-2.5 h-2.5 rounded-full bg-accent-500 mr-2 shadow-sm"></div>
               <span>Student Requests</span>
            </div>
            <div className="flex items-center">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm"></div>
               <span>Meal Offers</span>
            </div>
            <div className="flex items-center">
               <div className="w-2.5 h-2.5 rounded-full bg-brand-600 border border-white mr-2 shadow-sm"></div>
               <span>Your Location</span>
            </div>
         </div>
      </div>

    </div>
  );
};

export default MapVisualizer;