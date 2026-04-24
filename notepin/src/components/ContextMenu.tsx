import React from 'react';
import { motion } from 'motion/react';
import { Plus, Settings, Info, Cloud, List } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onAddNote: () => void;
  onOpenSettings: () => void;
  onOpenAllNotes: () => void;
  onOpenHelp: () => void;
  onClose: () => void;
  t: any; // Translation object
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onAddNote, onOpenSettings, onOpenAllNotes, onOpenHelp, onClose, t }) => {
  return (
    <>
      <div 
        className="fixed inset-0 z-40 pointer-events-auto" 
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        style={{ left: x, top: y }}
        className="fixed z-50 min-w-[240px] glass shadow-2xl overflow-hidden py-1 border border-white/20 select-none pointer-events-auto"
      >
        <div className="px-3 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">NotePin</span>
          <Cloud size={10} className="text-cyan-400" />
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddNote();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white border border-cyan-500/30 transition-colors">
            <Plus size={16} />
          </div>
          {t.addNote}
        </button>

        <div className="h-px bg-white/5 mx-2 my-1" />

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenAllNotes();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
            <List size={16} className="text-purple-400" />
          </div>
          {t.allNotes}
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
            <Settings size={16} className="text-slate-400" />
          </div>
          {t.settings}
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenHelp();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60">
            <Info size={16} />
          </div>
          {t.help}
        </button>
      </motion.div>
    </>
  );
};
