document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const assetBody = document.getElementById('assetBody');
  
    if (!token) {
      window.location.href = 'login.html'; // Not logged in
      return;
    }
  
    fetch('/api/assets', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          assetBody.innerHTML = '<tr><td colspan="4">No assets found</td></tr>';
          return;
        }
  
        data.forEach(asset => {
          const row = `
            <tr>
              <td>${asset.id}</td>
              <td>${asset.name}</td>
              <td>${asset.category}</td>
              <td>${asset.status}</td>
            </tr>
          `;
          assetBody.innerHTML += row;
        });
      })
      .catch(err => {
        console.error(err);
        assetBody.innerHTML = '<tr><td colspan="4">Error loading assets</td></tr>';
      });
  
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  });