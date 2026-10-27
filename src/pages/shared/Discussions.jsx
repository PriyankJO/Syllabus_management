import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addDiscussion, addReply } from '../../store/slices/discussionSlice';
import Modal from '../../components/common/Modal';
import { MessageSquare, Plus, Send } from 'lucide-react';

const Discussions = () => {
  const { discussions } = useSelector(state => state.discussions);
  const { subjects } = useSelector(state => state.subjects);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ subjectId: '', title: '', description: '' });
  const [replyText, setReplyText] = useState('');
  const [activeThreadId, setActiveThreadId] = useState(null);

  const activeThread = discussions.find(d => (d._id || d.id) === activeThreadId) || null;

  const handleCreate = (e) => {
    e.preventDefault();
    const discussion = {
      ...newDiscussion
    };
    dispatch(addDiscussion(discussion));
    setIsModalOpen(false);
    setNewDiscussion({ subjectId: '', title: '', description: '' });
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    dispatch(addReply({
      id: activeThread._id || activeThread.id,
      message: replyText
    }));
    setReplyText('');
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Discussion Forums</h3>
          <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            <Plus size={16} /> New Topic
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {discussions.map(d => (
            <div 
              key={d._id || d.id} 
              onClick={() => setActiveThreadId(d._id || d.id)}
              style={{ 
                padding: '15px', 
                borderBottom: '1px solid var(--color-border)', 
                cursor: 'pointer',
                backgroundColor: (activeThread?._id || activeThread?.id) === (d._id || d.id) ? 'var(--color-bg)' : 'transparent'
              }}
            >
              <h4 style={{ margin: '0 0 5px 0' }}>{d.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span>{d.createdBy?.name || d.createdByName}</span>
                <span>{d.replies?.length || 0} replies</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {activeThread ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)' }}>{activeThread.title}</h3>
              <p style={{ margin: '0 0 15px 0' }}>{activeThread.description}</p>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Started by {activeThread.createdBy?.name || activeThread.createdByName} on {new Date(activeThread.createdAt || activeThread.createdDate).toLocaleDateString()}
              </div>
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: 'var(--color-bg)' }}>
              {activeThread.replies?.length > 0 ? activeThread.replies.map(r => (
                <div key={r._id || r.id} style={{ backgroundColor: 'var(--color-surface)', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <p style={{ margin: '0 0 10px 0' }}>{r.message || r.text}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                    {r.createdBy?.name || r.by} • {new Date(r.date || r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '20px' }}>No replies yet. Start the conversation!</div>
              )}
            </div>
            
            <form onSubmit={handleReply} style={{ padding: '15px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                placeholder="Type your reply..." 
                style={{ flex: 1, padding: '12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} 
              />
              <button type="submit" style={{ padding: '12px 20px', backgroundColor: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} /> Reply
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
            <p>Select a discussion thread to view details</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Discussion Topic">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
             <label>Subject</label>
             <select required value={newDiscussion.subjectId} onChange={e => setNewDiscussion({...newDiscussion, subjectId: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
               <option value="">Select Subject</option>
               {subjects.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
             </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Title</label>
            <input required type="text" value={newDiscussion.title} onChange={e => setNewDiscussion({...newDiscussion, title: e.target.value})} style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Description</label>
            <textarea required value={newDiscussion.description} onChange={e => setNewDiscussion({...newDiscussion, description: e.target.value})} style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px', minHeight: '100px' }}></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create Topic</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Discussions;
