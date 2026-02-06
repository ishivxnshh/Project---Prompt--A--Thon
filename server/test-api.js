import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Testing Gemini API Key...');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ NOT FOUND');

if (!apiKey) {
    console.error('\n❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testAPI() {
    try {
        console.log('\n📡 Calling Gemini API with model: gemini-2.5-flash');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Say "Hello, API works!"');
        const response = await result.response;
        const text = response.text();
        
        console.log('\n✅ SUCCESS! API is working!');
        console.log('Response:', text);
        console.log('\n✨ Your AI prioritization should now work in the app!');
        
    } catch (error) {
        console.log('\n❌ API Test FAILED');
        console.log('Error:', error.message);
        
        if (error.message.includes('API key not valid')) {
            console.log('\n🔧 Troubleshooting steps:');
            console.log('1. Go to: https://aistudio.google.com/app/apikey');
            console.log('2. Create a NEW API key');
            console.log('3. Make sure the Generative Language API is enabled');
            console.log('4. Update the GEMINI_API_KEY in server/.env');
            console.log('5. Run this test again: node test-api.js');
        }
        
        process.exit(1);
    }
}

testAPI();
