"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập mô tả sản phẩm...", 
  className = '',
  minHeight = '200px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
    numberedList: false
  });

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Update formatting state based on cursor position
  const updateFormattingState = useCallback(() => {
    setIsActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      bulletList: document.queryCommandState('insertUnorderedList'),
      numberedList: document.queryCommandState('insertOrderedList')
    });
  }, []);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Execute formatting command
  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateFormattingState();
    handleInput();
  }, [updateFormattingState, handleInput]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  }, [executeCommand]);

  // Handle selection change
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateFormattingState();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateFormattingState]);

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt('Nhập URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  }, [executeCommand]);

  // Toolbar button component
  const ToolbarButton = ({ 
    onClick, 
    active, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    active: boolean; 
    icon: any; 
    title: string; 
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded border text-sm transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${
        active 
          ? 'bg-blue-100 border-blue-300 text-blue-700' 
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 overflow-x-auto">
        <ToolbarButton
          onClick={() => executeCommand('bold')}
          active={isActive.bold}
          icon={BoldIcon}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => executeCommand('italic')}
          active={isActive.italic}
          icon={ItalicIcon}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => executeCommand('underline')}
          active={isActive.underline}
          icon={UnderlineIcon}
          title="Underline (Ctrl+U)"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />
        
        <ToolbarButton
          onClick={() => executeCommand('insertUnorderedList')}
          active={isActive.bulletList}
          icon={ListBulletIcon}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => executeCommand('insertOrderedList')}
          active={isActive.numberedList}
          icon={NumberedListIcon}
          title="Numbered List"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />
        
        <ToolbarButton
          onClick={insertLink}
          active={false}
          icon={LinkIcon}
          title="Insert Link"
        />

        <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />

        <select
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          className="px-2 py-1 text-xs border border-gray-200 rounded min-w-[80px] touch-manipulation"
          defaultValue="div"
        >
          <option value="div">Paragraph</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset text-sm sm:text-base"
        style={{ minHeight }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={updateFormattingState}
        onKeyUp={updateFormattingState}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contenteditable] {
          line-height: 1.6;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        [contenteditable] h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        [contenteditable] h5 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] a {
          color: #3B82F6;
          text-decoration: underline;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}

// Hook for form integration
export function useRichTextEditor(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  
  const reset = useCallback((newValue: string = '') => {
    setValue(newValue);
  }, []);

  const getPlainText = useCallback(() => {
    const div = document.createElement('div');
    div.innerHTML = value;
    return div.textContent || div.innerText || '';
  }, [value]);

  return {
    value,
    setValue,
    reset,
    getPlainText,
    isEmpty: !value || value.trim() === '',
    props: {
      value,
      onChange: setValue
    }
  };
}