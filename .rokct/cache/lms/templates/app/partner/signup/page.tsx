/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// /partner/signup (1.37.0) - where the landing's "Become a partner" button
// on the "Become a Sponsor or Partner" card lands. A public page: the
// visitor has no account yet. The form creates a partner account through
// api.lms.partner_signup (app/actions/handson/all/lms/partner/actions.ts).
// The site's own page, never a chat app or a phone number.

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerSignupForm } from "./partner-signup-form";

export const metadata: Metadata = {
  title: "Become a Sponsor or Partner",
  description:
    "Fund a learner, sponsor a school programme, or partner with us to expand reach.",
};

export default function PartnerSignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        Back to the home page
      </Link>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">
            Become a Sponsor or Partner
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fund a learner, sponsor a school programme, or partner with us to
            expand reach. Every contribution opens a seat for a child who needs
            it.
          </p>
        </CardHeader>
        <CardContent>
          <PartnerSignupForm />
        </CardContent>
      </Card>
    </main>
  );
}
