'use client';

import React, { useState, useCallback } from 'react';
import { Modal, Button, Icon, Select, Toggle, Input } from '@hool/design-system';
import { recruitmentApi } from '../../../../../lib/api';

const METHOD_OPTIONS = [
  { value: 'discord', label: 'Discord' },
  { value: 'in-game', label: 'In-Game' },
  { value: 'email', label: 'Email' },
  { value: 'bnet', label: 'Battle.net' },
  { value: 'forum', label: 'Forum' },
  { value: 'other', label: 'Other' },
];

interface ContactLogModalProps {
  guildId: string;
  candidateId: string;
  onClose: () => void;
  onLogged: () => void;
}

export function ContactLogModal({
  guildId,
  candidateId,
  onClose,
  onLogged,
}: ContactLogModalProps) {
  const [method, setMethod] = useState('discord');
  const [message, setMessage] = useState('');
  const [contactedDate, setContactedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [responseReceived, setResponseReceived] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      await recruitmentApi.post(
        `/guilds/${guildId}/recruitment/candidates/${candidateId}/contact`,
        {
          method,
          message: message.trim() || undefined,
          contacted_date: contactedDate || undefined,
          response_received: responseReceived,
        }
      );
      onLogged();
    } catch (err: any) {
      setError(err.message || 'Failed to log contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [guildId, candidateId, method, message, contactedDate, responseReceived, onLogged]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Log Contact"
      subtitle="Record communication with this candidate"
      size="md"
      gradientVariant="purple-pink"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSaving}
            icon={<Icon name="check" size={16} />}
          >
            {isSaving ? 'Saving...' : 'Log Contact'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.8125rem',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Method */}
        <div>
          <label
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'block',
              marginBottom: '0.375rem',
            }}
          >
            Contact Method
          </label>
          <Select
            options={METHOD_OPTIONS}
            value={method}
            onChange={setMethod}
            size="md"
            variant="secondary"
          />
        </div>

        {/* Message */}
        <div>
          <label
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'block',
              marginBottom: '0.375rem',
            }}
          >
            Message / Notes
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="What was discussed..."
            style={{
              width: '100%',
              padding: '0.625rem',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Date */}
        <div>
          <label
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'block',
              marginBottom: '0.375rem',
            }}
          >
            Contact Date
          </label>
          <Input
            variant="default"
            size="md"
            type="date"
            value={contactedDate}
            onChange={(e) => setContactedDate(e.target.value)}
          />
        </div>

        {/* Response received */}
        <Toggle
          checked={responseReceived}
          onChange={setResponseReceived}
          label="Response Received"
          description="Did the candidate respond to this contact?"
          variant="primary"
          size="md"
        />
      </div>
    </Modal>
  );
}
