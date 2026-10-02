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

// /handson/all/lms/instructor - the authoring side on the web: created
// courses, their cohorts (rlms' batches), the scheduled live classes and
// the homework waiting on a tutor. Every read is System Manager on the
// server; anyone else gets empty lists and the note below. A server page:
// loaded in the render, never in an effect.

import Link from "next/link";
import { fetchCreatedCourses } from "@/app/actions/handson/all/lms/courses/actions";
import { fetchCreatedBatches } from "@/app/actions/handson/all/lms/batches/actions";
import {
  fetchAdminEvals,
  fetchAdminLiveClasses,
} from "@/app/actions/handson/all/lms/events/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground italic">{text}</p>;
}

export default async function InstructorPage() {
  const [courses, batches, liveClasses, evals] = await Promise.all([
    fetchCreatedCourses(),
    fetchCreatedBatches(),
    fetchAdminLiveClasses(),
    fetchAdminEvals(),
  ]);
  const nothing = !courses?.length && !batches?.length && !evals?.length;

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Instructor</h1>
        {nothing && (
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing to show. These views are for platform administrators.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Created courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {courses?.length ? (
            courses.map((c: any) => (
              <div
                key={c.name}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0"
              >
                <Link
                  href={`/handson/all/lms/courses/${encodeURIComponent(c.name)}`}
                  className="font-medium hover:underline"
                >
                  {c.title || c.name}
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{c.subject}</span>
                  {c.grade && <span>Grade {c.grade}</span>}
                  <span>{c.lesson_count ?? 0} lessons</span>
                  <span>{c.enrollments ?? 0} enrolled</span>
                  <Badge variant={c.published ? "default" : "secondary"}>
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <Empty text="No courses." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {batches?.length ? (
            batches.map((b: any) => (
              <div
                key={b.name}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0"
              >
                <span className="font-medium">{b.title}</span>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{b.learners} learners</span>
                  <span>{Math.round(b.average_progress ?? 0)}% average</span>
                  {b.start_date && <span>Since {b.start_date}</span>}
                </div>
              </div>
            ))
          ) : (
            <Empty text="No batches." />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Live classes (next two weeks)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {liveClasses?.length ? (
              liveClasses.map((l: any) => (
                <div key={l.name} className="border-b py-2 last:border-0">
                  <div className="font-medium">{l.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {l.date} {l.time} · {l.status}
                  </div>
                </div>
              ))
            ) : (
              <Empty text="No sessions scheduled." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluations waiting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {evals?.length ? (
              evals.map((e: any) => (
                <div key={e.name} className="border-b py-2 last:border-0">
                  <div className="font-medium">{e.course_title}</div>
                  <div className="text-sm text-muted-foreground">
                    {e.date} · {e.status}
                  </div>
                </div>
              ))
            ) : (
              <Empty text="No homework waiting on a tutor." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
