const mongoose = require('mongoose');
const ServiceProvider = require('./models/serviceProvider.model');
require('dotenv').config();

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all providers
    const providers = await ServiceProvider.find({});
    
    console.log(`Found ${providers.length} service providers to migrate`);
    
    for (const provider of providers) {
      // Convert the old format (latitude/longitude) to GeoJSON format
      const updateData = {
        latlon: {
          type: 'Point',
          coordinates: [
            provider.latlon?.longitude || 0, // longitude must come first in GeoJSON
            provider.latlon?.latitude || 0
          ]
        },
        isAvailable: true
      };

      await ServiceProvider.updateOne(
        { _id: provider._id },
        { $set: updateData }
      );
      console.log(`Migrated provider: ${provider.name}`);
    }
    
    // Drop existing index if any
    try {
      await ServiceProvider.collection.dropIndex('latlon_2dsphere');
      console.log('Dropped existing index');
    } catch (e) {
      console.log('No existing index to drop');
    }

    // Create the 2dsphere index
    await ServiceProvider.collection.createIndex({ "latlon": "2dsphere" });
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateData();