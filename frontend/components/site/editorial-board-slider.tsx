"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

type BoardMember = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  email: string;
  link: string;
};

type EditorialBoardSliderProps = {
  members: BoardMember[];
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function EditorialBoardSlider({ members }: EditorialBoardSliderProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const delta = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between pb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Editorial Board</p>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-slate-300"
            onClick={() => scrollBy("left")}
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-slate-300"
            onClick={() => scrollBy("right")}
            aria-label="Scroll right"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pr-2 scrollbar-hide"
      >

        {members.map((member,i) => (
          <div
            key={i}
            className="min-w-[260px] snap-start rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white font-semibold">
                {getInitials(member.name)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{member.name}</p>
                <p className="text-xs text-slate-500">{member?.role}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">{member?.affiliation}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <a href={`mailto:${member?.email}`} className="flex items-center gap-1 hover:text-slate-900">
                <Mail className="h-3.5 w-3.5" />
                {member?.email}
              </a>
              <Link href={member?.link} className="text-slate-700 hover:text-slate-900">
                Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
