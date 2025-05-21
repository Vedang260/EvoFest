// "use client";

// import { useState, useRef } from 'react';
// import { Formik, Form, Field, FieldArray } from 'formik';
// import * as Yup from 'yup';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Calendar } from '@/components/ui/calendar';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textArea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popOver';
// import { format, addDays, isSameDay } from 'date-fns';
// import toast from 'react-hot-toast';
// import { cn } from '@/lib/utils';
// import { CalendarDays, Clock, Plus, Trash2, UploadCloud } from 'lucide-react';

// // Cloudinary config
// const cloudinaryConfig = {
//   cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//   uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
// };

// // Event categories
// const EventCategoryEnum = {
//   MUSIC: 'Music',
//   SPORTS: 'Sports',
//   THEATER: 'Theater',
//   ART: 'Art',
//   FOOD: 'Food & Drink',
//   TECH: 'Technology',
// } as const;

// // Ticket types
// const TicketTypeEnum = {
//   VIP: 'VIP',
//   GENERAL: 'General Admission',
//   STUDENT: 'Student',
//   EARLY_BIRD: 'Early Bird',
//   GROUP: 'Group',
// } as const;

// // Validation Schema
// const eventSchema = Yup.object().shape({
//   title: Yup.string().required('Title is required'),
//   description: Yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
//   category: Yup.string().oneOf(Object.keys(EventCategoryEnum)).required('Category is required'),
//   venue: Yup.string().required('Venue is required'),
//   startDate: Yup.date().required('Start date is required').typeError('Invalid start date'),
//   endDate: Yup.date()
//     .required('End date is required')
//     .typeError('Invalid end date')
//     .when('startDate', (startDate, schema) => {
//       return startDate && schema.min(startDate, 'End date must be after start date');
//     }),
//   schedule: Yup.array()
//     .of(
//       Yup.object().shape({
//         date: Yup.date().required('Date is required'),
//         startTime: Yup.string().required('Start time is required'),
//         endTime: Yup.string().required('End time is required').test(
//           'end-after-start',
//           'End time must be after start time',
//           function (value) {
//             const { startTime } = this.parent;
//             if (!startTime || !value) return true;
//             const start = parseTime(startTime);
//             const end = parseTime(value);
//             return end > start;
//           }
//         ),
//       })
//     )
//     .required('At least one schedule entry is required'),
//   prohibitedItems: Yup.array().of(Yup.string()),
//   termsAndConditions: Yup.array().of(Yup.string()).min(1, 'At least one term is required'),
//   capacity: Yup.number().positive('Capacity must be positive').integer().required('Capacity is required'),
//   ticketTypes: Yup.array()
//     .of(
//       Yup.object().shape({
//         type: Yup.string().oneOf(Object.keys(TicketTypeEnum)).required('Ticket type is required'),
//         price: Yup.number().positive('Price must be positive').required('Price is required'),
//         quantity: Yup.number()
//           .positive('Quantity must be positive')
//           .integer()
//           .required('Quantity is required')
//           .test(
//             'total-capacity',
//             'Total tickets cannot exceed capacity',
//             function (value) {
//               const { ticketTypes, capacity } = this.parent;
//               const totalTickets = ticketTypes.reduce((sum: number, type: any) => sum + type.quantity, 0);
//               return totalTickets <= capacity;
//             }
//           ),
//       })
//     )
//     .required('At least one ticket type is required'),
//   media: Yup.array().of(Yup.string().url('Each media item must be a valid URL')),
//   organizerId: Yup.string().required('Organizer ID is required'),
// });

// // Helper to parse time strings
// const parseTime = (time: string) => {
//   const [hours, minutes, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/i)!.slice(1);
//   let hour = parseInt(hours);
//   if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
//   if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
//   return new Date(0, 0, 0, hour, parseInt(minutes));
// };

// // Clock Picker Component
// const ClockPicker = ({ value, onChange, minTime }: { value: string; onChange: (time: string) => void; minTime?: string }) => {
//   const [hour, setHour] = useState(value ? parseInt(value.match(/(\d+)/)![1]) % 12 || 12 : 12);
//   const [minute, setMinute] = useState(value ? parseInt(value.match(/:(\d+)/)![1]) : 0);
//   const [period, setPeriod] = useState(value ? value.match(/(AM|PM)/i)![1].toUpperCase() : 'AM');

//   const handleDrag = (type: 'hour' | 'minute', angle: number) => {
//     if (type === 'hour') {
//       const newHour = Math.round((angle % 360) / 30) || 12;
//       setHour(newHour);
//     } else {
//       const newMinute = Math.round((angle % 360) / 6);
//       setMinute(newMinute);
//     }
//     const formattedTime = `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
//     if (!minTime || parseTime(formattedTime) > parseTime(minTime)) {
//       onChange(formattedTime);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <div className="relative w-40 h-40 rounded-full bg-neutral-light/30 flex items-center justify-center">
//         <svg className="w-full h-full" viewBox="0 0 100 100">
//           <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="2" />
//           {[...Array(12)].map((_, i) => (
//             <line
//               key={i}
//               x1="50"
//               y1="10"
//               x2="50"
//               y2="15"
//               stroke="black"
//               strokeWidth="2"
//               transform={`rotate(${(i * 30)} 50 50)`}
//             />
//           ))}
//           <motion.line
//             x1="50"
//             y1="50"
//             x2="50"
//             y2="20"
//             stroke="black"
//             strokeWidth="3"
//             transform={`rotate(${(hour % 12) * 30} 50 50)`}
//             drag
//             onDrag={(e, info) => {
//               const angle = Math.atan2(info.point.y - 50, info.point.x - 50) * (180 / Math.PI) + 90;
//               handleDrag('hour', angle);
//             }}
//             dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
//           />
//           <motion.line
//             x1="50"
//             y1="50"
//             x2="50"
//             y2="15"
//             stroke="black"
//             strokeWidth="2"
//             transform={`rotate(${minute * 6} 50 50)`}
//             drag
//             onDrag={(e, info) => {
//               const angle = Math.atan2(info.point.y - 50, info.point.x - 50) * (180 / Math.PI) + 90;
//               handleDrag('minute', angle);
//             }}
//             dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
//           />
//         </svg>
//         <div className="absolute top-2 left-2 text-sm font-medium">{`${hour}:${minute
//           .toString()
//           .padStart(2, '0')} ${period}`}</div>
//       </div>
//       <div className="flex gap-2">
//         <Button
//           type="button"
//           onClick={() => setPeriod(period === 'AM' ? 'PM' : 'AM')}
//           className={cn(
//             'w-16',
//             period === 'AM' ? 'bg-primary-light text-white' : 'bg-neutral-light'
//           )}
//         >
//           AM
//         </Button>
//         <Button
//           type="button"
//           onClick={() => setPeriod(period === 'AM' ? 'PM' : 'AM')}
//           className={cn(
//             'w-16',
//             period === 'PM' ? 'bg-primary-light text-white' : 'bg-neutral-light'
//           )}
//         >
//           PM
//         </Button>
//       </div>
//     </div>
//   );
// };

// const CreateEventForm = () => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [uploading, setUploading] = useState<string[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const initialValues = {
//     title: '',
//     description: '',
//     category: '',
//     venue: '',
//     startDate: null,
//     endDate: null,
//     schedule: [],
//     prohibitedItems: [],
//     termsAndConditions: [''],
//     capacity: 100,
//     ticketTypes: [{ type: 'GENERAL', price: 0, quantity: 0 }],
//     media: [],
//     organizerId: 'organizer123', // Replace with actual organizer ID
//   };

//   const handleNext = () => setCurrentStep((prev) => prev + 1);
//   const handlePrev = () => setCurrentStep((prev) => prev - 1);

//   const handleCloudinaryUpload = async (file: File) => {
//     if (!['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'].includes(file.type)) {
//       toast.error(
//         'Only JPG, PNG, GIF, MP4, or WebM files are supported.',
        
//       );
//       return null;
//     }
//     if (file.size > 50 * 1024 * 1024) {
//       toast.error(
     
//         'Files must be under 50MB.',
  
//       );
//       return null;
//     }

//     setUploading((prev) => [...prev, file.name]);
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', cloudinaryConfig.uploadPreset!);

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
//         {
//           method: 'POST',
//           body: formData,
//         }
//       );
//       const data = await response.json();
//       if (data.error) throw new Error(data.error.message);
//       return data.secure_url;
//     } catch (error) {
//       console.error('Upload failed:', error);
//       toast.error('There was an error uploading your file.');
//       return null;
//     } finally {
//       setUploading((prev) => prev.filter((name) => name !== file.name));
//     }
//   };

//   const handleFileChange = async (
//     e: React.ChangeEvent<HTMLInputElement>,
//     setFieldValue: (field: string, value: any) => void,
//     currentMedia: string[]
//   ) => {
//     const files = e.target.files;
//     if (!files) return;

//     const urls: string[] = [];
//     for (let i = 0; i < files.length; i++) {
//       const url = await handleCloudinaryUpload(files[i]);
//       if (url) urls.push(url);
//     }
//     setFieldValue('media', [...currentMedia, ...urls]);
//   };

//   const handleSubmit = async (values: any) => {
//     console.log('Form submitted:', values);
//     toast.success('Your event has been successfully created.');
//   };

//   return (
//     <div
//       className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg relative"
//       style={{
//         backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, #ffffff 25%, #ffffff 50%, #f3f4f6 50%, #f3f4f6 75%, #ffffff 75%, #ffffff)',
//         backgroundSize: '20px 20px',
//       }}
//     >
//       <div
//         className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-200 to-transparent"
//         style={{ clipPath: 'url(#perforation)' }}
//       />
//       <svg className="absolute" width="0" height="0">
//         <defs>
//           <clipPath id="perforation">
//             <path d="M0,0 H4 C4,2 2,4 0,4 V8 C2,8 4,10 4,12 H0 V16 C2,16 4,18 4,20 H0 V24 C2,24 4,26 4,28 H0 V32 C2,32 4,34 4,36 H0 V40 C2,40 4,42 4,44 H0 V48 Z" />
//           </clipPath>
//         </defs>
//       </svg>

//       <h1 className="text-3xl font-bold mb-6 text-purple-800">Create New Event</h1>

//       <Formik
//         initialValues={initialValues}
//         validationSchema={eventSchema}
//         onSubmit={handleSubmit}
//       >
//         {({ values, errors, touched, setFieldValue, isSubmitting }) => (
//           <Form>
//             <div className="relative flex mb-8">
//               <div className="absolute top-4 left-0 right-0 h-1 bg-neutral-light/50">
//                 <motion.div
//                   className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
//                   initial={{ width: `${(currentStep / 4) * 100}%` }}
//                   animate={{ width: `${(currentStep / 4) * 100}%` }}
//                   transition={{ duration: 0.5 }}
//                 />
//               </div>
//               {['Event Info', 'Date & Venue', 'Rules', 'Tickets', 'Media'].map((step, index) => (
//                 <div key={step} className="flex-1 flex flex-col items-center z-10">
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(index)}
//                     className={cn(
//                       'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300',
//                       currentStep >= index
//                         ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
//                         : 'bg-neutral-light text-neutral-dark'
//                     )}
//                   >
//                     {index + 1}
//                   </button>
//                   <span
//                     className={cn(
//                       'text-sm',
//                       currentStep === index ? 'font-bold text-purple-800' : 'text-neutral-dark/70'
//                     )}
//                   >
//                     {step}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             <div className="min-h-[400px]">
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={currentStep}
//                   initial={{ opacity: 0, x: 50 }}
//                   animate={{ opacity: 1, x: 0, scale: 1 }}
//                   exit={{ opacity: 0, x: -50 }}
//                   transition={{ duration: 0.3, ease: 'easeInOut' }}
//                 >
//                   {currentStep === 0 && (
//                     <div className="space-y-6">
//                       <h2 className="text-xl font-semibold text-purple-800">Basic Event Information</h2>
//                       <motion.div
//                         className="space-y-4"
//                         initial={{ y: 20, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         transition={{ delay: 0.1 }}
//                       >
//                         <div>
//                           <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Event Title*
//                           </label>
//                           <Field
//                             as={Input}
//                             name="title"
//                             placeholder="Enter event title"
//                             className={cn(
//                               'transition-all duration-300 focus:ring-2 focus:ring-purple-500',
//                               errors.title && touched.title && 'border-red-500'
//                             )}
//                           />
//                           {errors.title && touched.title && (
//                             <div className="text-red-500 text-sm mt-1">{errors.title}</div>
//                           )}
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Description*
//                           </label>
//                           <Field
//                             as={Textarea}
//                             name="description"
//                             rows={4}
//                             placeholder="Describe your event in detail..."
//                             className={cn(
//                               'transition-all duration-300 focus:ring-2 focus:ring-purple-500',
//                               errors.description && touched.description && 'border-red-500'
//                             )}
//                           />
//                           {errors.description && touched.description && (
//                             <div className="text-red-500 text-sm mt-1">{errors.description}</div>
//                           )}
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Category*
//                           </label>
//                           <Field name="category">
//                             {({ field }: any) => (
//                               <Select
//                                 value={field.value}
//                                 onValueChange={(value) => setFieldValue('category', value)}
//                               >
//                                 <SelectTrigger
//                                   className={cn(
//                                     'transition-all duration-300',
//                                     errors.category && touched.category && 'border-red-500'
//                                   )}
//                                 >
//                                   <SelectValue placeholder="Select a category" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   {Object.entries(EventCategoryEnum).map(([key, value]) => (
//                                     <SelectItem key={key} value={key}>
//                                       {value}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                             )}
//                           </Field>
//                           {errors.category && touched.category && (
//                             <div className="text-red-500 text-sm mt-1">{errors.category}</div>
//                           )}
//                         </div>
//                       </motion.div>
//                     </div>
//                   )}

//                   {currentStep === 1 && (
//                     <div className="space-y-6">
//                       <h2 className="text-xl font-semibold text-purple-800">Date & Venue</h2>
//                       <motion.div
//                         className="space-y-4"
//                         initial={{ y: 20, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         transition={{ delay: 0.1 }}
//                       >
//                         <div>
//                           <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Venue*
//                           </label>
//                           <Field
//                             as={Input}
//                             name="venue"
//                             placeholder="Enter venue address"
//                             className={cn(
//                               'transition-all duration-300 focus:ring-2 focus:ring-purple-500',
//                               errors.venue && touched.venue && 'border-red-500'
//                             )}
//                           />
//                           {errors.venue && touched.venue && (
//                             <div className="text-red-500 text-sm mt-1">{errors.venue}</div>
//                           )}
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                               <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                               Start Date*
//                             </label>
//                             <Popover>
//                               <PopoverTrigger asChild>
//                                 <Button
//                                   variant="outline"
//                                   className={cn(
//                                     'w-full justify-start text-left font-normal',
//                                     !values.startDate && 'text-muted-foreground',
//                                     errors.startDate && touched.startDate && 'border-red-500'
//                                   )}
//                                 >
//                                   <CalendarDays className="mr-2 h-4 w-4 text-purple-500" />
//                                   {values.startDate ? (
//                                     format(values.startDate, 'PPP')
//                                   ) : (
//                                     <span>Pick a date</span>
//                                   )}
//                                 </Button>
//                               </PopoverTrigger>
//                               <PopoverContent className="w-auto p-0">
//                                 <Calendar
//                                   mode="single"
//                                   selected={values.startDate}
//                                   onSelect={(date: any) => {
//                                     setFieldValue('startDate', date);
//                                     if (values.endDate && date && date > values.endDate) {
//                                       setFieldValue('endDate', date);
//                                     }
//                                     setFieldValue('schedule', []);
//                                   }}
//                                   initialFocus
//                                 />
//                               </PopoverContent>
//                             </Popover>
//                             {errors.startDate && touched.startDate && (
//                               <div className="text-red-500 text-sm mt-1">{errors.startDate}</div>
//                             )}
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                               <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                               End Date*
//                             </label>
//                             <Popover>
//                               <PopoverTrigger asChild>
//                                 <Button
//                                   variant="outline"
//                                   className={cn(
//                                     'w-full justify-start text-left font-normal',
//                                     !values.endDate && 'text-muted-foreground',
//                                     errors.endDate && touched.endDate && 'border-red-500'
//                                   )}
//                                   disabled={!values.startDate}
//                                 >
//                                   <CalendarDays className="mr-2 h-4 w-4 text-purple-500" />
//                                   {values.endDate ? (
//                                     format(values.endDate, 'PPP')
//                                   ) : (
//                                     <span>Pick a date</span>
//                                   )}
//                                 </Button>
//                               </PopoverTrigger>
//                               <PopoverContent className="w-auto p-0">
//                                 <Calendar
//                                   mode="single"
//                                   selected={values.endDate}
//                                   onSelect={(date) => {
//                                     setFieldValue('endDate', date);
//                                     setFieldValue('schedule', []);
//                                   }}
//                                   initialFocus
//                                   fromDate={values.startDate || new Date()}
//                                 />
//                               </PopoverContent>
//                             </Popover>
//                             {errors.endDate && touched.endDate && (
//                               <div className="text-red-500 text-sm mt-1">{errors.endDate}</div>
//                             )}
//                           </div>
//                         </div>
//                         {values.startDate && values.endDate && (
//                           <div>
//                             <label className="block text-sm font-medium mb-2 text-neutral-dark flex items-center">
//                               <Clock className="h-4 w-4 mr-2 text-purple-500" />
//                               Event Schedule
//                             </label>
//                             <FieldArray name="schedule">
//                               {({ push, remove }) => (
//                                 <div className="space-y-4">
//                                   {values.schedule.length > 0 ? (
//                                     values.schedule.map((day: any, index: number) => (
//                                       <motion.div
//                                         key={index}
//                                         className="border border-neutral-light rounded-lg p-4"
//                                         initial={{ opacity: 0, y: 10 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         transition={{ delay: index * 0.1 }}
//                                       >
//                                         <div className="flex justify-between items-center mb-3">
//                                           <h3 className="font-medium text-purple-800">
//                                             Day {index + 1}: {format(day.date, 'PPP')}
//                                           </h3>
//                                           <button
//                                             type="button"
//                                             onClick={() => remove(index)}
//                                             className="text-red-500 hover:text-red-700"
//                                           >
//                                             <Trash2 className="h-4 w-4" />
//                                           </button>
//                                         </div>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                           <div>
//                                             <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                                               <Clock className="h-4 w-4 mr-2 text-purple-500" />
//                                               Start Time*
//                                             </label>
//                                             <ClockPicker
//                                               value={day.startTime}
//                                               onChange={(time) =>
//                                                 setFieldValue(`schedule.${index}.startTime`, time)
//                                               }
//                                             />
//                                             {(errors.schedule?.[index] as any)?.startTime && (
//                                               <div className="text-red-500 text-sm mt-1">
//                                                 {(errors.schedule?.[index] as any)?.startTime}
//                                               </div>
//                                             )}
//                                           </div>
//                                           <div>
//                                             <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                                               <Clock className="h-4 w-4 mr-2 text-purple-500" />
//                                               End Time*
//                                             </label>
//                                             <ClockPicker
//                                               value={day.endTime}
//                                               onChange={(time) =>
//                                                 setFieldValue(`schedule.${index}.endTime`, time)
//                                               }
//                                               minTime={day.startTime}
//                                             />
//                                             {(errors.schedule?.[index] as any )?.endTime && (
//                                               <div className="text-red-500 text-sm mt-1">
//                                                 {(errors.schedule?.[index] as any)?.endTime}
//                                               </div>
//                                             )}
//                                           </div>
//                                         </div>
//                                       </motion.div>
//                                     ))
//                                   ) : (
//                                     <div className="text-center py-4 text-neutral-dark/70">
//                                       No schedule entries yet
//                                     </div>
//                                   )}
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       if (!values.startDate || !values.endDate) return;
//                                       const days = Math.ceil(
//                                         ((values.endDate as any ).getTime() - (values.startDate as any).getTime()) /
//                                           (1000 * 60 * 60 * 24)
//                                       ) + 1;
//                                       const newSchedule = [];
//                                       for (let i = 0; i < days; i++) {
//                                         const date = addDays(values.startDate, i);
//                                         newSchedule.push({
//                                           date,
//                                           startTime: '10:00 AM',
//                                           endTime: '06:00 PM',
//                                         });
//                                       }
//                                       setFieldValue('schedule', newSchedule);
//                                     }}
//                                     className="flex items-center text-sm text-purple-500 hover:text-purple-700"
//                                   >
//                                     <Plus className="h-4 w-4 mr-1" />
//                                     {values.schedule.length > 0
//                                       ? 'Regenerate Schedule'
//                                       : 'Create Schedule'}
//                                   </button>
//                                 </div>
//                               )}
//                             </FieldArray>
//                             {errors.schedule && typeof errors.schedule === 'string' && (
//                               <div className="text-red-500 text-sm mt-1">{errors.schedule}</div>
//                             )}
//                           </div>
//                         )}
//                       </motion.div>
//                     </div>
//                   )}

//                   {currentStep === 2 && (
//                     <div className="space-y-6">
//                       <h2 className="text-xl font-semibold text-purple-800">Rules & Conditions</h2>
//                       <motion.div
//                         className="space-y-4"
//                         initial={{ y: 20, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         transition={{ delay: 0.1 }}
//                       >
//                         <div>
//                           <label className="block text-sm font-medium mb-2 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Prohibited Items
//                           </label>
//                           <FieldArray name="prohibitedItems">
//                             {({ push, remove }) => (
//                               <div className="space-y-2">
//                                 {values.prohibitedItems.map((item: string, index: number) => (
//                                   <motion.div
//                                     key={index}
//                                     className="flex items-center gap-2"
//                                     initial={{ opacity: 0, x: 20 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: index * 0.1 }}
//                                   >
//                                     <Field
//                                       as={Input}
//                                       name={`prohibitedItems.${index}`}
//                                       placeholder="e.g., Outside food, Large bags"
//                                       className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-purple-500"
//                                     />
//                                     <button
//                                       type="button"
//                                       onClick={() => remove(index)}
//                                       className="text-red-500 hover:text-red-700 p-2"
//                                     >
//                                       <Trash2 className="h-4 w-4" />
//                                     </button>
//                                   </motion.div>
//                                 ))}
//                                 <button
//                                   type="button"
//                                   onClick={() => push('')}
//                                   className="flex items-center text-sm text-purple-500 hover:text-purple-700"
//                                 >
//                                   <Plus className="h-4 w-4 mr-1" />
//                                   Add prohibited item
//                                 </button>
//                               </div>
//                             )}
//                           </FieldArray>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium mb-2 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Terms & Conditions*
//                           </label>
//                           <FieldArray name="termsAndConditions">
//                             {({ push, remove }) => (
//                               <div className="space-y-2">
//                                 {values.termsAndConditions.map((term: string, index: number) => (
//                                   <motion.div
//                                     key={index}
//                                     className="flex items-start gap-2"
//                                     initial={{ opacity: 0, x: 20 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: index * 0.1 }}
//                                   >
//                                     <Field
//                                       as={Textarea}
//                                       name={`termsAndConditions.${index}`}
//                                       placeholder="Enter term or condition"
//                                       rows={2}
//                                       className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-purple-500"
//                                     />
//                                     {index === 0 ? (
//                                       <div className="w-8"></div>
//                                     ) : (
//                                       <button
//                                         type="button"
//                                         onClick={() => remove(index)}
//                                         className="text-red-500 hover:text-red-700 p-2 mt-2"
//                                       >
//                                         <Trash2 className="h-4 w-4" />
//                                       </button>
//                                     )}
//                                   </motion.div>
//                                 ))}
//                                 <button
//                                   type="button"
//                                   onClick={() => push('')}
//                                   className="flex items-center text-sm text-purple-500 hover:text-purple-700"
//                                 >
//                                   <Plus className="h-4 w-4 mr-1" />
//                                   Add another term
//                                 </button>
//                               </div>
//                             )}
//                           </FieldArray>
//                           {errors.termsAndConditions && typeof errors.termsAndConditions === 'string' && (
//                             <div className="text-red-500 text-sm mt-1">{errors.termsAndConditions}</div>
//                           )}
//                         </div>
//                       </motion.div>
//                     </div>
//                   )}

//                   {currentStep === 3 && (
//                     <div className="space-y-6">
//                       <h2 className="text-xl font-semibold text-purple-800">Tickets & Capacity</h2>
//                       <motion.div
//                         className="space-y-4"
//                         initial={{ y: 20, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         transition={{ delay: 0.1 }}
//                       >
//                         <div>
//                           <label className="block text-sm font-medium mb-1 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Total Capacity*
//                           </label>
//                           <Field
//                             as={Input}
//                             name="capacity"
//                             type="number"
//                             min="1"
//                             className={cn(
//                               'w-32 transition-all duration-300 focus:ring-2 focus:ring-purple-500',
//                               errors.capacity && touched.capacity && 'border-red-500'
//                             )}
//                           />
//                           {errors.capacity && touched.capacity && (
//                             <div className="text-red-500 text-sm mt-1">{errors.capacity}</div>
//                           )}
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium mb-2 text-neutral-dark flex items-center">
//                             <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
//                             Ticket Types*
//                           </label>
//                           <FieldArray name="ticketTypes">
//                             {({ push, remove }) => (
//                               <div className="space-y-4">
//                                 {values.ticketTypes.map((ticket: any, index: number) => (
//                                   <motion.div
//                                     key={index}
//                                     className="border border-neutral-light rounded-lg p-4"
//                                     initial={{ opacity: 0, y: 10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     transition={{ delay: index * 0.1 }}
//                                   >
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                       <div>
//                                         <label className="block text-sm font-medium mb-1 text-neutral-dark">
//                                           Type*
//                                         </label>
//                                         <Field name={`ticketTypes.${index}.type`}>
//                                           {({ field }: any) => (
//                                             <Select
//                                               value={field.value}
//                                               onValueChange={(value) =>
//                                                 setFieldValue(`ticketTypes.${index}.type`, value)
//                                               }
//                                             >
//                                               <SelectTrigger
//                                                 className={cn(
//                                                   'transition-all duration-300',
//                                                   (errors.ticketTypes?.[index] as any)?.type && 'border-red-500'
//                                                 )}
//                                               >
//                                                 <SelectValue placeholder="Select type" />
//                                               </SelectTrigger>
//                                               <SelectContent>
//                                                 {Object.entries(TicketTypeEnum).map(([key, value]) => (
//                                                   <SelectItem key={key} value={key}>
//                                                     {value}
//                                                   </SelectItem>
//                                                 ))}
//                                               </SelectContent>
//                                             </Select>
//                                           )}
//                                         </Field>
//                                         {(errors.ticketTypes?.[index] as any)?.type && (
//                                           <div className="text-red-500 text-sm mt-1">
//                                             {(errors.ticketTypes?.[index] as any).type}
//                                           </div>
//                                         )}
//                                       </div>
//                                       <div>
//                                         <label className="block text-sm font-medium mb-1 text-neutral-dark">
//                                           Price*
//                                         </label>
//                                         <div className="relative">
//                                           <span className="absolute left-3 top-2 text-neutral-dark">$</span>
//                                           <Field
//                                             as={Input}
//                                             name={`ticketTypes.${index}.price`}
//                                             type="number"
//                                             min="0"
//                                             step="0.01"
//                                             className="pl-8 transition-all duration-300 focus:ring-2 focus:ring-purple-500"
//                                           />
//                                         </div>
//                                         {(errors.ticketTypes?.[index] as any)?.price && (
//                                           <div className="text-red-500 text-sm mt-1">
//                                             {(errors.ticketTypes?.[index] as any).price}
//                                           </div>
//                                         )}
//                                       </div>
//                                       <div>
//                                         <label className="block text-sm font-medium mb-1 text-neutral-dark">
//                                           Quantity*
//                                         </label>
//                                         <Field
//                                           as={Input}
//                                           name={`ticketTypes.${index}.quantity`}
//                                           type="number"
//                                           min="1"
//                                           max={values.capacity}
//                                           className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
//                                         />
//                                         {(errors.ticketTypes?.[index] as any)?.quantity && (
//                                           <div className="text-red-500 text-sm mt-1">
//                                             {(errors.ticketTypes?.[index] as any ).quantity}
//                                           </div>
//                                         )}
//                                       </div>
//                                     </div>
//                                     {values.ticketTypes.length > 1 && (
//                                       <div className="flex justify-end mt-3">
//                                         <button
//                                           type="button"
//                                           onClick={() => remove(index)}
//                                           className="text-red-500 hover:text-red-700 text-sm flex items-center"
//                                         >
//                                           <Trash2 className="h-4 w-4 mr-1" />
//                                           Remove
//                                         </button>
//                                       </div>
//                                     )}
//                                   </motion.div>
//                                 ))}
//                                 <button
//                                   type="button"
//                                   onClick={() => push({ type: 'GENERAL', price: 0, quantity: 0 })}
//                                   className="flex items-center text-sm text-purple-500 hover:text-purple-700"
//                                 >
//                                   <Plus className="h-4 w-4 mr-1" />
//                                   Add ticket type
//                                 </button>
//                                 {values.ticketTypes.length > 0 && (
//                                   <motion.div
//                                     className="mt-4 p-3 bg-neutral-light/30 rounded-lg"
//                                     initial={{ opacity: 0 }}
//                                     animate={{ opacity: 1 }}
//                                     transition={{ delay: 0.2 }}
//                                   >
//                                     <div className="flex justify-between">
//                                       <span className="font-medium text-neutral-dark">Total Tickets:</span>
//                                       <span>
//                                         {values.ticketTypes.reduce(
//                                           (sum: number, ticket: any) => sum + ticket.quantity,
//                                           0
//                                         )}{' '}
//                                         / {values.capacity}
//                                       </span>
//                                     </div>
//                                     {errors.ticketTypes && typeof errors.ticketTypes === 'string' && (
//                                       <div className="text-red-500 text-sm mt-1">
//                                         {errors.ticketTypes}
//                                       </div>
//                                     )}
//                                   </motion.div>
//                                 )}
//                               </div>
//                             )}
//                           </FieldArray>
//                         </div>
//                       </motion.div>
//                     </div>
//                   )}

//                   {currentStep === 4 && (
//                     <div className="space-y-6">
//                       <h2 className="text-xl font-semibold text-purple-800">Media Upload</h2>
//                       <motion.div
//                         className="space-y-4"
//                         initial={{ y: 20, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         transition={{ delay: 0.1 }}
//                       >
//                         <div>
//                           <label className="block text-sm font-medium mb-2 text-neutral-dark flex items-center">
//                             <UploadCloud className="h-4 w-4 mr-2 text-purple-500" />
//                             Upload Images & Videos
//                           </label>
//                           <input
//                             type="file"
//                             ref={fileInputRef}
//                             onChange={(e) => handleFileChange(e, setFieldValue, values.media)}
//                             multiple
//                             accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
//                             className="hidden"
//                           />
//                           <div
//                             onClick={() => fileInputRef.current?.click()}
//                             className="border-2 border-dashed border-neutral-light rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
//                           >
//                             <UploadCloud className="h-12 w-12 mx-auto text-purple-500/50 mb-3" />
//                             <p className="text-neutral-dark/70 mb-2">
//                               Drag & drop files here, or click to select
//                             </p>
//                             <p className="text-sm text-neutral-dark/50">
//                               Supports JPG, PNG, GIF, MP4, WebM (max 50MB each)
//                             </p>
//                           </div>
//                         </div>
//                         {uploading.length > 0 && (
//                           <div className="space-y-2">
//                             {uploading.map((fileName, index) => (
//                               <motion.div
//                                 key={index}
//                                 className="flex items-center gap-2 text-sm text-neutral-dark"
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 transition={{ delay: index * 0.1 }}
//                               >
//                                 <svg
//                                   className="animate-spin h-4 w-4 text-purple-500"
//                                   xmlns="http://www.w3.org/2000/svg"
//                                   fill="none"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <circle
//                                     className="opacity-25"
//                                     cx="12"
//                                     cy="12"
//                                     r="10"
//                                     stroke="currentColor"
//                                     strokeWidth="4"
//                                   />
//                                   <path
//                                     className="opacity-75"
//                                     fill="currentColor"
//                                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                   />
//                                 </svg>
//                                 <span>Uploading {fileName}...</span>
//                               </motion.div>
//                             ))}
//                           </div>
//                         )}
//                         {values.media.length > 0 && (
//                           <div>
//                             <label className="block text-sm font-medium mb-2 text-neutral-dark flex items-center">
//                               <UploadCloud className="h-4 w-4 mr-2 text-purple-500" />
//                               Uploaded Media
//                             </label>
//                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                               {values.media.map((url: string, index: number) => (
//                                 <motion.div
//                                   key={index}
//                                   className="relative group rounded-lg overflow-hidden border border-neutral-light"
//                                   initial={{ opacity: 0, scale: 0.9 }}
//                                   animate={{ opacity: 1, scale: 1 }}
//                                   transition={{ delay: index * 0.1 }}
//                                 >
//                                   {url.match(/\.(mp4|webm|mov)$/i) ? (
//                                     <video
//                                       src={url}
//                                       className="w-full h-32 object-cover"
//                                       muted
//                                       loop
//                                       playsInline
//                                     />
//                                   ) : (
//                                     <img
//                                       src={url}
//                                       alt={`Event media ${index + 1}`}
//                                       className="w-full h-32 object-cover"
//                                     />
//                                   )}
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       const newMedia = [...values.media];
//                                       newMedia.splice(index, 1);
//                                       setFieldValue('media', newMedia);
//                                     }}
//                                     className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                                   >
//                                     <Trash2 className="h-3 w-3" />
//                                   </button>
//                                 </motion.div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </motion.div>
//                     </div>
//                   )}
//                 </motion.div>
//               </AnimatePresence>
//             </div>

//             <div className="flex justify-between mt-8">
//               {currentStep > 0 ? (
//                 <Button
//                   type="button"
//                   onClick={handlePrev}
//                   variant="outline"
//                   className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
//                 >
//                   Previous
//                 </Button>
//               ) : (
//                 <div></div>
//               )}
//               {currentStep < 4 ? (
//                 <Button
//                   type="button"
//                   onClick={handleNext}
//                   className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
//                 >
//                   Next
//                 </Button>
//               ) : (
//                 <Button
//                   type="submit"
//                   disabled={isSubmitting || uploading.length > 0}
//                   className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
//                 >
//                   {isSubmitting || uploading.length > 0 ? (
//                     <span className="flex items-center">
//                       <svg
//                         className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         />
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         />
//                       </svg>
//                       {uploading.length > 0 ? 'Uploading...' : 'Creating Event...'}
//                     </span>
//                   ) : (
//                     'Create Event'
//                   )}
//                 </Button>
//               )}
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default CreateEventForm;


'use client';

import React, { useState, useRef } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popOver';
import { format, addDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { eventSchema } from '@/lib/validations/event'; // Assuming the Zod schema is in this file

// Type derived from Zod schema
type EventFormValues = z.infer<typeof eventSchema>;

// Cloudinary config
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
};

// Mock TimePicker component (replace with your actual implementation)
const TimePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  minTime?: string;
}> = ({ value, onChange, minTime }) => (
  <Input
    type="time"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    min={minTime}
    className="w-full"
  />
);

const CreateEventForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues: EventFormValues = {
    title: '',
    description: '',
    category: 'MUSIC',
    venue: '',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    schedule: [],
    prohibitedItems: [],
    termsAndConditions: [''],
    capacity: 100,
    ticketTypes: [{ type: 'GENERAL', price: 0, quantity: 0 }],
    media: [],
    organizerId: 'mock-organizer-id', // Replace with actual user context
    status: 'PUBLISHED',
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const handleCloudinaryUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url && z.string().url().safeParse(data.secure_url).success) {
        return data.secure_url;
      }
      throw new Error('Invalid URL');
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

  const handleSubmit = async (values: EventFormValues) => {
    try {
      // Mock API call (replace with actual API endpoint)
      console.log('Submitting event:', values);
      toast.success('Event created successfully!');
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
          validationSchema={toFormikValidationSchema(eventSchema)}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form>
              {/* Progress Steps */}
              <motion.div
                className="flex mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
                            <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                          )}
                        </div>
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
                            <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">
                            Category*
                          </label>
                          <Select
                            value={values.category}
                            onValueChange={(value) => setFieldValue('category', value)}
                          >
                            <SelectTrigger className="w-full rounded-md">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventSchema.shape.category.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.category && touched.category && (
                            <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-purple-800">Date & Venue</h2>
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
                            <div className="text-red-500 text-sm mt-1">{errors.venue}</div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                  {values.startDate ? (
                                    format(parseISO(values.startDate), 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={values.startDate ? parseISO(values.startDate) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setFieldValue('startDate', date.toISOString());
                                      if (values.endDate && date > parseISO(values.endDate)) {
                                        setFieldValue('endDate', date.toISOString());
                                      }
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            {errors.startDate && touched.startDate && (
                              <div className="text-red-500 text-sm mt-1">{errors.startDate}</div>
                            )}
                          </div>
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
                                  <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                  {values.endDate ? (
                                    format(parseISO(values.endDate), 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={values.endDate ? parseISO(values.endDate) : undefined}
                                  onSelect={(date) => date && setFieldValue('endDate', date.toISOString())}
                                  initialFocus
                                  fromDate={values.startDate ? parseISO(values.startDate) : new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                            {errors.endDate && touched.endDate && (
                              <div className="text-red-500 text-sm mt-1">{errors.endDate}</div>
                            )}
                          </div>
                        </div>
                        {values.startDate && values.endDate && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Event Schedule
                            </label>
                            <FieldArray name="schedule">
                              {({ push, remove }) => (
                                <div className="space-y-4">
                                  {values.schedule.map((day, index) => (
                                    <div
                                      key={index}
                                      className="border border-gray-200 rounded-lg p-4"
                                    >
                                      <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium text-purple-800">
                                          Day {index + 1}
                                        </h3>
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
                                        <div>
                                          <label className="block text-sm font-medium mb-1 text-gray-600">
                                            Date*
                                          </label>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant="outline"
                                                className={cn(
                                                  'w-full justify-start text-left font-normal rounded-md',
                                                  !day.date && 'text-gray-400',
                                                  errors.schedule?.[index]?.date && 'border-red-500'
                                                )}
                                              >
                                                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                                {day.date ? (
                                                  format(parseISO(day.date), 'PPP')
                                                ) : (
                                                  <span>Pick a date</span>
                                                )}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                mode="single"
                                                selected={day.date ? parseISO(day.date) : undefined}
                                                onSelect={(date) =>
                                                  date &&
                                                  setFieldValue(`schedule.${index}.date`, date.toISOString())
                                                }
                                                initialFocus
                                                fromDate={parseISO(values.startDate)}
                                                toDate={parseISO(values.endDate)}
                                              />
                                            </PopoverContent>
                                          </Popover>
                                          {errors.schedule?.[index]?.date && (
                                            <div className="text-red-500 text-sm mt-1">
                                              {errors.schedule[index].date}
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1 text-gray-600">
                                            Start Time*
                                          </label>
                                          <TimePicker
                                            value={day.startTime}
                                            onChange={(time) =>
                                              setFieldValue(`schedule.${index}.startTime`, time)
                                            }
                                          />
                                          {errors.schedule?.[index]?.startTime && (
                                            <div className="text-red-500 text-sm mt-1">
                                              {errors.schedule[index].startTime}
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1 text-gray-600">
                                            End Time*
                                          </label>
                                          <TimePicker
                                            value={day.endTime}
                                            onChange={(time) =>
                                              setFieldValue(`schedule.${index}.endTime`, time)
                                            }
                                            minTime={day.startTime}
                                          />
                                          {errors.schedule?.[index]?.endTime && (
                                            <div className="text-red-500 text-sm mt-1">
                                              {errors.schedule[index].endTime}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const start = parseISO(values.startDate);
                                      const end = parseISO(values.endDate);
                                      const days = Math.ceil(
                                        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                                      ) + 1;
                                      const newSchedule = [];
                                      for (let i = 0; i < days; i++) {
                                        const date = addDays(start, i);
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
                                    {values.schedule.length > 0
                                      ? 'Regenerate Schedule'
                                      : 'Create Schedule'}
                                  </button>
                                  {errors.schedule && typeof errors.schedule === 'string' && (
                                    <div className="text-red-500 text-sm mt-1">{errors.schedule}</div>
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
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Prohibited Items
                          </label>
                          <FieldArray name="prohibitedItems">
                            {({ push, remove }) => (
                              <div className="space-y-2">
                                {values.prohibitedItems.map((item, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Field
                                      as={Input}
                                      name={`prohibitedItems.${index}`}
                                      placeholder="e.g., Outside food, Large bags"
                                      className="flex-1 rounded-md"
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
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Terms & Conditions*
                          </label>
                          <FieldArray name="termsAndConditions">
                            {({ push, remove }) => (
                              <div className="space-y-2">
                                {values.termsAndConditions.map((term, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Field
                                      as={Textarea}
                                      name={`termsAndConditions.${index}`}
                                      placeholder="Enter term or condition"
                                      rows={2}
                                      className="flex-1 rounded-md"
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
                            <div className="text-red-500 text-sm mt-1">{errors.capacity}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Ticket Types*
                          </label>
                          <FieldArray name="ticketTypes">
                            {({ push, remove }) => (
                              <div className="space-y-4">
                                {values.ticketTypes.map((ticket, index) => (
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
                                          onValueChange={(value) =>
                                            setFieldValue(`ticketTypes.${index}.type`, value)
                                          }
                                        >
                                          <SelectTrigger className="rounded-md">
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {eventSchema.shape.ticketTypes.element.shape.type.options.map(
                                              (option) => (
                                                <SelectItem key={option} value={option}>
                                                  {option}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                        {errors.ticketTypes?.[index]?.type && (
                                          <div className="text-red-500 text-sm mt-1">
                                            {errors.ticketTypes[index].type}
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
                                            className="pl-8 rounded-md"
                                          />
                                        </div>
                                        {errors.ticketTypes?.[index]?.price && (
                                          <div className="text-red-500 text-sm mt-1">
                                            {errors.ticketTypes[index].price}
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
                                          className="rounded-md"
                                        />
                                        {errors.ticketTypes?.[index]?.quantity && (
                                          <div className="text-red-500 text-sm mt-1">
                                            {errors.ticketTypes[index].quantity}
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
                                {values.ticketTypes.length > 0 && (
                                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                    <div className="flex justify-between text-gray-600">
                                      <span className="font-medium">Total Tickets:</span>
                                      <span>
                                        {values.ticketTypes.reduce(
                                          (sum, ticket) => sum + ticket.quantity,
                                          0
                                        )}{' '}
                                        / {values.capacity}
                                      </span>
                                    </div>
                                    {errors.ticketTypes && typeof errors.ticketTypes === 'string' && (
                                      <div className="text-red-500 text-sm mt-1">
                                        {errors.ticketTypes}
                                      </div>
                                    )}
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
                        </div>
                        {values.media.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                              Uploaded Media
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {values.media.map((url, index) => (
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
                      onClick={handleNext}
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

export default CreateEventForm;
