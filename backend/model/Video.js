import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  ageLimit: {
    type: Number,
    required: true,
    min: 0,
    max: 18
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);
export default Video;