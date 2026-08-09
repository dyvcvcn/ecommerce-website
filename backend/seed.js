// Seeds the database with demo categories/products.
const { v4: uuid } = require('uuid');
const db = require('./db');

const products = [
  { name: 'Classic Cotton T-Shirt', description: 'Soft 100% cotton crew-neck tee, everyday essential.', price: 499, category: 'Apparel', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', stock: 120 },
  { name: 'Slim Fit Denim Jeans', description: 'Stretch denim with a modern slim fit.', price: 1899, category: 'Apparel', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', stock: 60 },
  { name: 'Wireless Bluetooth Headphones', description: 'Over-ear headphones with 30-hour battery life.', price: 3499, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', stock: 40 },
  { name: 'Smart Fitness Watch', description: 'Tracks heart rate, sleep, and workouts.', price: 5999, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', stock: 25 },
  { name: 'Stainless Steel Water Bottle', description: 'Insulated 1L bottle, keeps drinks cold 24h.', price: 799, category: 'Home & Kitchen', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', stock: 200 },
  { name: 'Non-Stick Frying Pan 28cm', description: 'Durable non-stick coating, induction compatible.', price: 1299, category: 'Home & Kitchen', image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', stock: 55 },
  { name: 'Leather Laptop Backpack', description: 'Fits up to 15.6" laptops, water-resistant.', price: 2499, category: 'Accessories', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', stock: 70 },
  { name: 'Running Shoes', description: 'Lightweight breathable mesh, cushioned sole.', price: 2999, category: 'Footwear', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', stock: 90 },
  { name: 'Wireless Mechanical Keyboard', description: 'Hot-swappable switches, RGB backlight.', price: 4499, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', stock: 35 },
  { name: 'Ceramic Coffee Mug Set (4pc)', description: 'Microwave & dishwasher safe, 350ml each.', price: 899, category: 'Home & Kitchen', image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', stock: 150 },
  { name: 'Yoga Mat', description: 'Non-slip 6mm eco-friendly TPE mat.', price: 999, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', stock: 80 },
  { name: 'Sunglasses UV400', description: 'Polarized lenses with a classic frame.', price: 1199, category: 'Accessories', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', stock: 100 },
];

const insert = db.prepare(`INSERT INTO products (id, name, description, price, category, image_url, stock) VALUES (?,?,?,?,?,?,?)`);
const countRow = db.prepare('SELECT COUNT(*) as c FROM products').get();

if (countRow.c === 0) {
  const insertMany = db.transaction((items) => {
    for (const p of items) {
      insert.run(uuid(), p.name, p.description, p.price, p.category, p.image_url, p.stock);
    }
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log('Products already exist, skipping seed.');
}