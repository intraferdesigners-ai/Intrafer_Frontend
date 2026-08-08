'use client';

// Bot honeypot for public, anonymous-facing forms. A real visitor never
// sees or tabs into this field — off-screen absolute positioning, not
// display:none/visibility:hidden, since some bot form-fillers skip fields
// hidden that way but still populate anything else they find. Any non-empty
// value here on submit is a reliable bot signal the corresponding backend
// controller checks for (see src/utils/honeypot.js on the backend) and
// silently no-ops on, responding with an ordinary-looking success so the
// bot's script never learns the field was a trap.
export default function Honeypot({ value, onChange, name = 'website' }) {
  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  );
}
