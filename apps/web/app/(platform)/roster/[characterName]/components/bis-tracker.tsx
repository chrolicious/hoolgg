'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Icon, Select, Toggle } from '@hool/design-system';
import { buildBtnStyle } from '../utils';
import { progressApi } from '../../../../lib/api';
import { SectionCard } from './section-card';
import type { BisResponse, BisItem } from '../types';
import { BIS_SLOTS } from '../types';

interface BisTrackerProps {
  bisData: BisResponse | null;
  characterId: number;
  
  classColor: string;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  padding: '6px 10px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
};

const slotOptions = BIS_SLOTS.map((slot) => ({
  value: slot,
  label: slot,
}));

interface WowheadItem {
  name: string;
  id: number;
  quality: number;
}

export function BisTracker({ bisData, characterId, classColor }: BisTrackerProps) {
  const [items, setItems] = useState<BisItem[]>(bisData?.items ?? []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>(BIS_SLOTS[0]);
  const [itemName, setItemName] = useState('');
  const [itemId, setItemId] = useState('');
  const [targetIlvl, setTargetIlvl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [suggestions, setSuggestions] = useState<WowheadItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const btnStyle = buildBtnStyle(classColor);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Wowhead search
  const searchWowhead = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://www.wowhead.com/search/suggestions?q=${encodeURIComponent(query)}&type=item`
      );
      const data = await response.json();

      if (data && data.results) {
        setSuggestions(data.results.slice(0, 10));
      }
    } catch (err) {
      console.error('Wowhead search failed:', err);
    }
  };

  const handleItemNameChange = (value: string) => {
    setItemName(value);
    setShowSuggestions(true);

    // Debounce search
    const timer = setTimeout(() => {
      searchWowhead(value);
    }, 300);

    return () => clearTimeout(timer);
  };

  const selectSuggestion = (item: WowheadItem) => {
    setItemName(item.name);
    setItemId(String(item.id));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const obtainedCount = items.filter((item) => item && item.obtained).length;
  const totalCount = items.length;

  const handleAdd = async () => {
    if (!itemName.trim()) return;

    setIsAdding(true);
    try {
      const result = await progressApi.post<{ item: BisItem }>(
        `/users/me/characters/${characterId}/bis`,
        {
          slot: selectedSlot,
          item_name: itemName.trim(),
          item_id: itemId ? Number(itemId) : undefined,
          target_ilvl: targetIlvl ? Number(targetIlvl) : undefined,
        },
      );

      console.log('BiS API response:', result);

      // Handle different response structures
      const itemData = result.item || result;

      if (!itemData || !itemData.id) {
        throw new Error('Invalid API response: missing item data');
      }

      // Ensure item has required fields with defaults
      const newItem: BisItem = {
        ...itemData,
        obtained: itemData.obtained ?? false,
      };

      setItems((prev) => [...prev, newItem]);
      setItemName('');
      setItemId('');
      setTargetIlvl('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add BiS item:', err);
      alert('Failed to add BiS item. Check console for details.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleObtained = async (item: BisItem, checked: boolean) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, obtained: checked } : i)),
    );

    try {
      await progressApi.put(
        `/users/me/characters/${characterId}/bis/${item.id}`,
        { obtained: checked },
      );
    } catch (err) {
      console.error('Failed to toggle obtained:', err);
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, obtained: !checked } : i)),
      );
    }
  };

  const handleDelete = async (item: BisItem) => {
    // Optimistic update
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    try {
      await progressApi.delete(
        `/users/me/characters/${characterId}/bis/${item.id}`,
      );
    } catch (err) {
      console.error('Failed to delete BiS item:', err);
      // Revert on error
      setItems((prev) => [...prev, item]);
    }
  };

  return (
    <SectionCard
      title="BiS Tracker"
      rightContent={
        <span style={{
          fontSize: '13px',
          color: obtainedCount === totalCount && totalCount > 0
            ? '#4ade80'
            : 'rgba(255,255,255,0.5)',
          fontWeight: 600,
        }}>
          {obtainedCount}/{totalCount} obtained
        </span>
      }
    >
      {/* Add Item Toggle */}
      <div style={{ marginBottom: items.length > 0 || showAddForm ? '16px' : '0' }}>
        <Button
          variant="primary"
          size="sm"
          icon={<Icon name={showAddForm ? 'x' : 'plus'} size={14} />}
          onClick={() => setShowAddForm(!showAddForm)}
          style={btnStyle}
        >
          {showAddForm ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '14px',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '10px',
            alignItems: 'start',
          }}>
            <Select
              options={slotOptions}
              value={selectedSlot}
              onChange={(val) => setSelectedSlot(val)}
              size="sm"
              placeholder="Slot"
              style={btnStyle}
            />
            <div ref={suggestionsRef} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Item name (search Wowhead)"
                value={itemName}
                onChange={(e) => handleItemNameChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                style={inputStyle}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'rgba(0,0,0,0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 100,
                }}>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectSuggestion(item)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#fff',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '10px',
            alignItems: 'start',
          }}>
            <input
              type="number"
              placeholder="Item ID (optional)"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Target ilvl (optional)"
              value={targetIlvl}
              onChange={(e) => setTargetIlvl(e.target.value)}
              style={inputStyle}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAdd}
              disabled={!itemName.trim() || isAdding}
              loading={isAdding}
              style={btnStyle}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && !showAddForm && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '32px 16px',
        }}>
          <Icon name="target" size={36} style={{ opacity: 0.15 }} />
          <span style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
          }}>
            No BiS items added yet.
          </span>
        </div>
      )}

      {/* Item List */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.filter((item) => item != null).map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                backgroundColor: item.obtained
                  ? 'rgba(74,222,128,0.06)'
                  : 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: `1px solid ${
                  item.obtained
                    ? 'rgba(74,222,128,0.15)'
                    : 'rgba(255,255,255,0.05)'
                }`,
                transition: 'background-color 0.2s, border-color 0.2s',
              }}
            >
              {/* Slot Badge */}
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: classColor,
                backgroundColor: `${classColor}18`,
                padding: '3px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {item.slot}
              </span>

              {/* Item Name + Target ilvl */}
              <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}>
                <span style={{
                  fontSize: '14px',
                  color: item.obtained ? 'rgba(255,255,255,0.5)' : '#fff',
                  textDecoration: item.obtained ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.item_name}
                </span>
                {item.target_ilvl && (
                  <span style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    Target: {item.target_ilvl} ilvl
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                height: '32px', // Fixed height for alignment
              }}>
                {/* Obtained Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Toggle
                    checked={item.obtained}
                    onChange={(val) => handleToggleObtained(item, val)}
                    size="sm"
                  />
                </div>

                {/* Delete Button */}
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Button
                    variant="destructive"
                    size="sm"
                    icon={<Icon name="trash" size={14} />}
                    onClick={() => handleDelete(item)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
