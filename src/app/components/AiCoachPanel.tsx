import { useState, useRef, useEffect } from 'react';
import type { Quest } from '../types/database';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

Keep responses concise (2-4 sentences max), practical, and encouraging. Focus on the Philippines context when relevant. Use simple language. Add a relevant emoji occasionally.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          max_tokens: 300,
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
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden sticky top-16 flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-[#1a3a2a] px-4 py-3">
        <p className="text-white text-sm font-semibold">🌿 Environmental Coach</p>
        <p className="text-green-300 text-xs">AI-powered · Powered by Groq</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1a3a2a] text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-3 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '100ms' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '200ms' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach..."
          className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="bg-[#1a3a2a] text-white text-xs px-3 py-2 rounded-xl hover:bg-green-900 transition disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AiCoachPanel;
