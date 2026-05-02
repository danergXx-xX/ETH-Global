// Brand layer — Conclave.
// One source of truth for product name, logo, tagline, manifest.
// Used across all components (Live Debate, Form, Dashboard, Registry, etc.).

const BRAND = {
  name: 'Conclave',
  nameUpper: 'CONCLAVE',
  domain: 'conclave.fi',
  tagline: {
    en: 'Your treasury, deliberated.',
    pl: 'Twój skarbiec, przemyślany.',
  },
  manifest: {
    en: 'An AI council that debates every treasury decision before it touches your funds.',
    pl: 'Rada AI deliberuje każdą decyzję skarbca, zanim dotknie ona Twoich środków.',
  },
  // i18n labels
  reasoningButton: {
    en: 'Challenge',
    pl: 'Wykaz',
  },
  reasoningButtonShort: {
    en: 'Ask',
    pl: 'Pytaj',
  },
};

// Logo: 5 dots forming a council ring around a center user dot.
// Sizes: sm (20x20), md (28x28), lg (40x40).
function ConclaveLogo({ size = 28, color = 'currentColor', accent, dim = 'currentColor', strokeOpacity = 0.25 }) {
  const a = accent || color;
  // 5 council members at 18°, 90°, 162°, 234°, 306° (top, top-right, bottom-right, bottom-left, top-left)
  const radius = 14;
  const positions = [
    { angle: -90, label: 'top' },
    { angle: -18, label: 'tr' },
    { angle: 54, label: 'br' },
    { angle: 126, label: 'bl' },
    { angle: 198, label: 'tl' },
  ];
  const cx = 20, cy = 20;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ display: 'block' }}>
      {/* outer ring */}
      <circle cx={cx} cy={cy} r={radius} stroke={dim} strokeWidth="0.7" strokeOpacity={strokeOpacity} fill="none" />
      {/* council dots */}
      {positions.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * radius;
        const y = cy + Math.sin(rad) * radius;
        return <circle key={i} cx={x} cy={y} r={2.4} fill={color} />;
      })}
      {/* center: the proposal/user */}
      <circle cx={cx} cy={cy} r={3} fill={a} />
    </svg>
  );
}

// Wordmark: monospace uppercase, tight letterspacing, with logo to the left
function ConclaveMark({ size = 'md', theme, locale = 'en', showTagline = false, accent }) {
  const sizes = {
    xs: { logo: 18, font: 11, gap: 7, tagFont: 9 },
    sm: { logo: 22, font: 13, gap: 8, tagFont: 9.5 },
    md: { logo: 28, font: 15, gap: 9, tagFont: 10 },
    lg: { logo: 40, font: 22, gap: 12, tagFont: 11 },
    xl: { logo: 56, font: 30, gap: 16, tagFont: 13 },
  };
  const s = sizes[size] || sizes.md;
  const fg = (theme && theme.text) || 'currentColor';
  const muted = (theme && (theme.textDim || theme.muted)) || 'currentColor';
  const acc = accent || ((theme && theme.amber) || 'oklch(0.78 0.13 252)');

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, color: fg }}>
      <ConclaveLogo size={s.logo} color={fg} accent={acc} dim={muted} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontSize: s.font,
          fontWeight: 700,
          letterSpacing: 1.5,
          lineHeight: 1,
          color: fg,
        }}>{BRAND.nameUpper}</span>
        {showTagline && (
          <span style={{
            fontSize: s.tagFont,
            color: muted,
            letterSpacing: 0.2,
            lineHeight: 1.2,
            marginTop: 2,
          }}>{BRAND.tagline[locale] || BRAND.tagline.en}</span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { BRAND, ConclaveLogo, ConclaveMark });
