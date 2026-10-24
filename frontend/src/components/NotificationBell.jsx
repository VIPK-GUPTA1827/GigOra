import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  UploadCloud, 
  AlertCircle, 
  Sparkles, 
  Clock,
  ExternalLink
} from 'lucide-react';
import io from 'socket.io-client';

export default function NotificationBell({ userRole = 'freelancer', onNavigateToGig }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications on mount
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time socket events
    const socket = io(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socket.on('new_notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark single notification as read and navigate
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await fetch(`/api/notifications/mark-read/${notif._id}`, {
          method: 'PUT',
          credentials: 'include'
        });
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
        );
      }

      setIsOpen(false);

      // Route navigation based on notification reference and user role
      if (notif.destinationUrl) {
        if (onNavigateToGig) {
          onNavigateToGig(notif.referenceId, notif.type, notif.destinationUrl);
        } else {
          navigate(notif.destinationUrl);
        }
      } else if (onNavigateToGig && notif.referenceId) {
        onNavigateToGig(notif.referenceId, notif.type);
      } else if (notif.referenceId) {
        if (userRole === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/dashboard');
        }
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'proposal_submitted':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'proposal_accepted':
      case 'milestone_approved':
      case 'milestone_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'proposal_rejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'deliverable_submitted':
        return <UploadCloud className="w-4 h-4 text-indigo-600" />;
      case 'revision_requested':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#593CFF]" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#593CFF] text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Glassmorphic Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#593CFF]/10 text-[#593CFF] text-[11px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#593CFF] hover:text-[#472fe0] inline-flex items-center gap-1 cursor-pointer transition hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400">Updates on proposals, deliverables, and milestone releases will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 sm:p-4 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 relative ${
                    !notif.read ? 'bg-indigo-50/30' : 'bg-transparent'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs truncate ${!notif.read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[#593CFF] shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
            <span className="text-[10px] font-medium text-slate-400">
              Real-time in-app notifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
