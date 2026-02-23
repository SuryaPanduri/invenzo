const form = document.getElementById('resetPasswordForm');
const messageEl = document.getElementById('resetPasswordMessage');

const params = new URLSearchParams(window.location.search);
const tokenFromQuery = params.get('token');

if (!tokenFromQuery) {
  messageEl.className = 'small text-center text-danger';
  messageEl.textContent = 'Missing reset token. Use the reset link from forgot password.';
  Array.from(form.elements).forEach((el) => {
    el.disabled = true;
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!tokenFromQuery) {
    return;
  }

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    messageEl.className = 'small text-center text-danger';
    messageEl.textContent = 'Passwords do not match.';
    return;
  }

  try {
    const res = await fetch('/api/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenFromQuery, password })
    });

    const data = await res.json();

    if (!res.ok) {
      messageEl.className = 'small text-center text-danger';
      messageEl.textContent = data.message || 'Failed to reset password.';
      return;
    }

    messageEl.className = 'small text-center text-success';
    messageEl.textContent = 'Password reset successful. Redirecting to login...';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } catch (err) {
    console.error('Reset password error:', err);
    messageEl.className = 'small text-center text-danger';
    messageEl.textContent = 'Something went wrong. Try again.';
  }
});
