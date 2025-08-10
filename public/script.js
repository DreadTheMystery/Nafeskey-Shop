// API Configuration
const API_BASE = window.location.origin;
const API_URL = `${API_BASE}/api/products`;

// DOM Elements
const productsGrid = document.getElementById("products-grid");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

// State
let products = [];
let cart = JSON.parse(localStorage.getItem("nafeskey-cart")) || [];
let currentCategory = "all";

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
  updateCartUI();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Navigation
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Cart modal
  cartBtn.addEventListener("click", openCartModal);
  closeCart.addEventListener("click", closeCartModal);
  clearCartBtn.addEventListener("click", clearCart);
  checkoutBtn.addEventListener("click", checkoutWhatsApp);

  // Category filters
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const category = e.target.dataset.category;
      filterProducts(category);

      // Update active button
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      closeCartModal();
    }
  });
}

// Load Products
async function loadProducts() {
  try {
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to load products");

    products = await response.json();
    displayProducts(products);

    // Update category filter based on available categories
    updateCategoryFilter();
  } catch (error) {
    console.error("Error loading products:", error);
    productsGrid.innerHTML = `
            <div class="loading">
                <p>Failed to load products. Please try again later.</p>
                <button onclick="loadProducts()" class="btn btn-primary">Retry</button>
            </div>
        `;
  }
}

// Display Products
function displayProducts(productsToShow) {
  if (productsToShow.length === 0) {
    productsGrid.innerHTML = `
            <div class="loading">
                <p>No products available.</p>
                ${
                  window.location.pathname.includes("admin")
                    ? ""
                    : "<p>Check back later for new items!</p>"
                }
            </div>
        `;
    return;
  }

  productsGrid.innerHTML = productsToShow
    .map(
      (product) => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${
        product.name
      }" class="product-image" loading="lazy">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">₦${Number(
                  product.price
                ).toLocaleString()}</p>
                ${
                  product.description
                    ? `<p class="product-description">${product.description}</p>`
                    : ""
                }
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// Update Category Filter
function updateCategoryFilter() {
  const categories = [...new Set(products.map((p) => p.category))];
  const categoryFilter = document.querySelector(".category-filter");

  // Keep the "All" button and add categories that exist in products
  const existingButtons = categoryFilter.querySelectorAll(
    '.filter-btn:not([data-category="all"])'
  );
  existingButtons.forEach((btn) => {
    if (!categories.includes(btn.dataset.category)) {
      btn.style.display = "none";
    } else {
      btn.style.display = "block";
    }
  });
}

// Filter Products
function filterProducts(category) {
  currentCategory = category;
  const filteredProducts =
    category === "all"
      ? products
      : products.filter((product) => product.category === category);

  displayProducts(filteredProducts);
}

// Cart Functions
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
  displayCartItems();
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = parseInt(newQuantity);
    saveCart();
    updateCartUI();
    displayCartItems();
  }
}

function clearCart() {
  if (cart.length === 0) return;

  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    saveCart();
    updateCartUI();
    displayCartItems();
    showToast("Cart cleared!");
  }
}

function saveCart() {
  localStorage.setItem("nafeskey-cart", JSON.stringify(cart));
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// Cart Modal Functions
function openCartModal() {
  cartModal.style.display = "block";
  displayCartItems();
}

function closeCartModal() {
  cartModal.style.display = "none";
}

function displayCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    cartTotal.innerHTML = "";
    checkoutBtn.style.display = "none";
    clearCartBtn.style.display = "none";
    return;
  }

  const cartHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₦${Number(
                  item.price
                ).toLocaleString()}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${
                      item.id
                    }, ${item.quantity - 1})">-</button>
                    <input type="number" value="${
                      item.quantity
                    }" min="1" class="qty-input" 
                           onchange="updateQuantity(${item.id}, this.value)">
                    <button class="qty-btn" onclick="updateQuantity(${
                      item.id
                    }, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${
                      item.id
                    })">Remove</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  cartItems.innerHTML = cartHTML;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartTotal.innerHTML = `
        <div class="cart-total">
            <div>Total Items: ${totalItems}</div>
            <div>Total: ₦${total.toLocaleString()}</div>
        </div>
    `;

  checkoutBtn.style.display = "block";
  clearCartBtn.style.display = "block";
}

// WhatsApp Checkout
function checkoutWhatsApp() {
  if (cart.length === 0) return;

  let message = "Hello! I'd like to order the following items:\n\n";
  let total = 0;

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    message += `• ${item.name}\n  Quantity: ${
      item.quantity
    }\n  Price: ₦${Number(
      item.price
    ).toLocaleString()}\n  Subtotal: ₦${subtotal.toLocaleString()}\n\n`;
  });

  message += `Total: ₦${total.toLocaleString()}\n\n`;
  message += "Please confirm availability and payment details. Thank you!";

  const whatsappNumber = "2348000000000"; // Replace with your WhatsApp number
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  window.open(whatsappURL, "_blank");
}

// Utility Functions
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  const container =
    document.getElementById("toast-container") || createToastContainer();
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 3000;
    `;
  document.body.appendChild(container);
  return container;
}

// Search functionality (if needed)
function searchProducts(query) {
  const filtered = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
  );
  displayProducts(filtered);
}

// Footer functionality
document.addEventListener("DOMContentLoaded", function () {
  // Footer cart link functionality
  const footerCartLink = document.getElementById("footer-cart-link");
  if (footerCartLink) {
    footerCartLink.addEventListener("click", function (e) {
      e.preventDefault();
      cartModal.style.display = "block";
    });
  }

  // Footer category links functionality
  const footerCategoryLinks = document.querySelectorAll(
    ".footer-links a[data-category]"
  );
  footerCategoryLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const category = this.getAttribute("data-category");

      // Scroll to products section
      document.getElementById("products").scrollIntoView({
        behavior: "smooth",
      });

      // Filter products by category after a short delay
      setTimeout(() => {
        filterProducts(category);

        // Update active filter button
        document.querySelectorAll(".filter-btn").forEach((btn) => {
          btn.classList.remove("active");
          if (btn.getAttribute("data-category") === category) {
            btn.classList.add("active");
          }
        });
      }, 500);
    });
  });

  // Add smooth scrolling for all footer internal links
  const footerInternalLinks = document.querySelectorAll(
    '.footer-links a[href^="#"]'
  );
  footerInternalLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Add click-to-copy functionality for contact info
  const contactLinks = document.querySelectorAll(
    '.footer-links a[href^="tel:"], .footer-links a[href^="mailto:"]'
  );
  contactLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Allow normal behavior but also show a toast
      const text = this.href.replace("tel:", "").replace("mailto:", "");
      showToast(`Contact info copied: ${text}`, "success");
    });
  });
});

// Helper function to show toast notifications (if not already defined)
function showToast(message, type = "success") {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 90px;
      right: 20px;
      z-index: 3000;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    background: ${
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#f59e0b"
    };
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease;
  `;

  toastContainer.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
