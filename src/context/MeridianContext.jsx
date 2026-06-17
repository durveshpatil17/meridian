import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const MeridianContext = createContext({});

export const MeridianProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [pipelineItems, setPipelineItems] = useState([]);
  const [contentPieces, setContentPieces] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAll();
      const docSub = supabase.channel('documents_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `user_id=eq.${user.id}` }, payload => {
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => prev.filter(d => d.id !== payload.old.id));
          }
        }).subscribe();
      return () => { supabase.removeChannel(docSub); };
    } else {
      setCourses([]); setDeliverables([]); setPipelineItems([]); setContentPieces([]); setChatMessages([]); setDocuments([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [
        { data: cData, error: cErr },
        { data: dData, error: dErr },
        { data: pData, error: pErr },
        { data: ctData, error: ctErr },
        { data: docData, error: docErr }
      ] = await Promise.all([
        supabase.from('courses').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('deliverables').select('*').eq('user_id', user.id),
        supabase.from('pipeline_items').select('*').eq('user_id', user.id),
        supabase.from('content_pieces').select('*').eq('user_id', user.id),
        supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (cErr) throw cErr; if (dErr) throw dErr; if (pErr) throw pErr; if (ctErr) throw ctErr; if (docErr) throw docErr;

      setCourses(cData || []); setDeliverables(dData || []); setPipelineItems(pData || []); setContentPieces(ctData || []); setDocuments(docData || []);
      await fetchChatHistory();
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    const { data, error } = await supabase.from('chat_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (error) setError('Failed to fetch chat history');
    else setChatMessages((data || []).reverse());
  };

  // --- Deliverables CRUD ---
  const addDeliverable = async (data) => {
    const tempId = crypto.randomUUID(); const newItem = { id: tempId, user_id: user.id, ...data };
    setDeliverables(prev => [...prev, newItem]);
    const { data: inserted, error: err } = await supabase.from('deliverables').insert([newItem]).select().single();
    if (err) { setError('Failed to add deliverable'); setDeliverables(prev => prev.filter(d => d.id !== tempId)); }
    else { setDeliverables(prev => prev.map(d => d.id === tempId ? inserted : d)); }
  };
  const updateDeliverable = async (id, data) => {
    const prevItems = [...deliverables]; setDeliverables(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    const { error: err } = await supabase.from('deliverables').update(data).eq('id', id).eq('user_id', user.id);
    if (err) { setError('Failed to update deliverable'); setDeliverables(prevItems); }
  };
  const deleteDeliverable = async (id) => {
    const prevItems = [...deliverables]; setDeliverables(prev => prev.filter(d => d.id !== id));
    const { error: err } = await supabase.from('deliverables').delete().eq('id', id).eq('user_id', user.id);
    if (err) { setError('Failed to delete deliverable'); setDeliverables(prevItems); }
  };
  const cycleDeliverableStatus = async (id) => {
    const item = deliverables.find(d => d.id === id); if (!item) return;
    const nextStatus = { 'not_started': 'in_progress', 'in_progress': 'submitted', 'submitted': 'not_started' }[item.status] || 'not_started';
    await updateDeliverable(id, { status: nextStatus });
  };

  // --- Pipeline CRUD ---
  const addPipelineItem = async (data) => {
    const tempId = crypto.randomUUID(); const newItem = { id: tempId, user_id: user.id, ...data };
    setPipelineItems(prev => [...prev, newItem]);
    const { data: inserted, error: err } = await supabase.from('pipeline_items').insert([newItem]).select().single();
    if (err) { setError('Failed to add pipeline item'); setPipelineItems(prev => prev.filter(p => p.id !== tempId)); }
    else { setPipelineItems(prev => prev.map(p => p.id === tempId ? inserted : p)); }
  };
  const updatePipelineItem = async (id, data) => {
    const prevItems = [...pipelineItems]; setPipelineItems(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    const { error: err } = await supabase.from('pipeline_items').update(data).eq('id', id).eq('user_id', user.id);
    if (err) { setError('Failed to update pipeline item'); setPipelineItems(prevItems); }
  };
  const deletePipelineItem = async (id) => {
    const prevItems = [...pipelineItems]; setPipelineItems(prev => prev.filter(p => p.id !== id));
    const { error: err } = await supabase.from('pipeline_items').delete().eq('id', id).eq('user_id', user.id);
    if (err) { setError('Failed to delete pipeline item'); setPipelineItems(prevItems); }
  };

  // --- Content CRUD ---
  const addContentPiece = async (data) => {
    const tempId = crypto.randomUUID(); const newItem = { id: tempId, user_id: user.id, ...data };
    setContentPieces(prev => [...prev, newItem]);
    const { data: inserted, error: err } = await supabase.from('content_pieces').insert([newItem]).select().single();
    if (err) { setError('Failed to add content piece'); setContentPieces(prev => prev.filter(c => c.id !== tempId)); }
    else { setContentPieces(prev => prev.map(c => c.id === tempId ? inserted : c)); }
  };
  const updateContentPiece = async (id, data) => {
    const prevItems = [...contentPieces]; setContentPieces(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    const { error: err } = await supabase.from('content_pieces').update(data).eq('id', id).eq('user_id', user.id);
    if (err) { setError('Failed to update content piece'); setContentPieces(prevItems); }
  };
  const deleteContentPiece = async (id) => {
    const prevItems = [...contentPieces]; setContentPieces(prev => prev.filter(c => c.id !== id));
    const { error: err } = await supabase.from('content_pieces').delete().eq('id', id).eq('user_id', user.id);
    if (err) { setError('Failed to delete content piece'); setContentPieces(prevItems); }
  };

  // --- Chat ---
  const addChatMessage = async (role, content) => {
    const tempId = crypto.randomUUID(); const newMessage = { id: tempId, user_id: user.id, role, content, created_at: new Date().toISOString() };
    setChatMessages(prev => [...prev, newMessage]);
    const { data: inserted, error: err } = await supabase.from('chat_messages').insert([newMessage]).select().single();
    if (err) { setError('Failed to add chat message'); }
    else { setChatMessages(prev => prev.map(m => m.id === tempId ? inserted : m)); }
  };

  // --- Derived Values ---
  const now = new Date(); const nextWeek = new Date(now.getTime() + 7 * 86400000);
  const deliverablesDueThisWeek = deliverables.filter(d => d.status !== 'submitted' && d.due_date && new Date(d.due_date) <= nextWeek);
  const activePipelineCount = pipelineItems.filter(p => p.stage !== 'closed').length;
  const contentInDraftCount = contentPieces.filter(c => c.stage === 'draft' || c.stage === 'review').length;
  const awaitingReviewCount = documents.filter(d => d.status === 'extracted').length;

  const thisWeekItems = [
    ...deliverablesDueThisWeek.map(d => ({ ...d, engine: 'Academics', sortDate: new Date(d.due_date), displayDate: d.due_date, badgeText: d.status.replace('_', ' '), accentClass: 'var(--accent-academics)' })),
    ...pipelineItems.filter(p => p.stage !== 'closed' && p.next_action_date && new Date(p.next_action_date) <= nextWeek).map(p => ({ ...p, title: `${p.company} - ${p.role}`, engine: 'Pipeline', sortDate: new Date(p.next_action_date), displayDate: p.next_action_date, badgeText: p.stage.replace('_', ' '), accentClass: 'var(--accent-pipeline)' })),
    ...contentPieces.filter(c => c.stage !== 'published' && c.target_date && new Date(c.target_date) <= nextWeek).map(c => ({ ...c, engine: 'Content', sortDate: new Date(c.target_date), displayDate: c.target_date, badgeText: c.stage.replace('_', ' '), accentClass: 'var(--accent-content)' }))
  ].sort((a, b) => a.sortDate - b.sortDate);

  const value = {
    courses, deliverables, pipelineItems, contentPieces, chatMessages, documents,
    loading, error, fetchAll, fetchChatHistory,
    addDeliverable, updateDeliverable, deleteDeliverable, cycleDeliverableStatus,
    addPipelineItem, updatePipelineItem, deletePipelineItem,
    addContentPiece, updateContentPiece, deleteContentPiece,
    addChatMessage,
    deliverablesDueThisWeek, activePipelineCount, contentInDraftCount, awaitingReviewCount, thisWeekItems
  };

  return <MeridianContext.Provider value={value}>{children}</MeridianContext.Provider>;
};

export const useMeridian = () => useContext(MeridianContext);
