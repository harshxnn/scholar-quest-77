import { useState, useEffect, useRef } from "react";
import {
  ArrowUp,
  FileText,
  Globe,
  Paperclip,
  ChevronDown,
  Mic,
  X,
  BarChart2,
  BookOpenCheck,
  Microscope,
  Quote,
  File as FileIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatContainer } from "./ChatContainer";

const HERO_TEXTS = [
  "Uncover deep research insights.",
  "Synthesize literature instantly.",
  "Accelerate your academic discovery.",
  "Map complex citation networks.",
  "Identify critical research gaps."
];

const ADDONS = [
  { id: 'methodology', label: 'Methodology Focus', icon: Microscope },
  { id: 'data', label: 'Data Analysis', icon: BarChart2 },
  { id: 'literature', label: 'Lit Review', icon: BookOpenCheck },
  { id: 'citations', label: 'Citations', icon: Quote },
];

const sources = [
  { icon: FileText, label: "Papers" },
  { icon: Globe, label: "Internet" },
];

export function SearchArea() {
  const [activeSources, setActiveSources] = useState<string[]>(["Papers"]);
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeAddons, setActiveAddons] = useState<string[]>([]);

  // Rotating Text State
  const [heroIndex, setHeroIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Chat History & Loading State
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_TEXTS.length);
    }, 3000); // Rotates every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleSource = (label: string) => {
    setActiveSources((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const toggleAddon = (id: string) => {
    setActiveAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setAttachedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!query.trim() && attachedFiles.length === 0) return;

    const userMessage = {
      role: 'user',
      content: query,
      files: attachedFiles.map(f => ({ name: f.name }))
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery("");

    try {
      const formData = new FormData();
      formData.append('query', userMessage.content);
      formData.append('activeSources', JSON.stringify(activeSources));
      formData.append('activeAddons', JSON.stringify(activeAddons));
      formData.append('advancedOptions', JSON.stringify({ researchArea: '' })); // Can link to state if needed

      attachedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'bot',
        content: data.response || "No response received."
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "An error occurred while connecting to the ScholarAI backend."
      }]);
    } finally {
      setIsLoading(false);
      setAttachedFiles([]);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12">
      {/* Hero */}
      <div className="mb-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[50px] lg:leading-[1.1]">
          <span className="inline-grid w-full items-center justify-items-center">
            {HERO_TEXTS.map((text, i) => (
              <span
                key={text}
                className={`col-start-1 row-start-1 w-full bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${heroIndex === i
                  ? "opacity-100 translate-y-0 blur-none"
                  : "opacity-0 translate-y-4 blur-[3px] pointer-events-none select-none"
                  }`}
              >
                {text}
              </span>
            ))}
          </span>
        </h1>
        <p className="mt-5 text-sm font-medium text-muted-foreground/80 md:text-base">
          Powered by AI to accelerate your academic research
        </p>
      </div>

      {/* Search Container */}
      <div className="group relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04),0_24px_60px_rgba(179,75,96,0.15)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04),0_30px_80px_rgba(179,75,96,0.25)] border border-border/60 hover:border-[#B34B60]/30 focus-within:border-[#B34B60]/50 focus-within:ring-4 focus-within:ring-[#B34B60]/10 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.04),0_30px_80px_rgba(179,75,96,0.25)]">

        {/* Textarea */}
        <div className="relative p-6 pb-2">
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
              {attachedFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-1.5 text-sm shadow-sm backdrop-blur-sm transition-all hover:bg-background/80 hover:shadow-md">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#B34B60]/10">
                    <FileIcon className="h-3.5 w-3.5 text-[#B34B60]" />
                  </div>
                  <span className="max-w-[200px] truncate text-xs font-medium text-foreground">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="ml-1 rounded-full p-1 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Enter your research topic or ask a question..."
            className="min-h-[160px] resize-none border-0 bg-transparent p-0 text-[19px] shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 leading-relaxed caret-[#B34B60] selection:bg-[#B34B60]/20"
            maxLength={2000}
          />
          <div className="absolute bottom-3 right-5 text-[11px] font-medium text-muted-foreground/30 select-none transition-colors group-focus-within:text-muted-foreground/60">
            {query.length} / 2000
          </div>
        </div>

        {/* Add-ons strip */}
        <div className="flex flex-wrap gap-2.5 px-6 pb-5 select-none animate-in fade-in duration-500 delay-150 fill-mode-both">
          {ADDONS.map((addon) => {
            const isActive = activeAddons.includes(addon.id);
            return (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`group/addon flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-300 active:scale-95 ${isActive
                  ? "border-[#B34B60]/30 bg-[#B34B60]/10 text-[#B34B60] shadow-[0_0_15px_rgba(179,75,96,0.15)] ring-1 ring-[#B34B60]/20"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-border hover:shadow-sm"
                  }`}
              >
                <addon.icon className={`h-3.5 w-3.5 transition-all duration-300 ${isActive ? "text-[#B34B60] scale-110" : "text-muted-foreground/70 group-hover/addon:text-foreground/70"}`} />
                <span>{addon.label}</span>
                {isActive && (
                  <div
                    className="ml-0.5 rounded-full p-0.5 hover:bg-[#B34B60]/20 text-[#B34B60]/80 hover:text-[#B34B60] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAddon(addon.id);
                    }}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between border-t border-border/30 bg-gradient-to-b from-transparent to-muted/20 px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            {sources.map((src) => {
              const active = activeSources.includes(src.label);
              return (
                <button
                  key={src.label}
                  onClick={() => toggleSource(src.label)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all active:scale-95 ${active
                    ? "bg-[#B34B60]/10 text-[#B34B60] shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                >
                  <src.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{src.label}</span>
                </button>
              );
            })}
            <div className="mx-2 h-5 w-[1px] bg-border/60 rounded-full" />

            {/* Hidden File Input */}
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <button
              title="Attach File"
              onClick={handleAttachmentClick}
              className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground active:scale-90"
            >
              <Paperclip className="h-[18px] w-[18px]" />
            </button>
            <button title="Voice Input" className="relative rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground active:scale-90 group/mic">
              <Mic className="h-[18px] w-[18px] transition-transform group-hover/mic:scale-110" />
              {/* Subtle pulse indicator for voice */}
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B34B60] opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B34B60]/80"></span>
              </span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleSubmit}
            className="h-10 w-10 text-white rounded-full bg-gradient-to-b from-[#e3566f] to-[#B34B60] p-0 hover:from-[#f05a75] hover:to-[#c45269] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(179,75,96,0.4)] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#B34B60] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:saturate-0"
            disabled={(!query.trim() && attachedFiles.length === 0) || isLoading}
          >
            <ArrowUp className="h-5 w-5" strokeWidth={3} />
          </Button>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="mt-4 flex flex-col items-center w-full">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-95"
        >
          <span>Advanced Options</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Expandable Helper Inputs */}
        <div
          className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? "max-h-[200px] mt-4 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 p-1">
            <div className="space-y-1.5">
              <label className="pl-1 text-xs font-semibold text-muted-foreground">
                Prompt Helper
              </label>
              <Select>
                <SelectTrigger className="h-10 border-border/50 bg-card text-sm shadow-sm transition-colors hover:border-border">
                  <SelectValue placeholder="Select a helper..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="methodology">Methodology Focus</SelectItem>
                  <SelectItem value="literature">Literature Review</SelectItem>
                  <SelectItem value="hypothesis">Hypothesis Testing</SelectItem>
                  <SelectItem value="data">Data Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="pl-1 text-xs font-semibold text-muted-foreground">
                Research Area
              </label>
              <Input
                placeholder="e.g., Machine Learning, Neuroscience..."
                className="h-10 border-border/50 bg-card text-sm shadow-sm transition-colors hover:border-border focus-visible:ring-[#B34B60]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chat History & LLM Responses */}
      <ChatContainer messages={messages} isLoading={isLoading} />
    </div>
  );
}
