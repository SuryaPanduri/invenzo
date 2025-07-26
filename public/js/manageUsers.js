console.log("🔧 Manage Users loaded");

const userTableBody = document.getElementById("userTableBody");
const token = localStorage.getItem("token");
const userRole = localStorage.getItem("role");

const addUserForm = document.getElementById("addUserForm");
const editUserForm = document.getElementById("editUserForm");

const addUserModal = new bootstrap.Modal(document.getElementById("addUserModal"));
const editUserModal = new bootstrap.Modal(document.getElementById("editUserModal"));

const userNameInput = document.getElementById("addUserName");
const userEmailInput = document.getElementById("addUserEmail");
const userPasswordInput = document.getElementById("addUserPassword");
const userRoleSelect = document.getElementById("addUserRole");

const editUserIdInput = document.getElementById("editUserId");
const editUserNameInput = document.getElementById("editUserName");
const editUserEmailInput = document.getElementById("editUserEmail");
const editUserRoleSelect = document.getElementById("editUserRole");

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");

let allUsers = []; // to hold the unfiltered list

const addUserBtn = document.getElementById("addUserBtn");
if (userRole !== "admin") {
  addUserBtn.style.display = "none";
}

function fetchUsers() {
  fetch("/api/users", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const users = Array.isArray(data) ? data : data.users || [];
      allUsers = Array.isArray(data) ? data : data.users || [];
      renderUserTable(allUsers);
    })
    .catch((err) => console.error("❌ Error fetching users:", err));
}

addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!userNameInput || !userEmailInput || !userPasswordInput || !userRoleSelect) {
    console.error("❌ One or more add form inputs not found");
    return;
  }

  const payload = {
    name: userNameInput.value.trim(),
    email: userEmailInput.value.trim(),
    password: userPasswordInput.value.trim(),
    role: userRoleSelect.value
  };

  console.log("📥 Add User Input:", payload);
  if (!payload.name || !payload.email || !payload.password || !payload.role) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to add user");

    addUserForm.reset();
    addUserModal.hide();
    fetchUsers();
    alert('New user added successfully.');
  } catch (err) {
    console.error("❌ Add user error:", err);
    alert("Error adding user: " + err.message);
  }
});

editUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editUserIdInput.value;
  const payload = {
    name: editUserNameInput.value.trim(),
    email: editUserEmailInput.value.trim(),
    role: editUserRoleSelect.value
  };

  if (!payload.name || !payload.email || !payload.role) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to update user");

    editUserForm.reset();
    editUserModal.hide();
    fetchUsers();
    alert('User details updated successfully.');
  } catch (err) {
    console.error("❌ Edit user error:", err);
    alert("Error editing user: " + err.message);
  }
});

userTableBody.addEventListener("click", (e) => {

  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        fetchUsers();
        alert("User deleted successfully.");
      })
      .catch((err) => console.error("❌ Delete error:", err));
  }

  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.getAttribute("data-id");
    const row = e.target.closest("tr");

    if (!editUserIdInput || !editUserNameInput || !editUserEmailInput || !editUserRoleSelect) {
      console.error("❌ One or more edit form inputs not found");
      return;
    }

    if (row) {
      editUserIdInput.value = id;
      editUserNameInput.value = row.children[1].textContent.trim();
      editUserEmailInput.value = row.children[2].textContent.trim();
      editUserRoleSelect.value = row.children[3].textContent.trim();

      editUserModal.show();
    } else {
      console.warn("Edit row not found");
    }
  }
});

document.addEventListener("DOMContentLoaded", fetchUsers);

document.getElementById("addUserBtn").addEventListener("click", () => {
  addUserForm.reset();
  addUserModal.show();
});


function renderUserTable(users) {
  userTableBody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");
    let actionButtons = '';
    if (userRole === "admin") {
      actionButtons = `
        <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Delete</button>
      `;
    } else if (userRole === "manager") {
      actionButtons = `<button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}">Edit</button>`;
    } else {
      actionButtons = '';
    }

    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${actionButtons}</td>
    `;
    userTableBody.appendChild(tr);
  });
}

  function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();
    const selectedRole = roleFilter.value;
  
    const filteredUsers = allUsers.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchValue) ||
                            user.email.toLowerCase().includes(searchValue);
      const matchesRole = selectedRole ? user.role === selectedRole : true;
      return matchesSearch && matchesRole;
    });
  
    renderUserTable(filteredUsers);
  }

searchInput.addEventListener("input", applyFilters);
roleFilter.addEventListener("change", applyFilters);
console.log("✅ DOM fully loaded, JS initialized.");

