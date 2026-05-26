import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieSlug: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
