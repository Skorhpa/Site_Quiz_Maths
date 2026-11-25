/**
 * Shared sub-quiz card used by every hub menu (the screen listing the sub-quizzes of a quiz).
 * Styling lives in global.css (`mc-` prefix). Each card takes a colour from a rotating palette
 * (by position in the menu) so the menus match the home page and the level pages.
 */
export function ModeCard({ label, icon, desc, onClick, href, disabled = false }: {
  label: string;
  icon: string;
  desc: string;
  /** Kept for call-site compatibility: the card colour now comes from its position in the menu. */
  accent?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const inner = (
    <>
      <span className="mc-icon">{icon}</span>
      <span className="mc-body">
        <span className="mc-label">{label}</span>
        <span className="mc-desc">{desc}</span>
      </span>
      <span className="mc-go" aria-hidden="true">{disabled ? 'Bientôt' : '→'}</span>
    </>
  );
  if (href && !disabled) {
    return <a className="mc-card" href={href}>{inner}</a>;
  }
  return (
    <button type="button" className="mc-card" onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}
