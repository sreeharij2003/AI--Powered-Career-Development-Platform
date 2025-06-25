import mongoose from 'mongoose';

const scrapedDataSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['job', 'company', 'salary', 'industry'],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  metadata: {
    url: String,
    timestamp: Date,
    success: Boolean,
    error: String,
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: Date,
  isProcessed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  }
});

// Indexes for better query performance
scrapedDataSchema.index({ source: 1, type: 1 });
scrapedDataSchema.index({ scrapedAt: 1 });
scrapedDataSchema.index({ status: 1 });

const ScrapedData = mongoose.model('ScrapedData', scrapedDataSchema);

export default ScrapedData; 