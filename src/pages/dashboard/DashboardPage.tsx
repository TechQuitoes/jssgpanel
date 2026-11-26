import { useCallback } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Building2,
  Calendar,
  CalendarDays,
  CalendarPlus,
  FileText,
  Megaphone,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import { StatCard } from "@/components/StatCard"
import {
  getDashboardStats,
  getDashboardUpcomingEvents,
  getRecentDashboardActivities,
} from "@/services/api/dashboard"
import { useData } from "@/lib/useData"
import DashboardBanner from "@/components/DashboardBanner"
import { LotusIcon } from "@/components/LotusIcon"
import type { DashboardActivity } from "@/types"

// Fallback recent activities matching the 4 categories
const DEFAULT_ACTIVITIES: DashboardActivity[] = [
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

const ACTIVITY_CONFIG: Record<
  DashboardActivity["type"],
  {
    icon: typeof User
    iconBg: string
    iconColor: string
    link: string
  }
> = {
  member: {
    icon: User,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    link: "/admin/members",
  },
  event: {
    icon: Calendar,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    link: "/admin/events",
  },
  ad: {
    icon: Megaphone,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    link: "/admin/advertisements",
  },
  group: {
    icon: Building2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    link: "/admin/groups",
  },
}

export default function DashboardPage() {
  const stats = useData(useCallback(() => getDashboardStats(), []))
  const upcoming = useData(useCallback(() => getDashboardUpcomingEvents(), []))
  const activities = useData(useCallback(() => getRecentDashboardActivities(), []))

  // Only display strictly verified upcoming events, no past events and no mock fallbacks
  const displayEvents = upcoming.data || []

  const displayActivities =
    activities.data && activities.data.length > 0
      ? activities.data
      : activities.loading
        ? []
        : DEFAULT_ACTIVITIES

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <DashboardBanner />

      {/* Row of 4 Stat Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Members"
          value={
            stats.data?.totalMembers !== undefined
              ? stats.data.totalMembers.toLocaleString()
              : stats.loading
                ? "..."
                : "0"
          }
          trend="12%"
          trendLabel="vs. last month"
          iconBg="bg-amber-100/80"
          iconColor="text-amber-800"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={
            stats.data?.upcomingEvents !== undefined
              ? String(stats.data.upcomingEvents)
              : upcoming.data
                ? String(upcoming.data.length)
                : stats.loading
                  ? "..."
                  : "0"
          }
          trend={stats.data?.upcomingEvents ? "33%" : undefined}
          trendLabel="vs. last month"
          iconBg="bg-purple-100/80"
          iconColor="text-purple-700"
        />
        <StatCard
          icon={Megaphone}
          label="Total Advertisements"
          value={
            stats.data?.totalAdvertisements !== undefined
              ? String(stats.data.totalAdvertisements)
              : stats.loading
                ? "..."
                : "0"
          }
          trend="20%"
          trendLabel="vs. last month"
          iconBg="bg-emerald-100/80"
          iconColor="text-emerald-700"
        />
        <StatCard
          icon={Building2}
          label="Total Groups"
          value={
            stats.data?.totalGroups !== undefined
              ? String(stats.data.totalGroups)
              : stats.data?.activeGroups !== undefined
                ? String(stats.data.activeGroups)
                : stats.loading
                  ? "..."
                  : "0"
          }
          trend="8%"
          trendLabel="vs. last month"
          iconBg="bg-blue-100/80"
          iconColor="text-blue-700"
        />
      </section>

      {/* Main Grid: Left Column (Upcoming Events) + Right Column (Activities & Quick Links) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Upcoming Events Table (approx 7 of 12 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[#E8DFD1] bg-white p-5 sm:p-6 shadow-[0_2px_10px_rgba(43,30,22,0.03)] h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                <h2 className="font-serif-display text-base font-bold tracking-tight text-[#2B1E16]">
                  Upcoming Events
                </h2>
                <Link
                  to="/admin/events"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6D46] hover:text-[#3D2B1F] hover:underline"
                >
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F2ECE3] text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider">
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Event Name</th>
                      <th className="py-3 px-2">Venue</th>
                      <th className="py-3 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F6F1EA]">
                    {upcoming.loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-3.5 px-2">
                            <div className="h-3 w-16 bg-slate-200 rounded" />
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="h-3 w-36 bg-slate-200 rounded" />
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="h-4 w-14 bg-slate-200 rounded-full ml-auto" />
                          </td>
                        </tr>
                      ))
                    ) : displayEvents.length > 0 ? (
                      displayEvents.map((evt) => (
                        <tr key={evt.id} className="transition-colors hover:bg-[#FAF8F5]">
                          <td className="py-3.5 px-2 text-[#7C6C5E] whitespace-nowrap">
                            {evt.date}
                          </td>
                          <td className="py-3.5 px-2 font-medium text-[#2B1E16] whitespace-nowrap">
                            {evt.title}
                          </td>
                          <td className="py-3.5 px-2 text-[#7C6C5E] whitespace-nowrap">
                            {evt.venue}
                          </td>
                          <td className="py-3.5 px-2 text-right whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-[11px] font-semibold text-[#2E7D32]">
                              {evt.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-xs text-[#8C7A6B]">
                          No upcoming events scheduled
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities + Quick Links (approx 5 of 12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Activities Card */}
          <div className="rounded-2xl border border-[#E8DFD1] bg-white p-5 sm:p-6 shadow-[0_2px_10px_rgba(43,30,22,0.03)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <h2 className="font-serif-display text-base font-bold tracking-tight text-[#2B1E16]">
                Recent Activities
              </h2>
              <Link
                to="/admin/members"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6D46] hover:text-[#3D2B1F] hover:underline"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#F6F1EA] pt-1">
              {activities.loading && displayActivities.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 gap-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-28 bg-slate-200 rounded" />
                        <div className="h-2.5 w-20 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="h-2.5 w-14 bg-slate-100 rounded" />
                  </div>
                ))
              ) : displayActivities.length > 0 ? (
                displayActivities.map((act) => {
                  const config = ACTIVITY_CONFIG[act.type] || ACTIVITY_CONFIG.member
                  const Icon = config.icon
                  return (
                    <Link
                      key={act.id}
                      to={config.link}
                      className="flex items-center justify-between py-3 gap-3 transition-colors hover:bg-[#FAF8F5] -mx-2 px-2 rounded-lg block"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.iconBg} ${config.iconColor}`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 leading-tight">
                          <p className="truncate text-xs font-semibold text-[#2B1E16]">
                            {act.title}
                          </p>
                          <p className="truncate text-[11px] text-[#7C6C5E]">{act.detail}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] text-[#A09385] whitespace-nowrap">
                        {act.time}
                      </span>
                    </Link>
                  )
                })
              ) : (
                <p className="py-4 text-center text-xs text-[#8C7A6B]">
                  No recent activities
                </p>
              )}
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="rounded-2xl border border-[#E8DFD1] bg-white p-5 sm:p-6 shadow-[0_2px_10px_rgba(43,30,22,0.03)]">
            <div className="pb-3 border-b border-[#F0EAE1]">
              <h2 className="font-serif-display text-base font-bold tracking-tight text-[#2B1E16]">
                Quick Links
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                to="/admin/members"
                className="flex items-center gap-2.5 rounded-xl border border-[#E8DFD1] bg-[#FAF8F5] p-3 text-xs font-medium text-[#2B1E16] transition-all hover:bg-[#F2ECE0] hover:border-[#D0C2AE] shadow-2xs"
              >
                <UserPlus className="size-4 text-[#8C6D46]" />
                <span className="truncate">Add Member</span>
              </Link>

              <Link
                to="/admin/events"
                className="flex items-center gap-2.5 rounded-xl border border-[#E8DFD1] bg-[#FAF8F5] p-3 text-xs font-medium text-[#2B1E16] transition-all hover:bg-[#F2ECE0] hover:border-[#D0C2AE] shadow-2xs"
              >
                <CalendarPlus className="size-4 text-[#8C6D46]" />
                <span className="truncate">Create Event</span>
              </Link>

              <Link
                to="/admin/advertisements"
                className="flex items-center gap-2.5 rounded-xl border border-[#E8DFD1] bg-[#FAF8F5] p-3 text-xs font-medium text-[#2B1E16] transition-all hover:bg-[#F2ECE0] hover:border-[#D0C2AE] shadow-2xs"
              >
                <Megaphone className="size-4 text-[#8C6D46]" />
                <span className="truncate">Post Advertisement</span>
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center gap-2.5 rounded-xl border border-[#E8DFD1] bg-[#FAF8F5] p-3 text-xs font-medium text-[#2B1E16] transition-all hover:bg-[#F2ECE0] hover:border-[#D0C2AE] shadow-2xs"
              >
                <FileText className="size-4 text-[#8C6D46]" />
                <span className="truncate">View Reports</span>
              </Link>
            </div>

            {/* Bottom Footer inside Quick Links */}
            <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-[#A08B77] select-none">
              <LotusIcon className="size-3.5 text-[#C5A059]" />
              <span className="font-serif-display text-[11px] tracking-wide">Jai Jinendra</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
