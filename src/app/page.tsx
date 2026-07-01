export default function Home() {
  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 20px' }}>
      <h1>FitPlan</h1>
      <p>Welcome to the FitPlan test project. See README.md for your assignment.</p>
      <ul>
        <li><code>GET /api/programs</code> — Task 1</li>
        <li><code>/programs</code> — Task 2</li>
        <li><code>src/lib/program-cache-buggy.ts</code> — Task 3</li>
        <li><code>POST /api/webhooks/payments</code> — Task 4</li>
      </ul>
    </main>
  );
}
