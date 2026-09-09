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

// The lesson route on the web: it still resolves - the learn/ layout above
// it has already fetched the course and 404s only when the course itself is
// missing - but since 1.12.0 it renders the download prompt instead of a
// player. Ray, 2026-09-09: "supacharge web doesnt play lessons or whatch
// libray" - "for attending lessons it should ask you to download app on
// phone or download desktop app". The player it used to render is kept
// whole in ./_components/lesson-playback.tsx, flagged as not used on the
// web, and nothing imports it.
//
// Nothing is fetched here: the prompt reads the same for every lesson, and
// the lesson fetch (fetchLesson, with its enrolment guardrail) belongs to
// the player that is not on this surface. The route stays under /handson,
// which auth_sdk's middleware gates, so an anonymous visitor never reaches
// it.

import { LmsDownloadAppPrompt } from "@/components/custom/lms-download-app";

interface LessonPageProps {
  // Next 15+: route params are a Promise; await them before reading.
  params: Promise<{ courseName: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseName } = await params;

  return (
    <div className="p-6 md:p-10">
      <LmsDownloadAppPrompt
        backHref={`/handson/all/lms/courses/${courseName}`}
      />
    </div>
  );
}
