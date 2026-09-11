"use client";

import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

interface DeleteRoleModalProps {
  roleName: string;
  busy: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteRoleModal({ roleName, busy, error, onClose, onConfirm }: DeleteRoleModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      trigger?.focus();
    };
  }, []);

  return (
    <dialog ref={dialog} aria-labelledby="delete-role-title" aria-describedby="delete-role-description"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      className="fixed inset-0 m-auto w-[calc(100%-32px)] max-w-[440px] rounded-xl border border-grey-4 bg-white p-0 text-grey-1 shadow-xl backdrop:bg-black/50">
      <div className="p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-5 w-5" aria-hidden="true" /></div>
        <h2 id="delete-role-title" className="text-lg font-bold">Delete role?</h2>
        <p id="delete-role-description" className="mt-2 text-sm text-grey-2">Are you sure you want to delete the <strong>{roleName}</strong> role? This action cannot be undone.</p>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex justify-end gap-3 border-t border-grey-4 bg-grey-5 px-6 py-4" aria-busy={busy}>
        <button type="button" autoFocus disabled={busy} onClick={onClose} className="rounded-lg border border-grey-4 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50">Cancel</button>
        <button type="button" disabled={busy} onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-50">{busy ? "Deleting…" : "Delete Role"}</button>
      </div>
    </dialog>
  );
}
