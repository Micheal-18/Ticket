import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import NotificationItem from "./NotificationItem";

const NotificationPanel = ({ notifications, close }) => {
  const navigate = useNavigate();
  const grouped = groupNotifications(notifications);

  const handleClick = async (notif) => {
    if (!notif.read) {
      await updateDoc(doc(db, "notifications", notif.id), {
        read: true,
      });
    }

    if(notif.status === "pending") {
      await updateDoc(doc(db, "notifications", notif.id), {
        status: "approved",
      });
    }

    if (notif.link) navigate(notif.link);
    close?.();
  };

  const Section = ({ title, items }) =>
    items.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
          {title}
        </p>

        <div className="space-y-1">
          {items.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={() => handleClick(n)}
            />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-h-[420px] overflow-y-auto space-y-4">
      <Section title="Today" items={grouped.today} />
      <Section title="Yesterday" items={grouped.yesterday} />
      <Section title="Earlier" items={grouped.earlier} />

      {notifications.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-6">
          No notifications
        </p>
      )}
    </div>
  );
};

export default NotificationPanel;

/* ===== helpers ===== */
function groupNotifications(notifications) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups = { today: [], yesterday: [], earlier: [] };

  notifications.forEach((n) => {
    if (!n.createdAt?.toDate) {
      groups.earlier.push(n);
      return;
    }

    const d = n.createdAt.toDate();
    d.setHours(0, 0, 0, 0);

    if (d.getTime() === today.getTime()) {
      groups.today.push(n);
    } else if (d.getTime() === yesterday.getTime()) {
      groups.yesterday.push(n);
    } else {
      groups.earlier.push(n);
    }
  });

  return groups;
}
