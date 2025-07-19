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
    // ✅ Save token
    localStorage.setItem('token', data.token);

    // ✅ Save username (make sure backend sends data.user.name)
    if (data.user && data.user.name) {
      localStorage.setItem('username', data.user.name);
    }

    // ✅ Redirect to dashboard
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('error').textContent = data.message;
  }
});