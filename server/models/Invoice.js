import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    billingPeriod: {
      type: String, // e.g. "2026-10"
      required: true,
      index: true,
    },
    baseAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    usageAmount: {
      type: Number,
      default: 0,
    },
    dataCharge: {
      type: Number,
      default: 0,
    },
    smsCharge: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
    details: {
      planName: String,
      includedDataGB: Number,
      actualDataGB: Number,
      extraDataGB: Number,
      dataRatePerGB: Number,
      includedSms: Number,
      actualSms: Number,
      extraSms: Number,
      taxRate: { type: Number, default: 0.18 },
    },
  },
  { timestamps: true }
);

// Indexes specified in PDF page 8: { customerId: 1, billingPeriod: -1 }
invoiceSchema.index({ customerId: 1, billingPeriod: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
