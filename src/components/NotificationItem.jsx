import { FaTicketAlt, FaUserPlus, FaMoneyBillWave } from "react-icons/fa";

const iconMap = {
  event_submission: "📢",
  ticket_purchase: <FaTicketAlt className="text-green-500" />,
  follower: <FaUserPlus className="text-blue-500" />,
  settlement: <FaMoneyBillWave className="text-orange-500" />,
  blog: "📝",
};

const NotificationItem = ({ notification, onClick }) => {
  
  // 🕓 Safe Date Parsing Function
  const formatNotificationDate = (dateField) => {
    if (!dateField) return "No date";

    // 1. If it's a native Firestore Timestamp object
    if (typeof dateField.toDate === "function") {
      return dateField.toDate().toLocaleString();
    }

    // 2. If it's already a regular JavaScript Date Object
    if (dateField instanceof Date) {
      return dateField.toLocaleString();
    }

    // 3. If it's saved as an ISO String (e.g., from your .toISOString() fields)
    if (typeof dateField === "string") {
      const parsedDate = new Date(dateField);
      return isNaN(parsedDate.getTime()) ? "Invalid date" : parsedDate.toLocaleString();
    }

    return "No date";
  };

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition
        ${notification.read
          ? "bg-transparent"
          : "bg-orange-500/10 hover:bg-orange-500/20"}
      `}
    >
      {/* Icon */}
      <div className="mt-1">
        {iconMap[notification.type] || "🔔"}
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="font-semibold text-sm">
          {notification.title}
        </p>
        <p className="text-xs text-gray-500">
          {notification.message}
        </p>

        {/* Date Render */}
        <p className="text-[10px] text-gray-400 mt-1">
          {formatNotificationDate(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
      )}
    </div>
  );
};

export default NotificationItem;