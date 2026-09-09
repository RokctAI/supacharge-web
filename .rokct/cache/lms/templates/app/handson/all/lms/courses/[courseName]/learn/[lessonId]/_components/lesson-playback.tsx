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

// NOT USED ON THE WEB since lms_sdk 1.12.0 - kept, never deleted.
//
// This is the lesson player the route ../page.tsx rendered until 1.12.0:
// react-player over the lesson's video_url or YouTube id, the EditorJS body,
// the discussions and the anti-skip completion tracking. Ray, 2026-09-09:
// "supacharge web doesnt play lessons or whatch libray" - "we make things to
// apps so it will mean waiting on downloading those assets to users browser
// before play". The route now renders components/custom/lms-download-app.tsx
// and nothing imports this module, so react-player and the EditorJS wrapper
// stay out of the web bundle. It is left whole so the day the web is meant
// to play a lesson is one import away, not a rewrite.


"use client";

import { useEffect, useState, useRef } from "react";
import type { SyntheticEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactPlayer from "react-player";
import {
  fetchLesson,
  saveLessonProgress,
} from "@/app/actions/handson/all/lms/courses/actions";
import type { CourseLesson } from "@/app/actions/handson/all/lms/courses/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle, Circle } from "lucide-react";

// Dynamically import EditorJS related stuff to avoid SSR issues
import dynamic from "next/dynamic";

// We need a wrapper for EditorJS since it interacts with DOM immediately
const EditorContent = dynamic(() => import("./editor-content"), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse bg-muted rounded-md" />,
});

import { Discussions } from "./discussions";

export default function LessonPlayback() {
  const params = useParams();
  const router = useRouter();

  // Decode params
  const courseName = decodeURIComponent(params.courseName as string);
  // lessonId is actually the lesson NAME (ID), chapter logic handled by backend mostly
  // But backend needs chapter/lesson numbers or just the lesson name?
  // Our service `getLesson` takes (courseName, chapter, lesson) - wait, checking service signature.
  // Service: getLesson(courseName, chapter, lesson) -> requires chapter ID.
  // The Route is [lessonId]. We might need to fetch the course structure first to find the chapter?
  // OR we can adjust the service to find lesson by name if possible.
  // Actually, `lms.lms.utils.get_lesson` expects chapter and lesson *names* (ids).

  // PROBLEM: URL only has [lessonId]. Sidebar has access to chapters.
  // We should probably include chapter in URL or fetch course to find chapter.
  // For now assuming [lessonId] is sufficient if we iterate course, OR we change route.
  // Let's rely on finding the chapter from the course data if not in URL.

  // Wait, the Vue app route was `Lesson` with params `chapterNumber`, `lessonNumber`.
  // My route is `.../learn/[lessonId]`.
  // I need to look up which chapter this lesson belongs to.
  // I can do this by fetching the course details again or just iterating if I had them.
  // Better: Fetch full lesson details by *name* if backend supports it, or fetch course first.
  // Let's try fetching the lesson using just the ID if backend allows, or iterate.

  // Let's cheat: The Sidebar links passed `lesson.name`.
  // I will fetch the LESSON details. The `get_lesson` API might need adjustment or we loop.
  // Actually `get_lesson` in `lms.lms.utils` needs `chapter` and `lesson`.
  // I will add a helper to `actions` to find chapter from course if needed, or just pass dummy if backend ignores.

  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // State for video tracking
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedSegments, setWatchedSegments] = useState<Set<number>>(
    new Set(),
  );
  const watchedSegmentsRef = useRef<Set<number>>(new Set());

  // Fetch data
  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      try {
        // Fetch lesson (now includes enrollment guardrail)
        const data = await fetchLesson(courseName, params.lessonId as string);

        // The only error fetchLesson returns is access_denied; the
        // `in` check also narrows `data` to a lesson below.
        if (data && "error" in data) {
          toast.error(data.message);
          router.push(
            `/handson/all/lms/courses/${encodeURIComponent(courseName)}`,
          );
          return;
        }

        if (data) {
          setLesson(data);
        } else {
          toast.error("Failed to load lesson");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading lesson");
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [courseName, params.lessonId, router]);

  // react-player 3 renders a media element and forwards its native events:
  // `timeupdate` replaces the v2 `onProgress` callback and `durationchange`
  // replaces `onDuration`. The played fraction is derived the same way v2
  // reported it (currentTime / duration).
  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const media = event.currentTarget;
    const playedSeconds = media.currentTime;
    const played =
      media.duration > 0 && Number.isFinite(media.duration)
        ? playedSeconds / media.duration
        : 0;
    setPlayed(played);

    // Anti-Skip Logic: Track every unique second watched
    const currentSecond = Math.floor(playedSeconds);
    if (!watchedSegmentsRef.current.has(currentSecond)) {
      watchedSegmentsRef.current.add(currentSecond);
      // Verify completion locally
      checkCompletion(played);
    }
  };

  const handleDurationChange = (event: SyntheticEvent<HTMLVideoElement>) => {
    const value = event.currentTarget.duration;
    setDuration(Number.isFinite(value) ? value : 0);
  };

  const checkCompletion = (currentProgress: number) => {
    if (lesson?.is_complete || completing) return;

    // Strict Check: Must have watched 90% of UNIQUE seconds
    // Fallback to simple progress if duration is 0 (e.g. infinite stream or load error)
    if (duration > 0) {
      const uniqueSecondsWatched = watchedSegmentsRef.current.size;
      const percentageWatched = uniqueSecondsWatched / duration;

      if (percentageWatched > 0.9) {
        markComplete();
      }
    } else {
      // Fallback for non-duration videos (rare)
      if (currentProgress > 0.95) markComplete();
    }
  };

  const markComplete = async () => {
    if (completing || lesson?.is_complete) return;
    setCompleting(true);
    try {
      if (!lesson) return;
      await saveLessonProgress(courseName, lesson.name);
      setLesson((prev) => (prev ? { ...prev, is_complete: true } : prev));
      toast.success("Lesson completed!");
    } catch (err) {
      toast.error("Failed to save progress");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="p-8 text-center">Lesson not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            {lesson.course_title} - {lesson.chapter_title}
          </p>
        </div>
        <Button
          variant={lesson.is_complete ? "outline" : "default"}
          onClick={markComplete}
          disabled={completing}
          className="gap-2"
        >
          {lesson.is_complete ? (
            <>
              <CheckCircle className="h-4 w-4" /> Completed
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" /> Mark Complete
            </>
          )}
        </Button>
      </header>

      {/* Video Player */}
      {lesson.video_url && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
          <ReactPlayer
            src={lesson.video_url}
            width="100%"
            height="100%"
            controls
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
          />
        </div>
      )}

      {/* Youtube (if separate field) */}
      {lesson.youtube && !lesson.video_url && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
          <ReactPlayer
            src={`https://www.youtube.com/watch?v=${lesson.youtube}`}
            width="100%"
            height="100%"
            controls
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      )}

      {/* Content Body (EditorJS) */}
      {lesson.content && (
        <div className="prose dark:prose-invert max-w-none">
          <EditorContent data={JSON.parse(lesson.content)} />
        </div>
      )}

      {/* HTML Body Fallback */}
      {lesson.body && !lesson.content && (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.body }}
        />
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between pt-8 border-t">
        <Button
          variant="ghost"
          disabled={!lesson.prev}
          onClick={() => router.push(lesson.prev ? lesson.prev : "#")}
        >
          &larr; Previous
        </Button>
        <Button
          variant="ghost"
          disabled={!lesson.next}
          onClick={() => router.push(lesson.next ? lesson.next : "#")}
        >
          Next &rarr;
        </Button>
      </div>

      {/* Discussions */}
      {lesson && (
        <Discussions
          doctype="Course Lesson"
          docname={lesson.name}
          title="Lesson Discussions"
        />
      )}
    </div>
  );
}
