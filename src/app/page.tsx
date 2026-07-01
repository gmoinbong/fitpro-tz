import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 20px' }}>
      <h1>FitPlan</h1>
      <p>Welcome to the FitPlan test project.</p>
      <Link href="/programs"><code>Open Programs</code></Link>
      <br />
      also available in
      <Link href="/programs?locale=es">
        <br />  <code>Spanish</code>
      </Link>
    </main>
  );
}
