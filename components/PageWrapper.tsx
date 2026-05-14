export default function PageWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`flex-1 container mx-auto px-4 md:px-6 py-8 ${className}`}>
      {children}
    </main>
  );
}
