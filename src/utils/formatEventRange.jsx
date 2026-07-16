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


// If end time is before start time,
// assume the event ends the next day.
if (endDate && endDate <= startDate) {
  endDate.setDate(endDate.getDate() + 1);
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

const startTime = format(startDate, "HH:mm");
const endTime = endDate ? format(endDate, "HH:mm") : null;

  return startTime
    ? `${prefix}, ${startTime} → ${endTime}`
    : `${prefix}, ${startTime}`;
};
