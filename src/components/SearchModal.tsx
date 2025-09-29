"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchProducts, type SearchResultItem } from '@/lib/search';
import Link from 'next/link';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

// Simple trap + restore focus
export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(open); // for mount/unmount
  const [recent, setRecent] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const debounceRef = useRef<number | undefined>();
  const closeTimeoutRef = useRef<number | undefined>();

  // Debounce search
  useEffect(() => {
    if (!open) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      (async () => {
        const r = await searchProducts(query);
        setResults(r);
        setActive(0);
        if (query.trim().length >= 2) {
          setRecent(prev => {
            const next = [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 8);
            try { localStorage.setItem('recent-searches', JSON.stringify(next)); } catch {}
            return next;
          });
        }
      })();
    }, 150);
    return () => window.clearTimeout(debounceRef.current);
  }, [query, open]);

  // Load recent at mount/open
  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem('recent-searches');
        if (raw) {
          const arr = JSON.parse(raw);
            if (Array.isArray(arr)) setRecent(arr.filter((x: any) => typeof x === 'string'));
        }
      } catch {}
    }
  }, [open]);

  // Handle open/close with animation mount control
  useEffect(() => {
    if (open) {
      window.clearTimeout(closeTimeoutRef.current);
      setVisible(true);
      prevFocus.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      // Delay unmount for animation
      closeTimeoutRef.current = window.setTimeout(() => {
        setVisible(false);
        setQuery('');
        setResults([]);
        prevFocus.current?.focus();
      }, 140); // match animation duration
    }
  }, [open]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => (a - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[active];
      if (r) {
        onClose();
        window.location.href = `/product/${r.product.slug}`;
      }
    }
  }, [results, active, onClose]);

  // Basic focus trap
  useEffect(() => {
    if (!open) return;
    function handleFocus(e: FocusEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      // redirect focus back inside
      inputRef.current?.focus();
    }
    document.addEventListener('focus', handleFocus, true);
    return () => document.removeEventListener('focus', handleFocus, true);
  }, [open]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 transition-opacity duration-150 ${open ? 'opacity-100' : 'opacity-0'} bg-black/40 backdrop-blur-sm`}
      role="dialog"
      aria-modal="true"
      onKeyDown={onKeyDown}
    >
      <div
        ref={containerRef}
        className={`w-full max-w-xl rounded-lg bg-white shadow-xl ring-1 ring-black/10 overflow-hidden flex flex-col transform transition-all duration-150 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex items-center gap-2 border-b px-4">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products... (Esc to close)"
            className="w-full bg-transparent py-3 outline-none text-sm"
            aria-label="Search products"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-gray-500 hover:text-gray-800"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-800"
            aria-label="Close search"
          >
            Esc
          </button>
        </div>
        <div
          className="max-h-96 overflow-auto divide-y"
          role="listbox"
          id="search-results"
          aria-label="Search results"
          aria-activedescendant={results[active] ? `search-result-${results[active].product.slug}` : undefined}
        >
          {query.length === 0 && recent.length > 0 && (
            <div className="p-3 text-xs text-gray-600 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Tìm gần đây</span>
                <button
                  onClick={() => { setRecent([]); try { localStorage.removeItem('recent-searches'); } catch {}; }}
                  className="text-[10px] uppercase tracking-wide text-gray-400 hover:text-gray-600"
                >Xoá</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map(r => (
                  <button
                    key={r}
                    onClick={() => setQuery(r)}
                    className="rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-[11px]"
                  >{r}</button>
                ))}
              </div>
            </div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No results</div>
          )}
          {results.map((r, i) => (
            <Link
              key={r.product.slug}
              id={`search-result-${r.product.slug}`}
              role="option"
              aria-selected={i === active}
              href={`/product/${r.product.slug}`}
              className={`flex flex-col gap-1 px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 outline-none ${i === active ? 'bg-gray-100' : ''}`}
              onClick={onClose}
            >
              <span className="text-sm font-medium">{highlightParts(r, 'name')}</span>
              <span className="text-xs text-gray-600 line-clamp-2">{highlightParts(r, 'description')}</span>
            </Link>
          ))}
          {query.length < 2 && (
            <div className="p-4 text-xs text-gray-500">Type at least 2 characters to search</div>
          )}
        </div>
        <div className="border-t bg-gray-50 px-4 py-2 flex justify-between text-[11px] text-gray-500">
          <span>/ to focus</span>
          <span>Esc to close • ↑ ↓ navigate • Enter open</span>
        </div>
      </div>
    </div>
  );
}

function highlightParts(result: SearchResultItem, key: string) {
  const h = result.highlights.find(h => h.key === key);
  const text = (result.product as any)[key] as string | undefined;
  if (!text) return null;
  if (!h) return text;
  // Fuse indices are inclusive ranges
  const parts: string[] = [];
  let lastIndex = 0;
  h.indices.forEach(([start, end]) => {
    if (start > lastIndex) parts.push(escapeHTML(text.slice(lastIndex, start)));
    parts.push(`<mark class="bg-yellow-200/70 rounded px-0.5">${escapeHTML(text.slice(start, end + 1))}</mark>`);
    lastIndex = end + 1;
  });
  if (lastIndex < text.length) parts.push(escapeHTML(text.slice(lastIndex)));
  return (
    <span
      className="[&_mark]:font-semibold"
      dangerouslySetInnerHTML={{ __html: parts.join('') }}
    />
  );
}

function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
