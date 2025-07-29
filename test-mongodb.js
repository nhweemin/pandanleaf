const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing Direct MongoDB Connection...');
  
  // Get MongoDB credentials from Railway
  const connections = [
    'mongodb://mongo:uuzFbNFKakijpxQjyhAWFEYsgkjtQqbE@mongodb.railway.internal:27017/pandanleaf',
    'mongodb://mongo:uuzFbNFKakijpxQjyhAWFEYsgkjtQqbE@mongodb.railway.internal:27017',
    'mongodb://mongo:uuzFbNFKakijpxQjyhAWFEYsgkjtQqbE@switchback.proxy.rlwy.net:18770/pandanleaf',
    'mongodb://mongo:uuzFbNFKakijpxQjyhAWFEYsgkjtQqbE@switchback.proxy.rlwy.net:18770'
  ];

  for (let i = 0; i < connections.length; i++) {
    const uri = connections[i];
    const testName = i === 0 ? 'Internal with DB' : 
                    i === 1 ? 'Internal without DB' :
                    i === 2 ? 'Public with DB' : 'Public without DB';
    
    console.log(`\n📡 Test ${i + 1}: ${testName}`);
    console.log(`   URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
    
    try {
      const conn = await mongoose.createConnection(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 20000,
        connectTimeoutMS: 10000,
        maxPoolSize: 1
      });
      
      console.log('✅ Connection successful!');
      console.log(`   Database: ${conn.db.databaseName}`);
      console.log(`   Host: ${conn.host}:${conn.port}`);
      
      // Test basic operation
      const collections = await conn.db.listCollections().toArray();
      console.log(`   Collections: ${collections.length} found`);
      
      await conn.close();
      console.log('✅ Connection closed cleanly');
      break; // Success - stop testing
      
    } catch (error) {
      console.log('❌ Connection failed:');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code || 'unknown'}`);
    }
  }
  
  console.log('\n🏁 Test completed');
  process.exit(0);
}

testConnection().catch(console.error); 