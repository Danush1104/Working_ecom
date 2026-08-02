import { useState, useEffect, useRef } from 'react';

interface DualRangeSliderProps {
 min: number;
 max: number;
 value: [number, number];
 onChange: (value: [number, number]) => void;
}

export function DualRangeSlider({ min, max, value, onChange }: DualRangeSliderProps) {
 const [minVal, setMinVal] = useState(value[0]);
 const [maxVal, setMaxVal] = useState(value[1]);
 const minValRef = useRef(value[0]);
 const maxValRef = useRef(value[1]);
 const range = useRef<HTMLDivElement>(null);

 // Convert to percentage without Math.round to avoid rendering glitches
 const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

 useEffect(() => {
 setMinVal(value[0]);
 setMaxVal(value[1]);
 minValRef.current = value[0];
 maxValRef.current = value[1];
 }, [value]);

 useEffect(() => {
 const minPercent = getPercent(minVal);
 const maxPercent = getPercent(maxValRef.current);

 if (range.current) {
 range.current.style.left =`${minPercent}%`;
 range.current.style.width =`${maxPercent - minPercent}%`;
 }
 }, [minVal, getPercent]);

 useEffect(() => {
 const minPercent = getPercent(minValRef.current);
 const maxPercent = getPercent(maxVal);

 if (range.current) {
 range.current.style.width =`${maxPercent - minPercent}%`;
 }
 }, [maxVal, getPercent]);

 return (
  <div className="relative w-full flex items-center h-5">
    <input 
      type="range"
      min={min}
      max={max}
      value={minVal}
      onChange={(event) => {
        const val = Math.min(Number(event.target.value), maxVal - 1);
        setMinVal(val);
        minValRef.current = val;
        onChange([val, maxVal]);
      }}
      className="absolute w-full h-1 appearance-none pointer-events-none bg-transparent z-30 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(6,182,212,0.6)] focus:[&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(6,182,212,0.3)]"
    />
    <input 
      type="range"
      min={min}
      max={max}
      value={maxVal}
      onChange={(event) => {
        const val = Math.max(Number(event.target.value), minVal + 1);
        setMaxVal(val);
        maxValRef.current = val;
        onChange([minVal, val]);
      }}
      className="absolute w-full h-1 appearance-none pointer-events-none bg-transparent z-40 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(6,182,212,0.6)] focus:[&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(6,182,212,0.3)]"
    />
    <div className="relative w-full">
      <div className="absolute w-full h-1 bg-border-subtle rounded z-10" />
      <div ref={range} className="absolute h-1 bg-primary rounded z-20" />
    </div>
  </div>
 );
}
