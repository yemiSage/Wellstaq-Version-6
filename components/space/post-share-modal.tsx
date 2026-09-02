"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Facebook, Instagram, Linkedin, MessageCircle, X } from "lucide-react";
import { getPostShareLinks } from "@/lib/post-sharing";

export function PostShareModal({ link, onClose }: { link: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const [instagramSelected, setInstagramSelected] = useState(false);
  const links = getPostShareLinks(link);
  const localLink = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(link).hostname);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const copyLink = async () => {
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(link);
      setCopyState("copied");
    } catch {
      setCopyState("error");
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };
  const optionClass = "flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-grey-4 bg-white px-2 py-3 text-xs font-medium text-grey-2 hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1";

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-lg overflow-y-auto rounded-xl border border-grey-4 bg-white p-0 text-grey-1 shadow-xl backdrop:bg-black/40">
      <div className="flex items-center justify-between gap-4 border-b border-grey-4 p-5">
        <h2 id={titleId} className="text-lg font-semibold">Share post</h2>
        <button type="button" onClick={onClose} aria-label="Close share modal" className="flex h-8 w-8 items-center justify-center rounded-lg text-grey-2 hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-5 p-5">
        <p className="text-sm text-grey-2">Choose where to share, or copy the post link.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <a className={optionClass} href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp (opens a new tab)"><MessageCircle className="h-6 w-6" aria-hidden="true" />WhatsApp</a>
          <a className={optionClass} href={links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook (opens a new tab)"><Facebook className="h-6 w-6" aria-hidden="true" />Facebook</a>
          <a className={optionClass} href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn (opens a new tab)"><Linkedin className="h-6 w-6" aria-hidden="true" />LinkedIn</a>
          <button type="button" className={optionClass} aria-pressed={instagramSelected} onClick={() => { setInstagramSelected(true); void copyLink(); }}><Instagram className="h-6 w-6" aria-hidden="true" />Instagram</button>
        </div>
        {instagramSelected && <div className="space-y-2 rounded-lg bg-grey-5 p-3 text-sm text-grey-2">
          <p>Copy the link below, then paste it into an Instagram message.</p>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium underline underline-offset-4">Open Instagram<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
        </div>}
        <div>
          <label htmlFor={`${titleId}-link`} className="mb-2 block text-sm font-medium">Post link</label>
          <div className="flex gap-2">
            <input ref={inputRef} id={`${titleId}-link`} value={link} readOnly onFocus={(event) => event.currentTarget.select()} className="h-11 min-w-0 flex-1 rounded-lg border border-grey-4 bg-grey-5 px-3 text-sm text-grey-2 focus:outline-none focus:ring-2 focus:ring-primary-1" />
            <button type="button" onClick={() => void copyLink()} disabled={copyState === "copying"} className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-grey-4 bg-white px-3 text-sm font-medium text-grey-1 hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 disabled:opacity-50">
              {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copyState === "copied" ? "Copied" : "Copy link"}
            </button>
          </div>
          <p role="status" className="mt-2 text-xs text-grey-2">{copyState === "copied" ? "Link copied to clipboard." : copyState === "error" ? "Couldn’t copy automatically. Select and copy the link above." : ""}</p>
        </div>
        <p className="text-xs leading-5 text-grey-2">Only people with access to your organization and this post can view it. Sharing a link doesn’t change access.</p>
        {localLink && <p className="text-xs text-grey-2">This local preview link won’t open on other devices. Use the deployed app to share externally.</p>}
      </div>
    </dialog>
  );
}
