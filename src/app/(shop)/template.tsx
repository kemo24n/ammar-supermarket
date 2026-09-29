// Re-mounts on every navigation → gentle fade/slide page transition.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
