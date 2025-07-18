document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
  
    const data = await res.json();
  
    if (res.ok) {
      // ✅ Login success – store token
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      // ❌ Show error message
      document.getElementById('error').textContent = data.message;
    }
  });