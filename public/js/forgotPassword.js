const form = document.getElementById('forgotPasswordForm');
const messageEl = document.getElementById('forgotPasswordMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();

  try {
    const res = await fetch('/api/users/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      messageEl.className = 'small text-center text-danger';
      messageEl.textContent = data.message || 'Failed to process request.';
      return;
    }

    messageEl.className = 'small text-center text-success';
    messageEl.textContent = data.message;

    if (data.resetToken) {
      const resetUrl = `reset-password.html?token=${encodeURIComponent(data.resetToken)}`;
      messageEl.innerHTML = `${data.message} <br><a href="${resetUrl}">Reset now (dev)</a>`;
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    messageEl.className = 'small text-center text-danger';
    messageEl.textContent = 'Something went wrong. Try again.';
  }
});
