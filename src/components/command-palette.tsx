"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Users, FileText, Calendar, StickyNote, CornerDownLeft, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  breadcrumb: string;
  description: string;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "App";

  // Search results state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Active filters state
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filters = [
    { id: "organization", label: "Organizations", icon: Building2 },
    { id: "workspace", label: "Workspaces", icon: Users },
    { id: "document", label: "Documents", icon: FileText },
    { id: "chat", label: "Chats", icon: Calendar },
    { id: "note", label: "Notes", icon: StickyNote }
  ];

  // Filter results based on active filters
  const filteredResults = useMemo(() => {
    if (activeFilters.length === 0) return searchResults;

    return searchResults.filter(result =>
      activeFilters.includes(result.type)
    );
  }, [searchResults, activeFilters]);

  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch(type) {
      case "organization": return Building2;
      case "workspace": return Users;
      case "document": return FileText;
      case "chat": return Calendar;
      case "note": return StickyNote;
      default: return FileText;
    }
  };

  // Search function - replace this with actual API call
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Replace with actual API call
      // const results = await searchService.search(searchQuery);

      // Mock search results for demonstration
      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "organization",
          title: "Organization Example",
          breadcrumb: "Organizations",
          description: "Sample organization"
        },
        {
          id: "2",
          type: "workspace",
          title: "Workspace Example",
          breadcrumb: "Workspaces",
          description: "Sample workspace"
        },
        {
          id: "3",
          type: "document",
          title: "Document Example.pdf",
          breadcrumb: "Documents > PDF",
          description: "Size: 2.4 MB"
        }
      ].filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle navigation to results
  const handleNavigateToResult = (result: SearchResult) => {
    onOpenChange(false);

    // TODO: Update routes based on your app structure
    if (result.type === "organization") {
      router.push(`/org/${result.id}`);
    } else if (result.type === "workspace") {
      router.push(`/org/1/workspace/${result.id}`); // Replace with actual org ID
    } else if (result.type === "document") {
      router.push(`/documents/${result.id}`);
    }
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setActiveFilters([]);
    }
  }, [open]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If there are search results, navigate to the first one
      if (filteredResults.length > 0) {
        const firstResult = filteredResults[0];
        handleNavigateToResult(firstResult);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 w-full max-w-none [&>button]:hidden sm:[&>button]:hidden flex flex-col sm:max-w-[680px] sm:top-16 sm:translate-y-0",
        "data-[state=open]:slide-in-from-top-[48%] data-[state=open]:slide-in-from-left-[50%] data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:slide-out-to-left-[50%]",
        "h-full max-h-none sm:h-auto sm:max-h-[500px]"
      )}>
        <DialogTitle className="sr-only">
          Search {appName}
        </DialogTitle>

        {/* Header with search */}
        <DialogHeader className="px-4 py-3.5 border-b border-border flex-shrink-0 space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={`Search ${appName}...`}
                className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] placeholder:text-gray-500 h-9"
              />
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <div className="h-full flex flex-col overflow-hidden">
            {/* Filters */}
            <div className="px-4 py-3">
              <div className="flex gap-2">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.id}
                      variant={activeFilters.includes(filter.id) ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-7 px-3 text-[11px] font-medium rounded-full border",
                        activeFilters.includes(filter.id)
                          ? "bg-muted text-foreground dark:text-white border-foreground/20"
                          : "bg-transparent text-muted-foreground dark:text-white/70 border-border hover:text-foreground dark:hover:text-white hover:bg-muted/50"
                      )}
                      onClick={() => {
                        setActiveFilters(prev =>
                          prev.includes(filter.id)
                            ? prev.filter(f => f !== filter.id)
                            : [...prev, filter.id]
                        );
                      }}
                    >
                      <Icon className="h-3 w-3 mr-1.5" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-muted-foreground dark:text-gray-500" />
                  <span className="text-[12px] text-muted-foreground dark:text-gray-500">Searching...</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredResults.map((result) => {
                    const Icon = getResultIcon(result.type);
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleNavigateToResult(result)}
                        className="w-full p-2.5 rounded-md hover:bg-muted dark:hover:bg-gray-800/40 transition-all duration-150 text-left group"
                      >
                        <div className="space-y-1">
                          <div className="text-[11px] text-muted-foreground dark:text-gray-500 line-clamp-1 min-w-0 flex-shrink">
                            {result.breadcrumb}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
                            <span className="text-[13px] font-medium text-foreground dark:text-gray-200 flex-1">{result.title}</span>
                            <CornerDownLeft className="h-3 w-3 text-muted-foreground/60 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-muted-foreground dark:text-gray-500 line-clamp-1">
                            {result.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {searchQuery && filteredResults.length === 0 && !isSearching && (
                    <div className="text-center py-8">
                      <p className="text-[12px] text-muted-foreground dark:text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                    </div>
                  )}

                  {!searchQuery && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-[13px] text-muted-foreground">Start typing to search...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
