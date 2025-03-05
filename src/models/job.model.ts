import mongoose, { type Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  postedDate?: Date;
  jobUrl: string;
  uniqueIdentifier: string;
  updatedAt: Date;
  createdAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      index: true,
      enum: ["Microsoft", "Google", "Amazon"],
    },
    location: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    postedDate: {
      type: Date,
      index: true,
    },
    jobUrl: {
      type: String,
      required: true,
    },
    uniqueIdentifier: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

JobSchema.index({ company: 1, location: 1, postedDate: -1 });
JobSchema.index({ title: "text", description: "text" });

export default mongoose.model<IJob>("Job", JobSchema);
