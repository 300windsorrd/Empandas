export default function ChangeLogTab({ initialChanges }: any) {
  return (
    <div className="space-y-2">
      {initialChanges.map((c: any) => (
        <div key={c.id} className="rounded border border-white/10 p-3">
          <div className="text-sm"><strong>{c.action}</strong> {c.entity} <span className="text-white/70">{c.entityId}</span></div>
          <div className="text-xs text-white/60">{new Date(c.createdAt).toLocaleString()} • {c.userId}</div>
        </div>
      ))}
    </div>
  );
}

