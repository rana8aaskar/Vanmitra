import axios from 'axios'

class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Set auth token
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  // Auth endpoints
  async register(name, email, password) {
    const response = await this.client.post('/users/register', {
      name,
      email,
      password
    })
    return response.data
  }

  async login(email, password) {
    const response = await this.client.post('/users/login', {
      email,
      password
    })
    return response.data
  }

  async getMe() {
    const response = await this.client.get('/users/me')
    return response.data
  }

  // FRA document endpoints
  async uploadDoc(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async fetchDocs(filters = {}) {
    const params = new URLSearchParams()

    if (filters.state) params.append('state', filters.state)
    if (filters.district) params.append('district', filters.district)
    if (filters.claim_status) params.append('claim_status', filters.claim_status)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.offset) params.append('offset', filters.offset)

    const response = await this.client.get(`/fra-docs?${params.toString()}`)
    return response.data
  }

  async getDocumentById(id) {
    const response = await this.client.get(`/fra-docs/${id}`)
    return response.data
  }

  async updateDocument(id, data) {
    const response = await this.client.put(`/fra-docs/${id}`, data)
    return response.data
  }

  async deleteDocument(id) {
    const response = await this.client.delete(`/fra-docs/${id}`)
    return response.data
  }

  async reprocessDocument(id) {
    const response = await this.client.post(`/fra-docs/${id}/reprocess`)
    return response.data
  }

  async getStatistics() {
    const response = await this.client.get('/fra-docs/statistics')
    return response.data
  }

  // Claim endpoints
  async getClaimDetails(params) {
    const response = await this.client.get('/claims/claim-details', { params })
    return response.data
  }

  async getAllClaims(filters = {}) {
    const response = await this.client.get('/claims/all-claims', { params: filters })
    return response.data
  }

  async getClaimStatistics() {
    const response = await this.client.get('/claims/statistics')
    return response.data
  }
}

const api = new ApiService()
export default api