import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

// Same shared Navbar/Footer as the rest of the site (see
// app/(public)/layout.jsx) — /auth/* used to be a full-bleed, nav-free
// split screen (AuthSplitCard's two panels filled the entire 100dvh
// viewport), which meant these pages had no way back to the rest of the
// site except via AuthHeroPanel's own baked-in logo link, and no footer at
// all. AuthSplitCard/AuthHeroPanel now size themselves against the
// remaining viewport height instead of the full 100dvh, and `main` gets
// paddingTop matching Navbar's fixed 64px height, same as how individual
// (public) pages clear the fixed nav themselves (e.g. the homepage hero's
// own paddingTop) — this layout has no hero background needing the
// transparent-until-scrolled navbar treatment, so it clears it outright
// rather than letting content run underneath.
export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '64px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
