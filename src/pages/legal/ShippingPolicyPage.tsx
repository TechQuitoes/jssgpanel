import { PackageCheck, Clock, CheckCircle2, ShieldCheck, Calendar } from "lucide-react"
import { COMPANY_CONFIG } from "@/config/company"

export default function ShippingPolicyPage() {
  return (
    <article className="bg-white rounded-2xl border border-[#e8e0ce] shadow-xs overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-[#123f24] to-[#1c5532] text-white p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-[#f1e6cb] mb-4">
          <PackageCheck className="size-3.5 text-[#c5a84e]" />
          <span>Fulfillment &amp; Service Delivery Guidelines</span>
        </div>
        <h1 className="font-serif-display text-2xl sm:text-4xl font-bold tracking-tight text-[#fbf8f0]">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#d4cbb8] max-w-2xl leading-relaxed">
          Information regarding the fulfillment, electronic delivery, and access timelines for services provided by {COMPANY_CONFIG.name}.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#c9bd9a]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            Last Updated: {COMPANY_CONFIG.lastUpdated}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-emerald-400" />
            Electronic Delivery: Instant (1–5 Minutes)
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-10 space-y-8 text-sm text-foreground/85 leading-relaxed">
        {/* Highlight Card for Razorpay Reviewer */}
        <div className="rounded-xl border border-emerald-600/20 bg-emerald-50/70 p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-950 text-base">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            Delivery Summary at a Glance
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-emerald-900">
            <div className="rounded-lg bg-white/80 p-3 border border-emerald-200">
              <p className="font-semibold text-emerald-950">Fulfillment Mode</p>
              <p className="mt-1">Instant electronic delivery via Email &amp; Web Portal.</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 border border-emerald-200">
              <p className="font-semibold text-emerald-950">Shipping Charges</p>
              <p className="mt-1">₹0.00 (Zero shipping fees — No physical courier).</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 border border-emerald-200">
              <p className="font-semibold text-emerald-950">Delivery Timeline</p>
              <p className="mt-1">Immediately upon payment confirmation (1–5 mins).</p>
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#123f24] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#123f24]/10 text-xs font-bold text-[#123f24]">1</span>
            Nature of Services &amp; Digital Fulfillment
          </h2>
          <p>
            <strong>{COMPANY_CONFIG.name}</strong> operates as an apex community organization providing digital administrative software, annual member affiliations, convention and event registrations, and community news/advertisement postings.
          </p>
          <p>
            We do not manufacture, sell, package, or transport physical goods or physical merchandise. Therefore, physical shipping, postal transit times, and physical courier deliveries are not applicable to the transactions executed on this portal.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#123f24] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#123f24]/10 text-xs font-bold text-[#123f24]">2</span>
            Fulfillment Timeline by Service Category
          </h2>
          <p>All services and entitlements are fulfilled digitally according to the following schedules:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Membership Affiliations &amp; Annual Dues:</strong> Once payment is confirmed by the Razorpay payment gateway, your membership status or group affiliation is immediately marked active in the database. A digital receipt and acknowledgement letter are sent to your registered email address within <strong>1 to 5 minutes</strong>.
            </li>
            <li>
              <strong>Event &amp; Convention Registrations:</strong> Upon successful checkout, your registration pass and entry confirmation with booking reference are generated immediately and sent to your email and made available under your account.
            </li>
            <li>
              <strong>Advertisement Bookings:</strong> After transaction completion, your advertisement listing is queued for administrative content review and scheduled for publication within <strong>24 to 48 business hours</strong> in accordance with community guidelines.
            </li>
            <li>
              <strong>Transaction Invoices &amp; Receipts:</strong> Official GST-compliant tax/contribution receipts are issued electronically and remain permanently downloadable from the portal.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#123f24] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#123f24]/10 text-xs font-bold text-[#123f24]">3</span>
            Shipping &amp; Delivery Charges
          </h2>
          <div className="rounded-xl border border-[#e3d8be] bg-[#fbf9f4] p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#123f24]">
              <ShieldCheck className="size-4 text-[#123f24]" />
              Zero Hidden Shipping Charges
            </div>
            <p className="text-muted-foreground">
              Because all services and digital documentation are dispatched electronically via the internet and our secure cloud servers, customers are not charged any shipping, freight, packaging, or handling fees. The amount displayed at the checkout page is all-inclusive.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#123f24] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#123f24]/10 text-xs font-bold text-[#123f24]">4</span>
            Resolving Delivery Delays or Issues
          </h2>
          <p>
            If your payment has been successfully debited from your bank account or card via Razorpay, but you have not received your digital confirmation receipt or access within <strong>30 minutes</strong>, please follow these steps:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs">
            <li>Verify your email Spam / Junk folder for communications from our automated system.</li>
            <li>Log into the portal to check if your transaction status is updated under payment history.</li>
            <li>
              If the transaction is not visible, contact our technical support desk with your Razorpay Payment ID at{" "}
              <a href={`mailto:${COMPANY_CONFIG.email}`} className="text-[#123f24] font-semibold underline">
                {COMPANY_CONFIG.email}
              </a>
              .
            </li>
          </ol>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-[#ede5d4]">
          <h2 className="text-base sm:text-lg font-bold text-[#123f24] flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#123f24]/10 text-xs font-bold text-[#123f24]">5</span>
            Contact Support &amp; Delivery Helpdesk
          </h2>
          <div className="rounded-xl border border-[#e3d8be] bg-[#fbf9f4] p-4 text-xs space-y-1.5">
            <p className="font-semibold text-[#123f24]">Fulfillment Desk — {COMPANY_CONFIG.name}</p>
            <p className="text-muted-foreground">{COMPANY_CONFIG.address.full}</p>
            <p className="text-muted-foreground">
              Email:{" "}
              <a href={`mailto:${COMPANY_CONFIG.email}`} className="text-[#123f24] font-medium underline">
                {COMPANY_CONFIG.email}
              </a>{" "}
              | Helpline:{" "}
              <a href={`tel:${COMPANY_CONFIG.phoneRaw}`} className="text-[#123f24] font-medium">
                {COMPANY_CONFIG.phone}
              </a>
            </p>
            <p className="text-muted-foreground">Operating Hours: {COMPANY_CONFIG.operatingHours}</p>
          </div>
        </section>
      </div>
    </article>
  )
}
