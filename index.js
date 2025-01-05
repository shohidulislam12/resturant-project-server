const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
console.log(process.env.DB_USER);
// Middleware
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mq5kn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("bistroDb");
    const menucollection = database.collection("menu");
    const reviewscollection = database.collection("reviews");
    const cartscollection = database.collection("carts");
    const usercollection = database.collection("users");

    // jwr api

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    // middlewire
    const verifyToken = (req, res, next) => {
      console.log(req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send({ messsage: "forbidden access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      jwt.verify(token, process.env.ACCESS_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).send({ messsage: "forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    };
// verify admin after verify token
const verifyAdmin=async(req,res,next)=>{
  const email=req.decoded.email
  const query={email:email}
  const user=await usercollection.findOne(query)
  const isAdmin=user?.role==="admin"
  if(!isAdmin){
    return res.status(403).send({messsage:'forbidden access'})
  }
  next()
}



    
    app.get("/menu", async (req, res) => {
      const result = await menucollection.find().toArray();
      res.send(result);
    });
    app.get("/reviwes", async (req, res) => {
      const result = await reviewscollection.find().toArray();
      res.send(result);
    });
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartscollection.insertOne(cartItem);
      res.send(result);
    });
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { useremail: email };
      const result = await cartscollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/cards/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartscollection.deleteOne(query);
      res.send(result);
    });
    // user creatr
    app.post("/users", async (req, res) => {
      const data = req.body;
      const email = data.email;
      // check user if exist
      const query = { email };
      const isexistingUser = await usercollection.findOne(query);
      if (isexistingUser) {
        return res.send({ messsage: "user Already Exist" });
      }
      const result = await usercollection.insertOne(data);
      res.send(result);
    });
    // get users
    app.get("/users",verifyAdmin, verifyToken, async (req, res) => {
      const result = await usercollection.find().toArray();
      res.send(result);
    });
    // menu api
    app.delete("/user/:id",verifyAdmin,verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usercollection.deleteOne(query);
      res.send(result);
    });
    app.patch("/users/admin/:id",verifyAdmin,verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateaDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usercollection.updateOne(query, updateaDoc);
      res.send(result);
    });

// 
app.get('/users/admin/:email',verifyToken,async(req,res)=>{
  const  email=req.params.email
  if(email!==req.decoded.email){
    return res.status(403).send({messsage:"unauthorized access"})
  }

const query={email:email}
const user=await usercollection.findOne(query)
let admin=false;
if (user?.role === 'admin') {
  admin = true;
}

res.send({admin})

})






  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

// Root route
app.get("/", async (req, res) => {
  res.send("Bistro Boss is Running");
});

// Start server
app.listen(port, () => {
  console.log(`Bistro Boss is sitting on port ${port}`);
});
