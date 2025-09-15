import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, CloudUpload } from 'lucide-react'

export default function FileUpload({ onUpload, loading }) {
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload file
      onUpload(file).then(() => {
        clearInterval(interval)
        setUploadProgress(100)
        setTimeout(() => setUploadProgress(0), 1000)
      })
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: loading
  })

  return (
    <div>
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive
            ? 'border-forest-500 bg-gradient-to-br from-forest-50 to-water-50 shadow-2xl'
            : 'border-gray-300 hover:border-forest-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-forest-50/30'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-forest-600 to-water-600 animate-gradient" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-forest-500 to-water-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CloudUpload className="w-10 h-10 text-white" />
          </div>

          {isDragActive ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-2xl font-bold bg-gradient-to-r from-forest-600 to-water-600 bg-clip-text text-transparent mb-2">
                Drop your file here!
              </p>
              <p className="text-gray-600">Release to upload your FRA document</p>
            </motion.div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Drop Your FRA Document
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                Drag and drop or <span className="text-forest-600 font-semibold">click to browse</span>
              </p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-forest-100 text-forest-700 rounded-full text-sm font-medium">
                  PDF
                </span>
                <span className="px-3 py-1 bg-water-100 text-water-700 rounded-full text-sm font-medium">
                  JPG
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  PNG
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Maximum file size: 10MB</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {acceptedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 bg-gradient-to-br from-forest-50 to-emerald-50 border border-forest-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-forest-800">File Ready</p>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-forest-600" />
                  <p className="text-sm text-forest-700 font-medium">{acceptedFiles[0].name}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && uploadProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  uploadProgress < 90
                    ? 'bg-gradient-to-br from-water-500 to-water-600'
                    : 'bg-gradient-to-br from-forest-500 to-forest-600'
                }`}>
                  {uploadProgress < 90 ? (
                    <Upload className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <FileText className="w-5 h-5 text-white animate-pulse" />
                  )}
                </div>
                <h4 className="font-semibold text-gray-900">
                  {uploadProgress < 90 ? 'Uploading Document' : 'AI Processing'}
                </h4>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-forest-600 to-water-600 bg-clip-text text-transparent">
                {uploadProgress}%
              </span>
            </div>

            <div className="relative w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-50" />
              <motion.div
                className="relative bg-gradient-to-r from-forest-500 to-water-600 h-3 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <p className="text-sm text-gray-600 text-center">
              {uploadProgress < 90
                ? 'Securely uploading your FRA document...'
                : 'Extracting and analyzing document data with AI...'
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}