import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    favorites: [
      {
        slug: String,
        title: String,
        poster_url: String,
      },
    ],
    watchHistory: [
      {
        movieSlug: String,
        movieTitle: String,
        poster_url: String,
        currentEpisode: String,
        episodeSlug: String,
        progressPercentage: Number,
        currentTime: Number,
        totalDuration: Number,
        lastWatchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
