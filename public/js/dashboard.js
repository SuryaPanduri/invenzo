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

      if (!Array.isArray(data)) {
        console.error("Expected asset data to be an array:", data);
        return;
      }

      const total = data.length;
      const available = data.filter(asset => asset.status === 'Available').length;
      const checkedOut = data.filter(asset => asset.status === 'Checked Out').length;

      console.log('📊 Stats:', { total, available, checkedOut });

      if (totalEl) totalEl.textContent = total;
      if (availableEl) availableEl.textContent = available;
      if (checkedOutEl) checkedOutEl.textContent = checkedOut;
    })
    .catch(err => {
      console.error('Error fetching asset stats:', err);
    });
});

async function loadAnalytics() {
  console.log("📊 Loading analytics...");
  // Helper to dynamically load Chart.js if not present
  function loadChartJSScript() {
    return new Promise((resolve, reject) => {
      if (window.Chart) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = () => {
        console.log("✅ Chart.js loaded");
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  await loadChartJSScript();
  const token = localStorage.getItem('token');
  try {
    console.log("🔗 Fetching analytics data...");
    const response = await fetch('/api/assets/analytics', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    console.log("✅ Analytics data loaded:", data);

    new Chart(document.getElementById('statusChart'), {
      type: 'pie',
      data: {
        labels: ['Available', 'Checked Out'],
        datasets: [{
          label: 'Asset Status',
          data: [data.available, data.checkedOut],
          backgroundColor: ['#10b981', '#f97316']
        }]
      }
    });

    new Chart(document.getElementById('usageChart'), {
      type: 'bar',
      data: {
        labels: Array.isArray(data.mostUsed) ? data.mostUsed.map(a => a.name) : [],
        datasets: [{
          label: 'Checkouts',
          data: Array.isArray(data.mostUsed) ? data.mostUsed.map(a => a.usageCount) : [],
          backgroundColor: '#6366f1'
        }]
      }
    });
  } catch (err) {
    console.error("❌ Error loading analytics:", err);
    // Fallback dummy data
    console.log("⚠️ Using fallback analytics data");
    new Chart(document.getElementById('statusChart'), {
      type: 'pie',
      data: {
        labels: ['Available', 'Checked Out'],
        datasets: [{
          label: 'Asset Status',
          data: [10, 5],
          backgroundColor: ['#10b981', '#f97316']
        }]
      }
    });

    new Chart(document.getElementById('usageChart'), {
      type: 'bar',
      data: {
        labels: ['Asset A', 'Asset B', 'Asset C'],
        datasets: [{
          label: 'Checkouts',
          data: [4, 3, 2],
          backgroundColor: '#6366f1'
        }]
      }
    });
  }
}

loadAnalytics();