const request = require('request');
const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const { json } = require('body-parser');
const res = require('express/lib/response');
const app = express();

function mongoURI(mongoAdminPassword, databaseName) {
    return "mongodb+srv://admin:" + mongoAdminPassword + "@mood-tracker-cluster.f0b5r.mongodb.net/" + databaseName + "?retryWrites=true&w=majority";
} 
const databaseName = 'MoodTrackerDatabase'
const mongoAdminPassword = 'admin'
const uri = mongoURI(mongoAdminPassword, databaseName)
const client = new MongoClient(uri);

function buildApiUriParams(params) {
    var uriParams = []
    Object.keys(params).forEach( key => uriParams.push(key+'='+params[key]) )
    return '?' + uriParams.join('&')
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

async function findUserAsync(req, res) {
    try {
        await client.connect();

        const database = client.db(databaseName);
        const userCollection = database.collection("Users");

        const userQuery = { username: req.params.username };
        const userResult = await userCollection.findOne(userQuery);
        console.log('Searched for username :"' + req.params.username + '" - Found:\n' + JSON.stringify(userResult))
        res.send(JSON.stringify(userResult))

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
            ...req.body,
            // username: req.params.username,
            // password: req.body.password,
            // email: req.body.email,
            // emotions: req.body.emotions,
            // entries: req.body.entries,
            // layout: req.body.layout
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

        const database = client.db(databaseName);
        const userCollection = database.collection("Users");
        
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

        const database = client.db(databaseName);
        const userCollection = database.collection("Users");
        
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

        const database = client.db(databaseName);
        const userCollection = database.collection("Users");
        
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        const entry = User.entries.filter( (entry) => entry._id == req.params.entryId )[0]
        const entryIndex = User.entries.indexOf(entry)
        
        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                // entries: [ ...User.entries.filter( (entry) => entry._id != req.params.entryId ), { _id: ObjectId(req.params.entryId), user_id: User._id, ...req.body } ]
                entries: [ 
                    ...User.entries.slice(0, entryIndex),
                    { _id: ObjectId(req.params.entryId), user_id: User._id, ...req.body },
                    ...User.entries.slice(entryIndex+1, User.entries.length)
                ]
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

async function postUserEmotionAsync(req, res) {
    try {
        console.log('Request received: POST user emotion. Attempting to connect...')
        await client.connect();
        const database = client.db(databaseName);
        const userCollection = database.collection("Users");
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                emotions: [ ...User.emotions, { ...req.body }]
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);

        resMsg = `${result.matchedCount} user document(s) matched the filter, updated ${result.modifiedCount} user document(s)`
        console.log(resMsg);
        res.json(JSON.stringify(req.body))
    
    } catch (error) {
        console.log('Catched error...')
        console.log(error)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

async function deleteUserEmotionAsync(req, res) {
    try {
        console.log('Request received: DELETE user emotion. Attempting to connect...')
        await client.connect();

        const database = client.db(databaseName);
        const userCollection = database.collection("Users");
        
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                emotions: [ ...User.emotions.filter( (emotion) => emotion.name != req.params.emotionName ) ]
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

async function postUserEmotionLayoutAsync(req, res) {
    try {
        console.log('Request received: POST user emotion layout. Attempting to connect...')
        await client.connect();
        const database = client.db(databaseName);
        const userCollection = database.collection("Users");
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                layout: req.body.layout
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);

        resMsg = `${result.matchedCount} user document(s) matched the filter, updated ${result.modifiedCount} user document(s)`
        console.log(resMsg);
        res.json(JSON.stringify(req.body))
    
    } catch (error) {
        console.log('Catched error...')
        console.log(error)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

async function postUserSettingsAsync(req, res) {
    try {
        console.log('Request received: POST user settings. Attempting to connect...')
        await client.connect();
        const database = client.db(databaseName);
        const userCollection = database.collection("Users");
        if (userCollection) {console.log('Connected successfully to "Users" database...')}

        var User = await userCollection.findOne({username: req.params.username})
        if (User) {console.log('User information returned successfully....')}

        const filter = { username: req.params.username };
        const options = {};
        const updateDoc = {
            $set: {
                settings: { ...User.settings, ...req.body}
            },
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);

        resMsg = `${result.matchedCount} user document(s) matched the filter, updated ${result.modifiedCount} user document(s)`
        console.log(resMsg);
        res.json(JSON.stringify(req.body))
    
    } catch (error) {
        console.log('Catched error...')
        console.log(error)

    } finally {
        await client.close();
        console.log('Database connection closed')
    }
}

const proxies = {
    'weather': {
        target: 'https://api.openweathermap.org/data/2.5/weather',
        queryParams: {
            APPID: process.env.OPEN_WEATHER_MAP_APIKEY
        }
    },
    'email': {
        target: 'https://emailverification.whoisxmlapi.com/api/v2',
        queryParams: {
            apiKey: process.env.EMAIL_VERIFICATION_APIKEY
        }
    },
    'unsplash': {
        target: 'https://api.unsplash.com',
        queryParams: {
            client_id: process.env.UNSPLASH_APIKEY
        }
    }
}

function requestHandler(res) {
    return (error, response, body) => {
        if (error) {
            throw new Error(error)
        } else {
            console.log('POST api response successful!')
            console.log('statusCode:', response && response.statusCode);
            res.json(JSON.parse(body))
        }
    } 
}

async function sendApiResponse(req, res) {
    console.log('Request received: POST api response. Attempting to fetch...')
    const proxy = proxies[req.params.apiName]
    const apiParams = { ...req.body.queryParams, ...proxy.queryParams}
    const endpoint = req.body.endpoint ? '/'+req.body.endpoint : ''
    const targetUrl = proxy.target + endpoint + buildApiUriParams(apiParams)
    console.log('PERFORMING API REQUEST FOR URL: ' + targetUrl)
    request(targetUrl, requestHandler(res));
}

const getUsers = (req, res) => {
    findUsersAsync(res).catch(console.dir);
    console.log('Trying to connect ...')
}
const getUser = (req, res) => {
    findUserAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}    
const postUser = (req, res) => {
    postUserAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const postUserEntry = (req, res) => {
    postUserEntryAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const deleteUserEntry = (req, res) => {
    deleteUserEntryAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const putUserEntry = (req, res) => {
    putUserEntryAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const postUserEmotion = (req, res) => {
    postUserEmotionAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const deleteUserEmotion = (req, res) => {
    deleteUserEmotionAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const postUserEmotionLayout = (req, res) => {
    postUserEmotionLayoutAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const postUserSettings = (req, res) => {
    postUserSettingsAsync(req, res).catch(console.dir);
    console.log('Trying to connect ...')
}
const fetchApiUrl = (req, res) => {
    console.log('Trying to connect ...')
    sendApiResponse(req, res).catch(console.dir)
}

var jsonParser = json()
app.get("/Users", getUsers);
app.get('/Users/:username', getUser);
app.post('/Users/:username', jsonParser, postUser)
app.post('/Users/:username/entries', jsonParser, postUserEntry)
app.delete('/Users/:username/entries/:entryId', deleteUserEntry)
app.put('/Users/:username/entries/:entryId', jsonParser, putUserEntry)
app.post('/Users/:username/emotions', jsonParser, postUserEmotion)
app.delete('/Users/:username/emotions/:emotionName', deleteUserEmotion)
app.post('/Users/:username/layout', jsonParser, postUserEmotionLayout)
app.post('/Users/:username/settings', jsonParser, postUserSettings)
app.post('/api/:apiName', jsonParser, fetchApiUrl)

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