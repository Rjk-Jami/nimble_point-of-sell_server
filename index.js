const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')



require('dotenv').config()
//middleware
app.use(cors())
app.use(express.json())

//jwt
const jwt = require('jsonwebtoken');

// mongodb

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://nimble-server:djwZpbGZtXhqcmLu@cluster0.anem91w.mongodb.net/?retryWrites=true&w=majority";

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

    //database 
    const database = client.db("NimbleDB");
    //sub-category
    const productsCollection = database.collection("products")

    //verify JWT valid token middleware
 const verifyJWT = (req, res, next) =>{
  // console.log("verifyJwt" ,req.headers.authorization)
  const authorization =req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorized access- 1" })
  }
  const token = authorization.split(" ")[1]
  // console.log(token)
  jwt.verify(token, process.env.Access_Token, (err, decoded)=>{

    if(err){
      return res.status(403).send({ error: true, message: "unauthorized access -2" })
    }
    req.decoded = decoded
    
    next();
  })



  
 }
    //jwt
    app.post('/jwt', (req,res)=>{
      const user = req.body
      // console.log(user);
      const token = jwt.sign(user,process.env.Access_Token, {expiresIn: '1h'})
      // console.log(token)
      res.send({token})
    })
    //search products
  //   app.get('/getProductByCode/:letter', async (req, res) => {
        
  //       let letter = req.params.letter; // Convert to uppercase for case-insensitivity
  //        letter = req.params.letter[0].toUpperCase(); // Convert to uppercase for case-insensitivity
  //       console.log(letter);
  //     const query = { name: { $regex: `${letter}` } }; // Use a regular expression for matching the starting letter

  //     const product = await productsCollection.find(query).toArray();
  //       console.log(product);
  //       res.send(product);

  // });
//get all products
  app.get('/products', verifyJWT, async(req,res)=>{
    const products = await productsCollection.find().toArray()
    res.send(products)
  })

  // add product form to db
  app.post('/createProduct', verifyJWT, async(req,res)=>{
    const newProduct = req.body
    const product = await productsCollection.insertOne(newProduct)
    res.send(product)
  })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to Nimble server. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Nimble POS machine server!')
  })
  
  app.listen(port, () => {
    console.log(`Author - Raihan Jami Khan. Server: Nimble ${port}`)
  })