import mongoose, { Schema, Model, Document } from 'mongoose';
import {
  FormAction as IFormAction,
  FormActionType,
  HttpMethod,
} from '@/types';

export interface FormActionDocument extends Omit<IFormAction, '_id'>, Document {}

// Main Form Action Schema
const FormActionSchema = new Schema<FormActionDocument>(
  {
    clientId: {
      type: String,
      required: [true, 'Client ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Action name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name must be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be less than 500 characters'],
    },
    type: {
      type: String,
      enum: Object.values(FormActionType),
      required: [true, 'Action type is required'],
    },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FormActionSchema.index({ clientId: 1, type: 1 });
FormActionSchema.index({ name: 1, clientId: 1 });

// Virtual to format config based on type
FormActionSchema.virtual('formattedConfig').get(function () {
  if (this.type === FormActionType.EMAIL) {
    const emailConfig = this.config as { recipients?: string[] };
    return {
      recipients: emailConfig.recipients || [],
    };
  } else if (this.type === FormActionType.API) {
    const apiConfig = this.config as { targetUrl: string; method: string; headers: Map<string, string> | Record<string, string> };
    const headers = apiConfig.headers instanceof Map
      ? Object.fromEntries(apiConfig.headers)
      : apiConfig.headers || {};

    return {
      targetUrl: apiConfig.targetUrl,
      method: apiConfig.method || HttpMethod.POST,
      headers,
    };
  }
  return this.config;
});

// Ensure virtuals are serialized
FormActionSchema.set('toJSON', { virtuals: true });
FormActionSchema.set('toObject', { virtuals: true });

const FormActionModel: Model<FormActionDocument> =
  mongoose.models.FormAction ||
  mongoose.model<FormActionDocument>('FormAction', FormActionSchema);

export default FormActionModel;
