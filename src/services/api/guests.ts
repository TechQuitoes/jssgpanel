import { apiRequest, unwrapItem, unwrapList } from "@/lib/apiClient"
import type { ApiEnvelope, GuestApprovePayload, GuestListResult, GuestRecord } from "@/types"

const BASE = "/guests"

export interface GuestListParams {
  status?: string
  query?: string
  page?: number
  pageSize?: number
}

/**
 * Fetch registered guests from the backend API.
 * Super Admin only.
 */
export async function getGuests(params: GuestListParams = {}): Promise<GuestListResult> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
  const search = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (params.status) {
    search.set("status", params.status.trim())
  }
  if (params.query?.trim()) {
    search.set("query", params.query.trim())
  }

  const payload = await apiRequest<ApiEnvelope<GuestRecord[]>>(`${BASE}?${search.toString()}`, {
    auth: true,
  })

  const guests = unwrapList<GuestRecord>(payload)
  const pagination = payload?.pagination

  return {
    guests,
    total: pagination?.total ?? guests.length,
    page: pagination?.page ?? page,
    pageSize: pagination?.page_size ?? pageSize,
    totalPages: pagination?.total_pages ?? 1,
  }
}

/**
 * Approve or reject a pending guest registration.
 * Super Admin only.
 */
export async function approveGuest(
  guestId: string,
  payload: GuestApprovePayload = { status: "APPROVED" }
): Promise<GuestRecord> {
  const res = await apiRequest<ApiEnvelope<GuestRecord>>(`${BASE}/${guestId}/approve`, {
    method: "POST",
    auth: true,
    body: {
      status: payload.status || "APPROVED",
      rejection_reason: payload.rejection_reason ?? null,
    },
  })
  return unwrapItem<GuestRecord>(res)
}

/**
 * Delete a guest account.
 * Super Admin only.
 */
export async function deleteGuest(guestId: string): Promise<void> {
  await apiRequest<ApiEnvelope<unknown>>(`${BASE}/${guestId}`, {
    method: "DELETE",
    auth: true,
  })
}
