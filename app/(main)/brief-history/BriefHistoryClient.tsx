"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Brief } from "@/lib/types";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";

export default function BriefHistoryClient({ initialBriefs }: { initialBriefs: Brief[] }) {
  const [briefs, setBriefs] = useState<Brief[]>(initialBriefs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [briefToDelete, setBriefToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAndSortedBriefs = useMemo(() => {
    let result = [...briefs];
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        (b.title?.toLowerCase() || "").includes(q) || 
        (b.client_name?.toLowerCase() || "").includes(q)
      );
    }
    
    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter(b => b.status === statusFilter);
    }
    
    // Sort
    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [briefs, searchQuery, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBriefs.length / itemsPerPage));
  const paginatedBriefs = filteredAndSortedBriefs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteClick = (id: string) => {
    setBriefToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!briefToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/brief/${briefToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setBriefs(prev => prev.filter(b => b.id !== briefToDelete));
        setDeleteModalOpen(false);
        setBriefToDelete(null);
        if (paginatedBriefs.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePin = async (id: string, currentPinStatus: boolean) => {
    const newStatus = !currentPinStatus;
    setBriefs(prev => prev.map(b => b.id === id ? { ...b, is_pinned: newStatus } : b));
    try {
      await fetch(`/api/brief/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: newStatus })
      });
    } catch (e) {
      setBriefs(prev => prev.map(b => b.id === id ? { ...b, is_pinned: currentPinStatus } : b));
      console.error(e);
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
    <main className="flex-1 flex flex-col min-w-0 w-full relative">
      <DashboardHeader />

      {/* Page Header */}
      <div className="px-4 md:px-8 py-6 md:py-10 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface">Brief History</h2>
            <p className="text-base leading-relaxed text-on-surface-variant mt-2">Review, manage, and resume your past AI intakes.</p>
          </div>
          
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mt-4 md:mt-0 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg py-2 pl-10 pr-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="Search projects or clients..." 
                type="text"
              />
            </div>
            {/* Filter/Sort Group */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full flex items-center justify-center gap-1 px-4 py-2 pl-8 pr-8 bg-surface border border-outline-variant/50 rounded-lg text-sm text-on-surface hover:border-outline-variant transition-colors outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="changes_requested">Changes Requested</option>
                </select>
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">filter_list</span>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
              <button 
                onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-surface border border-outline-variant/50 rounded-lg text-sm text-on-surface hover:border-outline-variant transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">{sortOrder === 'newest' ? 'arrow_downward' : 'arrow_upward'}</span>
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Canvas */}
      <div className="flex-1 p-4 md:p-8 bg-surface-dim flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1">
          {/* Data Table */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container/50 border-b border-outline-variant/20 text-xs font-mono font-medium tracking-wide uppercase text-on-surface-variant uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Project Name</th>
                    <th className="px-6 py-4 font-medium">Client</th>
                    <th className="px-6 py-4 font-medium">Date Created</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm leading-relaxed text-on-surface divide-y divide-outline-variant/10">
                  {paginatedBriefs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                        No briefs found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedBriefs.map((brief: any) => (
                      <tr key={brief.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                        <td className="px-6 py-4 font-medium">
                          <Link href={brief.status === 'draft' ? `/new-brief?id=${brief.id}` : `/brief/${brief.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                            {brief.title || "Untitled Project"}
                            {brief.status === 'draft' && <span className="material-symbols-outlined text-[14px] text-tertiary" title="Resume Draft">edit_note</span>}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{brief.client_name || "N/A"}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{new Date(brief.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${getStatusStyles(brief.status)}`}>
                            {formatStatus(brief.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            <button 
                              onClick={() => togglePin(brief.id, !!brief.is_pinned)}
                              className={`p-1 rounded-full transition-colors ${brief.is_pinned ? 'text-primary opacity-100 hover:bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100'}`}
                              title={brief.is_pinned ? "Unpin" : "Pin"}
                            >
                              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: brief.is_pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(brief.id)}
                              className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors opacity-0 group-hover:opacity-100" 
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredAndSortedBriefs.length > 0 && (
              <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-between items-center text-on-surface-variant text-sm bg-surface-container/30">
                <span>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedBriefs.length)} of {filteredAndSortedBriefs.length} briefs</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-high rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-outline-variant/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-error mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">Delete Brief?</h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              This action cannot be undone. This brief will be permanently removed from your history.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-error text-on-error hover:brightness-110 transition-all shadow-md shadow-error/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
