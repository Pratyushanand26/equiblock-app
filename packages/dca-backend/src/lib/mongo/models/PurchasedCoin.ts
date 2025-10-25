// REPLACE entire file content with:

import { Schema, model } from 'mongoose';

const priceLogSchemaDefinition = {
  price: {
    required: true,
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  transactionHash: {
    type: String,
  },
} as const;

const PriceLogSchema = new Schema(priceLogSchemaDefinition, { timestamps: true });

// Index for querying recent prices
PriceLogSchema.index({ createdAt: -1 });

export const PriceLog = model('PriceLog', PriceLogSchema);