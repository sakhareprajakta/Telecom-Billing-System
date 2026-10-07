import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    planCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    includedData: {
      type: Number, // in GB
      required: true,
      min: 0,
    },
    includedSms: {
      type: Number,
      required: true,
      default: 100,
    },
    callPolicy: {
      type: String,
      default: 'Unlimited Local + STD Calls',
    },
    dataOverageRate: {
      type: Number, // price per GB exceeded (e.g. 50 in page 8)
      default: 50,
    },
    smsOverageRate: {
      type: Number, // price per SMS exceeded (e.g. 1)
      default: 1,
    },
    speed: {
      type: String,
      default: '5G High Speed',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
