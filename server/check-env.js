import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Environment Variables Check\n');

const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GEMINI_API_KEY'
];

const optionalVars = [
    'PORT',
    'NODE_ENV'
];

let allGood = true;

console.log('Required Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Mask sensitive data
        const masked = varName === 'GEMINI_API_KEY' || varName === 'JWT_SECRET' || varName === 'MONGODB_URI'
            ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
            : value;
        console.log(`  ✅ ${varName}: ${masked}`);
    } else {
        console.log(`  ❌ ${varName}: MISSING`);
        allGood = false;
    }
});

console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`  ✅ ${varName}: ${value}`);
    } else {
        console.log(`  ⚠️  ${varName}: Not set (will use default)`);
    }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
    console.log('✅ All required environment variables are set!');
    console.log('You can proceed with deployment.');
} else {
    console.log('❌ Some required variables are missing.');
    console.log('Please check your .env file or Render environment variables.');
}
console.log('='.repeat(50) + '\n');
