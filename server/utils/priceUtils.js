import { fetchFeatureFlag } from "./featureFlagUtils.js";

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
