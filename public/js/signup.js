document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('🎉 Signup successful! Please log in.');
        window.location.href = 'login.html';
      } else {
        document.getElementById('signupError').textContent = data.message;
      }
    } catch (err) {
      console.error(err);
      document.getElementById('signupError').textContent = 'Signup failed. Please try again.';
    }
  });