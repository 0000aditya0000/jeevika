// Seed data for Jeevikaa Couture
export const CATEGORIES = [
  { name: 'Sarees', slug: 'sarees', description: 'Timeless elegance in silk, georgette and chiffon', banner: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e', thumbnail: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e' },
  { name: 'Lehengas', slug: 'lehengas', description: 'Regal lehengas for weddings and celebrations', banner: 'https://images.unsplash.com/photo-1654764746225-e63f5e90facd', thumbnail: 'https://images.unsplash.com/photo-1654764746225-e63f5e90facd' },
  { name: 'Kurtis', slug: 'kurtis', description: 'Everyday grace in modern silhouettes', banner: 'https://images.pexels.com/photos/35521738/pexels-photo-35521738.jpeg', thumbnail: 'https://images.pexels.com/photos/35521738/pexels-photo-35521738.jpeg' },
  { name: 'Gowns', slug: 'gowns', description: 'Statement gowns for unforgettable evenings', banner: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b', thumbnail: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b' },
  { name: 'Suits', slug: 'suits', description: 'Anarkalis and salwar suits with soul', banner: 'https://images.pexels.com/photos/15906956/pexels-photo-15906956.jpeg', thumbnail: 'https://images.pexels.com/photos/15906956/pexels-photo-15906956.jpeg' },
  { name: 'Co-ord Sets', slug: 'co-ord-sets', description: 'Coordinated luxury sets for every mood', banner: 'https://images.pexels.com/photos/8770996/pexels-photo-8770996.jpeg', thumbnail: 'https://images.pexels.com/photos/8770996/pexels-photo-8770996.jpeg' },
];

const IMG = {
  saree1: 'https://images.unsplash.com/photo-1610047614301-13c63f00c032',
  saree2: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e',
  saree3: 'https://images.pexels.com/photos/36041239/pexels-photo-36041239.jpeg',
  lehenga1: 'https://images.unsplash.com/photo-1617039487629-6babdcb2a24b',
  lehenga2: 'https://images.unsplash.com/photo-1654764746225-e63f5e90facd',
  lehenga3: 'https://images.pexels.com/photos/37628608/pexels-photo-37628608.jpeg',
  lehenga4: 'https://images.pexels.com/photos/28405815/pexels-photo-28405815.jpeg',
  gown1: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b',
  gown2: 'https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9',
  kurti1: 'https://images.pexels.com/photos/35521738/pexels-photo-35521738.jpeg',
  kurti2: 'https://images.pexels.com/photos/8770996/pexels-photo-8770996.jpeg',
  suit1: 'https://images.pexels.com/photos/15906956/pexels-photo-15906956.jpeg',
};

export const PRODUCTS = [
  { name: 'Rose Blush Silk Saree', slug: 'rose-blush-silk-saree', sku: 'JC-SR-001', category: 'sarees', price: 8999, discountPrice: 5999, description: 'A dreamy handwoven silk saree in blush rose with delicate gold zari borders. Perfect for festive evenings and intimate gatherings.', shortDescription: 'Handwoven silk with gold zari border', material: 'Pure Silk', fabric: 'Kanjivaram Silk', colors: ['#F19AC1', '#C2185B', '#FFD700'], sizes: ['Free Size'], stock: 25, images: [IMG.saree1, IMG.saree2, IMG.saree3], thumbnail: IMG.saree1, tags: ['saree','silk','festive'], trending: true, featured: true, bestSeller: true, newArrival: false, hotDeal: true },
  { name: 'Emerald Royalty Bridal Lehenga', slug: 'emerald-royalty-bridal-lehenga', sku: 'JC-LH-001', category: 'lehengas', price: 45000, discountPrice: 32999, description: 'A regal emerald and gold lehenga featuring intricate zardozi embroidery and dabka work. Handcrafted for the modern bride who commands every room.', shortDescription: 'Heavy zardozi bridal masterpiece', material: 'Raw Silk', fabric: 'Silk with Net Dupatta', colors: ['#0f5132', '#C2185B', '#FFD700'], sizes: ['XS','S','M','L','XL'], stock: 8, images: [IMG.lehenga2, IMG.lehenga1, IMG.lehenga4], thumbnail: IMG.lehenga2, tags: ['bridal','lehenga','luxury'], trending: true, featured: true, bestSeller: false, newArrival: true, hotDeal: false },
  { name: 'Peony Pink Party Lehenga', slug: 'peony-pink-party-lehenga', sku: 'JC-LH-002', category: 'lehengas', price: 22999, discountPrice: 15499, description: 'A romantic peony pink lehenga with sequin work and a floaty dupatta. Made to twirl on the dance floor.', shortDescription: 'Sequin embellished twirl-worthy lehenga', material: 'Georgette', fabric: 'Sequin Georgette', colors: ['#FFB6C1', '#C2185B'], sizes: ['XS','S','M','L','XL'], stock: 15, images: [IMG.lehenga1, IMG.lehenga3, IMG.lehenga4], thumbnail: IMG.lehenga1, tags: ['lehenga','party','sequin'], trending: true, featured: false, bestSeller: true, newArrival: true, hotDeal: true },
  { name: 'Sunset Coral Gown', slug: 'sunset-coral-gown', sku: 'JC-GW-001', category: 'gowns', price: 18999, discountPrice: 12499, description: 'A flowing coral evening gown with a plunging back and hand-embroidered bodice. Made for red carpet moments.', shortDescription: 'Hand-embroidered evening gown', material: 'Chiffon', fabric: 'Silk Chiffon', colors: ['#FF6F61', '#FFD700'], sizes: ['XS','S','M','L','XL'], stock: 12, images: [IMG.gown1, IMG.gown2], thumbnail: IMG.gown1, tags: ['gown','party','evening'], trending: false, featured: true, bestSeller: false, newArrival: true, hotDeal: false },
  { name: 'Ruby Bloom Kurti', slug: 'ruby-bloom-kurti', sku: 'JC-KR-001', category: 'kurtis', price: 3499, discountPrice: 1999, description: 'A vibrant ruby red kurti with subtle mirror work. Everyday elegance that stops traffic.', shortDescription: 'Mirror-work everyday kurti', material: 'Cotton', fabric: 'Pure Cotton', colors: ['#B71C1C', '#C2185B'], sizes: ['XS','S','M','L','XL','XXL'], stock: 40, images: [IMG.kurti1, IMG.kurti2], thumbnail: IMG.kurti1, tags: ['kurti','cotton','daily'], trending: true, featured: false, bestSeller: true, newArrival: false, hotDeal: true },
  { name: 'Marigold Muse Co-ord Set', slug: 'marigold-muse-co-ord-set', sku: 'JC-CO-001', category: 'co-ord-sets', price: 5999, discountPrice: 3999, description: 'A sunshine yellow co-ord set with delicate thread work. Effortless coordination, unforgettable presence.', shortDescription: 'Thread-work co-ord in marigold', material: 'Rayon', fabric: 'Rayon Blend', colors: ['#FFD700', '#F9A825'], sizes: ['S','M','L','XL'], stock: 22, images: [IMG.kurti2, IMG.kurti1], thumbnail: IMG.kurti2, tags: ['co-ord','yellow','summer'], trending: false, featured: true, bestSeller: false, newArrival: true, hotDeal: false },
  { name: 'Saffron Sunset Anarkali Suit', slug: 'saffron-sunset-anarkali-suit', sku: 'JC-ST-001', category: 'suits', price: 7999, discountPrice: 4999, description: 'A regal saffron anarkali suit with churidar and dupatta. Complete with hand-block prints and gota patti detailing.', shortDescription: 'Anarkali with gota patti', material: 'Georgette', fabric: 'Georgette with Cotton Lining', colors: ['#FF7043', '#FFD700', '#C2185B'], sizes: ['XS','S','M','L','XL','XXL'], stock: 18, images: [IMG.suit1, IMG.kurti1], thumbnail: IMG.suit1, tags: ['suit','anarkali','festive'], trending: true, featured: false, bestSeller: false, newArrival: false, hotDeal: false },
  { name: 'Midnight Bloom Silk Saree', slug: 'midnight-bloom-silk-saree', sku: 'JC-SR-002', category: 'sarees', price: 12999, discountPrice: 8999, description: 'A deep midnight blue silk saree with intricate floral zari motifs and a contrast border.', shortDescription: 'Floral zari silk saree', material: 'Silk', fabric: 'Banarasi Silk', colors: ['#0d1b2a', '#FFD700', '#C2185B'], sizes: ['Free Size'], stock: 20, images: [IMG.saree3, IMG.saree1, IMG.saree2], thumbnail: IMG.saree3, tags: ['saree','banarasi','luxury'], trending: false, featured: true, bestSeller: true, newArrival: true, hotDeal: false },
];

export const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The craftsmanship is beyond words. My bridal lehenga from Jeevikaa Couture was the highlight of my wedding — every detail was perfection.', image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=C2185B&color=fff&size=128' },
  { name: 'Ananya Iyer', location: 'Bengaluru', rating: 5, text: 'I ordered a saree for my sister\'s reception. The fabric quality and finish are truly luxurious. Will definitely shop again.', image: 'https://ui-avatars.com/api/?name=Ananya+Iyer&background=D4AF37&color=fff&size=128' },
  { name: 'Meera Kapoor', location: 'Delhi', rating: 5, text: 'The gown fits like it was tailored just for me. The packaging felt like unwrapping a gift. Absolutely obsessed.', image: 'https://ui-avatars.com/api/?name=Meera+Kapoor&background=C2185B&color=fff&size=128' },
  { name: 'Sanaya Verma', location: 'Hyderabad', rating: 5, text: 'From ordering to delivery, the entire experience is regal. Their kurtis have become my everyday staple.', image: 'https://ui-avatars.com/api/?name=Sanaya+Verma&background=D4AF37&color=fff&size=128' },
];

export const ADMIN_SEED = {
  email: 'admin@jeevikaacouture.com',
  password: 'Jeevikaa@2025',
  name: 'Super Admin',
  role: 'super_admin',
};
