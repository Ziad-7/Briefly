"use client";

import { useState } from "react";
import Link from "next/link";

import { Brief } from "@/lib/types";

export default function BriefActions({ 
  brief,
  activeIsEditing,
  setIsEditing,
  handleSaveEdit,
  isSaving,
  handleRegenerate,
  isRegenerating,
  handleExportPdf
}: { 
  brief: Brief,
  activeIsEditing: boolean,
  setIsEditing: (val: boolean) => void,
  handleSaveEdit: () => void,
  isSaving: boolean,
  handleRegenerate: () => void,
  isRegenerating: boolean,
  handleExportPdf: () => void
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${brief.id}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };



  return (
    <aside className="lg:col-span-4 xl:col-span-3">
      <div className="sticky top-24 self-start flex flex-col gap-4">
        {/* Complexity Card */}
        <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 shadow-lg shadow-black/10">
          <div className="text-xs font-mono font-medium tracking-wide uppercase text-on-surface-variant uppercase tracking-widest mb-4">Complexity Estimate</div>
          <div className="flex items-end gap-3 mb-3">
            <div className="text-5xl font-bold tracking-tight leading-tight text-on-surface leading-none">{brief.complexity_estimate || 'Medium'}</div>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-4">
            <div className={`h-full w-3/4 ${
              brief.complexity_estimate === 'High' ? 'bg-gradient-to-r from-primary to-error' :
              brief.complexity_estimate === 'Low' ? 'bg-gradient-to-r from-primary to-secondary' :
              'bg-gradient-to-r from-primary to-tertiary'
            }`}></div>
          </div>
          <p className="text-sm leading-relaxed text-on-surface-variant">{brief.complexity_reasoning || 'Standard project requirements.'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setShareModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary font-bold rounded-lg py-4 px-4 hover:brightness-110 transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">ios_share</span>
            Share with Client
          </button>
          
          {brief.status !== 'confirmed' && (
            <>
              {activeIsEditing ? (
                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-3 bg-secondary text-on-secondary font-bold rounded-lg py-4 px-4 hover:brightness-110 transition-all"
                >
                  <span className="material-symbols-outlined">save</span>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-3 bg-transparent border border-outline-variant text-on-surface font-medium rounded-lg py-4 px-4 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit Brief
                </button>
              )}
            </>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleExportPdf}
              className={`flex items-center justify-center gap-1 bg-transparent border border-outline-variant/50 text-on-surface-variant font-medium rounded-lg py-3 px-3 hover:text-on-surface hover:border-outline-variant transition-colors ${brief.status === 'confirmed' ? 'col-span-2' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Export PDF
            </button>
            {brief.status !== 'confirmed' && (
              <button 
                onClick={handleRegenerate}
                disabled={isRegenerating || activeIsEditing}
                className={`flex items-center justify-center gap-1 font-medium rounded-lg py-3 px-3 transition-colors border ${
                  isRegenerating ? 'bg-surface-container text-on-surface-variant border-outline-variant/30' : 'bg-surface-container text-primary hover:bg-surface-container-high border-primary/20'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isRegenerating ? 'animate-spin' : ''}`}>autorenew</span>
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex flex-col items-center">
          <span className={`w-full text-center px-4 py-3 rounded-xl text-sm font-mono font-bold uppercase tracking-[0.2em] border shadow-lg ${
            brief.status === 'confirmed' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30 shadow-[#22c55e]/5' :
            brief.status === 'changes_requested' ? 'bg-tertiary-container/20 text-tertiary border-tertiary-container/40 shadow-tertiary/5' :
            brief.status === 'pending' ? 'bg-primary-container/20 text-primary border-primary-container/40 shadow-primary/5' :
            'bg-surface-container-highest text-on-surface-variant border-outline-variant/30'
          }`}>
            {brief.status?.replace(/_/g, ' ') || 'Draft'}
          </span>
        </div>

        {/* Metadata */}
        <div className="mt-6 pt-lg border-t border-outline-variant/20">
          <ul className="space-y-xs text-sm leading-relaxed">
            <li className="flex justify-between text-on-surface-variant">
              <span>Created</span>
              <span className="text-on-surface">{new Date(brief.created_at || new Date()).toLocaleDateString()}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-high rounded-2xl shadow-2xl max-w-md w-full p-6 border border-outline-variant/20 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-on-surface">Share Brief</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
              Anyone with this link will be able to view the generated brief. They will not be able to edit it or see your other projects.
            </p>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 bg-surface-container border border-outline-variant/50 rounded-lg py-2 px-3 text-sm text-on-surface-variant overflow-hidden text-ellipsis whitespace-nowrap">
                {shareUrl}
              </div>
              <button 
                onClick={handleCopyLink}
                className="bg-primary/10 text-primary hover:bg-primary/20 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t border-outline-variant/20">
               <a 
                 href={`mailto:?subject=Review Project Brief&body=Here is the link to the brief: ${shareUrl}`}
                 className="flex-1 flex items-center justify-center gap-2 bg-surface-container text-on-surface hover:bg-surface-container-highest font-medium py-3 rounded-lg transition-colors"
               >
                 <span className="material-symbols-outlined text-[18px]">mail</span>
                 Email Link
               </a>
               <Link 
                 href={`/share/${brief.id}?preview=true`}
                 target="_blank"
                 onClick={() => setShareModalOpen(false)}
                 className="flex-1 flex items-center justify-center gap-2 bg-surface-container text-on-surface hover:bg-surface-container-highest font-medium py-3 rounded-lg transition-colors"
               >
                 <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                 Preview
               </Link>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
