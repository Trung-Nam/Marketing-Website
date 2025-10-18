import api from "../utils/axiosInstance";
import type {
  EventDetail,
  EventListResponse,
  EventListParams,
  CreateEventRequest,
  UpdateEventRequest,
} from "../types/event";

export const eventService = {
  async getEvents(params: EventListParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params.placeId)
      queryParams.append("placeId", params.placeId.toString());
    if (params.isPublished !== undefined)
      queryParams.append("isPublished", params.isPublished.toString());

    const response = await api.get<EventListResponse>(
      `/events/list?${queryParams.toString()}`
    );
    return response.data;
  },

  async getEventById(id: number): Promise<EventDetail> {
    const response = await api.get<{ data: EventDetail }>(`/events/get/${id}`);
    return response.data.data;
  },

  async createEvent(eventData: CreateEventRequest) {
    const response = await api.post("/events/create", eventData);
    return response.data;
  },

  async updateEvent(id: number, eventData: UpdateEventRequest) {
    const response = await api.put(`/events/update/${id}`, eventData);
    return response.data;
  },

  async deleteEvent(id: number) {
    const response = await api.delete(`/events/delete/${id}`);
    return response.data;
  },
};
