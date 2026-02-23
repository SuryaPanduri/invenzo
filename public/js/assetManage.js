document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return (window.location.href = 'login.html');

  if (role !== 'admin') {
    const addAssetBtn = document.getElementById('addAssetBtn');
    if (addAssetBtn) addAssetBtn.style.display = 'none';
  }

  loadAssets();

  document.getElementById('searchInput').addEventListener('input', loadAssets);
  document.getElementById('statusFilter').addEventListener('change', loadAssets);
});

function applyFilters(assets) {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const statusValue = document.getElementById('statusFilter').value;

  return assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchValue) ||
      asset.serial_number?.toLowerCase().includes(searchValue);
    const matchesStatus = !statusValue || asset.status === statusValue;
    return matchesSearch && matchesStatus;
  });
}

function formatDateValue(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

async function loadAssets() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/assets', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const assets = await response.json();
    const filteredAssets = applyFilters(assets);
    populateTable(filteredAssets);
    updateStats(filteredAssets);
  } catch (err) {
    console.error('Failed to load assets:', err);
    alert('Error loading data. Please login again.');
    window.location.href = 'login.html';
  }
}

function populateTable(assets) {
  const tbody = document.getElementById('assetTableBody');
  tbody.innerHTML = '';
  const role = localStorage.getItem('role');

  assets.forEach((asset) => {
    const statusClass =
      asset.status === 'Available'
        ? 'badge-available'
        : asset.status === 'Checked Out'
          ? 'badge-checkedout'
          : 'badge-other';

    const canManageCheckout = role === 'admin' || role === 'manager';
    const checkoutAction =
      canManageCheckout && asset.status !== 'Checked Out'
        ? `<button class="btn btn-sm btn-secondary me-2 checkout-btn" data-id="${asset.id}">Checkout</button>`
        : '';
    const returnAction =
      canManageCheckout && asset.status === 'Checked Out'
        ? `<button class="btn btn-sm btn-success me-2 return-btn" data-id="${asset.id}">Return</button>`
        : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${asset.id}</td>
      <td>${asset.name}</td>
      <td><span class="status-badge ${statusClass}">${asset.status}</span></td>
      <td>${asset.current_assignee || '-'}</td>
      <td>${formatDateValue(asset.current_due_date)}</td>
      <td>${new Date(asset.created_at).toLocaleString()}</td>
      <td>
        <button class="btn btn-sm btn-info me-2 view-btn" data-id="${asset.id}">View</button>
        ${checkoutAction}
        ${returnAction}
        ${role === 'admin' || role === 'manager' ? `<button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${asset.id}">Edit</button>` : ''}
        ${role === 'admin' ? `<button class="btn btn-sm btn-danger delete-btn" data-id="${asset.id}">Delete</button>` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.querySelectorAll('.view-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      const token = localStorage.getItem('token');

      try {
        const [assetRes, historyRes] = await Promise.all([
          fetch(`/api/assets/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`/api/assets/${id}/history`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const asset = await assetRes.json();
        const history = await historyRes.json();

        document.getElementById('viewAssetId').textContent = asset.id;
        document.getElementById('viewAssetName').textContent = asset.name;
        document.getElementById('viewAssetStatus').textContent = asset.status;
        document.getElementById('viewAssetDescription').textContent = asset.description || 'N/A';
        document.getElementById('viewAssetPurchaseDate').textContent = asset.purchase_date || 'N/A';
        document.getElementById('viewAssetSerial').textContent = asset.serial_number || 'N/A';
        document.getElementById('viewAssetNotes').textContent = asset.notes || 'N/A';
        document.getElementById('viewAssetCreatedAt').textContent = new Date(asset.created_at).toLocaleString();

        const historyEl = document.getElementById('viewAssetHistory');
        if (historyEl) {
          const latest = history.checkoutHistory?.[0];
          historyEl.textContent = latest
            ? `Last checkout: ${new Date(latest.checkout_date).toLocaleString()} to ${latest.checked_out_to_name || 'Unknown'}`
            : 'No checkout history yet.';
        }

        const modal = new bootstrap.Modal(document.getElementById('viewAssetModal'));
        modal.show();
      } catch (err) {
        console.error('Failed to fetch asset details:', err);
        alert('Failed to fetch asset details.');
      }
    });
  });
}

function updateStats(assets) {
  const totalEl = document.getElementById('totalAssets');
  const availableEl = document.getElementById('availableAssets');
  const checkedOutEl = document.getElementById('checkedOutAssets');

  if (!totalEl || !availableEl || !checkedOutEl) return;

  totalEl.textContent = assets.length;
  availableEl.textContent = assets.filter((a) => a.status === 'Available').length;
  checkedOutEl.textContent = assets.filter((a) => a.status === 'Checked Out').length;
}

document.getElementById('assetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const token = localStorage.getItem('token');

  const formData = {
    name: form.name.value,
    type: form.type.value,
    purchase_date: form.purchase_date.value,
    status: form.status.value,
    serial_number: form.serial_number.value,
    notes: form.notes.value
  };

  try {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert('Asset added!');
      form.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById('assetModal'));
      modal.hide();
      loadAssets();
    } else {
      alert(result.message || 'Failed to add asset');
    }
  } catch (err) {
    console.error('Add asset error:', err);
    alert('Something went wrong');
  }
});

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const assetId = e.target.dataset.id;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assets/${assetId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const asset = await res.json();

      document.getElementById('editAssetId').value = asset.id;
      document.getElementById('editAssetName').value = asset.name;
      document.getElementById('editAssetType').value = asset.type;
      document.getElementById('editAssetPurchaseDate').value = asset.purchase_date?.split('T')[0];
      document.getElementById('editAssetStatus').value = asset.status;
      document.getElementById('editAssetSerialNumber').value = asset.serial_number;
      document.getElementById('editAssetNotes').value = asset.notes;

      const modal = new bootstrap.Modal(document.getElementById('editAssetModal'));
      modal.show();
    } catch (err) {
      console.error('Error fetching asset:', err);
      alert('Failed to load asset data for editing.');
    }
  }

  if (e.target.classList.contains('checkout-btn')) {
    const assetId = e.target.getAttribute('data-id');
    const checkedOutToUserId = prompt('Enter user ID to checkout to:');
    if (!checkedOutToUserId) return;

    const dueDate = prompt('Enter due date (YYYY-MM-DD) or leave blank:') || null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assets/${assetId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ checkedOutToUserId: Number(checkedOutToUserId), dueDate })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Checkout failed');

      alert('Asset checked out successfully');
      loadAssets();
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.message || 'Failed to checkout asset');
    }
  }

  if (e.target.classList.contains('return-btn')) {
    const assetId = e.target.getAttribute('data-id');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assets/${assetId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Return failed');

      alert('Asset returned successfully');
      loadAssets();
    } catch (err) {
      console.error('Return error:', err);
      alert(err.message || 'Failed to return asset');
    }
  }
});

document.getElementById('editAssetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const id = document.getElementById('editAssetId').value;

  const updatedAsset = {
    name: document.getElementById('editAssetName').value,
    type: document.getElementById('editAssetType').value,
    purchase_date: document.getElementById('editAssetPurchaseDate').value,
    status: document.getElementById('editAssetStatus').value,
    serial_number: document.getElementById('editAssetSerialNumber').value,
    notes: document.getElementById('editAssetNotes').value
  };

  try {
    const res = await fetch(`/api/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedAsset)
    });

    if (res.ok) {
      bootstrap.Modal.getInstance(document.getElementById('editAssetModal')).hide();
      loadAssets();
      alert('Asset details updated successfully.');
    } else {
      const error = await res.json();
      alert(`Update failed: ${error.message}`);
    }
  } catch (err) {
    console.error('Update asset error:', err);
    alert('Something went wrong during update.');
  }
});

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const assetId = e.target.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/assets/${assetId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to delete asset');
        alert('Asset deleted successfully');
        loadAssets();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete asset.');
      }
    }
  }
});
