// API Configuration
const API_BASE = window.location.origin;
const API_URL = `${API_BASE}/api/products`;
const AUTH_URL = `${API_BASE}/api/admin`;

// Authentication State
let isAuthenticated = false;

// DOM Elements - Authentication
const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logout-btn");
const adminUsernameEl = document.getElementById("admin-username");

// DOM Elements - Admin Panel
const productForm = document.getElementById("product-form");
const productsGrid = document.getElementById("admin-products-grid");
const formTitle = document.getElementById("form-title");
const productIdInput = document.getElementById("product-id");
const nameInput = document.getElementById("product-name");
const priceInput = document.getElementById("product-price");
const categorySelect = document.getElementById("product-category");
const descriptionInput = document.getElementById("product-description");
const imageInput = document.getElementById("product-image");
const imagePreview = document.getElementById("image-preview");
const cancelEditBtn = document.getElementById("cancel-edit");
const refreshBtn = document.getElementById("refresh-products");
const totalProductsEl = document.getElementById("total-products");
const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const closeDeleteModalBtn = document.getElementById("close-delete-modal");

// State
let products = [];
let editingProductId = null;
let productToDelete = null;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  checkAuthentication();
  setupEventListeners();
});

// Authentication Functions
async function checkAuthentication() {
  try {
    const response = await fetch(`${AUTH_URL}/check`, {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        isAuthenticated = true;
        adminUsernameEl.textContent = data.username;
        showAdminPanel();
        loadProducts();
      } else {
        showLoginScreen();
      }
    } else {
      showLoginScreen();
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    showLoginScreen();
  }
}

function showLoginScreen() {
  loginScreen.style.display = "flex";
  adminPanel.style.display = "none";
  isAuthenticated = false;
}

function showAdminPanel() {
  loginScreen.style.display = "none";
  adminPanel.style.display = "block";
  isAuthenticated = true;
}

async function handleLogin(e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showToast("Please enter both username and password", "error");
    return;
  }

  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast(`Welcome back, ${data.username}!`, "success");
      adminUsernameEl.textContent = data.username;
      showAdminPanel();
      loadProducts();

      // Reset login form
      loginForm.reset();
    } else {
      showToast(data.error || "Login failed", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast("Login failed. Please try again.", "error");
  }
}

async function handleLogout() {
  try {
    const response = await fetch(`${AUTH_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      showToast("Logged out successfully", "success");
      showLoginScreen();
    } else {
      showToast("Logout failed", "error");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showToast("Logout failed", "error");
  }
}

// Event Listeners
function setupEventListeners() {
  // Authentication listeners
  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);

  // Admin panel listeners
  productForm.addEventListener("submit", handleFormSubmit);
  imageInput.addEventListener("change", handleImagePreview);
  cancelEditBtn.addEventListener("click", cancelEdit);
  refreshBtn.addEventListener("click", loadProducts);

  // Delete modal
  confirmDeleteBtn.addEventListener("click", confirmDelete);
  cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  closeDeleteModalBtn.addEventListener("click", closeDeleteModal);

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });
}

// Form Handling
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!isAuthenticated) {
    showToast("Please log in to continue", "error");
    showLoginScreen();
    return;
  }

  const formData = new FormData();
  formData.append("name", nameInput.value.trim());
  formData.append("price", priceInput.value);
  formData.append("category", categorySelect.value);
  formData.append("description", descriptionInput.value.trim());

  // Only append image if a new one is selected
  if (imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  try {
    const isEditing = editingProductId !== null;
    const url = isEditing ? `${API_URL}/${editingProductId}` : API_URL;
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      credentials: "include",
      body: formData,
    });

    if (response.status === 401) {
      showToast("Session expired. Please log in again.", "error");
      showLoginScreen();
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save product");
    }

    const result = await response.json();
    showToast(result.message || "Product saved successfully!", "success");

    resetForm();
    loadProducts();
  } catch (error) {
    console.error("Error saving product:", error);
    showToast(error.message || "Failed to save product", "error");
  }
}

// Image Preview
function handleImagePreview(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML = `
                <img src="${
                  e.target.result
                }" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    File: ${file.name} (${(file.size / 1024 / 1024).toFixed(
        2
      )} MB)
                </p>
            `;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = "";
  }
}

// Load Products
async function loadProducts() {
  try {
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to load products");

    products = await response.json();
    displayProducts();
    updateStats();
  } catch (error) {
    console.error("Error loading products:", error);
    productsGrid.innerHTML = `
            <div class="loading">
                <p>Failed to load products. Please try again.</p>
                <button onclick="loadProducts()" class="btn btn-primary">Retry</button>
            </div>
        `;
  }
}

// Display Products
function displayProducts() {
  if (products.length === 0) {
    productsGrid.innerHTML = `
            <div class="loading">
                <p>No products found.</p>
                <p>Add your first product using the form above!</p>
            </div>
        `;
    return;
  }

  productsGrid.innerHTML = products
    .map(
      (product) => `
        <div class="admin-product-card">
            <img src="${product.image}" alt="${
        product.name
      }" class="admin-product-image" loading="lazy">
            <div class="admin-product-info">
                <div class="admin-product-category">${product.category}</div>
                <h3 class="admin-product-name">${product.name}</h3>
                <p class="admin-product-price">₦${Number(
                  product.price
                ).toLocaleString()}</p>
                ${
                  product.description
                    ? `<p class="admin-product-description">${product.description}</p>`
                    : ""
                }
                <div class="admin-product-actions">
                    <button class="edit-btn" onclick="editProduct(${
                      product.id
                    })">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="showDeleteConfirmation(${
                      product.id
                    })">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Update Statistics
function updateStats() {
  totalProductsEl.textContent = products.length;
}

// Edit Product
function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  editingProductId = id;
  formTitle.textContent = "Edit Product";
  productIdInput.value = id;
  nameInput.value = product.name;
  priceInput.value = product.price;
  categorySelect.value = product.category;
  descriptionInput.value = product.description || "";

  // Show current image
  imagePreview.innerHTML = `
        <img src="${product.image}" alt="Current image" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
        <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">Current image (select new image to replace)</p>
    `;

  // Make image input optional for editing
  imageInput.removeAttribute("required");

  cancelEditBtn.style.display = "inline-flex";

  // Scroll to form
  productForm.scrollIntoView({ behavior: "smooth" });
}

// Cancel Edit
function cancelEdit() {
  resetForm();
}

// Reset Form
function resetForm() {
  editingProductId = null;
  formTitle.textContent = "Add New Product";
  productForm.reset();
  imagePreview.innerHTML = "";
  imageInput.setAttribute("required", "required");
  cancelEditBtn.style.display = "none";
}

// Delete Product Functions
function showDeleteConfirmation(id) {
  productToDelete = id;
  deleteModal.style.display = "block";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
  productToDelete = null;
}

async function confirmDelete() {
  if (!productToDelete) return;

  if (!isAuthenticated) {
    showToast("Please log in to continue", "error");
    showLoginScreen();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${productToDelete}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.status === 401) {
      showToast("Session expired. Please log in again.", "error");
      showLoginScreen();
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete product");
    }

    const result = await response.json();
    showToast(result.message || "Product deleted successfully!", "success");

    closeDeleteModal();
    loadProducts();
  } catch (error) {
    console.error("Error deleting product:", error);
    showToast(error.message || "Failed to delete product", "error");
  }
}

// Utility Functions
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-circle"
        }"></i>
        ${message}
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);

  // Manual close on click
  toast.addEventListener("click", () => {
    toast.remove();
  });
}

// File Upload Validation
imageInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast(
        "File size too large. Please select an image under 5MB.",
        "error"
      );
      this.value = "";
      imagePreview.innerHTML = "";
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast(
        "Invalid file type. Please select a valid image file.",
        "error"
      );
      this.value = "";
      imagePreview.innerHTML = "";
      return;
    }
  }
});

// Form validation
function validateForm() {
  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name) {
    showToast("Product name is required", "error");
    nameInput.focus();
    return false;
  }

  if (!price || price <= 0) {
    showToast("Please enter a valid price", "error");
    priceInput.focus();
    return false;
  }

  if (!editingProductId && !imageInput.files[0]) {
    showToast("Product image is required", "error");
    imageInput.focus();
    return false;
  }

  return true;
}

// Add validation to form submit
productForm.addEventListener("submit", function (e) {
  if (!validateForm()) {
    e.preventDefault();
  }
});

// Auto-save form data (optional)
function saveFormData() {
  const formData = {
    name: nameInput.value,
    price: priceInput.value,
    category: categorySelect.value,
    description: descriptionInput.value,
  };
  localStorage.setItem("nafeskey-admin-form", JSON.stringify(formData));
}

function loadFormData() {
  const saved = localStorage.getItem("nafeskey-admin-form");
  if (saved && !editingProductId) {
    const data = JSON.parse(saved);
    nameInput.value = data.name || "";
    priceInput.value = data.price || "";
    categorySelect.value = data.category || "General";
    descriptionInput.value = data.description || "";
  }
}

// Save form data on input
[nameInput, priceInput, categorySelect, descriptionInput].forEach((input) => {
  input.addEventListener("input", saveFormData);
});

// Load saved form data on page load
document.addEventListener("DOMContentLoaded", loadFormData);

// Clear saved form data when form is submitted successfully
productForm.addEventListener("submit", function () {
  localStorage.removeItem("nafeskey-admin-form");
});
