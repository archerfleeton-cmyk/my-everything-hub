import { useState } from "react";
import { BookOpen, Layers, HelpCircle, Sparkles, ChevronLeft, RotateCw, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type ToolType = "study-guide" | "flashcards" | "quiz";
type StudyView = "select" | "generate" | "result";

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const toolOptions: { id: ToolType; label: string; description: string; icon: React.ElementType }[] = [
  { id: "study-guide", label: "Study Guide", description: "Comprehensive overview with key concepts", icon: BookOpen },
  { id: "flashcards", label: "Flashcards", description: "Term & definition cards to drill", icon: Layers },
  { id: "quiz", label: "Quiz", description: "Multiple choice questions to test yourself", icon: HelpCircle },
];

const StudyTools = () => {
  const [view, setView] = useState<StudyView>("select");
  const [toolType, setToolType] = useState<ToolType>("study-guide");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Results
  const [studyGuideContent, setStudyGuideContent] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Flashcard state
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const generate = async () => {
    if (!subject.trim() || !topic.trim()) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("study-tools", {
        body: { subject, topic, type: toolType, numQuestions: 10 },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const content = data.content;

      if (toolType === "study-guide") {
        setStudyGuideContent(content);
      } else if (toolType === "flashcards") {
        const parsed = typeof content === "string" ? JSON.parse(content) : content;
        const cards = Array.isArray(parsed) ? parsed : parsed.flashcards || parsed.cards || [];
        setFlashcards(cards);
        setCurrentCard(0);
        setFlipped(false);
      } else if (toolType === "quiz") {
        const parsed = typeof content === "string" ? JSON.parse(content) : content;
        const questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.quiz || [];
        setQuizQuestions(questions);
        setSelectedAnswers({});
        setQuizSubmitted(false);
      }

      setView("result");
    } catch (e: any) {
      setError(e.message || "Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quizScore = quizSubmitted
    ? quizQuestions.filter((q, i) => selectedAnswers[i] === q.correctIndex).length
    : 0;

  if (view === "select") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Study Tools</h2>
          <p className="text-muted-foreground text-sm mt-1">AI-powered study materials for your classes</p>
        </div>

        <div className="grid gap-3">
          {toolOptions.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setToolType(tool.id);
                  setView("generate");
                }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{tool.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === "generate") {
    const selectedTool = toolOptions.find((t) => t.id === toolType)!;
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => setView("select")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <selectedTool.icon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-serif text-foreground">Generate {selectedTool.label}</h2>
            <p className="text-xs text-muted-foreground">{selectedTool.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Subject (e.g. Biology, History, Math)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Topic (e.g. Cellular Respiration, World War II, Quadratic Equations)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={generate}
            disabled={loading || !subject.trim() || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate {selectedTool.label}
              </>
            )}
          </button>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
      </div>
    );
  }

  // Result views
  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => setView("generate")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={16} />
        Generate another
      </button>

      {/* Study Guide */}
      {toolType === "study-guide" && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-card border border-border rounded-xl p-5 overflow-auto max-h-[70vh]">
            <ReactMarkdown>{studyGuideContent}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Flashcards */}
      {toolType === "flashcards" && flashcards.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Card {currentCard + 1} of {flashcards.length}
          </p>
          <button
            onClick={() => setFlipped(!flipped)}
            className="w-full min-h-[200px] p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex items-center justify-center text-center cursor-pointer"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-2">{flipped ? "Answer" : "Question"}</p>
              <p className="text-lg font-medium text-foreground">
                {flipped ? flashcards[currentCard].back : flashcards[currentCard].front}
              </p>
            </div>
          </button>
          <p className="text-xs text-center text-muted-foreground">Tap to flip</p>
          <div className="flex gap-2">
            <button
              disabled={currentCard === 0}
              onClick={() => { setCurrentCard(currentCard - 1); setFlipped(false); }}
              className="flex-1 py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              Previous
            </button>
            <button
              disabled={currentCard === flashcards.length - 1}
              onClick={() => { setCurrentCard(currentCard + 1); setFlipped(false); }}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {toolType === "quiz" && quizQuestions.length > 0 && (
        <div className="space-y-4 max-h-[70vh] overflow-auto">
          {quizSubmitted && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-lg font-serif text-foreground">
                Score: {quizScore}/{quizQuestions.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {quizScore === quizQuestions.length ? "Perfect! 🎉" : quizScore >= quizQuestions.length * 0.7 ? "Great job! 💪" : "Keep studying! 📚"}
              </p>
            </div>
          )}

          {quizQuestions.map((q, qi) => (
            <div key={qi} className="p-4 rounded-xl bg-card border border-border space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isSelected = selectedAnswers[qi] === oi;
                  const isCorrect = oi === q.correctIndex;
                  let optionStyle = "bg-muted/50 hover:bg-muted text-foreground";
                  if (quizSubmitted) {
                    if (isCorrect) optionStyle = "bg-success/15 text-foreground ring-1 ring-success/40";
                    else if (isSelected && !isCorrect) optionStyle = "bg-destructive/15 text-foreground ring-1 ring-destructive/40";
                  } else if (isSelected) {
                    optionStyle = "bg-primary/15 text-foreground ring-1 ring-primary/40";
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => !quizSubmitted && setSelectedAnswers({ ...selectedAnswers, [qi]: oi })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${optionStyle}`}
                    >
                      {quizSubmitted && isCorrect && <Check size={14} className="text-success shrink-0" />}
                      {quizSubmitted && isSelected && !isCorrect && <X size={14} className="text-destructive shrink-0" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!quizSubmitted && (
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Submit Quiz ({Object.keys(selectedAnswers).length}/{quizQuestions.length} answered)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyTools;
