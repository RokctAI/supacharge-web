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

"use client";

// The landing page's FAQ accordion. Copy and questions: LMS_LANDING_CONFIG.faq.

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function LmsFaqSection({ id }: { id?: string }) {
  const config = LMS_LANDING_CONFIG.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!config || config.items.length === 0) return null;

  const toggle = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <section id={id} className="w-full bg-[var(--sc-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-5">
          <h2 className="text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
            {config.heading}
          </h2>
          <p className="text-lg md:text-xl font-medium text-[var(--sc-ink-2)] max-w-2xl">
            {config.blurb}
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
          {config.items.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`sc-card overflow-hidden transition-colors ${
                  open ? "border-[var(--sc-primary)]" : ""
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 p-4 md:p-5 text-left"
                >
                  <span className="text-base md:text-lg font-bold text-[var(--sc-ink)]">
                    {faq.question}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--sc-card-alt)] text-[var(--sc-ink-2)]">
                    {open ? (
                      <Minus className="size-4" aria-hidden="true" />
                    ) : (
                      <Plus className="size-4" aria-hidden="true" />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 md:px-5 pb-5 text-[var(--sc-ink-2)] leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the page order
 * and its floating-nav entry.
 */
export const meta: PageSectionMeta = {
  order: 80,
  nav: [{ id: "faq", label: "FAQ" }],
};

export default LmsFaqSection;
