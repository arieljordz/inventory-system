import moment from "moment-timezone";
import { fetchFeatureFlag } from "./featureFlagUtils.js";

export const buildDateFilter = (startDate, endDate, field = "createdAt") => {
  const filter = {};
  if (startDate)
    filter[field] = { $gte: moment(startDate).startOf("day").toDate() };
  if (endDate)
    filter[field] = {
      ...filter[field],
      $lte: moment(endDate).endOf("day").toDate(),
    };
  return filter;
};

export const getEffectivePriceStage = async () => {
  const productPriceMode = await fetchFeatureFlag("product_price_mode");

  if (productPriceMode === true) {
    return {
      $addFields: {
        effectivePrice: {
          $cond: {
            if: {
              $and: [
                { $ne: ["$product.price", null] },
                { $gt: ["$product.price", 0] },
              ],
            },
            then: "$product.price",
            else: "$price",
          },
        },
      },
    };
  } else if (productPriceMode === false) {
    return {
      $addFields: {
        effectivePrice: {
          $cond: {
            if: { $and: [{ $ne: ["$price", null] }, { $gt: ["$price", 0] }] },
            then: "$price",
            else: "$product.price",
          },
        },
      },
    };
  }

  return {
    $addFields: {
      effectivePrice: { $ifNull: ["$price", "$product.price"] },
    },
  };
};
