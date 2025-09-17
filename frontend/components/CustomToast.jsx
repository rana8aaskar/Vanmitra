import { toast } from 'react-toastify'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContent = ({ type, title, message, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    error: <XCircle className="w-6 h-6 text-red-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />
  }

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  const titleColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900'
  }

  const messageColors = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${colors[type]} relative`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${titleColors[type]}`}>
          {title}
        </p>
        {message && (
          <p className={`text-sm mt-1 ${messageColors[type]}`}>
            {message}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export const showToast = {
  success: (title, message) => {
    toast(
      ({ closeToast }) => (
        <ToastContent
          type="success"
          title={title}
          message={message}
          onClose={closeToast}
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