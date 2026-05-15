import mongoose from "mongoose";

const blacklistKeywordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

const BlacklistKeyword = mongoose.model("BlacklistKeyword", blacklistKeywordSchema);
export default BlacklistKeyword;