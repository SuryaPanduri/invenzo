console.log("🔥 dashboard.js loaded");
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    console.log("🚪 Logout clicked");
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
}

console.log("🔍 Logout button found:", logoutBtn);
document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username');
  const usernameEl = document.getElementById('usernameDisplay');
  if (username && usernameEl) {
    usernameEl.textContent = username;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.error("No token found. Redirecting to login.");
    return (window.location.href = 'login.html');
  }

  fetch('/api/assets', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch assets: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const totalEl = document.getElementById('totalAssets');
      const availableEl = document.getElementById('availableAssets');
      const checkedOutEl = document.getElementById('checkedOutAssets');

      const total = data.length;
      const available = data.filter(asset => asset.status === 'Available').length;
      const checkedOut = data.filter(asset => asset.status === 'Checked Out').length;

      if (totalEl) {
        totalEl.textContent = total;
        totalEl.innerHTML = total;
      }
      if (availableEl) {
        availableEl.textContent = available;
        availableEl.innerHTML = available;
      }
      if (checkedOutEl) {
        checkedOutEl.textContent = checkedOut;
        checkedOutEl.innerHTML = checkedOut;
      }
    })
    .catch(err => {
      console.error('Error fetching asset stats:', err);
    });
});

