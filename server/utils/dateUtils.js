import moment from "moment-timezone";

const DEFAULT_TZ = "Asia/Manila";

export const buildDateFilter = (startDate, endDate, field = "createdAt") => {
  const filter = {};

  if (startDate) {
    filter[field] = {
      $gte: moment.tz(startDate, DEFAULT_TZ).startOf("day").toDate(),
    };
  }
  if (endDate) {
    filter[field] = {
      ...filter[field],
      $lte: moment.tz(endDate, DEFAULT_TZ).endOf("day").toDate(),
    };
  }
  return filter;
};

export const getDateRange = (startDate, endDate, timezone = DEFAULT_TZ) => {
  let start = null;
  let end = null;

  if (startDate) {
    start = moment.tz(startDate, timezone).startOf("day").toDate();
  }

  if (endDate) {
    end = moment.tz(endDate, timezone).endOf("day").toDate();
  }

  return { start, end };
};

export const getYearRange = (year = moment().year(), timezone = DEFAULT_TZ) => {
  const start = moment.tz({ year, month: 0, day: 1 }, timezone)
    .startOf("day")
    .toDate();
  const end = moment.tz({ year, month: 11, day: 31 }, timezone)
    .endOf("day")
    .toDate();
  return { start, end };
};

export const getCurrentMonthRange = (timezone = DEFAULT_TZ) => {
  const start = moment().tz(timezone).startOf("month").toDate();
  const end = moment().tz(timezone).endOf("month").toDate();
  return { start, end };
};
