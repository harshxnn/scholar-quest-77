import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';

export function ChatContainer({ messages, isLoading }) {
    if (messages.length === 0 && !isLoading) return null;

    return (
        <div className="w-full space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`flex gap-4 p-5 rounded-2xl ${msg.role === 'user'
                        ? 'bg-muted/50 border border-border/30 ml-8'
                        : 'bg-card shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-border/60 mr-8'
                        }`}
                >
                    <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${msg.role === 'user' ? 'bg-secondary' : 'bg-[#B34B60]/10'}`}>
                        {msg.role === 'user' ? <User className="h-5 w-5 text-muted-foreground" /> : <img src="/bot.png" alt="Bot" className="h-6 w-6 object-contain" />}
                    </div>

                    <div className="flex-1 space-y-2 overflow-hidden text-[#1e1e1e]">
                        {msg.role === 'user' ? (
                            <div className="text-[15px] font-medium leading-relaxed">{msg.content}</div>
                        ) : (
                            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-a:text-[#B34B60]">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        )}

                        {/* Display attachments if present on user message */}
                        {msg.files && msg.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {msg.files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-1.5 rounded-lg border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground font-medium">
                                        📎 {file.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex gap-4 p-5 rounded-2xl bg-card shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-border/60 mr-8 animate-pulse">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[#B34B60]/10">
                        <img src="/bot.png" alt="Bot" className="h-6 w-6 object-contain opacity-50" />
                    </div>
                    <div className="flex-1 space-y-3 py-2 text-transparent selection:bg-transparent">
                        <div className="h-4 bg-muted/60 rounded-md w-3/4"></div>
                        <div className="h-4 bg-muted/60 rounded-md w-full"></div>
                        <div className="h-4 bg-muted/60 rounded-md w-5/6"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
