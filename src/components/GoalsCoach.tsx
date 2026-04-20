import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type GoalCategory = "fitness" | "finance" | "health" | "personal";

interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  progress: number;
  target: string;
}

interface SuggestedGoal {
  title: string;
  category: GoalCategory;
  target: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestedGoals?: SuggestedGoal[];
}

interface GoalsCoachProps {
  goals: Goal[];
  onAddGoal: (g: SuggestedGoal) => void;
}

const GoalsCoach = ({ goals, onAddGoal }: GoalsCoachProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your SMART goals coach. Tell me how things are going with your current goals — what's working, what's stuck — and I'll help you refine them or set new ones.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("goals-coach", {
        body: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentGoals: goals,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setMessages(newMessages);
        return;
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply || "...",
          suggestedGoals: data.suggestedGoals?.length ? data.suggestedGoals : undefined,
        },
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't reach the coach. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary hover:from-primary/15 hover:to-accent/15 transition-colors text-sm font-medium"
      >
        <Sparkles size={16} />
        Chat with your AI Goals Coach
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden flex flex-col h-[480px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">SMART Goals Coach</h3>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] space-y-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`px-3 py-2 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
              {m.suggestedGoals?.map((g, gi) => (
                <div key={gi} className="p-3 rounded-lg bg-background border border-primary/30 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{g.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="capitalize">{g.category}</span> · {g.target}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onAddGoal(g);
                        toast.success("Goal added!");
                      }}
                      className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl bg-muted text-muted-foreground text-sm rounded-bl-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="How are you doing on your goals?"
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default GoalsCoach;
