import { apiRequest } from "@/lib/apiClient"
import type {
  ApiEnvelope,
  CollectionPoint,
  CommunityEvent,
  DashboardActivity,
  DashboardEventItem,
  DashboardStats,
  GroupCollection,
  Member,
  MemberGrowthPoint,
  Registration,
  RegistrationTrendPoint,
} from "@/types"
import { db, delay } from "@/services/mock/db"
import { listEvents, getEventCounts } from "@/services/api/events"
import { getAdvertisementCounts, getAdvertisements } from "@/services/api/ads"
import { getMembers } from "@/services/api/members"
import { listGroups } from "@/services/api/groups"
import { formatDate, formatRelativeTime } from "@/lib/format"

interface BackendDashboardStats {
  total_members?: number
  total_groups?: number
  total_post_holders?: number
  total_cities?: number
  total_guests?: number
}

/**
 * Helper to check if an event is strictly upcoming (today or in the future).
 */
export function isEventUpcoming(event: {
  time_frame?: string | null
  starts_at?: string | null
  event_date?: string | null
}): boolean {
  // If explicitly flagged as PAST, it is not upcoming
  if (event.time_frame === "PAST") {
    return false
  }

  // If flagged as UPCOMING or FUTURE, it is upcoming
  if (event.time_frame === "UPCOMING" || event.time_frame === "FUTURE") {
    return true
  }

  // Check starts_at timestamp
  if (event.starts_at) {
    const time = new Date(event.starts_at).getTime()
    if (!Number.isNaN(time)) {
      return time >= Date.now()
    }
  }

  // Check event_date
  if (event.event_date) {
    const parts = event.event_date.split("/")
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number)
      const eventDate = new Date(y, m - 1, d, 23, 59, 59)
      return eventDate.getTime() >= Date.now()
    }
    const parsed = new Date(event.event_date)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime() >= Date.now()
    }
  }

  return false
}

/**
 * Fetch dynamic dashboard summary numbers from real backend endpoints
 * with graceful fallback to mock data if offline or unavailable.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [statsResult, eventCountsResult, adCountsResult] = await Promise.allSettled([
      apiRequest<ApiEnvelope<BackendDashboardStats>>("/dashboard/statistics", { auth: true }),
      getEventCounts(),
      getAdvertisementCounts(),
    ])

    let statsData: BackendDashboardStats | null = null
    if (statsResult.status === "fulfilled") {
      const payload = statsResult.value
      statsData =
        payload && typeof payload === "object" && "data" in payload
          ? (payload as ApiEnvelope<BackendDashboardStats>).data
          : (payload as unknown as BackendDashboardStats)
    }

    const eventCounts = eventCountsResult.status === "fulfilled" ? eventCountsResult.value : null
    const adCounts = adCountsResult.status === "fulfilled" ? adCountsResult.value : null

    const totalMembers = statsData?.total_members ?? db.members.length
    const totalGroups = statsData?.total_groups ?? db.groups.length
    const totalAdvertisements = adCounts?.total ?? db.ads.length

    // Strictly count upcoming and future events only (do not include past events)
    const upcomingEvents =
      eventCounts?.upcoming !== undefined && eventCounts?.future !== undefined
        ? eventCounts.upcoming + eventCounts.future
        : (eventCounts?.upcoming ?? 0)

    return {
      totalMembers,
      totalGroups,
      totalAdvertisements,
      upcomingEvents,
      activeGroups: totalGroups,
      pendingRegistrations: db.registrations.filter((r) => r.status === "pending").length,
      totalLocations: statsData?.total_cities ?? db.cities.length,
      collectedThisYear: db.transactions
        .filter((t) => t.status === "success")
        .reduce((sum, t) => sum + t.amount, 0),
      outstandingFees: 0,
      activeAds: adCounts?.active ?? db.ads.filter((a) => a.status === "active").length,
      newMembersThisMonth: 0,
      totalPostHolders: statsData?.total_post_holders ?? 0,
      totalCities: statsData?.total_cities ?? 0,
      totalGuests: statsData?.total_guests ?? 0,
    }
  } catch (err) {
    console.warn("Failed to load dashboard statistics from backend, falling back:", err)
    return {
      totalMembers: db.members.length,
      totalGroups: db.groups.length,
      totalAdvertisements: db.ads.length,
      upcomingEvents: 0,
      activeGroups: db.groups.length,
      pendingRegistrations: 5,
      totalLocations: db.cities.length,
      collectedThisYear: 0,
      outstandingFees: 0,
      activeAds: db.ads.length,
      newMembersThisMonth: 0,
    }
  }
}

/**
 * Fetch dynamic upcoming events strictly (only UPCOMING & FUTURE, no PAST events).
 */
export async function getDashboardUpcomingEvents(): Promise<DashboardEventItem[]> {
  try {
    // 1. Query both UPCOMING (next 7 days) and FUTURE (beyond 7 days)
    const [upcomingRes, futureRes] = await Promise.allSettled([
      listEvents({ timeFrame: "UPCOMING", pageSize: 10, order: "asc" }),
      listEvents({ timeFrame: "FUTURE", pageSize: 10, order: "asc" }),
    ])

    const upcomingList = upcomingRes.status === "fulfilled" ? upcomingRes.value.events : []
    const futureList = futureRes.status === "fulfilled" ? futureRes.value.events : []

    // 2. Deduplicate and filter out any event that is not upcoming
    const seenIds = new Set<string>()
    const mergedEvents = [...upcomingList, ...futureList].filter((e) => {
      if (!e?.id || seenIds.has(e.id)) return false
      seenIds.add(e.id)
      return isEventUpcoming(e)
    })

    // 3. Sort chronologically ascending (soonest event first)
    mergedEvents.sort((a, b) => {
      const timeA = a.starts_at ? new Date(a.starts_at).getTime() : 0
      const timeB = b.starts_at ? new Date(b.starts_at).getTime() : 0
      return timeA - timeB
    })

    return mergedEvents.slice(0, 4).map((evt, idx) => {
      let dateDisplay = "—"
      if (evt.event_date) {
        dateDisplay = evt.event_date
      } else if (evt.starts_at) {
        dateDisplay = formatDate(evt.starts_at)
      }

      return {
        id: evt.id || `evt-${idx}`,
        date: dateDisplay,
        title: evt.title || "Community Event",
        venue: evt.venue_name || evt.venue_address || "Community Hall",
        status: "Upcoming",
      }
    })
  } catch (err) {
    console.warn("Failed to load upcoming events from backend:", err)
    return []
  }
}

/**
 * Fetch dynamic recent activities across the 4 modules:
 * 1. New member registered
 * 2. Event created
 * 3. Advertisement published
 * 4. New group added
 */
export async function getRecentDashboardActivities(): Promise<DashboardActivity[]> {
  try {
    const [membersRes, eventsRes, adsRes, groupsRes] = await Promise.allSettled([
      getMembers({ pageSize: 1 }),
      listEvents({ pageSize: 1, order: "desc" }),
      getAdvertisements({ page: 1, page_size: 1 }),
      listGroups({ pageSize: 10 }),
    ])

    const activities: DashboardActivity[] = []

    // 1. New Member Registered
    if (membersRes.status === "fulfilled" && membersRes.value?.members?.length > 0) {
      const member = membersRes.value.members[0]
      const memberName =
        member.full_name ||
        [member.first_name, member.last_name].filter(Boolean).join(" ") ||
        "New Member"
      activities.push({
        id: `act-member-${member.id}`,
        title: "New member registered",
        detail: memberName,
        time: formatRelativeTime(member.joined_at || member.approved_at || null),
        type: "member",
      })
    } else {
      activities.push({
        id: "act-member-fallback",
        title: "New member registered",
        detail: "Rahul Shah",
        time: "2 hours ago",
        type: "member",
      })
    }

    // 2. Event Created
    if (eventsRes.status === "fulfilled" && eventsRes.value?.events?.length > 0) {
      const event = eventsRes.value.events[0]
      activities.push({
        id: `act-event-${event.id}`,
        title: "Event created",
        detail: event.title || "Community Event",
        time: formatRelativeTime(event.created_at || event.starts_at),
        type: "event",
      })
    } else {
      activities.push({
        id: "act-event-fallback",
        title: "Event created",
        detail: "Samayik Satsang",
        time: "4 hours ago",
        type: "event",
      })
    }

    // 3. Advertisement Published
    if (adsRes.status === "fulfilled" && adsRes.value?.items?.length > 0) {
      const ad = adsRes.value.items[0]
      activities.push({
        id: `act-ad-${ad.id}`,
        title: "Advertisement published",
        detail: ad.title || ad.person_name || "Paryushan Mahaparva Details",
        time: formatRelativeTime(ad.created_at || ad.start_date),
        type: "ad",
      })
    } else {
      activities.push({
        id: "act-ad-fallback",
        title: "Advertisement published",
        detail: "Paryushan Mahaparva Details",
        time: "6 hours ago",
        type: "ad",
      })
    }

    // 4. New Group Added
    if (groupsRes.status === "fulfilled" && groupsRes.value?.groups?.length > 0) {
      const groups = [...groupsRes.value.groups]
      groups.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      const group = groups[0]
      const groupDetail = group.city ? `${group.name} (${group.city})` : group.name
      activities.push({
        id: `act-group-${group.id}`,
        title: "New group added",
        detail: groupDetail,
        time: formatRelativeTime(group.created_at),
        type: "group",
      })
    } else {
      activities.push({
        id: "act-group-fallback",
        title: "New group added",
        detail: "JSSG Surat Youth",
        time: "8 hours ago",
        type: "group",
      })
    }

    return activities
  } catch (err) {
    console.warn("Failed to fetch dashboard activities from backend:", err)
    return [
      {
        id: "act-1",
        title: "New member registered",
        detail: "Rahul Shah",
        time: "2 hours ago",
        type: "member",
      },
      {
        id: "act-2",
        title: "Event created",
        detail: "Samayik Satsang",
        time: "4 hours ago",
        type: "event",
      },
      {
        id: "act-3",
        title: "Advertisement published",
        detail: "Paryushan Mahaparva Details",
        time: "6 hours ago",
        type: "ad",
      },
      {
        id: "act-4",
        title: "New group added",
        detail: "JSSG Surat Youth",
        time: "8 hours ago",
        type: "group",
      },
    ]
  }
}

// Legacy / Mock helper methods kept for backward compatibility
export async function getMemberGrowth(): Promise<MemberGrowthPoint[]> {
  const months = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]
  return delay(
    months.map((m) => ({
      month: new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short" }),
      members: db.members.filter((mem) => mem.joinedOn.slice(0, 7) <= m).length,
    }))
  )
}

export async function getCollections(): Promise<CollectionPoint[]> {
  const months = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]
  const expectedPerMonth = db.feeConfigs.reduce((sum, f) => sum + f.totalMembers * f.amount, 0) / 9
  return delay(
    months.map((m) => ({
      month: new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short" }),
      collected: db.transactions
        .filter((t) => t.paidOn.startsWith(m) && t.status === "success")
        .reduce((sum, t) => sum + t.amount, 0),
      target: Math.round(expectedPerMonth * (months.indexOf(m) + 1)),
    }))
  )
}

export async function getGroupCollections(): Promise<GroupCollection[]> {
  const rows = db.groups.map((g) => {
    const fee = db.feeConfigs.find((f) => f.groupId === g.id)
    const amount = fee?.amount ?? 15000
    const collected = db.transactions
      .filter((t) => t.groupId === g.id && t.status === "success")
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      groupId: g.id,
      name: g.name.length > 22 ? `${g.name.slice(0, 20)}…` : g.name,
      collected,
      outstanding: Math.max(0, g.memberCount * amount - collected),
    }
  })
  return delay(rows)
}

export async function getRegistrationTrend(): Promise<RegistrationTrendPoint[]> {
  const months = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"]
  return delay(
    months.map((m) => {
      const applied = db.registrations.filter((r) => r.appliedOn.startsWith(m)).length + 4
      return {
        month: new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short" }),
        applied,
        approved: Math.round(applied * 0.7),
        rejected: applied - Math.round(applied * 0.7),
      }
    })
  )
}

export async function getUpcomingEvents(): Promise<CommunityEvent[]> {
  return delay(
    db.events
      .filter((e) => e.status === "upcoming" || e.status === "ongoing")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  )
}

export async function getRecentRegistrations(): Promise<Registration[]> {
  return delay(
    [...db.registrations]
      .filter((r) => r.status === "pending")
      .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
      .slice(0, 5)
  )
}

export async function getRecentMembers(): Promise<Member[]> {
  return delay([...db.members].sort((a, b) => b.joinedOn.localeCompare(a.joinedOn)).slice(0, 5))
}
