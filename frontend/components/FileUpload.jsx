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
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 transform hover:scale-105
          ${isDragActive 
            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {isDragActive ? (
          <div>
            <p className="text-xl font-semibold text-blue-600 mb-2">Drop your file here!</p>
            <p className="text-gray-600">Release to upload your document</p>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Document</h3>
            <p className="text-lg text-gray-600 mb-4">
              Drag and drop your document here, or click to browse
            </p>
            <p className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full inline-block">
              Supports PDF, JPG, JPEG, PNG up to 10MB
            </p>
          </div>
        )}
      </div>

      {acceptedFiles.length > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">File Selected</p>
              <p className="text-sm text-green-600">{acceptedFiles[0].name}</p>
            </div>
          </div>
        </div>
      )}

      {loading && uploadProgress > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {uploadProgress < 90 ? 'Uploading Document...' : 'Processing with AI...'}
            </h4>
            <span className="text-lg font-bold text-blue-600">{uploadProgress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            {uploadProgress < 90 
              ? 'Uploading your document to our secure servers...' 
              : 'Our AI is analyzing and extracting data from your document...'
            }
          </p>
        </div>
      )}
    </div>
  )
}