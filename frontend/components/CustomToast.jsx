import { toast } from 'react-toastify'
import { CheckCircle, XCircle, AlertTriangle, Info, X, Sparkles, UserCheck, LogIn } from 'lucide-react'

const ToastContent = ({ type, title, message, onClose, icon: customIcon }) => {
  const icons = {
    success: customIcon || <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
    login: <LogIn className="w-6 h-6" />,
    register: <UserCheck className="w-6 h-6" />
  }

  const gradients = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-rose-600',
    warning: 'from-yellow-500 to-orange-600',
    info: 'from-blue-500 to-indigo-600',
    login: 'from-purple-500 to-pink-600',
    register: 'from-teal-500 to-cyan-600'
  }

  const glowColors = {
    success: 'shadow-green-500/30',
    error: 'shadow-red-500/30',
    warning: 'shadow-yellow-500/30',
    info: 'shadow-blue-500/30',
    login: 'shadow-purple-500/30',
    register: 'shadow-teal-500/30'
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradients[type]} opacity-10 animate-pulse`} />

      <div className={`relative bg-white rounded-xl shadow-lg ${glowColors[type]} shadow-lg border border-gray-100 overflow-hidden`}>
        {/* Progress bar at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[type]} toast-progress`} />

        <div className="flex items-center gap-4 p-5">
          {/* Icon with gradient background */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${gradients[type]} flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110`}>
            {icons[type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900">
              {title}
            </p>
            {message && (
              <p className="text-sm mt-1 text-gray-600">
                {message}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const showToast = {
  success: (title, message, icon = null) => {
    toast(
      ({ closeToast }) => (
        <ToastContent
          type="success"
          title={title}
          message={message}
          onClose={closeToast}
          icon={icon}
        />
      ),
      {
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-success',
        autoClose: 4000,
        closeButton: false,
      }
    )
  },

  login: (title, message) => {
    toast(
      ({ closeToast }) => (
        <ToastContent
          type="login"
          title={title || 'Welcome Back!'}
          message={message || 'Successfully logged in to your account'}
          onClose={closeToast}
          icon={<Sparkles className="w-6 h-6" />}
        />
      ),
      {
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-login',
        autoClose: 4000,
        closeButton: false,
      }
    )
  },

  register: (title, message) => {
    toast(
      ({ closeToast }) => (
        <ToastContent
          type="register"
          title={title || 'Account Created!'}
          message={message || 'Your account has been successfully created'}
          onClose={closeToast}
          icon={<UserCheck className="w-6 h-6" />}
        />
      ),
      {
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-register',
        autoClose: 4000,
        closeButton: false,
      }
    )
  },

  error: (title, message) => {
    toast(
      ({ closeToast }) => (
        <ToastContent
          type="error"
          title={title}
          message={message}
          onClose={closeToast}
        />
      ),
      {
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-error',
        autoClose: 5000,
        closeButton: false,
      }
    )
  },

  warning: (title, message) => {
    toast(
      ({ closeToast }) => (
        <ToastContent
          type="warning"
          title={title}
          message={message}
          onClose={closeToast}
        />
      ),
      {
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-warning',
        autoClose: 4000,
        closeButton: false,
      }
    )
  },

  info: (title, message) => {
    toast(
      ({ closeToast }) => (
        <ToastContent
          type="info"
          title={title}
          message={message}
          onClose={closeToast}
        />
      ),
      {
        className: 'custom-toast',
        bodyClassName: 'custom-toast-body',
        progressClassName: 'custom-toast-progress-info',
        autoClose: 4000,
        closeButton: false,
      }
    )
  }
}

export default showToast