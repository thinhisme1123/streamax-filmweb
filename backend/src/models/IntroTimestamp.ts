import mongoose from 'mongoose';

const introTimestampSchema = new mongoose.Schema(
  {
    movieSlug: { type: String, required: true, unique: true, index: true },
    introEndTime: { type: Number, required: true, min: 0 },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const IntroTimestamp = mongoose.model('IntroTimestamp', introTimestampSchema);
