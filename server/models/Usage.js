import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['DATA', 'VOICE', 'SMS'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['GB', 'MB', 'MINS', 'SMS'],
      required: true,
    },
    usageDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    charge: {
      type: Number,
      default: 0,
    },
    billingPeriod: {
      type: String, // e.g. "2026-10"
      required: true,
      index: true,
    },
    isBilled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index as explicitly noted in PDF page 8: { customerId: 1, usageDate: -1 }
usageSchema.index({ customerId: 1, usageDate: -1 });
usageSchema.index({ customerId: 1, billingPeriod: 1 });

const Usage = mongoose.model('Usage', usageSchema);
export default Usage;
