// utils/formatEventRange.js
import { format, isToday, isTomorrow, isAfter, isBefore, isValid } from "date-fns";

export const formatEventStatus = (start, end) => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  // 🚨 If invalid date, stop early
  if (!isValid(startDate)) return "❌ Invalid start date";
  if (end && !isValid(endDate)) return "❌ Invalid end date";

  // ✅ Ongoing
  if (endDate && isAfter(now, startDate) && isBefore(now, endDate)) {
    return "🟢 Ongoing";
  }

  // ✅ Ended (but not yet deleted)
  if (endDate && isAfter(now, endDate)) {
    return "🔴 Ended";
  }

  // ✅ Upcoming
  let prefix = "";
  if (isToday(startDate)) {
    prefix = "Today";
  } else if (isTomorrow(startDate)) {
    prefix = "Tomorrow";
  } else {
    prefix = format(startDate, "MMM d, yyyy");
  }

  const startTime = format(startDate, "h:mm a");
  const endTime = endDate ? format(endDate, "h:mm a") : null;

  return endTime
    ? `${prefix}, ${startTime} → ${endTime}`
    : `${prefix}, ${startTime}`;
};
