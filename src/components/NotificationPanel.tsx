import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, Notification, NotificationType } from '@/contexts/NotificationContext';
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoInformationCircle, 
  IoWarning,
  IoTrashOutline,
  IoCheckmarkDoneOutline,
  IoNotificationsOffOutline
} from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <IoCheckmarkCircle className="text-green-500" size={20} />;
    case 'error':
      return <IoCloseCircle className="text-red-500" size={20} />;
    case 'warning':
      return <IoWarning className="text-yellow-500" size={20} />;
    case 'info':
      return <IoInformationCircle className="text-blue-500" size={20} />;
  }
};

const getNotificationBgColor = (type: NotificationType, read: boolean) => {
  const opacity = read ? '10' : '20';
  switch (type) {
    case 'success':
      return `bg-green-${opacity}`;
    case 'error':
      return `bg-red-${opacity}`;
    case 'warning':
      return `bg-yellow-${opacity}`;
    case 'info':
      return `bg-blue-${opacity}`;
  }
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        notification.read 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-gray-300 shadow-sm'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            >
              <IoTrashOutline size={16} />
            </button>
          </div>
          <p className={`text-xs mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: es })}
          </p>
        </div>
        {!notification.read && (
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
        )}
      </div>
    </motion.div>
  );
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-4 top-16 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
              </div>
              
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <IoCheckmarkDoneOutline size={14} />
                      Marcar todas como leídas
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <IoNotificationsOffOutline size={14} />
                    Limpiar todas
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <IoNotificationsOffOutline size={48} className="mb-2" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
