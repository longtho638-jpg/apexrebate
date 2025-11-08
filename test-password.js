const bcrypt = require('bcryptjs');

async function test() {
  const storedHash = '$2b$10$R3PDfwcNBTCRFKduu/OH.OytG/sO4FIIFyDaIkXWgZmdbovjVNp8i';
  const password = 'Admin@12345';
  
  const match = await bcrypt.compare(password, storedHash);
  console.log('Password match:', match);
}

test();
