import React, { useId, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import '../styles/Input.css';
import { initializeScreenReaderAnnouncer, announceToScreenReader } from '../utils/aria-utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  announceError?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  announceError?: boolean;
}

export function Input({
  label,
  helperText,
  error,
  id: providedId,
  className = '',
  announceError = true,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const messageId = `${id}-message`;
  const message = error || helperText;
  const prevErrorRef = useRef<string | undefined>();

  // Announce errors to screen readers
  useEffect(() => {
    if (announceError && error && error !== prevErrorRef.current) {
      announceToScreenReader(error, 'assertive');
    }
    prevErrorRef.current = error;
  }, [error, announceError]);

  // Initialize screen reader announcer on first render
  useEffect(() => {
    initializeScreenReaderAnnouncer();
  }, []);

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input ${error ? 'input--error' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-errormessage={error ? messageId : undefined}
        {...props}
      />
      {message && (
        <span
          id={messageId}
          className={`input-message ${error ? 'input-message--error' : 'input-message--helper'}`}
          role={error ? 'alert' : undefined}
          aria-live={error ? 'assertive' : undefined}
        >
          {error && <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} aria-hidden="true" />}
          {message}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  helperText,
  error,
  id: providedId,
  className = '',
  announceError = true,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const messageId = `${id}-message`;
  const message = error || helperText;
  const prevErrorRef = useRef<string | undefined>();

  // Announce errors to screen readers
  useEffect(() => {
    if (announceError && error && error !== prevErrorRef.current) {
      announceToScreenReader(error, 'assertive');
    }
    prevErrorRef.current = error;
  }, [error, announceError]);

  // Initialize screen reader announcer on first render
  useEffect(() => {
    initializeScreenReaderAnnouncer();
  }, []);

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`textarea ${error ? 'textarea--error' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-errormessage={error ? messageId : undefined}
        {...props}
      />
      {message && (
        <span
          id={messageId}
          className={`input-message ${error ? 'input-message--error' : 'input-message--helper'}`}
          role={error ? 'alert' : undefined}
          aria-live={error ? 'assertive' : undefined}
        >
          {error && <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} aria-hidden="true" />}
          {message}
        </span>
      )}
    </div>
  );
}
