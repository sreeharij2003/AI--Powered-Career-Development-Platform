import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  remote: boolean;
  type: string;
  experience_level?: string;
  skills: string[];
  requirements?: string[];
  posted_date: Date;
  is_active: boolean;
  source: string;
  url?: string;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: String },
    remote: { type: Boolean, default: false },
    type: { type: String, required: true },
    experience_level: { type: String },
    skills: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    posted_date: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
    source: { type: String, required: true },
    url: { type: String }
  },
  { timestamps: true }
);

// Create indexes for faster queries
JobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });
JobSchema.index({ posted_date: -1 });
JobSchema.index({ is_active: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ skills: 1 });

// Check if the model already exists to prevent OverwriteModelError
const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job; 