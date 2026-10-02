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

// /handson/all/lms/children - a parent's Grades R-3 child profiles on the
// web: list, add, edit, remove, a one-time claim code, and each child's
// progress this week with one line per session. No child mode and no
// "Who's learning?" picker: the child learns in the app.

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addChildAction,
  archiveChildAction,
  fetchChildWeek,
  fetchChildren,
  issueClaimCodeAction,
  updateChildAction,
} from "@/app/actions/handson/all/lms/children/actions";
import type {
  ChildInput,
  ChildProfile,
  ChildWeek,
  ClaimCode,
} from "@/app/actions/handson/all/lms/children/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const GRADES = ["R", "1", "2", "3"];
const AVATARS = [
  "lion",
  "elephant",
  "giraffe",
  "zebra",
  "hippo",
  "rhino",
  "leopard",
  "frog",
  "penguin",
  "owl",
  "turtle",
  "monkey",
];
const EMPTY: ChildInput = {
  display_name: "",
  grade: "R",
  avatar_key: "lion",
  school: "",
};

function gradeLabel(g: number) {
  return g === 0 ? "Grade R" : `Grade ${g}`;
}

function ChildForm({
  initial,
  askConsent,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ChildInput;
  askConsent: boolean;
  submitLabel: string;
  onSubmit: (v: ChildInput, consent: boolean) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<ChildInput>(initial);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await onSubmit(v, consent);
        setBusy(false);
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="child-name">Name</Label>
        <Input
          id="child-name"
          maxLength={40}
          value={v.display_name}
          onChange={(e) => setV({ ...v, display_name: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="child-grade">Grade</Label>
          <select
            id="child-grade"
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
            value={v.grade}
            onChange={(e) => setV({ ...v, grade: e.target.value })}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g === "R" ? "Grade R" : `Grade ${g}`}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="child-avatar">Avatar</Label>
          <select
            id="child-avatar"
            className="h-9 w-full rounded-md border bg-background px-2 text-sm capitalize"
            value={v.avatar_key}
            onChange={(e) => setV({ ...v, avatar_key: e.target.value })}
          >
            {AVATARS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="child-school">School (optional)</Label>
        <Input
          id="child-school"
          maxLength={140}
          value={v.school}
          onChange={(e) => setV({ ...v, school: e.target.value })}
        />
      </div>
      {askConsent && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          I am this child&apos;s parent or guardian and I consent to setting up
          this profile.
        </label>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ChildProgress({ student }: { student: string }) {
  const [week, setWeek] = useState<ChildWeek | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchChildWeek(student).then((r) =>
      r.success ? setWeek(r.data) : setError(r.error),
    );
  }, [student]);
  if (error)
    return <p className="text-sm text-muted-foreground">No report yet.</p>;
  if (!week) return <Skeleton className="h-16 w-full" />;
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-4 text-muted-foreground">
        <span>
          {week.sessions_attended}/{week.sessions_scheduled} sessions this week
        </span>
        <span>{Math.round(week.engagement_rate_percent ?? 0)}% engaged</span>
        <span>{week.current_streak ?? 0}-day streak</span>
      </div>
      {week.live_sessions?.length ? (
        <ul className="space-y-1">
          {week.live_sessions.map((s, i) => (
            <li key={i} className="truncate">
              {s.title}
              {s.status ? ` · ${s.status}` : ""}
              {s.minutes != null ? ` · ${s.minutes} min` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No sessions this week yet.</p>
      )}
    </div>
  );
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [codes, setCodes] = useState<Record<string, ClaimCode>>({});

  async function load() {
    const r = await fetchChildren();
    if (r.success) setChildren(r.data);
    else {
      setChildren([]);
      toast.error(r.error);
    }
  }
  useEffect(() => {
    load();
  }, []);

  if (!children)
    return (
      <div className="container max-w-4xl py-10">
        <Skeleton className="h-40 w-full" />
      </div>
    );

  return (
    <div className="container max-w-4xl space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My children</h1>
          <p className="text-sm text-muted-foreground">
            Grades R to 3. Your child learns in the app on your phone; manage
            their profiles and follow their progress here.
          </p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)}>Add a child</Button>
        )}
      </div>

      {adding && (
        <Card>
          <CardHeader>
            <CardTitle>Add a child</CardTitle>
          </CardHeader>
          <CardContent>
            <ChildForm
              initial={EMPTY}
              askConsent
              submitLabel="Add child"
              onCancel={() => setAdding(false)}
              onSubmit={async (v, consent) => {
                const r = await addChildAction(v, consent);
                if (!r.success) return void toast.error(r.error);
                toast.success("Child added");
                setAdding(false);
                load();
              }}
            />
          </CardContent>
        </Card>
      )}

      {children.length === 0 && !adding && (
        <p className="rounded-lg bg-muted/30 py-16 text-center text-muted-foreground">
          No child profiles yet.
        </p>
      )}

      {children.map((c) => (
        <Card key={c.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>{c.display_name}</CardTitle>
              <p className="text-sm capitalize text-muted-foreground">
                {gradeLabel(c.grade)} · {c.avatar_key}
                {c.school ? ` · ${c.school}` : ""}
              </p>
            </div>
            <Badge variant={c.status === "Active" ? "default" : "secondary"}>
              {c.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing === c.id ? (
              <ChildForm
                initial={{
                  display_name: c.display_name,
                  grade: c.grade === 0 ? "R" : String(c.grade),
                  avatar_key: c.avatar_key,
                  school: c.school,
                }}
                askConsent={false}
                submitLabel="Save"
                onCancel={() => setEditing(null)}
                onSubmit={async (v) => {
                  const r = await updateChildAction(c.id, v);
                  if (!r.success) return void toast.error(r.error);
                  toast.success("Saved");
                  setEditing(null);
                  load();
                }}
              />
            ) : (
              <>
                {c.student && <ChildProgress student={c.student} />}
                {codes[c.id] && (
                  <div className="rounded-md border p-3 text-sm">
                    Claim code:{" "}
                    <span className="font-mono text-lg font-semibold">
                      {codes[c.id].code}
                    </span>
                    <div className="text-muted-foreground">
                      Your child types this on their own phone to keep all their
                      progress. It works once and expires{" "}
                      {new Date(codes[c.id].expires_at).toLocaleDateString()}.
                      It is shown only now.
                    </div>
                  </div>
                )}
                {c.status === "Active" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(c.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const r = await issueClaimCodeAction(c.id);
                        if (!r.success) return void toast.error(r.error);
                        setCodes({ ...codes, [c.id]: r.data });
                      }}
                    >
                      {c.claim_code_expires_at
                        ? "New claim code"
                        : "Claim code"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (
                          !confirm(
                            `Remove ${c.display_name}? Their progress is kept.`,
                          )
                        )
                          return;
                        const r = await archiveChildAction(c.id);
                        if (!r.success) return void toast.error(r.error);
                        load();
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
