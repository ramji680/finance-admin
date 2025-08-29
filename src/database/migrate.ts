import { sequelize } from './connection';
import { User, Restaurant, Order, Payment, SupportTicket } from './models';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Sync all models with database
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');
    
    // Create superadmin user
    const superadmin = await User.create({
      username: 'admin',
      email: 'admin@fynito.com',
      password: 'admin123', // This will be hashed by the model hook
      role: 'superadmin',
      isActive: true,
    });
    console.log('✅ Superadmin user created:', superadmin.username);
    
    // Create sample restaurants
    const restaurants = await Restaurant.bulkCreate([
      {
        name: 'Spice Garden',
        ownerName: 'Rajesh Kumar',
        email: 'rajesh@spicegarden.com',
        phone: '9876543210',
        address: '123 Main Street, Downtown',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        cuisine: 'Indian',
        rating: 4.5,
        isActive: true,
        commissionRate: 12.0,
        bankAccountNumber: '1234567890',
        bankIfscCode: 'SBIN0001234',
        bankAccountHolderName: 'Rajesh Kumar',
        upiId: 'rajesh@spicegarden',
      },
      {
        name: 'Pizza Palace',
        ownerName: 'Maria Rodriguez',
        email: 'maria@pizzapalace.com',
        phone: '9876543211',
        address: '456 Oak Avenue, West Side',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        cuisine: 'Italian',
        rating: 4.2,
        isActive: true,
        commissionRate: 10.0,
        bankAccountNumber: '0987654321',
        bankIfscCode: 'HDFC0001234',
        bankAccountHolderName: 'Maria Rodriguez',
        upiId: 'maria@pizzapalace',
      },
      {
        name: 'Sushi Express',
        ownerName: 'Yuki Tanaka',
        email: 'yuki@sushiexpress.com',
        phone: '9876543212',
        address: '789 Pine Street, East End',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        cuisine: 'Japanese',
        rating: 4.7,
        isActive: true,
        commissionRate: 15.0,
        bankAccountNumber: '1122334455',
        bankIfscCode: 'ICICI0001234',
        bankAccountHolderName: 'Yuki Tanaka',
        upiId: 'yuki@sushiexpress',
      },
    ]);
    console.log('✅ Sample restaurants created:', restaurants.length);
    
    // Create sample orders
    const orders = await Order.bulkCreate([
      {
        restaurantId: 1,
        orderNumber: 'ORD-001-001',
        customerName: 'Amit Patel',
        customerPhone: '9876543210',
        customerAddress: 'Flat 101, Building A, Downtown',
        items: 'Butter Chicken, Naan, Rice',
        subtotal: 450.00,
        tax: 45.00,
        deliveryFee: 30.00,
        total: 525.00,
        commission: 63.00,
        restaurantAmount: 462.00,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'online',
        orderDate: new Date('2024-01-15'),
        deliveryDate: new Date('2024-01-15'),
      },
      {
        restaurantId: 1,
        orderNumber: 'ORD-001-002',
        customerName: 'Priya Sharma',
        customerPhone: '9876543211',
        customerAddress: 'House 25, Street B, Suburb',
        items: 'Paneer Tikka, Roti, Dal',
        subtotal: 380.00,
        tax: 38.00,
        deliveryFee: 30.00,
        total: 448.00,
        commission: 53.76,
        restaurantAmount: 394.24,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        orderDate: new Date('2024-01-16'),
        deliveryDate: new Date('2024-01-16'),
      },
      {
        restaurantId: 2,
        orderNumber: 'ORD-002-001',
        customerName: 'John Smith',
        customerPhone: '9876543212',
        customerAddress: 'Apartment 5C, Complex X',
        items: 'Margherita Pizza, Garlic Bread, Coke',
        subtotal: 650.00,
        tax: 65.00,
        deliveryFee: 40.00,
        total: 755.00,
        commission: 75.50,
        restaurantAmount: 679.50,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'online',
        orderDate: new Date('2024-01-15'),
        deliveryDate: new Date('2024-01-15'),
      },
    ]);
    console.log('✅ Sample orders created:', orders.length);
    
    // Create sample support tickets
    const tickets = await SupportTicket.bulkCreate([
      {
        ticketNumber: 'TKT-001',
        subject: 'Payment issue for January orders',
        description: 'I have not received payment for the orders delivered in January. Please check and process the payment.',
        priority: 'high',
        status: 'open',
        category: 'billing',
        requesterName: 'Rajesh Kumar',
        requesterEmail: 'rajesh@spicegarden.com',
        requesterPhone: '9876543210',
      },
      {
        ticketNumber: 'TKT-002',
        subject: 'App not working properly',
        description: 'The restaurant app is showing errors when trying to update menu items. Need immediate assistance.',
        priority: 'urgent',
        status: 'in_progress',
        category: 'technical',
        requesterName: 'Maria Rodriguez',
        requesterEmail: 'maria@pizzapalace.com',
        requesterPhone: '9876543211',
        assignedTo: 1,
      },
      {
        ticketNumber: 'TKT-003',
        subject: 'Commission rate query',
        description: 'I would like to discuss the current commission rate and see if we can negotiate better terms.',
        priority: 'medium',
        status: 'open',
        category: 'general',
        requesterName: 'Yuki Tanaka',
        requesterEmail: 'yuki@sushiexpress.com',
        requesterPhone: '9876543212',
      },
    ]);
    console.log('✅ Sample support tickets created:', tickets.length);
    
    console.log('🎉 Database migration completed successfully!');
    console.log('\n📋 Created data:');
    console.log(`   - 1 superadmin user (admin/admin123)`);
    console.log(`   - ${restaurants.length} restaurants`);
    console.log(`   - ${orders.length} orders`);
    console.log(`   - ${tickets.length} support tickets`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}
