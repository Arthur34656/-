import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { Sparkles, Send, Trash2, ShieldCheck, Scale, AlertTriangle, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AiConsultantProps {
  prefilledMessage?: string;
  onClearPrefill?: () => void;
}

const QUICK_SUGGESTIONS = [
  "Які ножі вважаються холодною зброєю в Україні?",
  "Чи законні газові балончики цивільним?",
  "Що краще обрати для захисту дівчині?",
  "Яка стаття ККУ регулює необхідну оборону?",
  "Чи потрібен дозвіл на тактичний ніж Сапсан?"
];

// Helper to format text with simple markdown-like elements (bold, lists, paragraph breaks)
function formatResponseText(text: string) {
  if (!text) return "";
  
  // Replace bold syntax **text** with HTML bold
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 font-bold">$1</strong>');
  
  // Format bullet items starting with * or - followed by space
  formatted = formatted.replace(/^[*-]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-zinc-300 my-1 font-sans">$1</li>');
  
  // Group li tags into ul tag
  formatted = formatted.replace(/(<li.*?>.*?<\/li>)+/g, '<ul class="my-2 bg-[#1c1c1f]/50 p-3 rounded border border-[#27272a]/30">$1</ul>');

  // Format line breaks into paragraph blocks unless they are inside ul tags
  const paragraphs = formatted.split("\n\n");
  return paragraphs.map((para) => {
    if (para.trim().startsWith("<ul") || para.trim().startsWith("<li")) {
      return para;
    }
    return `<p class="mb-3 leading-relaxed text-zinc-300 font-sans font-normal text-sm text-left">${para}</p>`;
  }).join("");
}

export default function AiConsultant({ prefilledMessage, onClearPrefill }: AiConsultantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Вітаю! Я ваш правовий та тактичний ШІ-консультант «ВАРТА». Я можу надати детальну юридичну довідку щодо законодавства України про межі самооборони (ст. 36 ККУ), роз'яснити методику МВС щодо холодної зброї або допомогти обрати найкраще тактичне спорядження під ваші задачі. Про що ви хотіли б запитати?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle outside prefilled triggers
  useEffect(() => {
    if (prefilledMessage) {
      handleSendMessage(prefilledMessage);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefilledMessage]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorStatus(null);
    setInputValue("");
    
    // Add user message
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Map helper state history
      const serverHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: serverHistory
        })
      });

      if (!res.ok) {
        throw new Error(`Помилка сервера (статус ${res.status})`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: "model", content: data.response }]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err?.message || "Не вдалося з'єднатися із ШІ. Перевірте з'єднання.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "model",
        content: "Історію очищено. Готовий надати нові консультації щодо засобів самооборони та законів України. Чим можу допомогти?"
      }
    ]);
    setErrorStatus(null);
  };

  return (
    <div id="ai-advisor" className="bg-[#121214] border border-[#27272a] rounded-xl flex flex-col h-[580px] overflow-hidden relative">
      {/* Consultant Header */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-zinc-100 flex items-center gap-1.5 text-sm md:text-base leading-tight">
              ШІ-Консультант ВАРТА
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="В мережі" />
            </h3>
            <span className="text-[11px] font-mono text-zinc-500 tracking-wide block">ЮРИДИЧНА ТА ТАКТИЧНА ПІДТРИМКА МВС</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          className="p-2 text-zinc-500 hover:text-rose-400 border border-transparent hover:border-[#27272a]/40 hover:bg-[#1f1f23]/40 rounded-lg transition-all cursor-pointer"
          title="Очистити чат"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Info Warning Bar */}
      <div className="bg-[#18181b]/40 border-b border-[#27272a]/40 px-4 py-2 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 justify-start">
        <Scale className="w-3.5 h-3.5 text-amber-500" />
        <span className="truncate">Консультації надаються на основі Кримінального кодексу України (ст. 36)</span>
      </div>

      {/* Chat Messages Screen */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-[#0d0d0f]">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isModel = msg.role === "model";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isModel ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3.5 text-left border ${
                    isModel
                      ? "bg-[#18181b] border-[#27272a] text-zinc-200"
                      : "bg-amber-500 text-[#09090b] border-amber-600 font-medium"
                  }`}
                >
                  {isModel ? (
                    <div 
                      className="text-sm space-y-2 select-text"
                      dangerouslySetInnerHTML={{ __html: formatResponseText(msg.content) }}
                    />
                  ) : (
                    <p className="text-sm font-sans break-words whitespace-pre-wrap select-text">{msg.content}</p>
                  )}
                  <span className={`text-[9px] font-mono block mt-1.5 text-right ${isModel ? "text-zinc-600" : "text-[#09090b]/60"}`}>
                    {isModel ? "Консультант" : "Ви"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading Bubble */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 max-w-[80%] space-y-1.5 flex flex-col items-start">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-500 mb-1">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>Аналітика законодавства...</span>
              </div>
              <div className="flex gap-1.5 py-1">
                <span className="w-2.5 h-2.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2.5 h-2.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2.5 h-2.5 bg-zinc-600 rounded-full animate-bounce"></span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error placeholder */}
        {errorStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-lg flex items-start gap-2.5 max-w-full text-left"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-rose-300 font-mono font-bold leading-none">Помилка AI-консультації</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {errorStatus}. Спробуйте відправити повідомлення повторно.
              </p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick advice suggestions block */}
      <div className="bg-[#141416]/90 border-t border-[#27272a]/60 px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {QUICK_SUGGESTIONS.map((s, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => handleSendMessage(s)}
            disabled={isLoading}
            className="inline-block border border-[#27272a] hover:border-amber-500/40 bg-[#1c1c1f]/50 hover:bg-amber-500/5 text-zinc-400 hover:text-amber-400 text-xs py-1.5 px-3 rounded-full cursor-pointer transition-all shrink-0 font-sans uppercase tracking-tight"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Form Input area */}
      <div className="p-3 bg-[#18181b] border-t border-[#27272a]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2 bg-[#121214] border border-[#27272a] rounded-lg p-1.5 focus-within:border-amber-500/60 transition-all"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Задайте питання (наприклад: 'Як діє балончик Кобра-1?' або 'Чи є відповідальність за перевищення оборони?')..."
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm text-zinc-200 px-2.5 placeholder-zinc-500 text-left font-sans"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-amber-500 text-[#09090b] hover:bg-amber-400 p-2 rounded transition-colors disabled:opacity-40 disabled:hover:bg-amber-500 cursor-pointer active:scale-95"
            title="Надіслати"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mt-2 font-mono ml-1 justify-start">
          <CornerDownLeft className="w-3 h-3" />
          <span>ШІ-консультант Варта не замінює повноцінного залучення професійного адвоката</span>
        </div>
      </div>
    </div>
  );
}
