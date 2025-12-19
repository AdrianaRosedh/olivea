export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--olivea-white) text-(--olivea-olive)">
      {children}
    </div>
  );
}
