# 🛍️ Nafeskey Shop

A modern, responsive e-commerce platform with a beautiful purple and black color scheme. Built with Node.js, Express, and SQLite for a seamless shopping experience.

## ✨ Features

### 🎨 Design & UI
- **Beautiful Purple & Black Theme**: Modern gradient-based design with excellent contrast
- **Responsive Layout**: Optimized for all devices (desktop, tablet, mobile)
- **Enhanced Product Cards**: Large product images with compact, readable text
- **Interactive Animations**: Smooth hover effects and transitions
- **Professional Typography**: Clean, modern fonts with proper hierarchy

### 🛍️ Customer Features

- **Modern UI/UX**: Clean, responsive design that works on all devices
- **Product Catalog**: Browse products with beautiful grid layout
- **Category Filtering**: Filter products by categories
- **Shopping Cart**: Add, remove, and manage items in cart
- **WhatsApp Checkout**: Direct ordering through WhatsApp
- **Image Optimization**: Fast loading with optimized product images

### 🛠️ Admin Features

- **Product Management**: Add, edit, and delete products
- **Image Upload**: Upload product images with automatic processing
- **Category Management**: Organize products into categories
- **Real-time Updates**: See changes instantly
- **Form Validation**: Prevent errors with built-in validation
- **Statistics Dashboard**: Track your inventory with visual cards

### 🔧 Technical Features

- **SQLite Database**: Lightweight, serverless database
- **File Upload**: Secure image upload with validation
- **API-First**: RESTful API architecture
- **Error Handling**: Robust error handling and user feedback
- **Responsive Design**: Mobile-first design approach
- **CORS Support**: Cross-origin resource sharing enabled

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start the Server**

   ```bash
   npm start
   ```

3. **Access Your Shop**
   - **Shop**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin.html

## 🎯 Recent Enhancements

### Visual Improvements
- **Purple & Black Color Scheme**: Cohesive design with beautiful gradients and proper contrast
- **Larger Product Images**: Enhanced from 250px to 320px height for better product showcase
- **Compact Text Layout**: Reduced font sizes and spacing for cleaner, more professional appearance
- **Enhanced Footer**: Comprehensive footer with company info, quick links, categories, and contact details
- **Better Spacing**: Optimized margins and padding throughout the application

### User Experience
- **Improved Navigation**: Smooth scrolling and interactive footer elements
- **Mobile Optimization**: Better responsive design for all screen sizes
- **Interactive Cart**: Enhanced shopping cart accessible from footer
- **Category Links**: Footer category links that filter products automatically
- **Loading States**: Better visual feedback and animations

### Technical Improvements
- **Text Truncation**: Product descriptions limited to 2 lines for consistent card heights
- **Enhanced Hover Effects**: Smooth transitions and purple glow effects
- **Optimized Performance**: Reduced spacing and improved layout efficiency

## 🎨 Color Palette

- **Primary Purple**: `#9333ea`
- **Light Purple**: `#c084fc`
- **Deep Purple**: `#7c3aed`
- **Dark Background**: `#0a0a0a`
- **Purple Dark**: `#1a0d2e`
- **Text Light**: `#f0e6ff`
- **Text Secondary**: `#d8b4fe`

## 📱 Usage

### For Shop Owners (Admin)

1. **Add Products**:

   - Go to the Admin Panel
   - Fill in product details (name, price, category, description)
   - Upload a product image
   - Click "Save Product"

2. **Manage Inventory**:

   - View all products in the admin dashboard
   - Edit existing products
   - Delete products when out of stock

3. **Categories**:
   - Products are automatically organized by categories
   - Default categories: General, Electronics, Clothing, Books, Sports
   - Add custom categories as needed

### For Customers

1. **Browse Products**:

   - Visit the main shop page
   - Filter by categories
   - View product details

2. **Shopping**:

   - Add items to cart
   - Adjust quantities
   - Remove unwanted items

3. **Checkout**:
   - Click "Checkout via WhatsApp"
   - Complete purchase through WhatsApp

## 🔧 Configuration

### WhatsApp Integration

Update the WhatsApp number in:

- `public/script.js` (line 185): Replace `"2348000000000"` with your number
- `public/index.html` (line 90): Update the WhatsApp float button URL

### Customization

- **Logo**: Update the logo in `public/index.html`
- **Colors**: Modify CSS variables in `public/styles.css`
- **Categories**: Add more categories in the admin form

## 📁 Project Structure

```
nafeskey-shop/
├── server.js              # Express server
├── package.json           # Dependencies
├── shop.db               # SQLite database (auto-created)
├── uploads/              # Product images (auto-created)
└── public/               # Frontend files
    ├── index.html        # Main shop page
    ├── admin.html        # Admin panel
    ├── styles.css        # All styles
    ├── script.js         # Shop functionality
    └── admin.js          # Admin functionality
```

## 🔒 Security Features

- **File Upload Validation**: Only images allowed, size limits enforced
- **Input Sanitization**: All inputs are validated
- **Error Handling**: Graceful error handling prevents crashes
- **CORS Protection**: Cross-origin requests properly configured

## 🎨 Customization

The shop is designed to be easily customizable:

1. **Branding**: Update colors, fonts, and logo
2. **Layout**: Modify grid layouts and spacing
3. **Features**: Add new product fields or functionality
4. **Integration**: Connect to payment gateways or other services

## 📈 Performance

- **Optimized Images**: Automatic image compression and lazy loading
- **Efficient Database**: SQLite for fast, local data storage
- **Minimal Dependencies**: Lightweight stack for fast loading
- **Responsive Design**: Mobile-optimized for all devices

## 🚀 Deployment

Ready for deployment to:

- **Heroku**: Add Postgres for production database
- **Vercel**: Frontend with serverless functions
- **Digital Ocean**: Full server deployment
- **Local Server**: Perfect for local business use

## 📞 Support

Need help? Your shop includes:

- **WhatsApp Integration**: Direct customer communication
- **Error Logging**: Built-in error tracking
- **User-Friendly Interface**: Intuitive design for all skill levels

---

**Start selling your products today with Nafeskey Shop!** 🛍️
