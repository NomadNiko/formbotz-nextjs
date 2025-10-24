import mongoose, { Schema, Model, Document } from 'mongoose';
import {
  Form as IForm,
  Step,
  FormStatus,
  StepType,
  OutputType,
  DataType,
  ConditionalOperator,
  LogicalOperator,
} from '@/types';

export interface FormDocument extends Omit<IForm, '_id'>, Document {
  incrementViews(): Promise<this>;
  incrementStarts(): Promise<this>;
  incrementCompletions(): Promise<this>;
  updateCompletionRate(): Promise<this>;
}

// Sub-schemas
const MediaItemSchema = new Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    alt: String,
    caption: String,
  },
  { _id: false }
);

const LinkItemSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    openInNewTab: { type: Boolean, default: true },
  },
  { _id: false }
);

const ChoiceOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: Schema.Types.Mixed,
    redirectUrl: String,
  },
  { _id: false }
);

const ValidationRuleSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['required', 'minLength', 'maxLength', 'pattern', 'custom'],
      required: true,
    },
    value: Schema.Types.Mixed,
    message: { type: String, required: true },
  },
  { _id: false }
);

const ConditionSchema = new Schema(
  {
    variableName: { type: String, required: true },
    operator: {
      type: String,
      enum: Object.values(ConditionalOperator),
      required: true,
    },
    value: Schema.Types.Mixed,
  },
  { _id: false }
);

const ConditionalLogicSchema = new Schema(
  {
    showIf: [ConditionSchema],
    operator: {
      type: String,
      enum: Object.values(LogicalOperator),
      default: LogicalOperator.AND,
    },
  },
  { _id: false }
);

const NextStepRuleSchema = new Schema(
  {
    conditions: [ConditionSchema],
    operator: {
      type: String,
      enum: Object.values(LogicalOperator),
      default: LogicalOperator.AND,
    },
    targetStepId: { type: String, required: true },
  },
  { _id: false }
);

const DisplayContentSchema = new Schema(
  {
    messages: [
      {
        text: { type: String, required: true },
        delay: Number,
      },
    ],
    media: {
      type: {
        type: String,
        enum: ['image', 'carousel', 'video'],
      },
      items: [MediaItemSchema],
    },
    links: [LinkItemSchema],
  },
  { _id: false }
);

const InputConfigSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['text', 'choice', 'none'],
      required: true,
    },
    dataType: {
      type: String,
      enum: Object.values(DataType),
    },
    choices: [ChoiceOptionSchema],
    validation: [ValidationRuleSchema],
    placeholder: String,
    helperText: String,
  },
  { _id: false }
);

const DataCollectionSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    variableName: { type: String, required: true },
    storageKey: { type: String, required: true },
    updateExisting: { type: Boolean, default: false },
  },
  { _id: false }
);

const TrackingConfigSchema = new Schema(
  {
    conversionEvent: String,
    analyticsLabel: String,
  },
  { _id: false }
);

const StepSchema = new Schema<Step>(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(StepType),
      required: true,
    },
    outputType: {
      type: String,
      enum: Object.values(OutputType),
      required: true,
    },
    display: { type: DisplayContentSchema, required: true },
    input: InputConfigSchema,
    collect: DataCollectionSchema,
    conditionalLogic: ConditionalLogicSchema,
    nextStepOverride: {
      rules: [NextStepRuleSchema],
      default: String,
    },
    replayTarget: String,
    tracking: TrackingConfigSchema,
    createdAt: Date,
    updatedAt: Date,
  },
  { _id: false }
);

const FormSettingsSchema = new Schema(
  {
    brandColor: String,
    backgroundImageUrl: String,
    useDarkText: { type: Boolean, default: false },
    typingDelay: {
      type: String,
      enum: ['none', 'short', 'normal'],
      default: 'normal'
    },
    logo: String,
    welcomeMessage: String,
    thankYouMessage: String,
    enableProgressBar: { type: Boolean, default: true },
    allowBackNavigation: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
  },
  { _id: false }
);

const StatsSchema = new Schema(
  {
    views: { type: Number, default: 0 },
    starts: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageTimeToComplete: Number,
  },
  { _id: false }
);

// Main Form Schema
const FormSchema = new Schema<FormDocument>(
  {
    clientId: {
      type: String,
      required: [true, 'Client ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Form name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    steps: {
      type: [StepSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(FormStatus),
      default: FormStatus.DRAFT,
      index: true,
    },
    publicUrl: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    settings: {
      type: FormSettingsSchema,
      default: {},
    },
    stats: {
      type: StatsSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
FormSchema.index({ clientId: 1, status: 1 });
FormSchema.index({ 'steps.id': 1 });

// Methods
FormSchema.methods.incrementViews = function () {
  this.stats = this.stats || {};
  this.stats.views = (this.stats.views || 0) + 1;
  return this.save();
};

FormSchema.methods.incrementStarts = function () {
  this.stats = this.stats || {};
  this.stats.starts = (this.stats.starts || 0) + 1;
  return this.save();
};

FormSchema.methods.incrementCompletions = function () {
  this.stats = this.stats || {};
  this.stats.completions = (this.stats.completions || 0) + 1;
  this.updateCompletionRate();
  return this.save();
};

FormSchema.methods.updateCompletionRate = function () {
  if (this.stats && this.stats.starts > 0) {
    this.stats.completionRate =
      (this.stats.completions / this.stats.starts) * 100;
  }
};

const FormModel: Model<FormDocument> =
  mongoose.models.Form || mongoose.model<FormDocument>('Form', FormSchema);

export default FormModel;
