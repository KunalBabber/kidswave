import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      "Inappropriate Content",
      "Violence",
      "Hate Speech",
      "Misinformation",
      "Spam",
      "Sexual Content",
      "Child Safety Concern",
      "Copyright Violation",
      "Other"
    ]
  },
  status: {
    type: String,
    enum: ["Pending", "Under Review", "Resolved", "Dismissed"],
    default: "Pending"
  }
}, {
  timestamps: true
});

const Report = mongoose.model("Report", reportSchema);
export default Report;