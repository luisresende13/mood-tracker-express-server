const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
var bodyParser = require('body-parser')

const app = express();

function mongoURI(mongoAdminPassword, databaseName) {
    return "mongodb+srv://admin:" + mongoAdminPassword + "@mood-tracker-cluster.f0b5r.mongodb.net/" + databaseName + "?retryWrites=true&w=majority";
}
const databaseName = 'MoodTrackerDatabase'
const mongoAdminPassword = 'admin'

const uri = mongoURI(mongoAdminPassword, databaseName)
const client = new MongoClient(uri);

async function findUserAsync(res, username) {
    try {
        await client.connect();

        const database = client.db(databaseName);
        const userCollection = database.collection("Users");

        const userQuery = { username: username };
        const userResult = await userCollection.findOne(userQuery);
        console.log('Searched for username :"' + username + '" - Found: ' + JSON.stringify(userResult))
        res.send(JSON.stringify(userResult))

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

        const usersResult = await userCoollection.find({}, {sort: {_id: -1}}).toArray();
        console.log(`Searched for "Users" collection - Found ${usersResult.length} Users!`)
        res.json(usersResult)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

async function postUserAsync(req, res) {
    try {
        await client.connect();

        const database = client.db(databaseName);
        const userCollection = database.collection("Users");

        console.log('Handling POST request for user: ' + req.params.username)
        const user_doc = {
            username: req.params.username,
            password: req.body.password,
            email: req.body.email,
            entries: [],
        }
        const userResult = await userCollection.insertOne(user_doc);

        console.log(`A user document was inserted into 'Users' collection with _id: ${userResult.insertedId}`);
        res.write('POST Result Body:')
        res.end(userResult.body)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

async function postUserEntryAsync(req, res) {
    try {
        console.log('Request received: POST user entry. Attempting to connect...')
        await client.connect();

        const database = await client.db(databaseName);
        const userCollection = await database.collection("Users");
        
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                entries: [ ...User.entries, { _id: new ObjectId(), user_id: User._id, ...req.body }]
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);

        resMsg = `${result.matchedCount} user document(s) matched the filter, updated ${result.modifiedCount} user document(s)`
        console.log(resMsg);
        res.json(JSON.stringify(req.body))
    
    } catch(error) {
        console.log('Catched error...')
        console.log(error)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

async function deleteUserEntryAsync(req, res) {
    try {
        console.log('Request received: DELETE user entry. Attempting to connect...')
        await client.connect();

        const database = await client.db(databaseName);
        const userCollection = await database.collection("Users");
        
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                entries: [ ...User.entries.filter( (entry) => entry._id != req.params.entryId ) ]
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);

        resMsg = `${result.matchedCount} user entry document(s) matched the filter, deleted ${result.modifiedCount} user document(s)`
        console.log(resMsg);
        res.json(JSON.stringify(req.body))
    
    } catch(error) {
        console.log('Catched error...')
        console.log(error)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

async function putUserEntryAsync(req, res) {
    try {
        console.log('Request received: PUT user entry. Attempting to connect...')
        await client.connect();

        const database = await client.db(databaseName);
        const userCollection = await database.collection("Users");
        
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        // const filter = { username: req.params.username };
        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                entries: [ ...User.entries.filter( (entry) => entry._id != req.params.entryId ), { _id: ObjectId(req.params.entryId), user_id: User._id, ...req.body } ]
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);

        resMsg = `${result.matchedCount} user entry document(s) matched the filter, updated ${result.modifiedCount} user document(s)`
        console.log(resMsg);
        res.json(JSON.stringify(req.body))
    
    } catch(error) {
        console.log('Catched error...')
        console.log(error)

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
const postUser = (req, res) => {
    const userResult = postUserAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const postUserEntry = (req, res) => {
    const userEntryResult = postUserEntryAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const deleteUserEntry = (req, res) => {
    const deleteUserEntryResult = deleteUserEntryAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const putUserEntry = (req, res) => {
    const putUserEntryResult = putUserEntryAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}

var jsonParser = bodyParser.json()

app.get("/Users", getUsers);
app.get('/Users/:username', getUser);
app.post('/Users/:username', jsonParser, postUser)
app.post('/Users/:username/entries', jsonParser, postUserEntry)
app.delete('/Users/:username/entries/:entryId', deleteUserEntry)
app.put('/Users/:username/entries/:entryId', putUserEntry)

app.get('/', (req, res) => {
    res.send('Mood Tracker App Server API.')
})

var PORT 
if (process.env.PORT) {
    PORT = process.env.PORT
} else {
    PORT = 3000;
}

app.listen(PORT, () => {
    console.log('Server started at port ' + PORT + '.')
});