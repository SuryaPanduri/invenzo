function getToken() {
  return localStorage.getItem('token');
}

function ensureAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  try {
    const decoded = jwt_decode(token);
    return { token, decoded };
  } catch (err) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return null;
  }
}

function setRoleBlocks(role) {
  document.querySelectorAll('.admin-only, .manager-only, .viewer-only').forEach((el) => {
    el.style.display = 'none';
  });

  document.querySelectorAll(`.${role}-only`).forEach((el) => {
    el.style.display = 'block';
  });
}

function wireLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
  });
}

function updateStats(assets) {
  document.getElementById('totalAssets').textContent = assets.length;
  document.getElementById('availableAssets').textContent = assets.filter(
    (asset) => asset.status === 'Available'
  ).length;
  document.getElementById('checkedOutAssets').textContent = assets.filter(
    (asset) => asset.status === 'Checked Out'
  ).length;
}

function drawCharts(data) {
  new Chart(document.getElementById('statusChart'), {
    type: 'doughnut',
    data: {
      labels: ['Available', 'Checked Out', 'Overdue'],
      datasets: [
        {
          label: 'Asset Status',
          data: [data.available || 0, data.checkedOut || 0, data.overdue || 0],
          backgroundColor: ['#2b8a63', '#d78443', '#cc4d3f']
        }
      ]
    }
  });

  const mostUsed = Array.isArray(data.mostUsed) ? data.mostUsed : [];

  new Chart(document.getElementById('usageChart'), {
    type: 'bar',
    data: {
      labels: mostUsed.map((asset) => asset.name),
      datasets: [
        {
          label: 'Checkouts',
          data: mostUsed.map((asset) => asset.usageCount),
          backgroundColor: '#205f9d'
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

async function loadDashboard() {
  const auth = ensureAuth();
  if (!auth) return;

  const { token, decoded } = auth;
  const userName = localStorage.getItem('userName') || decoded.email;
  const role = String(decoded.role || '').toLowerCase();

  document.getElementById('usernameDisplay').textContent = userName;
  setRoleBlocks(role);

  const [assetsRes, analyticsRes] = await Promise.all([
    fetch('/api/assets', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch('/api/assets/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    })
  ]);

  if (!assetsRes.ok || !analyticsRes.ok) {
    throw new Error('Failed to load dashboard data');
  }

  const assets = await assetsRes.json();
  const analytics = await analyticsRes.json();

  updateStats(Array.isArray(assets) ? assets : []);
  drawCharts(analytics || {});
}

document.addEventListener('DOMContentLoaded', async () => {
  wireLogout();

  try {
    await loadDashboard();
  } catch (err) {
    console.error('Dashboard load failed:', err);
  }
});
