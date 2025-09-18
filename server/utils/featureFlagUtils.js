// utils/featureFlagUtils.js
import FeatureFlag from "../models/FeatureFlag.js";

export const fetchFeatureFlag = async (key) => {
  const flag = await FeatureFlag.findOne({ key });
  return flag ? flag.enabled : null; // return boolean or null
};
