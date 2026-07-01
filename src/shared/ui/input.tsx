import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label ? (
        <span style={{ fontSize: 13, fontWeight: 500, color: '#444' }}>{label}</span>
      ) : null}
      <input
        {...props}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #ccc',
          fontSize: 14,
          width: '100%',
          boxSizing: 'border-box',
          ...style,
        }}
      />
    </label>
  );
}
