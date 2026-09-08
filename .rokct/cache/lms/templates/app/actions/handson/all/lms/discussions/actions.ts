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

"use server";

import { DiscussionService } from "@/app/services/all/lms/discussions";
import { revalidatePath } from "next/cache";
import { DiscussionReply } from "./types";
import { z } from "zod";
import { verifyLmsRole } from "@/app/lib/roles";

const CreateTopicSchema = z.object({
  doctype: z.string().min(1),
  docname: z.string().min(1),
  title: z.string().min(3),
});

const CreateReplySchema = z.object({
  topic: z.string().min(1),
  reply: z.string().min(1),
});

export async function fetchDiscussionTopics(doctype: string, docname: string) {
  if (!(await verifyLmsRole())) return [];
  return await DiscussionService.getTopics(doctype, docname);
}

export async function createDiscussionTopicAction(
  doctype: string,
  docname: string,
  title: string,
) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  const valid = CreateTopicSchema.safeParse({ doctype, docname, title });
  if (!valid.success) return { success: false, error: valid.error.message };

  try {
    await DiscussionService.createTopic(doctype, docname, title);
    revalidatePath(`/handson/all/lms`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchDiscussionReplies(topic: string) {
  if (!(await verifyLmsRole())) return [];
  return await DiscussionService.getReplies(topic);
}

export async function createDiscussionReplyAction(
  topic: string,
  reply: string,
  path?: string,
) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  const valid = CreateReplySchema.safeParse({ topic, reply });
  if (!valid.success) return { success: false, error: valid.error.message };

  try {
    await DiscussionService.createReply(topic, reply);
    if (path) revalidatePath(path);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
