const mongoose = require('mongoose');

const createIndexes = async () => {
    try {
        // Users indexes
        await mongoose.connection.collection('users').createIndex({ phone: 1 }, { unique: true });
        await mongoose.connection.collection('users').createIndex({ location: 1 });
        await mongoose.connection.collection('users').createIndex({ skills: 1 });
        await mongoose.connection.collection('users').createIndex({ userType: 1 });
        await mongoose.connection.collection('users').createIndex({ rating: -1 });

        // Jobs indexes
        await mongoose.connection.collection('jobs').createIndex({ location: 1 });
        await mongoose.connection.collection('jobs').createIndex({ category: 1 });
        await mongoose.connection.collection('jobs').createIndex({ type: 1 });
        await mongoose.connection.collection('jobs').createIndex({ skills: 1 });
        await mongoose.connection.collection('jobs').createIndex({ employer: 1 });
        await mongoose.connection.collection('jobs').createIndex({ createdAt: -1 });
        await mongoose.connection.collection('jobs').createIndex({ featured: 1, createdAt: -1 });

        // Applications indexes
        await mongoose.connection
            .collection('applications')
            .createIndex({ jobId: 1, workerId: 1 }, { unique: true });

        await mongoose.connection.collection('applications').createIndex({ status: 1 });

        console.log('✅ Database indexes created successfully');
    } catch (error) {
        console.error('⚠️ Index creation error:', error.message);
    }
};

const connectDB = async () => {
    try {
        const mongoURI =
            process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/juakazi';

        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        await createIndexes();
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('⚠️ Local MongoDB not running. You can:');
            console.log('   1. Install MongoDB locally');
            console.log('   2. Use MongoDB Atlas');
            console.log('   3. Set MONGODB_URI in .env');
        }

        process.exit(1);
    }
};

module.exports = connectDB;
