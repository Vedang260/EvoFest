import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  mode?: 'single' | 'range' | 'multiple';
  selected?: Date | Date[] | { from: Date; to: Date };
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = 'single',
  selected,
  ...props
}: CalendarProps) {
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rdp {
        --rdp-cell-size: 40px;
        --rdp-accent-color: rgb(124 58 237);
        --rdp-background-color: rgba(124, 58, 237, 0.2);
        margin: 0;
      }
      .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
        background-color: var(--rdp-accent-color);
        color: white;
      }
      .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
        background-color: var(--rdp-background-color);
      }
    `;
    document.head.appendChild(style);
    setCssLoaded(true);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!cssLoaded) {
    return <div className="p-4">Loading calendar...</div>;
  }

  return (
    <DayPicker
      mode={mode}
      selected={selected}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        day_selected: 'bg-purple-600 text-white hover:bg-purple-600 focus:bg-purple-600',
        day_today: 'bg-gray-100',
        day_outside: 'text-gray-300 opacity-50',
        day_disabled: 'text-gray-300 opacity-50',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

// Small icon components for the calendar
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}