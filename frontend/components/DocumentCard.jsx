import { useState } from 'react'

export default function DocumentCard({ document, onUpdate, canEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(document)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate(document.id, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(document)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing_error':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? (
            <input
              type="text"
              name="claimant_name"
              value={editData.claimant_name}
              onChange={handleChange}
              className="w-full px-2 py-1 border rounded"
            />
          ) : (
            document.claimant_name || 'Unknown Claimant'
          )}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.claim_status)}`}>
          {document.claim_status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">District:</span>
          {isEditing ? (
            <input
              type="text"
              name="district"
              value={editData.district}
              onChange={handleChange}
              className="px-2 py-1 border rounded text-right"
            />
          ) : (
            <span className="font-medium">{document.district || 'N/A'}</span>
          )}
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">State:</span>
          {isEditing ? (
            <input
              type="text"
              name="state"
              value={editData.state}
              onChange={handleChange}
              className="px-2 py-1 border rounded text-right"
            />
          ) : (
            <span className="font-medium">{document.state || 'N/A'}</span>
          )}
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Village:</span>
          {isEditing ? (
            <input
              type="text"
              name="village"
              value={editData.village}
              onChange={handleChange}
              className="px-2 py-1 border rounded text-right"
            />
          ) : (
            <span className="font-medium">{document.village || 'N/A'}</span>
          )}
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Land Claimed:</span>
          {isEditing ? (
            <input
              type="text"
              name="land_claimed"
              value={editData.land_claimed}
              onChange={handleChange}
              className="px-2 py-1 border rounded text-right"
            />
          ) : (
            <span className="font-medium">{document.land_claimed || 'N/A'}</span>
          )}
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Submitted:</span>
          <span className="font-medium">
            {document.date_of_submission ? new Date(document.date_of_submission).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        {canEdit && !isEditing && (
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        )}

        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}

        {!isEditing && (
          <a
            href={`/document/${document.id}`}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            View Details →
          </a>
        )}
      </div>
    </div>
  )
}