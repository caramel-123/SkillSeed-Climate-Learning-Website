import { useState, useRef, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import type { Quest } from '../types/database';

/** Styled Markdown for coach replies only (user text stays plain for safety). */
const coachMarkdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic opacity-95">{children}</em>,
  ul: ({ children }) => <ul className="my-2 ml-1 list-disc space-y-1 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 ml-1 list-decimal space-y-1 pl-4">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <p className="mb-2 font-semibold text-[0.95em]">{children}</p>,
  h2: ({ children }) => <p className="mb-2 font-semibold text-[0.95em]">{children}</p>,
  h3: ({ children }) => <p className="mb-1.5 font-semibold">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[#2F8F6B] dark:text-[#6DD4A8] underline underline-offset-2 break-all"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const inline = !className;
    return inline ? (
      <code className="rounded bg-black/[0.08] dark:bg-white/10 px-1 py-0.5 text-[0.9em] font-mono">
        {children}
      </code>
    ) : (
      <code className={className}>{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-black/[0.06] dark:bg-white/10 p-2.5 text-xs leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#2F8F6B]/50 pl-3 my-2 text-muted-foreground dark:text-emerald-100/75">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border dark:border-[#1E3B34]" />,
};

function AssistantMessageBody({ content }: { content: string }) {
  return (
    <div className="break-words [&_.coach-md>*:first-child]:mt-0 [&_.coach-md>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={coachMarkdownComponents} className="coach-md">
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiCoachPanelProps {
  quest: Quest;
}

export function AiCoachPanel({ quest }: AiCoachPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your environmental coach for the **${quest.title}** quest. Ask me anything about the steps, materials, or environmental impact. I'm here to help! 🌱`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll only the chat column — scrollIntoView() on inner nodes scrolls the page too.
  useLayoutEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!apiKey) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'AI coach is not configured. Please add VITE_GROQ_API_KEY to your environment variables.'
          }
        ]);
        setLoading(false);
        return;
      }

      const stepsText = quest.steps
        ?.map(s => `Step ${s.step}: ${s.title} - ${s.instruction}`)
        .join('\n') ?? '';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an encouraging environmental coach helping a user complete the "${quest.title}" quest on SkillSeed, a climate learning platform.

The quest description: ${quest.description}

The steps involved:
${stepsText}

Formatting (always follow): reply in GitHub-flavored Markdown. Use **bold** for key terms and step titles. For multiple steps or tips, use a numbered list (1. one per line) or bullet lists (- item). Use short paragraphs (1–3 sentences). Avoid one huge paragraph.

Tone: concise, practical, encouraging. Philippines context when relevant. Simple language. At most one emoji at the end when it fits naturally.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content ??
        'Sorry, I could not respond right now.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Try again in a moment!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-[#132B23] border border-border dark:border-[#1E3B34] rounded-xl overflow-hidden lg:sticky lg:top-24 flex flex-col h-[min(60dvh,28rem)] min-h-[17.5rem] lg:h-[560px] lg:min-h-0 shadow-sm">
      {/* Header */}
      <div className="bg-[#0F3D2E] px-4 py-3">
        <p className="text-white text-sm font-bold">Environmental Coach</p>
        <p className="text-[#6DD4A8] text-xs">AI-powered</p>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 bg-muted/30 dark:bg-[#0D1F18]"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0F3D2E] text-white rounded-br-sm'
                  : 'bg-white dark:bg-[#132B23] text-card-foreground rounded-bl-sm border border-border dark:border-[#1E3B34]'
              }`}
            >
              {msg.role === 'assistant' ? (
                <AssistantMessageBody content={msg.content} />
              ) : (
                <span className="whitespace-pre-wrap break-words">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#132B23] rounded-xl rounded-bl-sm px-4 py-3 border border-border dark:border-[#1E3B34]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#2F8F6B] dark:bg-[#6DD4A8] rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-[#2F8F6B] dark:bg-[#6DD4A8] rounded-full animate-bounce"
                  style={{ animationDelay: '100ms' }}
                />
                <div
                  className="w-2 h-2 bg-[#2F8F6B] dark:bg-[#6DD4A8] rounded-full animate-bounce"
                  style={{ animationDelay: '200ms' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border dark:border-[#1E3B34] flex flex-col gap-2 sm:flex-row sm:items-stretch bg-white dark:bg-[#132B23] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach..."
          className="flex-1 min-w-0 text-base sm:text-sm border border-border dark:border-[#1E3B34] bg-input-background dark:bg-[#0D1F18] rounded-lg px-3 py-3 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="min-h-[48px] shrink-0 w-full sm:w-auto bg-[#0F3D2E] dark:bg-[#2F8F6B] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#2F8F6B] dark:hover:bg-[#6DD4A8] dark:hover:text-[#0A2E20] transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AiCoachPanel;
