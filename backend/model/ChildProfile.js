import mongoose from "mongoose";

const childProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

const ChildProfile = mongoose.model("ChildProfile", childProfileSchema);
export default ChildProfile;