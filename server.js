const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

let products = [
  { id: 1, name: "T-shirt", price: 20, image: "product1.jpg", colors: ["Red", "Blue"], sizes: ["S", "M", "L"] }
];

app.get('/products', (req, res) => {
  res.json(products);
});

app.post('/admin/products', upload.single('productImage'), (req, res) => {
  const { name, price, colors, sizes } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    price,
    image: req.file.filename,
    colors: colors.split(','),
    sizes: sizes.split(',')
  };
  products.push(newProduct);
  res.status(201).json({ message: 'Product added successfully', product: newProduct });
});

app.post('/upload-image', upload.single('customerImage'), (req, res) => {
  if (req.file) {
    res.status(200).json({ message: 'Image uploaded successfully', imagePath: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'No image uploaded' });
  }
});

let adminAuthenticated = false;
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'adminpassword') {
    adminAuthenticated = true;
    res.status(200).json({ message: 'Admin logged in' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

function checkAdminAuth(req, res, next) {
  if (adminAuthenticated) next();
  else res.status(403).json({ message: 'Access denied. Admin login required' });
}

app.get('/admin/dashboard', checkAdminAuth, (req, res) => {
  res.json(products);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});