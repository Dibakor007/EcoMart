document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    
    if (data.success) {
      console.log('Backend API is online and connected.');
    }
  } catch (err) {
    console.error('Backend API is offline.');
  }
});
