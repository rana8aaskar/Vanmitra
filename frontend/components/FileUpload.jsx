import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

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
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isDragActive ? (
          <p className="mt-2 text-sm text-gray-600">Drop the file here...</p>
        ) : (
          <div>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your FRA claim form here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF, JPG, JPEG, PNG up to 10MB
            </p>
          </div>
        )}
      </div>

      {acceptedFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Selected file: <span className="font-medium">{acceptedFiles[0].name}</span>
          </p>
        </div>
      )}

      {loading && uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="ml-3 text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {uploadProgress < 90 ? 'Uploading...' : 'Processing with AI model...'}
          </p>
        </div>
      )}
    </div>
  )
}