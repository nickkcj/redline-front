"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Users, FileText, Calendar, StickyNote, CornerDownLeft, Sparkles, MessageSquare, Loader2, Plus, Mic, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { aiService, ChatMessage } from "@/lib/services/ai.service";
import ReactMarkdown from "react-markdown";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabValue = "search" | "ask";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  breadcrumb: string;
  description: string;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabValue>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Chat state for Ask Vaultly
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Search results state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Active filters state
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filters = [
    { id: "room", label: "Salas", icon: Building2 },
    { id: "document", label: "Documentos", icon: FileText },
    { id: "contact", label: "Contato", icon: Users },
    { id: "interaction", label: "Interação", icon: Calendar },
    { id: "note", label: "Nota", icon: StickyNote }
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
      case "room": return Building2;
      case "document": return FileText;
      case "contact": return Users;
      case "interaction": return Calendar;
      case "note": return StickyNote;
      default: return FileText;
    }
  };

  // Mock search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "room",
          title: "Projeto Alpha",
          breadcrumb: "Salas > Due Diligence",
          description: "23 documentos nesta sala"
        },
        {
          id: "2",
          type: "document",
          title: "Relatório Financeiro Q4.pdf",
          breadcrumb: "Documentos > PDF",
          description: "Tamanho: 2.4 MB"
        },
        {
          id: "3",
          type: "contact",
          title: "João Silva",
          breadcrumb: "Contatos > Investidor",
          description: "CEO da empresa Alpha"
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
      if (activeTab === 'search') {
        handleSearch();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, activeTab]);

  // Handle navigation to results
  const handleNavigateToResult = (result: SearchResult) => {
    onOpenChange(false);
    if (result.type === "room") {
      router.push(`/rooms/${result.id}`);
    } else if (result.type === "document") {
      router.push(`/documents/${result.id}`);
    }
  };

  // Chat functionality
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      id: `msg-${Date.now()}`
    };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      let accumulatedContent = '';

      for await (const chunk of aiService.streamChatCompletions("default", {
        messages: [...messages, userMessage],
        model: "mock-model",
        stream: true,
        temperature: 0.7
      }, "mock")) {
        const content = chunk.choices[0]?.delta.content;
        if (content) {
          accumulatedContent += content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
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
      setActiveTab("search");
      setMessages([]);
      setSearchResults([]);
      setActiveFilters([]);
      setChatInput("");
    }
  }, [open]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If there are search results, navigate to the first one
      if (filteredResults.length > 0) {
        const firstResult = filteredResults[0];
        handleNavigateToResult(firstResult);
      } else {
        // No results - trigger Ask Vaultly
        setActiveTab("ask");

        // Add the search query as the first message
        if (searchQuery.trim()) {
          setChatInput(searchQuery);
          setTimeout(() => sendMessage(searchQuery), 100);
        }
      }
    }
  };

  const handleAskVaultlyClick = async () => {
    setActiveTab("ask");
    if (searchQuery.trim()) {
      setChatInput(searchQuery);
      setTimeout(() => sendMessage(searchQuery), 100);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 w-full max-w-none [&>button]:hidden sm:[&>button]:hidden flex flex-col sm:max-w-[680px] sm:top-16 sm:translate-y-0",
        "data-[state=open]:slide-in-from-top-[48%] data-[state=open]:slide-in-from-left-[50%] data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:slide-out-to-left-[50%]",
        activeTab === "ask"
          ? "h-full sm:h-[600px] max-h-none sm:max-h-[600px]"
          : "h-full max-h-none sm:h-auto sm:max-h-[500px]"
      )}>
        <DialogTitle className="sr-only">
          {activeTab === "search" ? "Search" : "Ask Vaultly"}
        </DialogTitle>

        {/* Header with search and tabs - exactly like the image */}
        <DialogHeader className="px-4 py-3.5 border-b border-border flex-shrink-0 space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search rooms, documents, or ask anything..."
                className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] placeholder:text-gray-500 h-9"
              />
            </div>

            {/* Tabs - exactly styled like image */}
            <div className="flex border border-border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("search")}
                className={cn(
                  "text-[11px] font-medium h-7 px-3.5 rounded-l-[5px] rounded-r-none border-r border-border",
                  activeTab === "search"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Search className="h-3.5 w-3.5 mr-1.5" />
                Search
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("ask")}
                className={cn(
                  "text-[11px] font-medium h-7 px-3.5 rounded-r-[5px] rounded-l-none",
                  activeTab === "ask"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Ask Vaultly
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          {activeTab === "search" ? (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Ask Vaultly Button - exactly like image */}
              <div className="px-4 pt-3.5 pb-2">
                <button
                  onClick={handleAskVaultlyClick}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">V</span>
                      </div>
                    </div>
                    <span className="text-[13px] text-muted-foreground dark:text-gray-300">
                      Ask Vaultly about
                      {searchQuery && (
                        <span className="font-medium text-foreground dark:text-gray-100 ml-1">
                          &quot;{searchQuery}&quot;
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-500">
                    <span className="text-[11px]">Start conversation</span>
                    <CornerDownLeft className="h-3 w-3" />
                  </div>
                </button>
              </div>

              {/* Filters - exactly like image */}
              <div className="px-4 pb-3">
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
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Chat Interface - exactly like image
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    {/* Logo */}
                    <div className="mb-6">
                      <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-bold">V</span>
                        </div>
                      </div>
                    </div>

                    {/* Title and subtitle */}
                    <h2 className="text-[18px] font-normal text-foreground mb-2">
                      Ask Vaultly Anything
                    </h2>
                    <p className="text-[13px] text-muted-foreground">
                      How can I help you today?
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-[13px] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}>
                          {message.role === "assistant" ? (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="prose prose-sm dark:prose-invert">{children}</p>
                              }}
                            >
                              {typeof message.content === 'string' ? message.content : ''}
                            </ReactMarkdown>
                          ) : (
                            typeof message.content === 'string'
                              ? message.content
                              : Array.isArray(message.content)
                                ? message.content.map(c => c.text).join(' ')
                                : ''
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg text-[13px]">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                            <span className="text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input - exactly like image */}
              <div className="p-4 border-t border-border">
                <form onSubmit={handleChatSubmit} className="relative">
                  <div className="border border-border rounded-xl overflow-hidden bg-muted/50">
                    {/* Input area */}
                    <div className="px-4 py-3 bg-muted/50">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about your rooms, documents, or anything else..."
                        className="w-full bg-transparent focus:outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (chatInput.trim()) {
                              sendMessage(chatInput);
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Buttons bar */}
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Mic className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <Button
                        type="submit"
                        disabled={!chatInput.trim() || isLoading}
                        size="sm"
                        className="h-7 w-7 p-0 bg-muted hover:bg-accent text-foreground disabled:bg-muted disabled:text-muted-foreground rounded-md"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}