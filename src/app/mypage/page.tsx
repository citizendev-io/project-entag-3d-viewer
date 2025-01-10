// /app/dummy/page.tsx

export default function DummyPage() {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Welcome to the Dummy Page</h1>
        <p>This is a simple page to demonstrate how to create a page in Next.js using the App Router.</p>
        <p>
          Current Date and Time: <strong>{new Date().toLocaleString()}</strong>
        </p>
      </div>
    );
  }
  