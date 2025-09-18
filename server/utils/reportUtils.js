import moment from "moment-timezone";

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

export const getEffectivePriceStage = (mode = "orderFirst") => {
  if (mode === "orderFirst") {
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
  } else if (mode === "productFirst") {
    return {
      $addFields: {
        effectivePrice: {
          $cond: {
            if: {
              $and: [{ $ne: ["$product.price", null] }, { $gt: ["$product.price", 0] }],
            },
            then: "$product.price",
            else: "$price",
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

