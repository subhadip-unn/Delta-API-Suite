export default function SimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>Simple Test Page</h1>
      <p>If you can see this styled properly, the version conflicts are fixed!</p>
      <div style={{ 
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', 
        padding: '20px', 
        borderRadius: '10px',
        color: 'white',
        margin: '20px 0'
      }}>
        <h2>Gradient Test</h2>
        <p>This should have a beautiful gradient background!</p>
      </div>
    </div>
  );
}
