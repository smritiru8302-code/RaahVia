import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    codeUrl: {
      type: String,
      required: true
    },
    scans: {
      type: Number,
      default: 0
    },
    lastScannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastScannedAt: Date,
    scanHistory: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('QRCode', qrCodeSchema);
