import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    block: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: String,
      enum: ['Ground', '1st', '2nd', '3rd', '4th', '5th'],
      required: true
    },
    category: {
      type: String,
      enum: ['Auditorium', 'Academic', 'Pharmacy', 'Cafeteria', 'Sports', 'Facilities', 'Administrative', 'Other'],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String, // URL to image
      default: null
    },
    maxSteps: {
      type: Number,
      required: true
    },
    distanceInMeters: {
      type: Number,
      required: true
    },
    angle: {
      type: Number,
      required: true
    },
    targetCoord: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    voiceGuidance: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      accessibilityNotes: String
    },
    operatingHours: {
      open: String,
      close: String,
      daysOpen: [String]
    },
    contact: {
      phone: String,
      email: String
    },
    facilities: [String], // e.g., ['WiFi', 'Parking', 'Seating']
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviews: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    qrCodeUrl: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Location', locationSchema);
