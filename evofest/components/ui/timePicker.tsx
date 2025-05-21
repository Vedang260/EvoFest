import React from 'react';
import { Input } from './input';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  minTime?: string;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  minTime,
  className 
}) => {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={minTime}
      className={className}
    />
  );
};

export default TimePicker;