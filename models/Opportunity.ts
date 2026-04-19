import mongoose, { Model, Schema } from 'mongoose';

export interface OpportunityDocument {
  id: string;
  title: string;
  description: string;
  type: string;
  deadline: Date;
  tags: string[];
  isRemote: boolean;
  isPaid: boolean;
  isBeginnerFriendly: boolean;
  company: string;
  location: string;
  applyUrl?: string;
}

const OpportunitySchema = new Schema<OpportunityDocument>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    deadline: { type: Date, required: true },
    tags: { type: [String], required: true, default: [] },
    isRemote: { type: Boolean, required: true, default: false },
    isPaid: { type: Boolean, required: true, default: false },
    isBeginnerFriendly: { type: Boolean, required: true, default: false },
    company: { type: String, required: true },
    location: { type: String, required: true },
    applyUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const Opportunity =
  (mongoose.models.Opportunity as Model<OpportunityDocument>) ||
  mongoose.model<OpportunityDocument>('Opportunity', OpportunitySchema);

export default Opportunity;
