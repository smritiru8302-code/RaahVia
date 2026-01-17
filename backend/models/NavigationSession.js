import mongoose from 'mongoose';

const navigationSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    endLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'paused'],
      default: 'active'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number, // in seconds
    distance: Number, // in meters
    stepsCount: Number,
    route: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: Date
      }
    ],
    feedback: {
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
      accurate: Boolean,
      comment: String
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('NavigationSession', navigationSessionSchema);
