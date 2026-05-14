"use client";

import DashboardHeader from "@/components/DashboardHeader";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function NewBriefContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [clientName, setClientName] = useState("");
  const [draftId, setDraftId] = useState<string | null>(initialId);

  const [textInput, setTextInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedAudios, setUploadedAudios] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'image'>('text');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load Draft if ID is present
  useEffect(() => {
    if (initialId) {
      fetch(`/api/brief/${initialId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setClientName(data.data.client_name || "");
            setTextInput(data.data.raw_input || "");
          }
        })
        .catch(console.error);
    }
  }, [initialId]);

  // Autosave Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!clientName.trim() && !textInput.trim() && uploadedImages.length === 0 && uploadedAudios.length === 0) {
        if (draftId) {
          fetch(`/api/draft?id=${draftId}`, { method: 'DELETE' })
            .then(() => setDraftId(null))
            .catch(console.error);
        }
        return;
      }

      const fileReferences = [
        ...uploadedImages.map(f => ({ name: f.name, type: 'image' })),
        ...uploadedAudios.map(f => ({ name: f.name, type: 'audio' }))
      ];

      setIsSavingDraft(true);
      fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftId,
          clientName,
          rawInput: textInput,
          fileReferences
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.id && !draftId) {
            setDraftId(data.data.id);
          }
        })
        .catch(console.error)
        .finally(() => setIsSavingDraft(false));
    }, 1500);

    return () => clearTimeout(handler);
  }, [clientName, textInput, uploadedImages, uploadedAudios, draftId]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Process files to send to backend
      const imagePrompts = await Promise.all(uploadedImages.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          name: file.name,
          type: 'image',
          data: base64.split(',')[1], // Remove data:image/png;base64,
          mimeType: file.type
        };
      }));

      const audioPrompts = await Promise.all(uploadedAudios.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          name: file.name,
          type: 'audio',
          data: base64.split(',')[1],
          mimeType: file.type
        };
      }));

      const res = await fetch("/api/generateBrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput: textInput.trim(),
          clientName,
          draftId,
          files: [...imagePrompts, ...audioPrompts]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate brief");
      }

      router.push(`/brief/${data.data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeTab === 'image') {
      setUploadedImages(prev => [...prev, file]);
    } else if (activeTab === 'audio') {
      setUploadedAudios(prev => [...prev, file]);
    }

    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = (index: number) => {
    setUploadedAudios(prev => prev.filter((_, i) => i !== index));
  };

  const hasAnyInput = textInput.trim().length > 0 || uploadedImages.length > 0 || uploadedAudios.length > 0;
  const isFormValid = clientName.trim().length > 0 && hasAnyInput;

  return (
    <main className="flex-1 flex flex-col min-w-0 w-full relative selection:bg-primary-container selection:text-on-primary-container">
      <DashboardHeader />

      {/* Canvas: Split Layout (Upload vs Preview) */}
      <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row p-4 lg:p-8 gap-6 lg:gap-8">
        {/* Left Column: Upload Workspace */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Header & Meta */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono font-medium tracking-wide uppercase text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">WORKSPACE</span>
              <span className="text-xs font-mono font-medium tracking-wide uppercase text-on-surface-variant">NEW INTAKE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface tracking-tight mb-3">Intake Details</h1>
            <p className="text-base leading-relaxed text-on-surface-variant max-w-2xl mb-6">Drop raw client notes, messy audio transcripts, or disjointed screenshots. Briefly's AI engine will synthesize them into a structured intake document.</p>

            <div className="flex flex-col gap-2 max-w-xl">
              <label className="text-sm font-medium text-on-surface">Client / Company Name <span className="text-error">*</span></label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp, Project X..."
                className="w-full bg-surface border border-outline-variant/40 rounded-lg py-3 px-4 text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          {/* Input Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-3 rounded-full text-sm leading-relaxed font-medium flex items-center gap-3 transition-colors ${activeTab === 'text' ? 'bg-surface-container border border-primary/30 text-primary' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:border-outline-variant'}`}
            >
              <span className="material-symbols-outlined text-[18px]">text_snippet</span>
              Paste Text
              {textInput.trim() && <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>}
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-3 rounded-full text-sm leading-relaxed font-medium flex items-center gap-3 transition-colors ${activeTab === 'audio' ? 'bg-surface-container border border-primary/30 text-primary' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:border-outline-variant'}`}
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              Audio / Voice
              {uploadedAudios.length > 0 && <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">{uploadedAudios.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-4 py-3 rounded-full text-sm leading-relaxed font-medium flex items-center gap-3 transition-colors ${activeTab === 'image' ? 'bg-surface-container border border-primary/30 text-primary' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:border-outline-variant'}`}
            >
              <span className="material-symbols-outlined text-[18px]">imagesmode</span>
              Screenshots / Images
              {uploadedImages.length > 0 && <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">{uploadedImages.length}</span>}
            </button>
          </div>

          {/* Interactive Area */}
          <div className="relative group flex-1 min-h-[300px] lg:min-h-[400px] flex flex-col rounded-xl border-2 border-outline-variant/40 bg-surface-container-lowest/60 backdrop-blur-sm transition-all duration-300 focus-within:border-primary/50 focus-within:bg-surface-container-low overflow-hidden">

            {activeTab === 'text' && (
              <textarea
                className="w-full h-full p-4 bg-transparent resize-none outline-none text-on-surface placeholder:text-on-surface-variant/50"
                placeholder="Paste raw project notes, client emails, or transcriptions here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={loading}
              />
            )}

            {(activeTab === 'audio' || activeTab === 'image') && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 border-dashed border-2 border-transparent group-hover:border-primary/50 transition-colors m-2 rounded-lg overflow-y-auto">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-outline-variant/30 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-primary transition-colors">upload_file</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight leading-snug text-on-surface mb-2">Upload {activeTab === 'audio' ? 'Audio' : 'Image'}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant mb-4 max-w-sm">
                  {activeTab === 'audio' ? 'Support for .mp3, .wav. Files are processed via AI for transcription.' : 'Support for .png, .jpg, .pdf. Files are processed via AI for content extraction.'}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept={activeTab === 'audio' ? 'audio/*' : 'image/*,application/pdf'}
                />
                <button
                  onClick={triggerFileInput}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-surface border border-outline-variant/50 text-on-surface text-sm leading-relaxed hover:bg-surface-container-high transition-colors shrink-0"
                >
                  Browse Files
                </button>

                {activeTab === 'image' && uploadedImages.length > 0 && (
                  <div className="mt-8 flex flex-col gap-2 w-full max-w-md text-left">
                    <p className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider">Queued Images for OCR</p>
                    {uploadedImages.map((f, i) => (
                      <div key={i} className="text-sm bg-surface-container p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between shadow-sm">
                        <span className="truncate max-w-[200px] text-on-surface">{f.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => removeImage(i)}
                            className="text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full p-1 transition-colors flex items-center justify-center"
                            title="Remove Image"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'audio' && uploadedAudios.length > 0 && (
                  <div className="mt-8 flex flex-col gap-2 w-full max-w-md text-left">
                    <p className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider">Queued Audio for Transcription</p>
                    {uploadedAudios.map((f, i) => (
                      <div key={i} className="text-sm bg-surface-container p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between shadow-sm">
                        <span className="truncate max-w-[200px] text-on-surface">{f.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => removeAudio(i)}
                            className="text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full p-1 transition-colors flex items-center justify-center"
                            title="Remove Audio"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="mt-6 flex items-center justify-between pt-md border-t border-outline-variant/10 pb-md lg:pb-0">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <button
                className="px-6 py-3 rounded-lg border border-outline-variant/30 text-sm leading-relaxed hover:bg-surface hover:text-on-surface transition-colors flex items-center gap-1"
                disabled={isSavingDraft}
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Draft
              </button>
              {isSavingDraft ? (
                <span className="text-xs font-medium text-primary animate-pulse ml-2">Autosaving...</span>
              ) : draftId ? (
                <span className="text-xs text-outline ml-2">Draft saved</span>
              ) : null}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !isFormValid}
              className="px-8 py-3 rounded-lg bg-primary text-on-primary text-base leading-relaxed font-semibold shadow-md shadow-primary/20 hover:brightness-110 hover:scale-95 transition-all duration-200 flex items-center gap-3 group disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
            >
              {loading ? "Synthesizing..." : "Generate Brief"}
              {!loading && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>}
            </button>
          </div>

          {/* Error Message if fetch fails */}
          {error && (
            <div className="mt-4 p-3 bg-error/10 text-error rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function NewBriefPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant flex-1 flex items-center justify-center">Loading workspace...</div>}>
      <NewBriefContent />
    </Suspense>
  );
}
