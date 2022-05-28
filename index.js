const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.0h0zm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}



async function run() {
  try {
    await client.connect();
    const productCollection = client
      .db("Rasel_Car_Parts_Store")
      .collection("product");
    const reviewCollection = client
      .db("Rasel_Car_Parts_Store")
      .collection("reviews");
    const userCollection = client
      .db("Rasel_Car_Parts_Store")
      .collection("users");
    const orderCollection = client
      .db("Rasel_Car_Parts_Store")
      .collection("order");

    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
})


    app.get('/review', async (req, res) =>{
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    
    })
    // post
    app.post('/review', async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    })

  app.get("/user", verifyJWT, async (req, res) => {
         const users = await userCollection.find().toArray();
         res.send(users);
  });
    
      app.put("/user/:email", async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };

        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        const token = jwt.sign(
          { email: email },
          process.env.ACCESS_TOKEN,
          { expiresIn: "1h" }
        );   
        res.send({ result, token });
      });
    
    
    
    
    // order api
    app.get('/order',verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email == decodedEmail) {
         const query = { email: email };
         const orders = await orderCollection.find(query).toArray();
     return  res.send(orders);
      }
      else {
        return res.status(403).send({ message: 'forbidden access' });
     }
})


    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })
    
    
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The server side is open in");
});
app.listen(port, () => {
  console.log(`The manufacturer web is running ${port}`);
});
