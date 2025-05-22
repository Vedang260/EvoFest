"use client";

import React, { useState, useRef } from 'react';
import { Formik, Form, Field, FieldArray, useFormikContext, setNestedObjectValues } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, UploadCloud } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Calendar } from '../../../../components/ui/calendar';
import TimePicker from '../../../../components/ui/timePicker';
import { cn } from '../../../../lib/utils';
import { eventSchema, type EventFormValues } from '../../../../lib/validations/event';
import { EventScheduleSchema } from '../../../../lib/validations/eventSchedule';
import { create } from 'node:domain';

// Extend the EventFormValues type to include schedule and ticketTypes
type ExtendedEventFormValues = EventFormValues & {
  schedule: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  ticketTypes: Array<{
    type: string;
    price: number;
    quantity: number;
  }>;
};

// Mock cloudinary config (replace with your actual config)
const cloudinaryConfig = {
  cloudName: 'demo',
  uploadPreset: 'preset1',
};


const createYupValidationSchema = () => {
  // Convert Zod schema to Yup-compatible schema
  const eventYupSchema = toFormikValidationSchema(eventSchema);

  return Yup.object().shape({
    // Manually define fields to avoid type mismatch
    title: Yup.string()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title is too long')
      .required('Title is required'),
    description: Yup.string()
      .min(10, 'Description is too short')
      .max(2000, 'Description is too long')
      .required('Description is required'),
    category: Yup.string()
      .oneOf(
        [
          'MUSIC',
          'SPORTS',
          'COMEDY',
          'WORKSHOP',
          'CONFERENCE',
          'PARTIES',
          'ARCADE',
          'ART',
          'FOOD',
          'FESTIVAL',
          'BUSINESS',
          'TECH',
        ],
        'Invalid category'
      )
      .required('Category is required'),
    venue: Yup.string()
      .min(3, 'Venue must be at least 3 characters')
      .required('Venue is required'),
    media: Yup.array()
      .of(Yup.string().url('Invalid URL'))
      .max(10, 'Too many media items')
      .required('Media is required'),
    startDate: Yup.string()
      .required('Start date is required')
      .test('is-future', 'Start date must be in the future', (value) => {
        if (!value) return false;
        return new Date(value) > new Date();
      }),
    endDate: Yup.string()
      .required('End date is required')
      .test('is-after-start', 'End date must be after start date', function (value) {
        if (!value || !this.parent.startDate) return false;
        return new Date(value) >= new Date(this.parent.startDate);
      }),
    capacity: Yup.number()
      .integer()
      .positive('Capacity must be positive')
      .required('Capacity is required'),
    schedule: Yup.array()
      .of(
        Yup.object().shape({
          date: Yup.string().required('Date is required'),
          startTime: Yup.string()
            .required('Start time is required')
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
          endTime: Yup.string()
            .required('End time is required')
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
            .test('is-after-start', 'End time must be after start time', function (value) {
              const { startTime } = this.parent;
              if (!startTime || !value) return true;
              return value > startTime;
            }),
        })
      )
      .optional(),
  ticketTypes: Yup.array()
    .of(
      Yup.object().shape({
        type: Yup.string().required('Type is required'),
        price: Yup.number()
          .transform((value, originalValue) => Number(originalValue))
          .required('Price is required')
          .min(0, 'Price cannot be negative'),
        quantity: Yup.number()
          .transform((value, originalValue) => Number(originalValue))
          .required('Quantity is required')
          .min(1, 'Minimum quantity is 1'),
      })
    )
    .min(1, 'At least one ticket type is required')
    .test(
      'total-capacity',
      'Total tickets exceed capacity',
      function (ticketTypes) {
        const capacity = this.parent.capacity;
        if (!ticketTypes || !capacity) return true;
        const total = ticketTypes.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0);
        return total <= capacity;
      }
    ),
    prohibitedItems: Yup.array()
      .of(Yup.string().max(50, 'Max 50 characters')),
    termsAndConditions: Yup.array()
      .of(Yup.string().max(500, 'Max 500 characters'))
      .min(1, 'At least one term is required'),
  });
};

const CreateEventForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues: ExtendedEventFormValues = {
    title: '',
    description: '',
    category: 'MUSIC',
    venue: '',
    startDate: new Date(),
    endDate: new Date(),
    schedule: [],
    prohibitedItems: [''],
    termsAndConditions: [''],
    capacity: 100,
    ticketTypes: [{ type: 'GENERAL', price: 0, quantity: 0 }],
    media: []
  };

  const validationSchema = createYupValidationSchema();

  const handleNext = () => setCurrentStep((prev) => prev + 1);

  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const handleCloudinaryUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fileUrl = URL.createObjectURL(file);
      return fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload file.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    currentMedia: string[]
  ) => {
    const files = e.target.files;
    if (!files) return;

    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await handleCloudinaryUpload(files[i]);
      if (url) urls.push(url);
    }
    setFieldValue('media', [...currentMedia, ...urls]);
  };

  const handleSubmit = async (values: ExtendedEventFormValues) => {
    try {
      // Prepare data for backend
      const { schedule, ticketTypes, ...eventData } = values;
      
      const payload = {
        ...eventData,
        ticketTypes: ticketTypes.map((ticket: { type: any; price: any; quantity: any; }) => ({
          type: ticket.type,
          price: Number(ticket.price),
          quantity: Number(ticket.quantity),
        })),
        schedule: schedule.map((item: { date: any; startTime: any; endTime: any; }) => ({
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      };

      console.log('Submitting event:', payload);
      toast.success('Event created successfully!');
      
      // In a real app:
      // const response = await fetch('/api/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!response.ok) throw new Error('Failed to create event');
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to create event.');
    }
  };

  return (
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
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting, validateForm }) => (
            <Form>
              {/* Progress Steps */}
              <motion.div className="flex mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {['Event Info', 'Date & Venue', 'Rules', 'Tickets', 'Media'].map((step, index) => (
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
                        
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">
                            Event Title*
                          </label>
                          <Field
                            as={Input}
                            name="title"
                            placeholder="Enter event title"
                            className={cn(
                              'rounded-md',
                              errors.title && touched.title && 'border-red-500'
                            )}
                          />
                          {errors.title && touched.title && (
                            <div className="text-red-500 text-sm mt-1">{errors.title as string}</div>
                          )}
                        </div>
                        
                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">
                            Description*
                          </label>
                          <Field
                            as={Textarea}
                            name="description"
                            rows={4}
                            placeholder="Describe your event in detail..."
                            className={cn(
                              'rounded-md',
                              errors.description && touched.description && 'border-red-500'
                            )}
                          />
                          {errors.description && touched.description && (
                            <div className="text-red-500 text-sm mt-1">{errors.description as string}</div>
                          )}
                        </div>
                        
                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">
                            Category*
                          </label>
                          <Select
                            value={values.category}
                            onValueChange={(value: any) => setFieldValue('category', value)}
                          >
                            <SelectTrigger className="w-full rounded-md">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                'MUSIC', 'SPORTS', 'COMEDY', 'WORKSHOP', 
                                'CONFERENCE', 'PARTIES', 'ARCADE', 'ART', 
                                'FOOD', 'FESTIVAL', 'BUSINESS', 'TECH'
                              ].map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option.charAt(0) + option.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.category && touched.category && (
                            <div className="text-red-500 text-sm mt-1">{errors.category as string}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-purple-800">Date & Venue</h2>
                        
                        {/* Venue */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">
                            Venue*
                          </label>
                          <Field
                            as={Input}
                            name="venue"
                            placeholder="Enter venue address"
                            className={cn(
                              'rounded-md',
                              errors.venue && touched.venue && 'border-red-500'
                            )}
                          />
                          {errors.venue && touched.venue && (
                            <div className="text-red-500 text-sm mt-1">{errors.venue as string}</div>
                          )}
                        </div>
                        
                        {/* Date Picker */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                            Start Date*
                            </label>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal rounded-md',
                                    !values.startDate && 'text-gray-400',
                                    errors.startDate && touched.startDate && 'border-red-500'
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                {values.startDate ? (
                                    format(new Date(values.startDate), 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={values.startDate ? new Date(values.startDate) : undefined}
                                onSelect={(date: Date | undefined) => {
                                    if (date) {
                                    setFieldValue('startDate', date.toISOString());
                                    // Auto-adjust end date if it's earlier than start date
                                    if (values.endDate && new Date(values.endDate) < date) {
                                        setFieldValue('endDate', date.toISOString());
                                    }
                                    }
                                }}
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            {errors.startDate && touched.startDate && (
                            <div className="text-red-500 text-sm mt-1">{errors.startDate as string}</div>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                            End Date*
                            </label>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal rounded-md',
                                    !values.endDate && 'text-gray-400',
                                    errors.endDate && touched.endDate && 'border-red-500'
                                )}
                                disabled={!values.startDate}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                {values.endDate ? (
                                    format(new Date(values.endDate), 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={values.endDate ? new Date(values.endDate) : undefined}
                                onSelect={(date: Date | undefined) => {
                                    if (date) {
                                    setFieldValue('endDate', date.toISOString());
                                    }
                                }}
                                initialFocus
                                fromDate={values.startDate ? new Date(values.startDate) : new Date()}
                                />
                            </PopoverContent>
                            </Popover>
                            {errors.endDate && touched.endDate && (
                            <div className="text-red-500 text-sm mt-1">{errors.endDate as string}</div>
                            )}
                        </div>
                        </div>
                        
                        {/* Event Schedule */}
                        {/* Event Schedule */}
                        {values.startDate && values.endDate && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                            Event Schedule
                            </label>
                            <FieldArray name="schedule">
                            {({ push, remove }) => (
                                <div className="space-y-4">
                                {values.schedule.map((day: any, index: number) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium text-purple-800">Day {index + 1}</h3>
                                        {values.schedule.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Date Picker */}
                                        <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-600">Date*</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                'w-full justify-start text-left font-normal rounded-md',
                                                !day.date && 'text-gray-400',
                                                typeof errors.schedule?.[index] === 'object' &&
                                                    errors.schedule?.[index]?.date && 'border-red-500'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                                {day.date ? format(new Date(day.date), 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={day.date ? new Date(day.date) : undefined}
                                                onSelect={(date: Date | undefined) => {
                                                if (date) {
                                                    setFieldValue(`schedule.${index}.date`, date.toISOString());
                                                }
                                                }}
                                                initialFocus
                                                fromDate={new Date(values.startDate)}
                                                toDate={new Date(values.endDate)}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        {typeof errors.schedule?.[index] === 'object' && errors.schedule[index]?.date && (
                                            <div className="text-red-500 text-sm mt-1">
                                            {errors.schedule[index].date as string}
                                            </div>
                                        )}
                                        </div>

                                        {/* Start Time Picker */}
                                        <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-600">Start Time*</label>
                                        <TimePicker
                                            value={day.startTime}
                                            onChange={(time: any) =>
                                            setFieldValue(`schedule.${index}.startTime`, time)
                                            }
                                        />
                                        {typeof errors.schedule?.[index] === 'object' &&
                                            errors.schedule[index]?.startTime && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors.schedule[index].startTime as string}
                                            </div>
                                            )}
                                        </div>

                                        {/* End Time Picker */}
                                        <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-600">End Time*</label>
                                        <TimePicker
                                            value={day.endTime}
                                            onChange={(time: any) =>
                                            setFieldValue(`schedule.${index}.endTime`, time)
                                            }
                                            minTime={day.startTime}
                                        />
                                        {typeof errors.schedule?.[index] === 'object' &&
                                            errors.schedule[index]?.endTime && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors.schedule[index].endTime as string}
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                    </div>
                                ))}

                                {/* Button to generate schedule */}
                                <button
                                    type="button"
                                    onClick={() => {
                                    const start = new Date(values.startDate);
                                    const end = new Date(values.endDate);
                                    const days = Math.ceil(
                                        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                                    ) + 1;

                                    const newSchedule = [];
                                    for (let i = 0; i < days; i++) {
                                        const date = new Date(start);
                                        date.setDate(start.getDate() + i);
                                        newSchedule.push({
                                        date: date.toISOString(),
                                        startTime: '10:00',
                                        endTime: '18:00',
                                        });
                                    }
                                    setFieldValue('schedule', newSchedule);
                                    }}
                                    className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                                >
                                    <Plus className="h-4 w-4 mr-1 text-purple-500" />
                                    {values.schedule.length > 0 ? 'Regenerate Schedule' : 'Create Schedule'}
                                </button>
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
                        
                        {/* Prohibited Items */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Prohibited Items
                          </label>
                          <FieldArray name="prohibitedItems">
                            {({ push, remove }) => (
                              <div className="space-y-2">
                                {values?.prohibitedItems?.map((item: any, index: any) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Field
                                      as={Input}
                                      name={`prohibitedItems.${index}`}
                                      placeholder="e.g., Outside food, Large bags"
                                      className={cn(
                                        'flex-1 rounded-md',
                                        errors.prohibitedItems?.[index] && 'border-red-500'
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
                        
                        {/* Terms & Conditions */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Terms & Conditions*
                          </label>
                          <FieldArray name="termsAndConditions">
                            {({ push, remove }) => (
                              <div className="space-y-2">
                                {values?.termsAndConditions?.map((term: string, index: any) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Field
                                      as={Textarea}
                                      name={`termsAndConditions.${index}`}
                                      placeholder="Enter term or condition"
                                      rows={2}
                                      className={cn(
                                        'flex-1 rounded-md',
                                        errors.termsAndConditions?.[index] && 'border-red-500'
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
                                {errors.termsAndConditions && typeof errors.termsAndConditions === 'string' && (
                                  <div className="text-red-500 text-sm">{errors.termsAndConditions}</div>
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
                        <h2 className="text-xl font-semibold text-purple-800">Tickets & Capacity</h2>
                        
                        {/* Capacity */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">
                            Total Capacity*
                          </label>
                          <Field
                            as={Input}
                            name="capacity"
                            type="number"
                            min="1"
                            className={cn(
                              'w-32 rounded-md',
                              errors.capacity && touched.capacity && 'border-red-500'
                            )}
                          />
                          {errors.capacity && touched.capacity && (
                            <div className="text-red-500 text-sm mt-1">{errors.capacity as string}</div>
                          )}
                        </div>
                        
                        {/* Ticket Types */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Ticket Types*
                          </label>
                          <FieldArray name="ticketTypes">
                            {({ push, remove }) => (
                              <div className="space-y-4">
                                {values.ticketTypes.map((ticket: any, index: any) => (
                                  <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-600">
                                          Type*
                                        </label>
                                        <Select
                                          value={ticket.type}
                                          onValueChange={(value: any) =>
                                            setFieldValue(`ticketTypes.${index}.type`, value)
                                          }
                                        >
                                          <SelectTrigger className={cn(
                                            'rounded-md',
                                            typeof errors.ticketTypes?.[index] === 'object' && errors.ticketTypes[index]?.type && 'border-red-500'
                                          )}>
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {['GENERAL', 'VIP', 'EARLY_BIRD', 'STUDENT', 'GROUP'].map(
                                              (option) => (
                                                <SelectItem key={option} value={option}>
                                                  {option.split('_').map(word => 
                                                    word.charAt(0) + word.slice(1).toLowerCase()
                                                  ).join(' ')}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                        {typeof errors.ticketTypes?.[index]=== 'object' && errors.ticketTypes[index]?.type && (
                                          <div className="text-red-500 text-sm mt-1">
                                            {errors.ticketTypes[index].type as string}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-600">
                                          Price*
                                        </label>
                                        <div className="relative">
                                          <span className="absolute left-3 top-2 text-gray-600">$</span>
                                          <Field
                                            as={Input}
                                            name={`ticketTypes.${index}.price`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className={cn(
                                              'pl-8 rounded-md',
                                              typeof errors.ticketTypes?.[index] === 'object' && errors.ticketTypes[index]?.price && 'border-red-500'
                                            )}
                                          />
                                        </div>
                                        {typeof errors.ticketTypes?.[index] === 'object' && errors.ticketTypes[index]?.price && (
                                          <div className="text-red-500 text-sm mt-1">
                                            {errors.ticketTypes[index].price as string}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-600">
                                          Quantity*
                                        </label>
                                        <Field
                                          as={Input}
                                          name={`ticketTypes.${index}.quantity`}
                                          type="number"
                                          min="1"
                                          max={values.capacity}
                                          className={cn(
                                            'rounded-md',
                                            typeof errors.ticketTypes?.[index] === 'object' && errors.ticketTypes[index]?.quantity && 'border-red-500'
                                          )}
                                        />
                                        {typeof errors.ticketTypes?.[index] === 'object' && errors.ticketTypes[index]?.quantity && (
                                          <div className="text-red-500 text-sm mt-1">
                                            {errors.ticketTypes[index].quantity as string}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {values.ticketTypes.length > 1 && (
                                      <div className="flex justify-end mt-3">
                                        <button
                                          type="button"
                                          onClick={() => remove(index)}
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
                                  onClick={() =>
                                    push({ type: 'GENERAL', price: 0, quantity: 0 })
                                  }
                                  className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                                >
                                  <Plus className="h-4 w-4 mr-1 text-purple-500" />
                                  Add ticket type
                                </button>
                                {errors.ticketTypes && typeof errors.ticketTypes === 'string' && (
                                  <div className="text-red-500 text-sm mt-2">{errors.ticketTypes}</div>
                                )}
                                {values.ticketTypes.length > 0 && (
                                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                    <div className="flex justify-between text-gray-600">
                                      <span className="font-medium">Total Tickets:</span>
                                      <span>
                                        {values.ticketTypes.reduce(
                                          (sum: number, ticket: any) => sum + ticket.quantity,
                                          0
                                        )}{' '}
                                        / {values.capacity}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </FieldArray>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-purple-800">Media Upload</h2>
                        
                        {/* Media Upload */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Upload Images & Videos
                          </label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e, setFieldValue, values.media)}
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                          />
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                          >
                            <UploadCloud className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-2">
                              Drag & drop files here, or click to select
                            </p>
                            <p className="text-sm text-gray-400">
                              Supports JPG, PNG, GIF, MP4 (max 50MB each)
                            </p>
                          </div>
                          {errors.media && (
                            <div className="text-red-500 text-sm mt-1">{errors.media as string}</div>
                          )}
                        </div>
                        
                        {/* Media Preview */}
                        {values.media.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Uploaded Media
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {values.media.map((url: string, index: any) => (
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
                                    />
                                  ) : (
                                    <img
                                      src={url}
                                      alt={`Event media ${index + 1}`}
                                      className="w-full h-32 object-cover"
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newMedia = [...values.media];
                                      newMedia.splice(index, 1);
                                      setFieldValue('media', newMedia);
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

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
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
                {currentStep < 5 ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={async () => {
                        // Validate current step before proceeding
                        const errors = await validateForm();
                        const stepErrors = getStepErrors(currentStep, errors);
                        
                        if (Object.keys(stepErrors).length === 0) {
                          handleNext();
                        } else {
                          // Show error toast
                          console.log("Errors: ", errors);
                          toast.error('Please Fill all the Required Fields');
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
  );
};

// Helper function to get errors for current step
function getStepErrors(step: number, errors: any) {
  const stepFields: Record<number, string[]> = {
    0: ['title', 'description', 'category'],
    1: ['venue', 'startDate', 'endDate', 'schedule'],
    2: ['termsAndConditions'],
    3: ['capacity', 'ticketTypes'],
    4: ['media'],
  };

  return Object.keys(errors).reduce((acc, key) => {
    if (stepFields[step]?.includes(key)) {
      acc[key] = errors[key];
    }
    return acc;
  }, {} as Record<string, any>);
}

export default CreateEventForm;