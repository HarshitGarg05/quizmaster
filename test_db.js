const mongoose = require('mongoose');
const URI = 'mongodb://Harshit:Quiz@ac-leafmic-shard-00-00.lhlqdhs.mongodb.net:27017,ac-leafmic-shard-00-01.lhlqdhs.mongodb.net:27017,ac-leafmic-shard-00-02.lhlqdhs.mongodb.net:27017/?ssl=true&replicaSet=atlas-55wigc-shard-0&authSource=admin&appName=QuizApp';

console.log('Testing connection to:', URI.split('@')[1]); // Don't log credentials

mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    })
    .catch((err) => {
        console.error('FAILURE: Connection failed');
        console.error(err.message);
        process.exit(1);
    });
