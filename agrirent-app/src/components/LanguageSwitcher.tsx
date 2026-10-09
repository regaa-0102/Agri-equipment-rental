import { LANGUAGES, useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      aria-label="Language selector"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 10001,
        display: "flex",
        gap: 4,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 999,
        padding: 4,
        boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: 15,
          padding: "6px 4px 6px 10px",
          lineHeight: 1,
        }}
      >
        🌐
      </span>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          style={{
            border: "none",
            cursor: "pointer",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            background: lang === l.code ? "#2E7D32" : "transparent",
            color: lang === l.code ? "#fff" : "#6B7280",
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
