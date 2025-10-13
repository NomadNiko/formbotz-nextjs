import mongoose, { Schema, Model, Document } from 'mongoose';
import { User as IUser } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      formsLimit: {
        type: Number,
        default: 3, // Free plan default
      },
      submissionsLimit: {
        type: Number,
        default: 100, // Free plan default
      },
      validUntil: {
        type: Date,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });

// Prevent password from being returned in queries
UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: function (_doc, ret: any) {
    delete ret.passwordHash;
    return ret;
  },
});

const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;
