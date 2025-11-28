// Quick test to verify bcrypt hash/compare works
const bcrypt = require('bcryptjs');

const password = 'Trung2410@';

// Simulate what authHelper.encryptPassword does
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Plain password:', password);
console.log('Generated hash:', hash);
console.log('');

// Simulate what authHelper.comparePassword does
const result = bcrypt.compareSync(password, hash);
console.log('Compare result:', result);
console.log('');

// Test with a hash from your DB (replace with actual hash from logs)
const dbHash = '$2b$10$jkd9Jm/YQFrDcE8Q/uZhmOglikyxrcIRIiVIvC5tYRTOvprNI2TOi';
const dbResult = bcrypt.compareSync(password, dbHash);
console.log('DB hash:', dbHash);
console.log('Compare with DB hash:', dbResult);
