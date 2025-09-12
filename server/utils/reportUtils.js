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
