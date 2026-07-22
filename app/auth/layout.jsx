// Full-bleed split-screen experience — no site nav ever renders on /auth/*
// (it lives outside the (public) route group), and AuthSplitCard's own two
// panels fill the entire viewport, so this layout is just a plain passthrough.
// Each panel carries its own logo-as-home-link (see AuthHeroPanel and each
// page's own small top logo) since there's no navbar to do it otherwise.
export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: '100dvh' }}>
      {children}
    </div>
  );
}
