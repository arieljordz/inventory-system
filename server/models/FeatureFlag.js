// models/FeatureFlag.js
import mongoose from "mongoose";

const featureFlagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // prevent duplicate keys
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional: link to user who created it
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional: link to user who last updated it
    },
  },
  { timestamps: true }
);

export default mongoose.model("FeatureFlag", featureFlagSchema);
