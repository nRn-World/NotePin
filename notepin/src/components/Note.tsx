import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Trash, GripHorizontal, Check, Edit2, X, Cloud, Minimize2 } from 'lucide-react';

export interface NoteData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  timestamp: number;
  url: string;
  urlTitle: string;
  selector?: string;
  offsetX?: number;
  offsetY?: number;
  containerSelector?: string;
  containerX?: number;
  containerY?: number;
  anchorTag?: string;
  anchorText?: string;
  isMinimized?: boolean;
}

export interface NoteProps {
  note: NoteData;
  onUpdate: (id: string, updates: Partial<NoteData>) => void;
  onDelete: (id: string) => void;
  onFocus: () => void;
  t: any;
  className?: string;
}

export const Note: React.FC<NoteProps> = ({ note, onUpdate, onDelete, onFocus, t, className }) => {
  const [isEditing, setIsEditing] = useState(!note.content);
  const [content, setContent] = useState(note.content);
  const noteRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  
  const latestNoteRef = useRef(note);
  const latestOnUpdateRef = useRef(onUpdate);
  const latestOnFocusRef = useRef(onFocus);
  useEffect(() => { latestNoteRef.current = note; }, [note]);
  useEffect(() => { latestOnUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { latestOnFocusRef.current = onFocus; }, [onFocus]);

  const dragStateRef = useRef<{
    active: boolean;
    startPointerX: number;
    startPointerY: number;
    startNoteX: number;
    startNoteY: number;
  }>({
    active: false,
    startPointerX: 0,
    startPointerY: 0,
    startNoteX: 0,
    startNoteY: 0,
  });
  
  // Handle clicking outside to save
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isEditing && noteRef.current && !noteRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, content]);

  useEffect(() => {
    const onDragMove = (e: MouseEvent) => {
      const state = dragStateRef.current;
      if (!state.active) return;
      const dx = (e.clientX + window.scrollX) - state.startPointerX;
      const dy = (e.clientY + window.scrollY) - state.startPointerY;
      latestOnUpdateRef.current(latestNoteRef.current.id, {
        x: state.startNoteX + dx,
        y: state.startNoteY + dy,
      });
    };
    const onDragUp = () => {
      dragStateRef.current.active = false;
      document.removeEventListener('mousemove', onDragMove, true);
      document.removeEventListener('mouseup', onDragUp, true);
    };
    const onHeaderDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      latestOnFocusRef.current();
      const n = latestNoteRef.current;
      dragStateRef.current = {
        active: true,
        startPointerX: e.clientX + window.scrollX,
        startPointerY: e.clientY + window.scrollY,
        startNoteX: n.x,
        startNoteY: n.y,
      };
      document.addEventListener('mousemove', onDragMove, true);
      document.addEventListener('mouseup', onDragUp, true);
    };
    (window as any)[`__notepin_hd_${note.id}`] = onHeaderDown;
    return () => {
      document.removeEventListener('mousemove', onDragMove, true);
      document.removeEventListener('mouseup', onDragUp, true);
      try { delete (window as any)[`__notepin_hd_${note.id}`]; } catch {}
    };
  }, [note.id]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    const fn = (window as any)[`__notepin_hd_${note.id}`];
    if (fn) fn(e.nativeEvent);
  };

  // Resizing logic
  useEffect(() => {
    const minWidth = 160;
    const minHeight = 100;
    let startX: number;
    let startY: number;
    let startWidth: number;
    let startHeight: number;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = note.width;
      startHeight = note.height;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(minWidth, startWidth + (e.clientX - startX));
      const newHeight = Math.max(minHeight, startHeight + (e.clientY - startY));
      onUpdate(note.id, { width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const resizer = resizeRef.current;
    if (resizer) {
      resizer.addEventListener('mousedown', onMouseDown);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (resizer) {
        resizer.removeEventListener('mousedown', onMouseDown);
      }
    };
  }, [note.id, note.width, note.height, onUpdate]);

  const handleSave = () => {
    onUpdate(note.id, { content });
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={noteRef}
      onPointerDown={onFocus}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      style={{ 
        left: note.x, 
        top: note.y, 
        width: note.isMinimized ? 220 : note.width,
        height: note.isMinimized ? 40 : note.height,
        position: 'absolute' 
      }}
      className={`z-50 ${className || ''}`}
    >
      <div 
        className="group relative flex flex-col w-full h-full backdrop-blur-xl border-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden transition-all duration-200"
        style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
          borderColor: note.color,
        }}
      >
        {/* Header/Grab Handle */}
        <div 
          onMouseDown={handleHeaderMouseDown}
          className="flex items-center justify-between px-3 py-2 bg-white/5 cursor-move border-b border-white/5 shrink-0 select-none"
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <GripHorizontal size={14} className="text-white/40 shrink-0" />
            {note.isMinimized && (
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
                  style={{ backgroundColor: note.color, boxShadow: `0 0 10px ${note.color}` }} 
                />
                <span className="text-[11px] text-white font-black truncate tracking-tight uppercase leading-none">
                  {note.content.substring(0, 25) || note.urlTitle.substring(0, 25) || 'ANTECKNING'}
                </span>
              </div>
            )}
          </div>
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 shrink-0"
          >
            {!note.isMinimized && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
              >
                <Edit2 size={12} />
              </button>
            )}
            <button 
              onClick={() => onUpdate(note.id, { isMinimized: !note.isMinimized })}
              className="p-1 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
              title={note.isMinimized ? "Maximera" : "Minimera"}
            >
              <Minimize2 size={12} className={note.isMinimized ? "rotate-180" : ""} />
            </button>
            <button 
              onClick={() => onDelete(note.id)}
              className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
            >
              <Trash size={12} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!note.isMinimized && (
          <div 
            className="flex-1 p-4 overflow-hidden cursor-text"
            onClick={() => !isEditing && setIsEditing(true)}
          >
            {isEditing ? (
              <div className="relative h-full">
                <textarea
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full bg-transparent outline-none resize-none text-sm font-sans text-white leading-relaxed placeholder:text-white/30"
                  placeholder={t.placeholder}
                />
                <div className="absolute bottom-0 right-0 flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSave(); }}
                    className="p-1 bg-white/20 text-white rounded shadow-sm hover:bg-white/30 transition-colors border border-white/10"
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-sans text-white/90 leading-relaxed whitespace-pre-wrap break-words h-full overflow-y-auto custom-scrollbar">
                {note.content || <span className="italic text-white/30">{t.emptyNote}</span>}
              </p>
            )}
          </div>
        )}

        {/* Footer info */}
        {!note.isMinimized && (
          <div className="px-3 py-1.5 bg-black/10 border-t border-white/5 shrink-0">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-white/30 font-mono flex justify-between uppercase tracking-tighter">
                <span>Pinned</span>
                <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
              <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                <Cloud size={10} className="text-cyan-400/50" />
                <p className="text-[9px] text-cyan-400/60 truncate hover:text-cyan-400 transition-colors cursor-pointer" title={note.url}>
                  {note.urlTitle || note.url}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resize Handle */}
        {!note.isMinimized && (
          <div 
            ref={resizeRef}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-[60] flex items-end justify-end p-1 hover:bg-white/5 transition-colors"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-white/40" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
