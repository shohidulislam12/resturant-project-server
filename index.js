const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
console.log(process.env.DB_USER)
// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mq5kn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("bistroDb");
    const menucollection = database.collection("menu");
    const reviewscollection = database.collection("reviews");



    app.get('/menu',async(req,res)=>{
        const result=await menucollection.find().toArray()
        res.send(result)
    })
    app.get('/reviwes',async(req,res)=>{
        const result=await reviewscollection.find().toArray()
        res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }

}
run().catch(console.dir);



    // Root route
app.get('/', async (req, res) => {
    res.send("Bistro Boss is Running");
});


// Start server
app.listen(port, () => {
    console.log(`Bistro Boss is sitting on port ${port}`);
});
