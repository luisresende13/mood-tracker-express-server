// const { MongoClient } = require("mongodb");

const express = require("express");
const app = express();

// function mongoURI(mongoAdminPassword, databaseName) {
//     return "mongodb+srv://admin:" + mongoAdminPassword + "@mood-tracker-cluster.f0b5r.mongodb.net/" + databaseName + "?retryWrites=true&w=majority";
// }
// const databaseName = 'MoodTrackerDatabase'
// const mongoAdminPassword = 'admin'
// //const collectionName = 'EntriesCollection'

// const uri = mongoURI(mongoAdminPassword, databaseName)
// const client = new MongoClient(uri);

// async function signup(username, password, email) {
//     try {
//         await client.connect();

//         const database = client.db(databaseName);
//         const userCollection = database.collection("Users");

//         // const userQuery = { username: username };
//         // const options = {};
//         // const userResult = await userCoollection.findOne(userQuery, options);
//         // console.log('Procurando por username "' + username + '" - Encontrado: ' + JSON.stringify(userResult))
//         // if (userResult) {
//         //     alert('Nome de usuário já cadastrado.');
//         //     return;
//         // }

//         // const emailQuery = { email: email };
//         // const emailResult = await userCoollection.findOne(emailQuery, options);
//         // console.log('Procurando por email "' + email + '" - Encontrado: ' + JSON.stringify(emailResult))
//         // if (emailResult) {
//         //     alert('Email de usuário já cadastrado.');
//         //     return;
//         // }
        
//         // create a document to insert
//         const user_doc = {
//             username: username,
//             password: password,
//             email: email,
//             entries: [],
//         }
//         const insertOne_Result = await userCollection.insertOne(user_doc);
//         console.log(`A User document was inserted into 'Users' collection with the _id: ${insertOne_Result.insertedId}`);

//     } finally {
//         await client.close();
//         console.log('Database connection closed')
//     }
// }

// async function signin(username, password) {
//     try {
//         await client.connect();

//         const database = client.db(databaseName);
//         const userCoollection = database.collection("Users");

//         const userQuery = { username: username };
//         const options = {};
//         const userResult = await userCoollection.findOne(userQuery, options);
//         console.log('Procurando por username "' + username + '" - Encontrado: ' + JSON.stringify(userResult))
//         return userResult
//         // if (userResult) {
//         //     return
//         // }

//     } finally {
//         await client.close();
//         console.log('Database connection closed')
//     }
// }

// const postUser = (req, res) => {
//     const userResult = signup('username', 'password', 'example@email.com').catch(console.dir);
//     res.send( userResult );
// }

// const getUsers = (req, res) => {

//     const userResult = signin('username', 'password').catch(console.dir);
//     res.send( userResult );
    

// }

// app.get("/Users", getUsers);
// app.post('/Users/:user', postUser)

app.get('/', (req, res) => {
    res.send('Hello World')
})

const PORT = process.env.PORT
// const PORT = 3000;

app.listen(PORT);