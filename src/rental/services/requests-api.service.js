import http from '@/shared/services/http-common'
import Request from '@/rental/domain/entity/request.entity'
export default class RequestsService {
  getAllByUserId (id) {
    return http.get(`/users/${id}/requests`)
      .then((response) => {
        const data = response.data
        if (!data.success) { throw new Error(data.message) }
        console.log(data.resource)
        return data.resource.map(request => new Request(request))
      })
  }

  getByOfferIdAndUserId (offerId, userId) {
    return http.get(`/requests/student/${userId}/rentals/offers/${offerId}`)
      .then((response) => {
        const data = response.data
        if (!data.success) { throw new Error(data.message) }
        return new Request(data.resource)
      })
  }

  getAllByOfferId (id) {
    return http.get(`/rentaloffers/${id}/requests`)
      .then((response) => {
        const data = response.data
        if (!data.success) { throw new Error(data.message) }
        return data.resource.map(request => new Request(request))
      })
  }

  create (data) {
    return http.post('/requests', JSON.stringify(data))
      .then((response) => {
        const data = response.data
        if (!data.success) { throw new Error(data.message) }
        return new Request(data.resource)
      })
  }

  accept (id) {
    return http.put(`/requests/${id}/accept`)
      .then((response) => {
        const data = response.data
        if (!data.success) { throw new Error(data.message) }
        return new Request(data.resource)
      })
  }

  decline (id) {
    return http.put(`/requests/${id}/decline`)
      .then((response) => {
        const data = response.data
        if (!data.success) { throw new Error(data.message) }
        return new Request(data.resource)
      })
  }
}
