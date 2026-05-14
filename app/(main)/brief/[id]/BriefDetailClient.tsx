"use client";

import { useState, useRef } from "react";
import Footer from "@/components/Footer";
import BriefActions from "@/components/BriefActions";
import { Brief } from "@/lib/types";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function BriefDetailClient({ initialBrief }: { initialBrief: Brief }) {
  const router = useRouter();
  const [brief, setBrief] = useState<Brief>(initialBrief);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Lock editing if confirmed
  const canEdit = brief.status !== 'confirmed';
  const activeIsEditing = isEditing && canEdit;
  
  const contentRef = useRef<HTMLElement>(null); // kept for potential future use

  const handleEditChange = (field: keyof Brief, value: any) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof Brief, index: number, value: string) => {
    setBrief(prev => {
      const arr = [...(prev[field] as string[])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('briefs')
        .update({
          title: brief.title,
          summary: brief.summary,
          goals: brief.goals,
          requested_features: brief.requested_features,
          ambiguities: brief.ambiguities,
          follow_up_questions: brief.follow_up_questions
        })
        .eq('id', brief.id);

      if (error) throw error;
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving brief:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/generateBrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: brief.id,
          rawInput: brief.raw_input,
          clientName: brief.client_name,
          currentBrief: brief, // Pass current brief for refinement
          clientFeedback: brief.client_feedback // Pass feedback for refinement
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to regenerate");
      }

      setBrief(data.data);
      router.refresh();
    } catch (error) {
      console.error("Error regenerating brief:", error);
      alert("Failed to regenerate the brief.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;

      // Build a self-contained HTML string to avoid html2canvas failing
      // on Tailwind v4's oklab/oklch color functions.
      const goalsHtml = (brief.goals || []).map(g => `<li>${g}</li>`).join('');
      const featuresHtml = (brief.requested_features || []).map(f => `<li>${f}</li>`).join('');
      const ambiguitiesHtml = (brief.ambiguities || []).map(a => `<li>${a}</li>`).join('');
      const questionsHtml = (brief.follow_up_questions || []).map((q, i) => `<p><strong>Q${i + 1}:</strong> ${q}</p>`).join('');

      const htmlContent = `
        <div style="font-family: Georgia, serif; color: #111; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin: 0 0 8px 0;">Generated Brief &middot; Briefly AI</p>
            <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 8px 0;">${brief.title || 'Untitled Project'}</h1>
            <p style="font-size: 13px; color: #555; margin: 0;">Client: ${brief.client_name || 'N/A'} &nbsp;&middot;&nbsp; Date: ${new Date(brief.created_at || '').toLocaleDateString()}</p>
          </div>
          <h2 style="font-size: 18px; color: #333; margin-bottom: 8px;">1. Project Summary</h2>
          <p style="font-size: 14px; line-height: 1.7; color: #444; margin-bottom: 24px;">${brief.summary || 'No summary provided.'}</p>
          <h2 style="font-size: 18px; color: #333; margin-bottom: 8px;">2. Goals &amp; Success Criteria</h2>
          <ul style="font-size: 14px; line-height: 1.7; color: #444; padding-left: 20px; margin-bottom: 24px;">${goalsHtml}</ul>
          <h2 style="font-size: 18px; color: #333; margin-bottom: 8px;">3. Requested Features</h2>
          <ul style="font-size: 14px; line-height: 1.7; color: #444; padding-left: 20px; margin-bottom: 24px;">${featuresHtml}</ul>
          ${ambiguitiesHtml ? `
          <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <h2 style="font-size: 18px; color: #b45309; margin: 0 0 8px 0;">4. Ambiguities &amp; Missing Info</h2>
            <ul style="font-size: 14px; line-height: 1.7; color: #78350f; padding-left: 20px; margin: 0;">${ambiguitiesHtml}</ul>
          </div>` : ''}
          ${questionsHtml ? `
          <h2 style="font-size: 18px; color: #333; margin-bottom: 8px;">5. Suggested Follow-up Questions</h2>
          <div style="font-size: 14px; line-height: 1.7; color: #444; margin-bottom: 24px;">${questionsHtml}</div>` : ''}
          <div style="border-top: 1px solid #ddd; padding-top: 12px; margin-top: 24px; font-size: 11px; color: #999; text-align: center;">
            Complexity: ${brief.complexity_estimate || 'N/A'} &nbsp;&middot;&nbsp; ${brief.complexity_reasoning || ''} &nbsp;&middot;&nbsp; Generated by Briefly AI
          </div>
        </div>
      `;

      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      const opt = {
        margin: 12,
        filename: `${(brief.title || 'Project_Brief').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF.');
    }
  };

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3 bg-surface/70 dark:bg-surface/70 backdrop-blur-md shadow-md shadow-black/40">
        <div className="text-2xl font-semibold tracking-tight leading-snug font-bold text-primary dark:text-primary-fixed-dim">Briefly</div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:bg-surface-container-high/50 transition-colors rounded-full p-1 hover:scale-95 duration-100">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-high/50 transition-colors rounded-full p-1 hover:scale-95 duration-100">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      <main className="flex-1 min-w-0 relative pb-16 pt-lg md:pt-xl px-6 md:px-6 flex justify-center">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <article ref={contentRef} className="lg:col-span-8 xl:col-span-9 bg-surface-container-high border border-outline-variant/30 rounded-xl p-4 md:p-8 lg:p-2xl shadow-xl shadow-black/5 relative overflow-hidden h-fit">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-error opacity-50"></div>
            
            <header className="mb-8 border-b border-outline-variant/20 pb-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-medium tracking-wide uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 border border-primary/20 rounded-md">Brief Details</span>
              </div>

              {/* Client Feedback Banner */}
              {brief.status === 'changes_requested' && (
                <div className="mb-8 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-tertiary/60 to-error/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-surface-container p-6 rounded-xl border border-tertiary/30 shadow-xl">
                    <div className="flex items-center gap-3 mb-4 text-tertiary">
                      <span className="material-symbols-outlined font-bold">feedback</span>
                      <h3 className="text-xl font-bold tracking-tight">Client Feedback</h3>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-lg border border-tertiary/20 text-on-surface-variant italic leading-relaxed">
                      "{brief.client_feedback || 'No feedback provided.'}"
                    </div>
                  </div>
                </div>
              )}
              {activeIsEditing ? (
                <input 
                  type="text" 
                  value={brief.title || ''} 
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface mb-3 bg-surface border border-outline-variant/50 rounded-md p-2"
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface mb-3">{brief.title || "Untitled Project"}</h1>
              )}
            </header>

            {/* Section 1: Project Summary */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">subject</span>
                1. Project Summary
              </h2>
              {activeIsEditing ? (
                <textarea 
                  value={brief.summary || ''} 
                  onChange={(e) => handleEditChange('summary', e.target.value)}
                  className="w-full min-h-[100px] text-base leading-relaxed text-on-surface bg-surface border border-outline-variant/50 rounded-md p-3"
                />
              ) : (
                <p className="text-base leading-relaxed text-on-surface-variant leading-relaxed">
                  {brief.summary || "No summary generated."}
                </p>
              )}
            </section>

            {/* Section 2: Goals & Success Criteria */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">flag</span>
                2. Goals &amp; Success Criteria
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {brief.goals && brief.goals.length > 0 ? (
                  brief.goals.map((goal: string, index: number) => (
                    <div key={index} className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
                      {activeIsEditing ? (
                        <input 
                          type="text" 
                          value={goal} 
                          onChange={(e) => handleArrayChange('goals', index, e.target.value)}
                          className="w-full text-base leading-relaxed text-on-surface bg-surface border border-outline-variant/50 rounded-md p-2"
                        />
                      ) : (
                        <div className="text-base leading-relaxed text-on-surface">{goal}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">No goals generated.</p>
                )}
              </div>
            </section>

            {/* Section 3: Requested Features */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">list_alt</span>
                3. Requested Features
              </h2>
              <ul className="space-y-sm">
                {brief.requested_features && brief.requested_features.length > 0 ? (
                  brief.requested_features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/10">
                      <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                      {activeIsEditing ? (
                        <input 
                          type="text" 
                          value={feature} 
                          onChange={(e) => handleArrayChange('requested_features', index, e.target.value)}
                          className="w-full text-base leading-relaxed text-on-surface bg-surface border border-outline-variant/50 rounded-md p-2"
                        />
                      ) : (
                        <div className="text-base leading-relaxed text-on-surface w-full">{feature}</div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-on-surface-variant">No requested features generated.</li>
                )}
              </ul>
            </section>

            {/* Section 4: Ambiguities */}
            <section className="mb-8 relative">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-tertiary/40 to-error/40 blur-sm z-0"></div>
              <div className="relative bg-surface-container z-10 p-6 rounded-xl border border-tertiary/30">
                <h2 className="text-2xl font-semibold tracking-tight leading-snug text-tertiary mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  4. Ambiguities &amp; Missing Info
                </h2>
                <div className="space-y-sm">
                  {brief.ambiguities && brief.ambiguities.length > 0 ? (
                    brief.ambiguities.map((ambiguity: string, index: number) => (
                      <div key={index} className="bg-surface-container-high p-4 rounded-lg border border-tertiary/20 border-l-4 border-l-tertiary">
                        {activeIsEditing ? (
                          <input 
                            type="text" 
                            value={ambiguity} 
                            onChange={(e) => handleArrayChange('ambiguities', index, e.target.value)}
                            className="w-full text-base leading-relaxed text-on-surface bg-surface border border-outline-variant/50 rounded-md p-2"
                          />
                        ) : (
                          <p className="text-base leading-relaxed text-on-surface">{ambiguity}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-on-surface-variant">No ambiguities detected.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 5: Suggested Follow-up */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                5. Suggested Follow-up Questions
              </h2>
              <div className="bg-surface-container-low rounded-lg border border-outline-variant/20 divide-y divide-outline-variant/10">
                {brief.follow_up_questions && brief.follow_up_questions.length > 0 ? (
                  brief.follow_up_questions.map((question: string, index: number) => (
                    <div key={index} className="p-4 flex items-start gap-3">
                      <span className="text-xs font-mono font-medium tracking-wide uppercase text-primary mt-1">Q{index + 1}</span>
                      {activeIsEditing ? (
                        <input 
                          type="text" 
                          value={question} 
                          onChange={(e) => handleArrayChange('follow_up_questions', index, e.target.value)}
                          className="w-full text-base leading-relaxed text-on-surface bg-surface border border-outline-variant/50 rounded-md p-2"
                        />
                      ) : (
                        <div className="text-base leading-relaxed text-on-surface w-full">{question}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-on-surface-variant">No follow-up questions generated.</div>
                )}
              </div>
            </section>
          </article>

          <BriefActions 
            brief={brief} 
            activeIsEditing={activeIsEditing} 
            setIsEditing={setIsEditing} 
            handleSaveEdit={handleSaveEdit}
            isSaving={isSaving}
            handleRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            handleExportPdf={handleExportPdf}
          />

        </div>
      </main>

      <Footer className="z-40 relative" />
    </>
  );
}
