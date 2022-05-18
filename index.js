/* eslint-disable no-underscore-dangle */
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// Get requests
app.get('/', (req, res) => {
    res.send(`Task manager server running on port ${port}`);
});

// Mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fakac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const taskCollection = client.db('Task-manager').collection('tasks');

async function run() {
    await client.connect();
    console.log('database connected');

    app.get('/tasks', async (req, res) => {
        const { email } = req.query;
        const query = { userName: email };
        const cursor = taskCollection.find(query);
        const tasks = await cursor.toArray();
        res.send(tasks);
    });

    app.post('/add', async (req, res) => {
        const task = req.body;
        const result = await taskCollection.insertOne(task);
        res.send(result);
    });

    app.delete('/delete', async (req, res) => {
        const task = req.body;
        const query = { _id: ObjectId(task._id) };
        const result = await taskCollection.deleteOne(query);
        res.send(result);
    });

    app.patch('/update', async (req, res) => {
        const updatedTask = req.body;

        const filter = { _id: ObjectId(updatedTask._id) };
        const updatedDoc = {
            $set: {
                completed: true,
            },
        };
        const result = await taskCollection.updateOne(filter, updatedDoc);
        res.send(result);
    });
}
run().catch(console.dir);

// Listener
app.listen(port, () => {
    console.log(`Task Manager server running on port ${port}`);
});
