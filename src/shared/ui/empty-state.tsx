interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <p
      style={{
        margin: '24px 0',
        padding: 24,
        textAlign: 'center',
        color: '#666',
        background: '#f9f9f9',
        borderRadius: 8,
      }}
    >
      {message}
    </p>
  );
}
