"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [notionToken, setNotionToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      }
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      
      if (data) {
        setApiKey(data.openai_api_key || "");
        setNotionToken(data.notion_token || "");
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000',
          openai_api_key: apiKey,
          notion_token: notionToken,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      alert("Settings saved successfully!");
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.from('briefs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `briefly_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.from('briefs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        alert("No briefs found to export.");
        return;
      }
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(val => {
          if (val === null || val === undefined) return '';
          const s = String(val);
          return s.includes(',') || s.includes('"') || s.includes('\n') 
            ? `"${s.replace(/"/g, '""')}"` 
            : s;
        }).join(',')
      ).join('\n');
      
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `briefly_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 w-full bg-background transition-colors duration-300">
      <DashboardHeader />

      <div className="p-6 md:p-8 lg:px-2xl max-w-4xl mx-auto w-full flex flex-col gap-6 md:gap-8 flex-grow pb-16">
        <div className="mb-4">
          <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Settings</h2>
          <p className="text-base leading-relaxed text-on-surface-variant">Manage your application preferences, API keys, and data exports.</p>
        </div>

        {/* Preferences */}
        <section className="bg-surface border border-outline-variant/30 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">Preferences</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">Appearance and notification settings.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 divide-y divide-outline-variant/20">
            <div className="flex justify-between items-center py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                  <span className="text-base font-semibold text-on-surface">Light Theme</span>
                </div>
                <span className="text-sm text-on-surface-variant">Toggle between dark and light modes.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={theme === "light"} onChange={toggleTheme} />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
              </label>
            </div>

            <div className="flex justify-between items-center py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
                  <span className="text-base font-semibold text-on-surface">Email Notifications</span>
                </div>
                <span className="text-sm text-on-surface-variant">Get notified when briefs are updated.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
              </label>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="bg-surface border border-outline-variant/30 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">API Keys</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">Store your keys for future automated integrations.</p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono font-bold uppercase text-outline">OpenAI API Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="sk-..." 
                className="bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 text-sm font-mono text-on-surface focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono font-bold uppercase text-outline">Notion Integration Token</label>
              <input 
                type="text" 
                value={notionToken} 
                onChange={(e) => setNotionToken(e.target.value)} 
                placeholder="secret_..." 
                className="bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 text-sm font-mono text-on-surface focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="flex justify-end">
              <button onClick={handleSaveSettings} disabled={isSaving} className="px-8 py-3 bg-primary text-on-primary rounded-lg text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-primary/20">
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-surface border border-outline-variant/30 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">database</span>
            <h3 className="text-xl font-bold tracking-tight text-on-surface">Data Management</h3>
          </div>
          <p className="text-sm text-on-surface-variant">Download your brief history in JSON or CSV format.</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleExportCSV} disabled={isExporting} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/30 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">table_view</span>
              Export as CSV
            </button>
            <button onClick={handleExportJSON} disabled={isExporting} className="px-6 py-3 bg-surface-container-highest border border-outline-variant/30 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">data_object</span>
              Export as JSON
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
