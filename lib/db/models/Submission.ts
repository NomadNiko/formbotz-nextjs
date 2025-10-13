import mongoose, { Schema, Model, Document } from 'mongoose';
import { Submission as ISubmission, SubmissionStatus } from '@/types';

export interface SubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

const StepAnswerSchema = new Schema(
  {
    stepId: { type: String, required: true },
    answeredAt: { type: Date, required: true },
    answer: Schema.Types.Mixed,
    variableName: String,
  },
  { _id: false }
);

const TimeSpentSchema = new Schema(
  {
    stepId: { type: String, required: true },
    seconds: { type: Number, required: true },
  },
  { _id: false }
);

const SubmissionMetadataSchema = new Schema(
  {
    startedAt: { type: Date, required: true },
    completedAt: Date,
    ipAddress: String,
    userAgent: String,
    conversions: [String],
    timeSpentPerStep: [TimeSpentSchema],
  },
  { _id: false }
);

const SubmissionSchema = new Schema<SubmissionDocument>(
  {
    formId: {
      type: String,
      required: [true, 'Form ID is required'],
      index: true,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.IN_PROGRESS,
      index: true,
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: SubmissionMetadataSchema,
      required: true,
    },
    stepHistory: {
      type: [StepAnswerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
SubmissionSchema.index({ formId: 1, status: 1 });
SubmissionSchema.index({ formId: 1, 'metadata.completedAt': -1 });
SubmissionSchema.index({ sessionId: 1 });

// Methods
SubmissionSchema.methods.addAnswer = function (
  stepId: string,
  answer: any,
  variableName?: string
) {
  this.stepHistory.push({
    stepId,
    answeredAt: new Date(),
    answer,
    variableName,
  });

  if (variableName) {
    this.data.set(variableName, answer);
  }

  return this.save();
};

SubmissionSchema.methods.complete = function () {
  this.status = SubmissionStatus.COMPLETED;
  this.metadata.completedAt = new Date();
  return this.save();
};

SubmissionSchema.methods.abandon = function () {
  this.status = SubmissionStatus.ABANDONED;
  return this.save();
};

SubmissionSchema.methods.addConversion = function (stepId: string) {
  if (!this.metadata.conversions.includes(stepId)) {
    this.metadata.conversions.push(stepId);
  }
  return this.save();
};

SubmissionSchema.methods.recordTimeSpent = function (
  stepId: string,
  seconds: number
) {
  const existing = this.metadata.timeSpentPerStep.find(
    (t: any) => t.stepId === stepId
  );

  if (existing) {
    existing.seconds += seconds;
  } else {
    this.metadata.timeSpentPerStep.push({ stepId, seconds });
  }

  return this.save();
};

const SubmissionModel: Model<SubmissionDocument> =
  mongoose.models.Submission ||
  mongoose.model<SubmissionDocument>('Submission', SubmissionSchema);

export default SubmissionModel;
