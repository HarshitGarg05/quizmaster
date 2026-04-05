const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function simulate() {
    try {
        const token = 'YOUR_BEARER_TOKEN'; // I need a token
        /*
        const res = await axios.post('http://localhost:5000/api/attempts', {
            quizId: '69cf4df4502294d8cf3fa37e', // Derivatives
            answers: [],
            score: 100,
            accuracy: 100,
            timeTaken: 10
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(res.data);
        */
        console.log('Simulation ready. Please provide a valid token from the browser console.');
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
}

simulate();
