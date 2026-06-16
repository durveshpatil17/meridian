import { useState, useRef, useEffect } from 'react';
import { useMeridian } from '../../context/MeridianContext';
import { supabase } from '../../lib/supabase';
import { IconSend } from '../ui/Icons';

export const AIPanel = () => {
  const { chatMessages, addChatMessage, courses, deliverables, pipelineItems, contentPieces, fetchAll } = useMeridian();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [chatMessages, isTyping]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;
    setInputValue('');
    setIsTyping(true);
    
    // Add user message
    await addChatMessage('user', text);
    
    const messagesPayload = chatMessages.concat({ role: 'user', content: text }).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const meridianState = { courses, deliverables, pipelineItems, contentPieces };

    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { messages: messagesPayload, meridianState }
      });

      if (error) throw error;
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error getting response";
      
      // Look for JSON action block
      const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      let cleanText = responseText;
      let actionExecuted = false;

      if (jsonMatch) {
         try {
           const actionData = JSON.parse(jsonMatch[1]);
           cleanText = cleanText.replace(jsonMatch[0], '').trim();
           cleanText += `\n\n*Done — executed ${actionData.action}*`;
           actionExecuted = true;
         } catch (e) {
           console.error("Action parse error", e);
         }
      }

      await addChatMessage('assistant', cleanText);
      if (actionExecuted) {
        await fetchAll(); // Reload data after action
      }
      
    } catch (err) {
      console.error(err);
      await addChatMessage('assistant', 'Sorry, I encountered an error communicating with the Edge Function.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSend(); };

  return (
    <div style={{ width: 'var(--ai-panel-width)', height: '100vh', borderLeft: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', position: 'fixed', right: 0, top: 0, zIndex: 10 }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-ai)', borderRadius: '50%' }}></div>
        <span style={{ fontWeight: 600 }}>Meridian AI</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {chatMessages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <div className="section-label">Suggestions</div>
            {["What's due this week?", "Add a new assignment", "Suggest what to focus on"].map(chip => (
              <div key={chip} className="card" style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', border: '1px solid var(--border)', backgroundColor: 'var(--bg)' }} onClick={() => handleSend(chip)}>
                {chip}
              </div>
            ))}
          </div>
        )}
        
        {chatMessages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '85%', 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: msg.role === 'user' ? 'var(--accent-ai)' : 'var(--bg)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: '13px',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', padding: '12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
            <span style={{ animation: 'pulse 1.5s infinite 0.2s' }}>●</span>
            <span style={{ animation: 'pulse 1.5s infinite 0.4s' }}>●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="form-input" 
            style={{ flex: 1 }} 
            placeholder="Ask Meridian..." 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn-primary" style={{ padding: '10px' }} onClick={() => handleSend()} disabled={isTyping}>
            <IconSend />
          </button>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
    </div>
  );
};
