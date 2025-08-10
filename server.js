const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Database setup
const db = new sqlite3.Database("shop.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// Create products table
db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            category TEXT,
            image TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Routes

// Get all products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single product
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(row);
    }
  });
});

// Add new product
app.post("/api/products", upload.single("image"), (req, res) => {
  const { name, price, description, category } = req.body;

  if (!name || !price || !req.file) {
    return res
      .status(400)
      .json({ error: "Name, price, and image are required" });
  }

  const image = `/uploads/${req.file.filename}`;

  db.run(
    "INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)",
    [name, price, description || "", category || "General", image],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          id: this.lastID,
          name,
          price,
          description,
          category,
          image,
          message: "Product added successfully!",
        });
      }
    }
  );
});

// Update product
app.put("/api/products/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, price, description, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  let query =
    "UPDATE products SET name = ?, price = ?, description = ?, category = ?";
  let params = [name, price, description || "", category || "General"];

  if (req.file) {
    query += ", image = ?";
    params.push(`/uploads/${req.file.filename}`);
  }

  query += " WHERE id = ?";
  params.push(id);

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Product updated successfully!" });
    }
  });
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;

  // First get the product to delete the image file
  db.get("SELECT image FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row && row.image) {
      const imagePath = path.join(__dirname, row.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Product deleted successfully!" });
      }
    });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nafeskey Shop Server running at http://localhost:${PORT}`);
  console.log(`📱 Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`🛍️ Shop: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔄 Closing database connection...");
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("✅ Database connection closed.");
    }
    process.exit(0);
  });
});
