const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/juakazi', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Create indexes for better performance
        await createIndexes();

    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

const createIndexes = async () => {
    const db = mongoose.connection.db;

    // Create indexes for frequently queried fields
    await db.collection('users').createIndex({ phone: 1 }, { unique: true });
    await db.collection('users').createIndex({ location: 1 });
    await db.collection('users').createIndex({ skills: 1 });

    await db.collection('jobs').createIndex({ location: 1 });
    await db.collection('jobs').createIndex({ skills: 1 });
    await db.collection('jobs').createIndex({ employer: 1 });
    await db.collection('jobs').createIndex({ createdAt: -1 });

    await db.collection('reviews').createIndex({ userId: 1 });
    await db.collection('reviews').createIndex({ jobId: 1 });

    console.log('✅ Database indexes created');
};

module.exports = connectDB;