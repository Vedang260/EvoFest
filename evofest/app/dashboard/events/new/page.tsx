"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, FileVideo, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Calendar } from '../../../../components/ui/calendar';
import TimePicker from '../../../../components/ui/timePicker';
import { cn } from '../../../../lib/utils';
import { eventSchema } from '../../../../lib/validations/event';
import { EventScheduleSchema } from '@/lib/validations/eventSchedule';
import { dailyTicketTypeEntrySchema } from '@/lib/validations/dailyTicketTypeEntry';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useAppSelector } from '@/lib/hooks/hook';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Combine Zod schemas for the full form
const fullFormSchema = z.object({
  event: eventSchema,
  schedules: z.array(
    EventScheduleSchema.extend({ 
      ticketTypes: z.array(dailyTicketTypeEntrySchema) 
    })
  ).min(1, 'At least one schedule is required'),
}).refine(
  (data) => {
    // Ensure schedule dates are within event start and end dates
    return data.schedules.every((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= new Date(data.event.startDate) && scheduleDate <= new Date(data.event.endDate);
    });
  },
  { message: 'Schedule date must be between event start and end dates', path: ['schedules'] }
).refine(
  (data) => {
    // Ensure total schedule capacity does not exceed event capacity
    const totalScheduleCapacity = data.schedules.reduce((sum, schedule) => sum + schedule.capacity, 0);
    return totalScheduleCapacity <= data.event.capacity;
  },
  { message: 'Total schedule capacity cannot exceed event capacity', path: ['schedules'] }
).refine(
  (data) => {
    // Ensure total ticket quantity per schedule does not exceed schedule capacity
    return data.schedules.every((schedule) => {
      const totalTickets = schedule.ticketTypes.reduce((sum: number, ticket: any) => sum + ticket.quantity, 0);
      return totalTickets <= schedule.capacity;
    });
  },
  { message: 'Total ticket quantity cannot exceed schedule capacity', path: ['schedules'] }
);


type FormValues = z.infer<typeof fullFormSchema>;

// Interface for media files
interface MediaFile extends File {
  preview?: string;
}

const CreateEventForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  const initialValues: FormValues = {
    event: {
      title: '',
      description: '',
      category: 'MUSIC',
      venue: '',
      media: [],
      startDate: new Date(),
      endDate: new Date(),
      prohibitedItems: [''],
      termsAndConditions: [''],
      capacity: 100,
    },
    schedules: [],
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const files = Array.from(e.target.files || []) as MediaFile[];

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType = file.type.match('image.*') || file.type.match('video.*');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    // Create previews for images
    const filesWithPreviews = validFiles.map((file) => {
      if (file.type.match('image.*')) {
        file.preview = URL.createObjectURL(file);
      }
      return file;
    });

    setSelectedFiles((prev) => [...prev, ...filesWithPreviews]);
    e.target.value = ''; // Reset input
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setUploading(true);
      // Prepare data for backend
      const payload = {
        eventBody: {
          ...values.event,
          startDate: new Date(values.event.startDate).toISOString(),
          endDate: new Date(values.event.endDate).toISOString(),
        },
        schedules: values.schedules.map((schedule) => ({
          date: new Date(schedule.date).toISOString(),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          capacity: schedule.capacity,
          ticketTypes: schedule.ticketTypes.map((ticket: any) => ({
            type: ticket.type,
            price: Number(ticket.price),
            quantity: Number(ticket.quantity),
          })),
        })),
      };

      console.log('Submitting event:', payload);

      if (token) {
        const response = await axios.post('/api/events/create', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          toast.success('New Event is created successfully');
          router.push('/events');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to create event.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
          <motion.h1
            className="text-3xl font-bold mb-6 text-purple-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Create New Event
          </motion.h1>

          <Formik
            initialValues={initialValues}
            validationSchema={toFormikValidationSchema(fullFormSchema)}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting, validateForm }) => (
              <Form>
                {/* Progress Steps */}
                <motion.div className="flex mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  {['Event Info', 'Date & Venue', 'Rules', 'Capacity', 'Media'].map((step, index) => (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors',
                          currentStep >= index
                            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        )}
                      >
                        {index + 1}
                      </button>
                      <span
                        className={cn(
                          'text-sm',
                          currentStep === index ? 'font-bold text-purple-800' : 'text-gray-600'
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </motion.div>

                <div className="min-h-[400px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: currentStep > 0 ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: currentStep > 0 ? -50 : 50 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentStep === 0 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold text-purple-800">Basic Event Information</h2>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Event Title*</label>
                            <Field
                              as={Input}
                              name="event.title"
                              placeholder="Enter event title"
                              className={cn(
                                'rounded-md',
                                errors.event?.title && touched.event?.title && 'border-red-500'
                              )}
                            />
                            {errors.event?.title && touched.event?.title && (
                              <div className="text-red-500 text-sm mt-1">{errors.event.title}</div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Description*</label>
                            <Field
                              as={Textarea}
                              name="event.description"
                              rows={4}
                              placeholder="Describe your event in detail..."
                              className={cn(
                                'rounded-md',
                                errors.event?.description && touched.event?.description && 'border-red-500'
                              )}
                            />
                            {errors.event?.description && touched.event?.description && (
                              <div className="text-red-500 text-sm mt-1">{errors.event.description}</div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Category*</label>
                            <Select
                              value={values.event.category}
                              onValueChange={(value) => setFieldValue('event.category', value)}
                            >
                              <SelectTrigger className="w-full rounded-md">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {['MUSIC', 'SPORTS', 'COMEDY', 'WORKSHOP', 'CONFERENCE', 'PARTIES', 'ARCADE', 'ART', 'FOOD', 'FESTIVAL', 'BUSINESS', 'TECH'].map(
                                  (option) => (
                                    <SelectItem key={option} value={option}>
                                      {option.charAt(0) + option.slice(1).toLowerCase()}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            {errors.event?.category && touched.event?.category && (
                              <div className="text-red-500 text-sm mt-1">{errors.event.category}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold text-purple-800">Date & Venue</h2>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Venue*</label>
                            <Field
                              as={Input}
                              name="event.venue"
                              placeholder="Enter venue address"
                              className={cn(
                                'rounded-md',
                                errors.event?.venue && touched.event?.venue && 'border-red-500'
                              )}
                            />
                            {errors.event?.venue && touched.event?.venue && (
                              <div className="text-red-500 text-sm mt-1">{errors.event.venue}</div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-600">Start Date*</label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full justify-start text-left font-normal rounded-md',
                                      !values.event.startDate && 'text-gray-400',
                                      errors.event?.startDate && touched.event?.startDate && 'border-red-500'
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                    {values.event.startDate ? (
                                      format(new Date(values.event.startDate), 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={values.event.startDate ? new Date(values.event.startDate) : undefined}
                                    onSelect={(date: Date | undefined) => {
                                      if (date) {
                                        setFieldValue('event.startDate', date.toISOString());
                                        if (values.event.endDate && new Date(values.event.endDate) < date) {
                                          setFieldValue('event.endDate', date.toISOString());
                                        }
                                      }
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {typeof errors.event?.startDate === 'string' && touched.event?.startDate && (
                                <div className="text-red-500 text-sm mt-1">
                                  {errors.event.startDate}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-600">End Date*</label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full justify-start text-left font-normal rounded-md',
                                      !values.event.endDate && 'text-gray-400',
                                      errors.event?.endDate && touched.event?.endDate && 'border-red-500'
                                    )}
                                    disabled={!values.event.startDate}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                    {values.event.endDate ? (
                                      format(new Date(values.event.endDate), 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={values.event.endDate ? new Date(values.event.endDate) : undefined}
                                    onSelect={(date: Date | undefined) => {
                                      if (date) {
                                        setFieldValue('event.endDate', date.toISOString());
                                      }
                                    }}
                                    initialFocus
                                    fromDate={values.event.startDate ? new Date(values.event.startDate) : new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                              {typeof errors.event?.endDate === 'string' && touched.event?.endDate && (
                                <div className="text-red-500 text-sm mt-1">{errors.event.endDate}</div>
                              )}
                            </div>
                          </div>
                          {values.event.startDate && values.event.endDate && (
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-600">Event Schedules*</label>
                              <FieldArray name="schedules">
                                {({ push, remove }) => (
                                  <div className="space-y-4">
                                    {values.schedules.map((schedule, index) => (
                                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                          <h3 className="font-medium text-purple-800">Schedule {index + 1}</h3>
                                          <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-600">Date*</label>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  className={cn(
                                                    'w-full justify-start text-left font-normal rounded-md',
                                                    !schedule.date && 'text-gray-400',
                                                    typeof errors.schedules?.[index] === 'object' && errors.schedules?.[index]?.date && 'border-red-500'
                                                  )}
                                                >
                                                  <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                                  {schedule.date ? format(new Date(schedule.date), 'PPP') : <span>Pick a date</span>}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                  mode="single"
                                                  selected={schedule.date ? new Date(schedule.date) : undefined}
                                                  onSelect={(date: Date | undefined) => {
                                                    if (date) {
                                                      setFieldValue(`schedules.${index}.date`, date.toISOString());
                                                    }
                                                  }}
                                                  initialFocus
                                                  fromDate={new Date(values.event.startDate)}
                                                  toDate={new Date(values.event.endDate)}
                                                />
                                              </PopoverContent>
                                            </Popover>
                                            {typeof errors.schedules?.[index] === 'object' && errors.schedules[index]?.date && (
                                              <div className="text-red-500 text-sm mt-1">
                                                {typeof errors.schedules[index].date === 'string'
                                                  ? errors.schedules[index].date
                                                  : JSON.stringify(errors.schedules[index].date)}
                                              </div>
                                            )}

                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-600">Start Time*</label>
                                            <TimePicker
                                              value={schedule.startTime}
                                              onChange={(time) => setFieldValue(`schedules.${index}.startTime`, time)}
                                            />
                                            {typeof errors.schedules?.[index] === 'object' && errors.schedules[index]?.startTime && (
                                              <div className="text-red-500 text-sm mt-1">{errors.schedules[index].startTime}</div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-600">End Time*</label>
                                            <TimePicker
                                              value={schedule.endTime}
                                              onChange={(time) => setFieldValue(`schedules.${index}.endTime`, time)}
                                              minTime={schedule.startTime}
                                            />
                                            {typeof errors.schedules?.[index] === 'object' && errors.schedules[index]?.endTime && (
                                              <div className="text-red-500 text-sm mt-1">{errors.schedules[index].endTime}</div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-600">Capacity*</label>
                                            <Field
                                              as={Input}
                                              name={`schedules.${index}.capacity`}
                                              type="number"
                                              min="1"
                                              className={cn(
                                                  'rounded-md',
                                                  typeof errors.schedules?.[index] === 'string' && 'border-red-500'
                                                )}
                                            />
                                            {typeof errors.schedules?.[index] === 'object'  && errors.schedules[index]?.capacity && (
                                              <div className="text-red-500 text-sm mt-1">{errors.schedules[index].capacity}</div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="mt-4">
                                          <label className="block text-sm font-medium mb-2 text-gray-600">Ticket Types*</label>
                                          <FieldArray name={`schedules.${index}.ticketTypes`}>
                                            {({ push: pushTicket, remove: removeTicket }) => (
                                              <div className="space-y-4">
                                                {schedule.ticketTypes.map((ticket: any, ticketIndex: any) => (
                                                  <div key={ticketIndex} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                      <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-600">Type*</label>
                                                        <Select
                                                          value={ticket.type}
                                                          onValueChange={(value) =>
                                                            setFieldValue(`schedules.${index}.ticketTypes.${ticketIndex}.type`, value)
                                                          }
                                                        >
                                                          <SelectTrigger
                                                            className={cn(
                                                              'rounded-md',
                                                              typeof errors.schedules?.[index] === 'object' && errors.schedules[index]?.ticketTypes?.[ticketIndex] && 'border-red-500'
                                                            )}
                                                          >
                                                            <SelectValue placeholder="Select type" />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            {['GENERAL', 'VIP', 'FIRST50', 'FIRST100'].map((option) => (
                                                              <SelectItem key={option} value={option}>
                                                                {option.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                                              </SelectItem>
                                                            ))}
                                                          </SelectContent>
                                                        </Select>
                                                        {typeof errors.schedules?.[index] === 'object' && 
                                                          Array.isArray(errors.schedules[index]?.ticketTypes) &&
                                                          typeof errors.schedules[index].ticketTypes[ticketIndex] === 'object' &&
                                                          errors.schedules[index].ticketTypes[ticketIndex]?.type && (
                                                            <div className="text-red-500 text-sm mt-1">
                                                              {errors.schedules[index].ticketTypes[ticketIndex].type}
                                                            </div>
                                                        )}

                                                      </div>
                                                      <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-600">Price*</label>
                                                        <div className="relative">
                                                          <span className="absolute left-3 top-2 text-gray-600">$</span>
                                                          <Field
                                                            as={Input}
                                                            name={`schedules.${index}.ticketTypes.${ticketIndex}.price`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className={cn(
                                                            'pl-8 rounded-md',
                                                            typeof errors.schedules?.[index] === 'object' &&
                                                            typeof errors.schedules[index].ticketTypes?.[ticketIndex] === 'object' &&
                                                            errors.schedules[index].ticketTypes[ticketIndex].price
                                                              ? 'border-red-500'
                                                              : ''
                                                          )}

                                                          />
                                                        </div>
                                                        {typeof errors.schedules?.[index] === 'object' &&
                                                                    typeof errors.schedules[index].ticketTypes?.[ticketIndex] === 'object' &&
                                                                    errors.schedules[index].ticketTypes[ticketIndex].price && (
                                                                      <div className="text-red-500 text-sm mt-1">
                                                                        {errors.schedules[index].ticketTypes[ticketIndex].price}
                                                                      </div>
                                                                    )}

                                                      </div>
                                                      <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-600">Quantity*</label>
                                                        <Field
                                                          as={Input}
                                                          name={`schedules.${index}.ticketTypes.${ticketIndex}.quantity`}
                                                          type="number"
                                                          min="1"
                                                          max={schedule.capacity}
                                                          className={cn(
                                                            'rounded-md',
                                                            typeof errors.schedules?.[index] === 'object' &&
                                                            typeof errors.schedules[index].ticketTypes?.[ticketIndex] === 'object' &&
                                                            errors.schedules[index].ticketTypes[ticketIndex].quantity && 'border-red-500'
                                                          )}

                                                        />
                                                        {typeof errors.schedules?.[index] === 'object' &&
                                                          typeof errors.schedules[index].ticketTypes?.[ticketIndex] === 'object' &&
                                                          errors.schedules[index].ticketTypes[ticketIndex].quantity && (
                                                            <div className="text-red-500 text-sm mt-1">
                                                              {errors.schedules[index].ticketTypes[ticketIndex].quantity}
                                                            </div>
                                                        )}

                                                      </div>
                                                    </div>
                                                    {schedule.ticketTypes.length > 1 && (
                                                      <div className="flex justify-end mt-3">
                                                        <button
                                                          type="button"
                                                          onClick={() => removeTicket(ticketIndex)}
                                                          className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                                        >
                                                          <Trash2 className="h-4 w-4 mr-1" />
                                                          Remove
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                                <button
                                                  type="button"
                                                  onClick={() => pushTicket({ type: 'GENERAL', price: 0, quantity: 0 })}
                                                  className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                                                >
                                                  <Plus className="h-4 w-4 mr-1 text-purple-500" />
                                                  Add ticket type
                                                </button>
                                                {typeof errors.schedules?.[index] === 'string' && typeof errors?.schedules[index]  && (
                                                  <div className="text-red-500 text-sm mt-2">{errors?.schedules[index]}</div>
                                                )}
                                                {schedule.ticketTypes.length > 0 && (
                                                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                                    <div className="flex justify-between text-gray-600">
                                                      <span className="font-medium">Total Tickets:</span>
                                                      <span>
                                                        {schedule.ticketTypes.reduce((sum: number, ticket: any) => sum + ticket.quantity, 0)} / {schedule.capacity}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </FieldArray>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        push({
                                          date: new Date(values.event.startDate).toISOString(),
                                          startTime: '10:00',
                                          endTime: '18:00',
                                          capacity: values.event.capacity,
                                          ticketTypes: [{ type: 'GENERAL', price: 0, quantity: 0 }],
                                        })
                                      }
                                      className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                                    >
                                      <Plus className="h-4 w-4 mr-1 text-purple-500" />
                                      Add Schedule
                                    </button>
                                    {errors.schedules && typeof errors.schedules === 'string' && (
                                      <div className="text-red-500 text-sm mt-2">{errors.schedules}</div>
                                    )}
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                          )}
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold text-purple-800">Rules & Conditions</h2>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">Prohibited Items</label>
                            <FieldArray name="event.prohibitedItems">
                              {({ push, remove }) => (
                                <div className="space-y-2">
                                  {values?.event?.prohibitedItems && values?.event?.prohibitedItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Field
                                        as={Input}
                                        name={`event.prohibitedItems.${index}`}
                                        placeholder="e.g., Outside food, Large bags"
                                        className={cn(
                                          'flex-1 rounded-md',
                                          errors.event?.prohibitedItems?.[index] && 'border-red-500'
                                        )}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => push('')}
                                    className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                                  >
                                    <Plus className="h-4 w-4 mr-1 text-purple-500" />
                                    Add prohibited item
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">Terms & Conditions*</label>
                            <FieldArray name="event.termsAndConditions">
                              {({ push, remove }) => (
                                <div className="space-y-2">
                                  {values?.event?.termsAndConditions?.map((term, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <Field
                                        as={Textarea}
                                        name={`event.termsAndConditions.${index}`}
                                        placeholder="Enter term or condition"
                                        rows={2}
                                        className={cn(
                                          'flex-1 rounded-md',
                                          errors.event?.termsAndConditions?.[index] && 'border-red-500'
                                        )}
                                      />
                                      {index === 0 ? (
                                        <div className="w-8"></div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => remove(index)}
                                          className="text-red-500 hover:text-red-700 p-2 mt-2"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  {errors.event?.termsAndConditions && typeof errors.event.termsAndConditions === 'string' && (
                                    <div className="text-red-500 text-sm">{errors.event.termsAndConditions}</div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => push('')}
                                    className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                                  >
                                    <Plus className="h-4 w-4 mr-1 text-purple-500" />
                                    Add another term
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold text-purple-800">Capacity</h2>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">Total Capacity*</label>
                            <Field
                              as={Input}
                              name="event.capacity"
                              type="number"
                              min="1"
                              className={cn(
                                'w-32 rounded-md',
                                errors.event?.capacity && touched.event?.capacity && 'border-red-500'
                              )}
                            />
                            {errors.event?.capacity && touched.event?.capacity && (
                              <div className="text-red-500 text-sm mt-1">{errors.event.capacity}</div>
                            )}
                          </div>
                          {values.schedules.length > 0 && (
                            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                              <div className="flex justify-between text-gray-600">
                                <span className="font-medium">Total Schedule Capacity:</span>
                                <span>
                                  {values.schedules.reduce((sum, schedule) => sum + schedule.capacity, 0)} / {values.event.capacity}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold text-purple-800">Media Upload</h2>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">Upload Images & Videos*</label>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={(e) => handleFileChange(e, setFieldValue)}
                              multiple
                              accept="image/*,video/*"
                              className="hidden"
                            />
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                            >
                              <UploadCloud className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                              <p className="text-gray-600 mb-2">Drag & drop files here, or click to select</p>
                              <p className="text-sm text-gray-400">Supports JPG, PNG, GIF, MP4 (max 50MB each)</p>
                            </div>
                            {errors.event?.media && touched.event?.media && (
                              <div className="text-red-500 text-sm mt-1">{errors.event.media}</div>
                            )}
                          </div>
                          {selectedFiles.length > 0 && Array.isArray(selectedFiles) && (
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-600">Selected Files</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {selectedFiles.map((file, index) => (
                                  <div
                                    key={index}
                                    className="relative group rounded-lg overflow-hidden border border-gray-200"
                                  >
                                    {file.type.match('video.*') ? (
                                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                                        <FileVideo className="h-8 w-8 text-gray-400" />
                                        <span className="absolute bottom-2 left-2 text-xs text-gray-600 truncate w-[90%]">{file.name}</span>
                                      </div>
                                    ) : (
                                      file.preview && <img src={file.preview} alt={file.name} className="w-full h-32 object-cover" />
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedFiles((prev) => {
                                          const newFiles = prev.filter((_, i) => i !== index);
                                          if (file.preview) {
                                            URL.revokeObjectURL(file.preview);
                                          }
                                          return newFiles;
                                        });
                                      }}
                                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedFiles.length > 0 && (
                            <button
                              type="button"
                              onClick={async () => {
                                setUploading(true);
                                try {
                                  const formData = new FormData();
                                  selectedFiles.forEach((file) => formData.append('files', file));
                                  const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  const result = await response.json();
                                  console.log('Upload success:', result);
                                  if (result.success && result.urls?.length > 0) {
                                    setFieldValue('event.media', [...values.event.media, ...result.urls]);
                                    setSelectedFiles([]);
                                  }
                                } catch (error) {
                                  console.error('Upload error:', error);
                                  toast.error('Failed to upload media.');
                                } finally {
                                  setUploading(false);
                                }
                              }}
                              disabled={uploading}
                              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                            >
                              {uploading ? 'Uploading...' : 'Upload Media'}
                            </button>
                          )}
                          {values.event.media.length > 0 && Array.isArray(values.event.media) && (
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-600">Uploaded Media</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {values.event.media
                                  .filter((url) => typeof url === 'string' && url.startsWith('http'))
                                  .map((url, index) => (
                                    <div
                                      key={index}
                                      className="relative group rounded-lg overflow-hidden border border-gray-200"
                                    >
                                      {url.match(/\.(mp4|webm|mov)$/i) ? (
                                        <video
                                          src={url}
                                          className="w-full h-32 object-cover"
                                          muted
                                          loop
                                          playsInline
                                          controls
                                          onError={() => toast.error(`Failed to load media ${index + 1}`)}
                                        />
                                      ) : (
                                        <img
                                          src={url}
                                          alt={`Media ${index + 1}`}
                                          className="w-full h-32 object-cover"
                                          onError={() => toast.error(`Failed to load image ${index + 1}`)}
                                        />
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newMedia = [...values.event.media];
                                          newMedia.splice(index, 1);
                                          setFieldValue('event.media', newMedia);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between mt-8">
                  {currentStep > 0 ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        onClick={handlePrev}
                        variant="outline"
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        Previous
                      </Button>
                    </motion.div>
                  ) : (
                    <div></div>
                  )}
                  {currentStep < 4 ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        onClick={async () => {
                          const errors = await validateForm();
                          const stepErrors = getStepErrors(currentStep, errors);
                          if (Object.keys(stepErrors).length === 0) {
                            handleNext();
                          } else {
                            console.log('Errors:', errors);
                            toast.error('Please fill all required fields');
                          }
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-md hover:shadow-lg"
                      >
                        Next
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting || uploading}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-md hover:shadow-lg"
                      >
                        {isSubmitting || uploading ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {uploading ? 'Uploading...' : 'Creating Event...'}
                          </span>
                        ) : (
                          'Create Event'
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <Footer />
    </>
  );
};

function getStepErrors(step: number, errors: any) {
  const stepFields: Record<number, string[]> = {
    0: ['event.title', 'event.description', 'event.category'],
    1: ['event.venue', 'event.startDate', 'event.endDate', 'schedules'],
    2: ['event.prohibitedItems', 'event.termsAndConditions'],
    3: ['event.capacity'],
    4: ['event.media'],
  };

  return Object.keys(errors).reduce((acc, key) => {
    if (stepFields[step]?.includes(key)) {
      acc[key] = errors[key];
    }
    return acc;
  }, {} as Record<string, any>);
}

export default CreateEventForm;
