"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Brief } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

function SharedBriefContent({ initialBrief }: { initialBrief: Brief }) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [brief, setBrief] = useState<Brief>(initialBrief);
  const [isApproving, setIsApproving] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // In preview mode, we always force 'view' state
  const [viewState, setViewState] = useState<'view' | 'approved' | 'changes_requested'>(
    isPreview ? 'view' :
    initialBrief.status === 'confirmed' ? 'approved' : 
    initialBrief.status === 'changes_requested' ? 'changes_requested' : 'view'
  );

  const handleApprove = async () => {
    if (isPreview) return;
    setIsApproving(true);
    try {
      const { error } = await supabase
        .from('briefs')
        .update({ status: 'confirmed' })
        .eq('id', brief.id);

      if (error) throw error;

      setViewState('approved');
      setBrief(prev => ({ ...prev, status: 'confirmed' }));

      // Non-blocking notification
      try {
        await supabase.from('notifications').insert([{
          brief_id: brief.id,
          type: 'approval',
          message: `The brief for "${brief.title}" has been approved by the client.`,
          is_read: false
        }]);
      } catch (err) {
        console.warn("Notification failed (table may not exist):", err);
      }
    } catch (error: any) {
      console.error("Error approving brief:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      alert(`Failed to approve the brief: ${error.message || "Unknown error"}.`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestChanges = async () => {
    if (isPreview || !feedback.trim()) return;
    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('briefs')
        .update({ 
          status: 'changes_requested',
          client_feedback: feedback 
        })
        .eq('id', brief.id);

      if (error) throw error;

      setViewState('changes_requested');
      setBrief(prev => ({ ...prev, status: 'changes_requested', client_feedback: feedback }));
      setCommentModalOpen(false);

      // Non-blocking notification
      try {
        await supabase.from('notifications').insert([{
          brief_id: brief.id,
          type: 'feedback',
          message: `Client requested changes for "${brief.title}": ${feedback.substring(0, 50)}...`,
          is_read: false
        }]);
      } catch (err) {
        console.warn("Notification failed (table may not exist):", err);
      }
    } catch (error: any) {
      console.error("Error requesting changes:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      alert(`Failed to submit feedback: ${error.message || "Unknown error"}.`);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "N/A";
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20';
      case 'changes_requested':
        return 'bg-tertiary-container/20 text-tertiary border-tertiary-container/30';
      case 'pending':
        return 'bg-primary-container/20 text-primary border-primary-container/30';
      case 'draft':
        return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
      default:
        return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">Briefly AI</h1>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs font-mono font-medium tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 border border-primary/20 rounded-md">
             {isPreview ? 'Client Preview' : 'Shared Brief'}
           </span>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 md:px-6 py-10 flex flex-col items-center justify-center">
        
        {/* Success/Status Message - REPLACES content if not in 'view' state */}
        {viewState === 'approved' && !isPreview ? (
          <div className="w-full max-w-xl p-8 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-2xl flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-500 shadow-2xl shadow-[#22c55e]/5">
            <div className="w-20 h-20 rounded-full bg-[#22c55e] flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
              <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-on-surface mb-3">Brief Approved!</h4>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Thank you for your approval. We've notified the team, and they will start working on your project immediately.
              </p>
            </div>
            <div className="w-full h-[1px] bg-[#22c55e]/20 my-2"></div>
            <p className="text-sm text-outline">You can safely close this window.</p>
          </div>
        ) : viewState === 'changes_requested' && !isPreview ? (
          <div className="w-full max-w-xl p-8 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-500 shadow-2xl shadow-tertiary/5">
            <div className="w-20 h-20 rounded-full bg-tertiary flex items-center justify-center shadow-lg shadow-tertiary/30">
              <span className="material-symbols-outlined text-on-tertiary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-on-surface mb-3">Feedback Received</h4>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Your requested changes have been sent to the team. We'll review them and update the brief as soon as possible.
              </p>
            </div>
            <div className="w-full h-[1px] bg-tertiary/20 my-2"></div>
            <p className="text-sm text-outline">We'll notify you once the updates are ready.</p>
          </div>
        ) : (
          <>
            {/* Brief Container */}
            <article className="w-full bg-surface-container rounded-xl border border-outline-variant/30 p-6 md:p-12 shadow-lg relative overflow-hidden">
              {/* Subtle AI Glow Top Border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-container via-primary to-primary-container opacity-50"></div>
              
              <div className="mb-10 border-b border-outline-variant/20 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <p className="text-xs font-mono font-medium tracking-wide uppercase text-primary">PROJECT BRIEF</p>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface mb-4">{brief.title || "Untitled Project"}</h2>
                <div className="flex items-center gap-4 text-on-surface-variant text-sm leading-relaxed">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span>Generated: {new Date(brief.created_at || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">domain</span>
                    <span>Client: {brief.client_name || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-base leading-relaxed text-on-surface-variant space-y-8">
                {/* Section 1: Project Summary */}
                <section>
                  <h3 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">subject</span>
                    1. Project Summary
                  </h3>
                  <p className="text-base leading-relaxed text-on-surface-variant">
                    {brief.summary || "No summary generated."}
                  </p>
                </section>
                
                {/* Section 2: Goals & Success Criteria */}
                <section>
                  <h3 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">flag</span>
                    2. Goals &amp; Success Criteria
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {brief.goals && brief.goals.length > 0 ? (
                      brief.goals.map((goal: string, index: number) => (
                        <div key={index} className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
                          <div className="text-base leading-relaxed text-on-surface">{goal}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-on-surface-variant">No goals generated.</p>
                    )}
                  </div>
                </section>
                
                {/* Section 3: Requested Features */}
                <section>
                  <h3 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">list_alt</span>
                    3. Requested Features
                  </h3>
                  <ul className="space-y-sm">
                    {brief.requested_features && brief.requested_features.length > 0 ? (
                      brief.requested_features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/10">
                          <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                          <div className="text-base leading-relaxed text-on-surface">{feature}</div>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-on-surface-variant">No requested features generated.</li>
                    )}
                  </ul>
                </section>
                
                {/* Section 4: Ambiguities */}
                {brief.ambiguities && brief.ambiguities.length > 0 && (
                  <section className="relative">
                    <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-tertiary/40 to-error/40 blur-sm z-0"></div>
                    <div className="relative bg-surface-container z-10 p-6 rounded-xl border border-tertiary/30">
                      <h3 className="text-2xl font-semibold tracking-tight leading-snug text-tertiary mb-4 flex items-center gap-3">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        4. Ambiguities &amp; Open Questions
                      </h3>
                      <div className="space-y-sm">
                        {brief.ambiguities.map((ambiguity: string, index: number) => (
                          <div key={index} className="bg-surface p-4 rounded-lg border border-tertiary/20 border-l-4 border-l-tertiary">
                            <p className="text-base leading-relaxed text-on-surface">{ambiguity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Section 5: Clarifications Needed */}
                {brief.follow_up_questions && brief.follow_up_questions.length > 0 && (
                  <section>
                    <h3 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                      5. Clarifications Needed
                    </h3>
                    <div className="space-y-sm">
                      {brief.follow_up_questions.map((question: string, index: number) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/10">
                          <span className="text-xs font-mono font-medium tracking-wide uppercase text-primary mt-1 shrink-0">Q{index + 1}</span>
                          <div className="text-base leading-relaxed text-on-surface">{question}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </article>

            {/* Action Buttons & Inline Feedback */}
            {!isPreview && (
              <div className="w-full flex flex-col items-center gap-6 py-12 border-b border-outline-variant/10 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
                  <button 
                    onClick={() => setCommentModalOpen(!commentModalOpen)}
                    className={`w-full sm:w-auto px-10 py-4 rounded-md border text-xs font-mono font-medium tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${commentModalOpen ? 'bg-surface-container-high border-primary text-primary' : 'border-outline-variant text-on-surface hover:bg-surface-container-high'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    {commentModalOpen ? 'Cancel Request' : 'Request Changes'}
                  </button>
                  <button 
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full sm:w-auto px-10 py-4 rounded-md bg-primary text-on-primary text-xs font-mono font-medium tracking-wide uppercase font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isApproving ? 'sync' : 'check_circle'}
                    </span>
                    {isApproving ? 'Approving...' : 'Approve Brief'}
                  </button>
                </div>

                {/* Inline Feedback Box */}
                {commentModalOpen && (
                  <div className="w-full max-w-2xl bg-surface-container-high/50 border border-outline-variant/30 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold tracking-tight text-on-surface mb-2">Describe your changes</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                      Please describe what you'd like to change or any concerns you have about this brief.
                    </p>
                    
                    <textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      autoFocus
                      className="w-full h-32 bg-surface border border-outline-variant/50 rounded-lg p-3 text-on-surface text-sm focus:border-primary outline-none transition-all placeholder:text-outline"
                      placeholder="e.g., Please add a section about mobile responsiveness..."
                    />
                    
                    <div className="flex justify-end gap-3 mt-4">
                      <button 
                        onClick={() => setCommentModalOpen(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleRequestChanges}
                        disabled={isSubmittingFeedback || !feedback.trim()}
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:brightness-110 transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingFeedback ? 'Sending...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Clean Footer */}
      <footer className="py-8 text-center text-on-surface-variant text-sm border-t border-outline-variant/10">
        Powered by Briefly AI
      </footer>
    </div>
  );
}

export default function SharedBriefClient({ initialBrief }: { initialBrief: Brief }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <SharedBriefContent initialBrief={initialBrief} />
    </Suspense>
  );
}
