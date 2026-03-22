'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { DESTINATIONS } from '@/lib/destinations'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DestinationAutocompleteProps {
  id: string
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

// ---------------------------------------------------------------------------
// Suggestion matching
// ---------------------------------------------------------------------------

const MAX_SUGGESTIONS = 8

function getSuggestions(query: string): string[] {
  const q = query.trim()
  if (q.length === 0) return []

  const lower = q.toLowerCase()
  const prefix: string[] = []
  const contains: string[] = []

  for (const dest of DESTINATIONS) {
    const d = dest.toLowerCase()
    if (d.startsWith(lower)) {
      prefix.push(dest)
    } else if (d.includes(lower)) {
      contains.push(dest)
    }
    // Early exit once we have plenty of candidates
    if (prefix.length + contains.length >= MAX_SUGGESTIONS * 3) break
  }

  return [...prefix, ...contains].slice(0, MAX_SUGGESTIONS)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DestinationAutocomplete({
  id,
  value,
  onChange,
  autoFocus,
}: DestinationAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // Suppress re-opening the list immediately after the user picks a suggestion
  const suppressRef = useRef(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const suggestions = suppressRef.current ? [] : getSuggestions(value)
  const showDropdown = open && suggestions.length > 0

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    suppressRef.current = false
    onChange(e.target.value)
    setActiveIndex(-1)
    setOpen(true)
  }

  function selectSuggestion(suggestion: string) {
    suppressRef.current = true
    onChange(suggestion)
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && getSuggestions(value).length > 0) {
        suppressRef.current = false
        setOpen(true)
        setActiveIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
        e.preventDefault()
        break
      case 'ArrowUp':
        setActiveIndex((i) => {
          if (i <= 0) {
            setOpen(false)
            return -1
          }
          return i - 1
        })
        e.preventDefault()
        break
      case 'Enter':
        if (activeIndex >= 0) {
          selectSuggestion(suggestions[activeIndex])
          e.preventDefault()
        }
        break
      case 'Escape':
        setOpen(false)
        setActiveIndex(-1)
        e.preventDefault()
        break
      case 'Tab':
        // Select the highlighted item on Tab, but let focus move naturally
        if (activeIndex >= 0) {
          selectSuggestion(suggestions[activeIndex])
        } else {
          setOpen(false)
        }
        break
    }
  }

  function handleFocus() {
    if (!suppressRef.current) setOpen(true)
  }

  function handleBlur(e: React.FocusEvent) {
    // Keep open if focus is moving into the listbox
    if (listRef.current?.contains(e.relatedTarget as Node)) return
    setOpen(false)
    setActiveIndex(-1)
  }

  // Close on outside pointer-down (covers touch devices)
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Scroll the active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const activeDescendant =
    activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Portugal, Dubai, New York"
        autoFocus={autoFocus}
        className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] placeholder:text-[#3D4A42]/40 focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
      />

      {showDropdown && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Destination suggestions"
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#191C1D]/10 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, i) => (
            <li
              key={suggestion}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              // onPointerDown instead of onClick so it fires before the input's
              // onBlur closes the dropdown
              onPointerDown={(e) => {
                e.preventDefault()
                selectSuggestion(suggestion)
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer select-none transition-colors ${
                i === activeIndex
                  ? 'bg-[#006948]/8 text-[#006948] font-medium'
                  : 'text-[#191C1D] hover:bg-[#F8F9FA]'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
