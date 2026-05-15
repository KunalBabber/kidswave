import mongoose from "mongoose";

const blacklistKeywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true, lowercase: true },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  category: {
    type: String,
    enum: [
      "Violence",
      "Hate Speech",
      "Sexual",
      "Drugs",
      "Scam",
      "Misinformation",
      "Other"
    ],
    default: "Other"
  },
  isActive: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const BlacklistKeyword = mongoose.model("BlacklistKeyword", blacklistKeywordSchema);
export default BlacklistKeyword;
