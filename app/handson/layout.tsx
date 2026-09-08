/**
 * Host-owned hands-on shell: the sidebar frame around every `/handson/*`
 * page an SDK installs (lms_sdk's `/handson/all/lms/*` today). lms_sdk's
 * manifest names `app/handson/sidebar-client.tsx` as its nav integration
 * target, and this layout is what renders that sidebar.
 *
 * NEUTRAL BY DESIGN. RokctAI/rokctai_frontend's copy is a ~380-line
 * role-gated menu (HR, finance, hosting, telephony...) with company
 * branding and an AI status pill. None of that has a consumer here, so this
 * copy keeps only the frame: a desktop sidebar, a mobile sheet, and the
 * entries SDKs inject at the sidebar's `@rokct-sdk-nav-start` marker.
 * Access is gated by auth_sdk's middleware (`/handson/:path*` needs a
 * session), not here.
 */
import Link from "next/link";
import { Menu } from "lucide-react";

import { PLATFORM_NAME } from "@/app/config/platform";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HandsOnSidebarClient } from "./sidebar-client";

export default function HandsOnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const title = `${PLATFORM_NAME} Hands-on`;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/handson" className="font-semibold">
            {title}
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <HandsOnSidebarClient items={[]} />
          </nav>
        </div>
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex w-full flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <HandsOnSidebarClient items={[]} mobile />
              </nav>
            </SheetContent>
          </Sheet>
          <span className="flex-1 font-semibold">{title}</span>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:p-8">{children}</main>
      </div>
    </div>
  );
}
