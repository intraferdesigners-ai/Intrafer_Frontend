const SIZES = { sm: 16, md: 32, lg: 48 };

export default function Spinner({ size = 'md', color }) {
  const px = SIZES[size] || SIZES.md;

  const wheel = (
    <div
      className="animate-spin"
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: '2px solid var(--color-border)',
        borderTopColor: color || 'var(--color-primary)',
        flexShrink: 0,
      }}
    />
  );

  if (size === 'md' || size === 'lg') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {wheel}
      </div>
    );
  }

  return wheel;
}
