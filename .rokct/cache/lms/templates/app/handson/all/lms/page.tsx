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

import {
  fetchUserInfo,
  fetchStreakInfo,
} from "@/app/actions/handson/all/lms/user/actions";
import { fetchMyCourses } from "@/app/actions/handson/all/lms/courses/actions";
import { fetchMyBatches } from "@/app/actions/handson/all/lms/batches/actions";
import {
  fetchMyLiveClasses,
  fetchUpcomingEvaluations,
} from "@/app/actions/handson/all/lms/events/actions";
import { DashboardHeader } from "./dashboard/header";
import { MyCourses } from "./dashboard/my-courses";
import { UpcomingEvents } from "./dashboard/upcoming-events";

export default async function LmsDashboardPage() {
  const [user, courses, batches, liveClasses, evals, streak] =
    await Promise.all([
      fetchUserInfo(),
      fetchMyCourses(),
      fetchMyBatches(),
      fetchMyLiveClasses(),
      fetchUpcomingEvaluations(),
      fetchStreakInfo(),
    ]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <DashboardHeader fullName={user?.full_name} streak={streak} />

      <MyCourses courses={courses} />

      <UpcomingEvents liveClasses={liveClasses} evals={evals} />
    </div>
  );
}
