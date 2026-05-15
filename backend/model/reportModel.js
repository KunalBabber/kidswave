import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  reason: {
    type: String,
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
    ],
    required: true
  },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Under Review", "Resolved", "Dismissed"],
    default: "Pending"
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  adminAction: {
    type: String,
    enum: ["Delete", "Block Channel", "Age Restrict", "Warning", "None"],
    default: "None"
  },
  reviewNotes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;
