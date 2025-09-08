const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seedCategories = async () => {
  const categories = [
    { name: 'Restaurant', description: 'Restaurants, cafes, and dining establishments', icon: 'restaurant' },
    { name: 'Retail', description: 'Clothing, electronics, and general retail stores', icon: 'shopping_bag' },
    { name: 'Grocery', description: 'Supermarkets, grocery stores, and food markets', icon: 'local_grocery_store' },
    { name: 'Health & Beauty', description: 'Pharmacies, salons, and wellness centers', icon: 'spa' },
    { name: 'Automotive', description: 'Car dealerships, repair shops, and auto services', icon: 'directions_car' },
    { name: 'Home & Garden', description: 'Hardware stores, furniture, and home improvement', icon: 'home' },
    { name: 'Entertainment', description: 'Movie theaters, gaming, and entertainment venues', icon: 'movie' },
    { name: 'Services', description: 'Professional services, banks, and business services', icon: 'business' },
    { name: 'Sports & Recreation', description: 'Gyms, sports stores, and recreational facilities', icon: 'fitness_center' },
    { name: 'Education', description: 'Schools, libraries, and educational institutions', icon: 'school' }
  ];

  console.log('Seeding categories...');
  
  for (const category of categories) {
    try {
      await pool.query(
        'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [category.name, category.description, category.icon]
      );
      console.log(`✓ Category: ${category.name}`);
    } catch (error) {
      console.error(`✗ Failed to seed category ${category.name}:`, error.message);
    }
  }
};

const seedAdminUser = async () => {
  console.log('Seeding admin user...');
  
  const adminData = {
    username: 'admin',
    email: 'admin@storerating.com',
    password: 'admin123', // This should be changed in production
    role: 'admin',
    first_name: 'System',
    last_name: 'Administrator',
    is_active: true,
    email_verified: true
  };

  try {
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [adminData.username, adminData.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminData.password, saltRounds);

    // Insert admin user
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      adminData.username,
      adminData.email,
      passwordHash,
      adminData.role,
      adminData.first_name,
      adminData.last_name,
      adminData.is_active,
      adminData.email_verified
    ]);

    console.log('✓ Admin user created successfully');
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password} (CHANGE THIS IN PRODUCTION!)`);

  } catch (error) {
    console.error('✗ Failed to seed admin user:', error.message);
  }
};

const seedSampleStores = async () => {
  console.log('Seeding sample stores...');
  
  // Get category IDs
  const categoriesResult = await pool.query('SELECT id, name FROM categories');
  const categories = {};
  categoriesResult.rows.forEach(row => {
    categories[row.name] = row.id;
  });

  // Get store owner user IDs
  const ownersResult = await pool.query('SELECT id, username FROM users WHERE role = $1', ['owner']);
  const owners = {};
  ownersResult.rows.forEach(row => {
    owners[row.username] = row.id;
  });

  // Fallback to admin if no owners exist
  const adminResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
  const adminId = adminResult.rows[0]?.id;

  const sampleStores = [
    {
      name: 'Downtown Deli',
      description: 'Fresh sandwiches and salads in the heart of downtown',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      phone: '(415) 123-4567',
      email: 'info@downtowndeli.com',
      category_id: categories['Restaurant'],
      owner_id: owners['downtown_deli_owner'] || adminId,
      opening_hours: {
        monday: { open: '07:00', close: '19:00' },
        tuesday: { open: '07:00', close: '19:00' },
        wednesday: { open: '07:00', close: '19:00' },
        thursday: { open: '07:00', close: '19:00' },
        friday: { open: '07:00', close: '20:00' },
        saturday: { open: '08:00', close: '20:00' },
        sunday: { open: '09:00', close: '18:00' }
      }
    },
    {
      name: 'Tech World Electronics',
      description: 'Latest gadgets and electronics with expert service',
      address: '456 Technology Blvd',
      city: 'San Jose',
      state: 'CA',
      zip_code: '95110',
      phone: '(408) 987-6543',
      email: 'support@techworld.com',
      website: 'https://techworld.com',
      category_id: categories['Retail'],
      owner_id: owners['tech_world_owner'] || adminId,
      opening_hours: {
        monday: { open: '10:00', close: '21:00' },
        tuesday: { open: '10:00', close: '21:00' },
        wednesday: { open: '10:00', close: '21:00' },
        thursday: { open: '10:00', close: '21:00' },
        friday: { open: '10:00', close: '22:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '11:00', close: '19:00' }
      }
    },
    {
      name: 'Fresh Market Grocery',
      description: 'Organic produce and quality groceries for your family',
      address: '789 Green Valley Road',
      city: 'Oakland',
      state: 'CA',
      zip_code: '94601',
      phone: '(510) 456-7890',
      email: 'hello@freshmarket.com',
      category_id: categories['Grocery'],
      owner_id: owners['fresh_market_owner'] || adminId,
      opening_hours: {
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '23:00' },
        saturday: { open: '06:00', close: '23:00' },
        sunday: { open: '07:00', close: '21:00' }
      }
    },
    {
      name: 'Bella Vista Restaurant',
      description: 'Authentic Italian cuisine with a modern twist and beautiful bay views',
      address: '2101 Lombard Street',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94123',
      phone: '(415) 555-0123',
      email: 'reservations@bellavista.com',
      website: 'https://bellavista.com',
      category_id: categories['Restaurant'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '17:00', close: '22:00' },
        tuesday: { open: '17:00', close: '22:00' },
        wednesday: { open: '17:00', close: '22:00' },
        thursday: { open: '17:00', close: '22:00' },
        friday: { open: '17:00', close: '23:00' },
        saturday: { open: '16:00', close: '23:00' },
        sunday: { open: '16:00', close: '21:00' }
      }
    },
    {
      name: 'Urban Fitness Center',
      description: 'State-of-the-art gym with personal trainers and group classes',
      address: '321 Fitness Way',
      city: 'Berkeley',
      state: 'CA',
      zip_code: '94704',
      phone: '(510) 555-0456',
      email: 'info@urbanfitness.com',
      website: 'https://urbanfitness.com',
      category_id: categories['Sports & Recreation'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '05:00', close: '23:00' },
        tuesday: { open: '05:00', close: '23:00' },
        wednesday: { open: '05:00', close: '23:00' },
        thursday: { open: '05:00', close: '23:00' },
        friday: { open: '05:00', close: '23:00' },
        saturday: { open: '06:00', close: '22:00' },
        sunday: { open: '07:00', close: '21:00' }
      }
    },
    {
      name: 'Style Studio Salon',
      description: 'Professional hair and beauty services in a relaxing environment',
      address: '654 Beauty Lane',
      city: 'Palo Alto',
      state: 'CA',
      zip_code: '94301',
      phone: '(650) 555-0789',
      email: 'appointments@stylestudio.com',
      category_id: categories['Health & Beauty'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: '10:00', close: '17:00' }
      }
    },
    {
      name: 'AutoCare Plus',
      description: 'Complete automotive service and repair for all vehicle makes',
      address: '987 Auto Service Rd',
      city: 'Fremont',
      state: 'CA',
      zip_code: '94538',
      phone: '(510) 555-0321',
      email: 'service@autocareplus.com',
      website: 'https://autocareplus.com',
      category_id: categories['Automotive'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '07:00', close: '18:00' },
        tuesday: { open: '07:00', close: '18:00' },
        wednesday: { open: '07:00', close: '18:00' },
        thursday: { open: '07:00', close: '18:00' },
        friday: { open: '07:00', close: '18:00' },
        saturday: { open: '08:00', close: '16:00' },
        sunday: { open: '', close: '' }
      }
    },
    {
      name: 'Home & Garden Paradise',
      description: 'Everything for your home improvement and gardening needs',
      address: '1234 Garden Center Dr',
      city: 'Santa Clara',
      state: 'CA',
      zip_code: '95050',
      phone: '(408) 555-0654',
      email: 'info@homegardenparadise.com',
      category_id: categories['Home & Garden'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '07:00', close: '21:00' },
        sunday: { open: '08:00', close: '19:00' }
      }
    },
    {
      name: 'Cinema Plaza',
      description: 'Premium movie theater experience with IMAX and luxury seating',
      address: '5678 Entertainment Blvd',
      city: 'San Mateo',
      state: 'CA',
      zip_code: '94403',
      phone: '(650) 555-0987',
      email: 'info@cinemaplaza.com',
      website: 'https://cinemaplaza.com',
      category_id: categories['Entertainment'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '11:00', close: '23:00' },
        tuesday: { open: '11:00', close: '23:00' },
        wednesday: { open: '11:00', close: '23:00' },
        thursday: { open: '11:00', close: '23:00' },
        friday: { open: '11:00', close: '00:00' },
        saturday: { open: '10:00', close: '00:00' },
        sunday: { open: '11:00', close: '22:00' }
      }
    },
    {
      name: 'Pacific Coast Coffee',
      description: 'Artisan coffee roastery with locally sourced beans and pastries',
      address: '432 Coffee Street',
      city: 'Half Moon Bay',
      state: 'CA',
      zip_code: '94019',
      phone: '(650) 555-0432',
      email: 'hello@pacificcoastcoffee.com',
      category_id: categories['Restaurant'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '06:00', close: '18:00' },
        tuesday: { open: '06:00', close: '18:00' },
        wednesday: { open: '06:00', close: '18:00' },
        thursday: { open: '06:00', close: '18:00' },
        friday: { open: '06:00', close: '19:00' },
        saturday: { open: '07:00', close: '19:00' },
        sunday: { open: '07:00', close: '17:00' }
      }
    },
    {
      name: 'Bay Area Books',
      description: 'Independent bookstore with rare finds and local author events',
      address: '876 Literary Lane',
      city: 'Mill Valley',
      state: 'CA',
      zip_code: '94941',
      phone: '(415) 555-0876',
      email: 'events@bayareabooks.com',
      website: 'https://bayareabooks.com',
      category_id: categories['Education'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '22:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '10:00', close: '19:00' }
      }
    },
    {
      name: 'Golden Gate Pharmacy',
      description: 'Full-service pharmacy with health consultations and wellness products',
      address: '1357 Health Plaza',
      city: 'Daly City',
      state: 'CA',
      zip_code: '94014',
      phone: '(650) 555-1357',
      email: 'info@goldengatepharmacy.com',
      category_id: categories['Health & Beauty'],
      owner_id: adminId,
      opening_hours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '10:00', close: '18:00' }
      }
    }
  ];

  for (const store of sampleStores) {
    try {
      await pool.query(`
        INSERT INTO stores (
          name, description, address, city, state, zip_code, phone, email, website,
          category_id, owner_id, opening_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING
      `, [
        store.name, store.description, store.address, store.city, store.state,
        store.zip_code, store.phone, store.email, store.website,
        store.category_id, store.owner_id, JSON.stringify(store.opening_hours)
      ]);
      console.log(`✓ Store: ${store.name}`);
    } catch (error) {
      console.error(`✗ Failed to seed store ${store.name}:`, error.message);
    }
  }
};

const seedSampleUsers = async () => {
  console.log('Seeding sample users...');
  
  const sampleUsers = [
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      email_verified: true
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'user',
      is_active: true,
      email_verified: true
    },
    {
      username: 'mike_wilson',
      email: 'mike@example.com',
      password: 'password123',
      first_name: 'Mike',
      last_name: 'Wilson',
      role: 'user',
      is_active: true,
      email_verified: true
    },
    {
      username: 'sarah_jones',
      email: 'sarah@example.com',
      password: 'password123',
      first_name: 'Sarah',
      last_name: 'Jones',
      role: 'user',
      is_active: true,
      email_verified: true
    },
    // Store Owners
    {
      username: 'downtown_deli_owner',
      email: 'owner@downtowndeli.com',
      password: 'password123',
      first_name: 'Mario',
      last_name: 'Rossi',
      role: 'owner',
      is_active: true,
      email_verified: true
    },
    {
      username: 'tech_world_owner',
      email: 'owner@techworld.com',
      password: 'password123',
      first_name: 'Steve',
      last_name: 'Johnson',
      role: 'owner',
      is_active: true,
      email_verified: true
    },
    {
      username: 'fresh_market_owner',
      email: 'owner@freshmarket.com',
      password: 'password123',
      first_name: 'Lisa',
      last_name: 'Chen',
      role: 'owner',
      is_active: true,
      email_verified: true
    }
  ];

  const saltRounds = 12;
  
  for (const user of sampleUsers) {
    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [user.username, user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`✓ User ${user.username} already exists`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, saltRounds);

      // Insert user
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        user.username,
        user.email,
        passwordHash,
        user.role,
        user.first_name,
        user.last_name,
        user.is_active,
        user.email_verified
      ]);

      console.log(`✓ User: ${user.username}`);
    } catch (error) {
      console.error(`✗ Failed to seed user ${user.username}:`, error.message);
    }
  }
};

const seedSampleReviews = async () => {
  console.log('Seeding sample reviews...');
  
  // Get users
  const usersResult = await pool.query('SELECT id, username FROM users WHERE role = $1', ['user']);
  const users = usersResult.rows;

  // Get stores
  const storesResult = await pool.query('SELECT id, name FROM stores');
  const stores = storesResult.rows;

  if (users.length === 0 || stores.length === 0) {
    console.log('✓ No users or stores found, skipping review seeding');
    return;
  }

  const sampleReviews = [
    {
      store_name: 'Downtown Deli',
      rating: 5,
      title: 'Amazing sandwiches!',
      comment: 'Best deli in the city! The pastrami sandwich is incredible and the staff is super friendly. Always fresh ingredients and quick service.',
      username: 'john_doe'
    },
    {
      store_name: 'Downtown Deli',
      rating: 4,
      title: 'Good food, busy place',
      comment: 'Great food quality but can get quite crowded during lunch hours. The turkey club is my favorite.',
      username: 'jane_smith'
    },
    {
      store_name: 'Tech World Electronics',
      rating: 5,
      title: 'Excellent customer service',
      comment: 'The staff really knows their stuff. Helped me find the perfect laptop within my budget. Great selection of accessories too.',
      username: 'mike_wilson'
    },
    {
      store_name: 'Tech World Electronics',
      rating: 4,
      title: 'Good prices, knowledgeable staff',
      comment: 'Competitive prices and the technicians are very helpful. Only downside is they can be busy on weekends.',
      username: 'sarah_jones'
    },
    {
      store_name: 'Fresh Market Grocery',
      rating: 5,
      title: 'Best organic produce',
      comment: 'Amazing selection of organic fruits and vegetables. Everything is always fresh and the prices are reasonable for organic.',
      username: 'jane_smith'
    },
    {
      store_name: 'Fresh Market Grocery',
      rating: 4,
      title: 'Great quality, clean store',
      comment: 'Clean, well-organized store with high quality products. The meat department is excellent.',
      username: 'john_doe'
    },
    {
      store_name: 'Bella Vista Restaurant',
      rating: 5,
      title: 'Romantic dinner spot',
      comment: 'Perfect for date night! The view is stunning and the pasta is authentic Italian. Service was impeccable.',
      username: 'sarah_jones'
    },
    {
      store_name: 'Bella Vista Restaurant',
      rating: 5,
      title: 'Outstanding food and atmosphere',
      comment: 'The osso buco was perfectly cooked and the wine selection is impressive. Definitely coming back!',
      username: 'mike_wilson'
    },
    {
      store_name: 'Urban Fitness Center',
      rating: 4,
      title: 'Great equipment and classes',
      comment: 'Modern equipment and excellent group fitness classes. The trainers are knowledgeable and motivating.',
      username: 'john_doe'
    },
    {
      store_name: 'Urban Fitness Center',
      rating: 5,
      title: 'Best gym in the area',
      comment: 'Clean facilities, great hours, and the staff is always helpful. Love the variety of equipment available.',
      username: 'jane_smith'
    },
    {
      store_name: 'Style Studio Salon',
      rating: 5,
      title: 'Amazing hair transformation',
      comment: 'The stylists here are artists! Got exactly the cut and color I wanted. Very relaxing atmosphere.',
      username: 'sarah_jones'
    },
    {
      store_name: 'Pacific Coast Coffee',
      rating: 5,
      title: 'Best coffee on the coast',
      comment: 'Their single origin coffees are phenomenal. The baristas really know their craft and the pastries are fresh daily.',
      username: 'mike_wilson'
    },
    {
      store_name: 'Pacific Coast Coffee',
      rating: 4,
      title: 'Great coffee, cozy atmosphere',
      comment: 'Perfect spot to work or catch up with friends. The WiFi is reliable and the coffee is consistently good.',
      username: 'jane_smith'
    },
    {
      store_name: 'Bay Area Books',
      rating: 5,
      title: 'Book lovers paradise',
      comment: 'Incredible selection of books and the staff recommendations are always spot on. Love the author events!',
      username: 'john_doe'
    },
    {
      store_name: 'Cinema Plaza',
      rating: 4,
      title: 'Great movie experience',
      comment: 'The IMAX screen is impressive and the recliner seats are very comfortable. Concession prices are a bit high though.',
      username: 'sarah_jones'
    }
  ];

  for (const review of sampleReviews) {
    try {
      // Find store and user IDs
      const store = stores.find(s => s.name === review.store_name);
      const user = users.find(u => u.username === review.username);

      if (!store || !user) {
        console.log(`✗ Skipping review: store "${review.store_name}" or user "${review.username}" not found`);
        continue;
      }

      // Check if review already exists
      const existingReview = await pool.query(
        'SELECT id FROM reviews WHERE store_id = $1 AND user_id = $2',
        [store.id, user.id]
      );

      if (existingReview.rows.length > 0) {
        console.log(`✓ Review for ${review.store_name} by ${review.username} already exists`);
        continue;
      }

      // Insert review
      await pool.query(`
        INSERT INTO reviews (store_id, user_id, rating, title, comment)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        store.id,
        user.id,
        review.rating,
        review.title,
        review.comment
      ]);

      console.log(`✓ Review: ${review.store_name} by ${review.username} (${review.rating}★)`);
    } catch (error) {
      console.error(`✗ Failed to seed review for ${review.store_name}:`, error.message);
    }
  }
};

const runSeeds = async () => {
  try {
    console.log('Starting database seeding...');
    
    await seedCategories();
    await seedAdminUser();
    await seedSampleUsers();
    await seedSampleStores();
    await seedSampleReviews();
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeds if called directly
if (require.main === module) {
  runSeeds().finally(() => {
    pool.end();
  });
}

module.exports = { runSeeds };