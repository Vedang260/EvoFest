'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './popOver';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  minTime?: string;
}

export const TimePicker = ({ value, onChange, minTime }: TimePickerProps) => {
  const [hour, setHour] = React.useState(12);
  const [minute, setMinute] = React.useState(0);
  const [period, setPeriod] = React.useState<'AM' | 'PM'>('AM');

  React.useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ');
      const [h, m] = time.split(':').map(Number);
      setHour(h);
      setMinute(m);
      setPeriod(period as 'AM' | 'PM');
    }
  }, [value]);

  const handleHourChange = (h: number) => {
    setHour(h);
    updateTime(h, minute, period);
  };

  const handleMinuteChange = (m: number) => {
    setMinute(m);
    updateTime(hour, m, period);
  };

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(newPeriod);
    updateTime(hour, minute, newPeriod);
  };

  const updateTime = (h: number, m: number, p: 'AM' | 'PM') => {
    const formattedHour = h.toString().padStart(2, '0');
    const formattedMinute = m.toString().padStart(2, '0');
    onChange(`${formattedHour}:${formattedMinute} ${p}`);
  };

  const renderClock = () => {
    const hours = [];
    const minutes = [];

    for (let i = 1; i <= 12; i++) {
      hours.push(
        <button
          key={`hour-${i}`}
          type="button"
          className={cn(
            'absolute w-8 h-8 rounded-full flex items-center justify-center',
            hour === i ? 'bg-primary-light text-neutral-white' : 'hover:bg-neutral-light'
          )}
          style={{
            transform: `rotate(${i * 30}deg) translate(0, -70px) rotate(-${i * 30}deg)`,
          }}
          onClick={() => handleHourChange(i)}
        >
          {i}
        </button>
      );
    }

    for (let i = 0; i < 60; i += 5) {
      minutes.push(
        <button
          key={`minute-${i}`}
          type="button"
          className={cn(
            'absolute w-6 h-6 rounded-full flex items-center justify-center text-xs',
            minute === i ? 'bg-secondary-light text-neutral-white' : 'hover:bg-neutral-light'
          )}
          style={{
            transform: `rotate(${i * 6}deg) translate(0, -90px) rotate(-${i * 6}deg)`,
          }}
          onClick={() => handleMinuteChange(i)}
        >
          {i.toString().padStart(2, '0')}
        </button>
      );
    }

    return (
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-light flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-neutral-dark" />
        </div>
        {hours}
        {minutes}
        {/* Hour hand */}
        <div
          className="absolute left-1/2 top-1/2 w-1 h-12 bg-neutral-dark origin-bottom transform -translate-x-1/2 -translate-y-full"
          style={{
            transform: `translateX(-50%) translateY(-100%) rotate(${hour * 30 + minute * 0.5}deg)`,
          }}
        />
        {/* Minute hand */}
        <div
          className="absolute left-1/2 top-1/2 w-1 h-16 bg-neutral-dark origin-bottom transform -translate-x-1/2 -translate-y-full"
          style={{
            transform: `translateX(-50%) translateY(-100%) rotate(${minute * 6}deg)`,
          }}
        />
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || 'Select time'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col items-center gap-4">
          {renderClock()}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePeriod}
                className="text-primary-light hover:text-primary-dark"
              >
                {period}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};