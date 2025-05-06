const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config()
app.use(bodyParser.json());
app.use(cors());

// data base :
const { MongoClient } = require('mongodb');
const url = process.env.MONGO_URL;
const client = new MongoClient(url);
const dbName = 'passOP';
client.connect();

app.get("/get-passwords", async (req, res) => {
  const email = req.query.email;
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.find({email:email}).toArray(); 
  res.send(findResult); // array of objects :
});


// save a password :
app.post('/', async (req, res) => {
  const password = req.body; // object :
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.insertOne(password);
  res.send({success: true, result: findResult});
});

// delete a password on the basis of id:
app.delete('/', async (req, res) => {
  const password = req.body; // object :
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.deleteOne(password);
  res.send({success: true,result: findResult});
});

// to verify token and sending email and name:
const CLIENT_ID = process.env.CLIENT_ID;
const clienttt = new OAuth2Client(CLIENT_ID);
app.post('/verify-token', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await clienttt.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    res.json({ email: payload.email, name: payload.name });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// node --watch server.js