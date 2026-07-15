/** F1 real route shell — full UI arrives in a later phase. */
export default function LaterSectionPage({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p style={{ color: "var(--admin-muted)" }}>
        Real admin route is live (F1). Full {title.toLowerCase()} UI ships in {phase}.
      </p>
    </div>
  );
}
