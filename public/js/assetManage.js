document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return (window.location.href = 'login.html');
  
    loadAssets(); // Call the main function to load data
  });
  
  // Function to load asset data and populate table + stats
  async function loadAssets() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assets', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
  
      const assets = await response.json();
      populateTable(assets);
      updateStats(assets);
  
    } catch (err) {
      console.error("Failed to load assets:", err);
      alert('Error loading data. Please login again.');
      window.location.href = 'login.html';
    }
  }
  
  // Insert assets into table
  function populateTable(assets) {
    const tbody = document.getElementById('assetTableBody');
    tbody.innerHTML = '';
  
    assets.forEach(asset => {
      const statusClass =
        asset.status === 'Available' ? 'badge-available' :
        asset.status === 'Checked Out' ? 'badge-checkedout' : 'badge-other';
  
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${asset.id}</td>
        <td>${asset.name}</td>
        <td><span class="status-badge ${statusClass}">${asset.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-2">Edit</button>
          <button class="btn btn-sm btn-outline-danger">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  // Update dashboard stats if available
  function updateStats(assets) {
    const totalEl = document.getElementById('totalAssets');
    const availableEl = document.getElementById('availableAssets');
    const checkedOutEl = document.getElementById('checkedOutAssets');
  
    if (!totalEl || !availableEl || !checkedOutEl) return;
  
    totalEl.textContent = assets.length;
    availableEl.textContent = assets.filter(a => a.status === 'Available').length;
    checkedOutEl.textContent = assets.filter(a => a.status === 'Checked Out').length;
  }
  
  // Highlight active sidebar link
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });