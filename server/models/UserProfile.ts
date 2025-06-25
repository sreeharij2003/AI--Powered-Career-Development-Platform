import mongoose, { Document, Schema, Types } from 'mongoose';

// Define interface for individual cover letters
export interface ICoverLetter extends Document { // Export the interface
  title?: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  jobId?: Types.ObjectId;
  company?: string;
}

// Define the schema for individual cover letters
const coverLetterSchema = new Schema<ICoverLetter>({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  company: String
});

// Define the schema for individual resumes
const resumeSchema = new Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

// Define interface for generated content
interface IGeneratedContent {
    coverLetters: ICoverLetter[]; // Array of ICoverLetter
    resumes: any[]; // Define a proper interface for resumes if needed
}

// Define interface for UserProfile
export interface IUserProfile extends Document { // Export the interface
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    currentTitle?: string;
    location?: string;
    skills: string[];
    experience: any[]; // Define proper interfaces for these
    education: any[]; // Define proper interfaces for these
    preferences: any; // Define proper interfaces for these
    savedJobs: Types.ObjectId[];
    applications: any[]; // Define proper interfaces for these
    generatedContent?: IGeneratedContent; // Make optional
}

// Define the UserProfile schema
const userProfileSchema = new mongoose.Schema<IUserProfile>({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  currentTitle: String,
  location: String,
  skills: [String],
  experience: [{
    title: String,
    company: String,
    description: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
  }],
  education: [{
    degree: String,
    institution: String,
    field: String,
    graduationYear: Number,
  }],
  preferences: {
    jobTypes: [String],
    industries: [String],
    locations: [String],
    salaryExpectation: {
      min: Number,
      max: Number,
      currency: String,
    },
    remote: Boolean,
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
  applications: [{
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    status: {
      type: String,
      enum: ['applied', 'interviewing', 'offered', 'rejected', 'accepted'],
    },
    appliedDate: Date,
    coverLetter: String, // This might be a path or reference if letters get large
    resume: String, // This might be a path or reference if resumes get large
  }],
  generatedContent: {
    coverLetters: [coverLetterSchema], // Use the defined schema
    resumes: [resumeSchema], // Use the defined schema
  }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt to the main document

// Update the updatedAt field on save
userProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ email: 1 });
userProfileSchema.index({ skills: 1 });

// Export the model
const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);

export default UserProfile; 