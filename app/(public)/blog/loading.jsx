export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8F7F4',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '2px solid #E2E8F0',
        borderTopColor: '#3B82F6',
        borderRadius: '50%',
        animation: 'spin 600ms linear infinite',
      }} />
    </div>
  );
}
