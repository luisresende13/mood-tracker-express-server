const { MongoClient } = require("mongodb");

const express = require("express");
const app = express();

function mongoURI(mongoAdminPassword, databaseName) {
    return "mongodb+srv://admin:" + mongoAdminPassword + "@mood-tracker-cluster.f0b5r.mongodb.net/" + databaseName + "?retryWrites=true&w=majority";
}
const databaseName = 'MoodTrackerDatabase'
const mongoAdminPassword = 'admin'

const uri = mongoURI(mongoAdminPassword, databaseName)
const client = new MongoClient(uri);

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


// const postUser = (req, res) => {
//     const userResult = signup('username', 'password', 'example@email.com').catch(console.dir);
//     res.send( userResult );
// }

async function findUserAsync(res, username) {
    try {
        await client.connect();

        const database = client.db(databaseName);
        const userCoollection = database.collection("Users");

        const userQuery = { username: username };
        const userResult = await userCoollection.findOne(userQuery);
        console.log('Searched for username :"' + username + '" - Found: ' + JSON.stringify(userResult))
        res.send(userResult)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

async function findUsersAsync(res) {
    try {
        await client.connect();

        const database = client.db(databaseName);
        const userCoollection = database.collection("Users");

        const usersResult = await userCoollection.find({}).toArray();
        console.log('Searched for Users - Found: ' + JSON.stringify(usersResult))
        res.send(usersResult)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

const getUsers = (req, res) => {

    const usersResult = findUsersAsync(res).catch(console.dir);
    console.log('Trying to connect ...')
}
const getUser = (req, res) => {

    const userResult = findUserAsync(res, req.params.username).catch(console.dir);
    console.log('Trying to connect ...')
}    

app.get("/Users", getUsers);
app.get('/Users/:username', getUser);


app.get('/', (req, res) => {
    res.send('Hello World')
})

const PORT = process.env.PORT
// const PORT = 3000;

app.listen(PORT);