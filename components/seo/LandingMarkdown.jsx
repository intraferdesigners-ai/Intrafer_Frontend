import Link from 'next/link';
import Markdown from 'react-markdown';

// Renders admin-authored Markdown on landing pages (Phase 2). Locked down
// on top of the backend already stripping HTML on save:
// - raw HTML is skipped entirely (skipHtml; no rehype-raw);
// - links only for http(s), mailto, tel and relative URLs — anything else
//   (javascript:, data:, protocol-relative //host) loses its href and
//   renders as plain text;
// - no images (<img> disallowed — authored bodies are text);
// - headings demote two levels (# -> h3, ## -> h4, ...) so authored
//   content can never add a second h1, or an h2 competing with the
//   page's own section titles.

const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i;
const HAS_SCHEME = /^[^/?#]*:/;

export function safeUrl(url) {
  const value = (url || '').trim();
  if (!value) return null;
  if (SAFE_SCHEME.test(value)) return value;
  if (/^[/\\][/\\]/.test(value) || HAS_SCHEME.test(value)) return null;
  return value;
}

const headingStyle = { fontSize: '17px', fontWeight: 500, color: 'var(--text)', margin: '24px 0 10px' };
const heading = (Tag) => function Heading({ children }) {
  return <Tag style={headingStyle}>{children}</Tag>;
};

const components = {
  h1: heading('h3'),
  h2: heading('h4'),
  h3: heading('h5'),
  h4: heading('h6'),
  h5: heading('h6'),
  h6: heading('h6'),
  p: ({ children }) => (
    <p style={{ fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '14px' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ listStyle: 'disc', paddingLeft: '22px', marginBottom: '14px', color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.8 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ listStyle: 'decimal', paddingLeft: '22px', marginBottom: '14px', color: 'var(--text-mid)', fontSize: '15px', lineHeight: 1.8 }}>{children}</ol>
  ),
  a: ({ href, children }) => {
    if (!href) return <span>{children}</span>;
    const style = { color: 'var(--primary)', textDecoration: 'underline' };
    if (/^https?:/i.test(href)) {
      return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{children}</a>;
    }
    if (/^(mailto|tel):/i.test(href)) return <a href={href} style={style}>{children}</a>;
    return <Link href={href} style={style}>{children}</Link>;
  },
};

export default function LandingMarkdown({ children }) {
  if (!children) return null;
  return (
    <div style={{ maxWidth: '760px' }}>
      <Markdown
        skipHtml
        disallowedElements={['img']}
        urlTransform={safeUrl}
        components={components}
      >
        {children}
      </Markdown>
    </div>
  );
}
