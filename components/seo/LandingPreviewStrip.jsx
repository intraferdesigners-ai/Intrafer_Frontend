// Banner across the very top of a landing page opened as an admin preview
// (draft mode, app/api/landing-preview/). Server component. It sits above
// the fixed Navbar by setting --preview-strip-h, which the Navbar uses as
// its `top` offset, and pads the body by the same amount so nothing hides
// behind it. `data-landing-preview` tells LeadCapturePopup to stay away;
// "Exit preview" leaves draft mode for this page.

const HEIGHT = 32;

export default function LandingPreviewStrip({ published, path }) {
  return (
    <>
      <style>{`:root{--preview-strip-h:${HEIGHT}px}body{padding-top:${HEIGHT}px}`}</style>
      <div
        role="status"
        data-landing-preview=""
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101, height: `${HEIGHT}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
          background: published ? '#1d4ed8' : '#b45309', color: '#fff',
          fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em', textAlign: 'center',
        }}
      >
        {published ? 'Preview of the published page' : 'Preview — this page is not live yet'}
        <a
          href={`/api/landing-preview/exit/?path=${encodeURIComponent(path)}`}
          style={{ color: '#fff', marginLeft: '16px', textDecoration: 'underline', fontWeight: 500 }}
        >
          Exit preview
        </a>
      </div>
    </>
  );
}
