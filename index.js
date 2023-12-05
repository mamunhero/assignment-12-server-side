const express = require('express')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', "https://assignment-12-server-side-xi.vercel.app"],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))






const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clf7ui5.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const database = client.db("tourDB");
    const packageCollection = database.collection("package");
    const usersCollection = database.collection("users");
    const tourGuideCollection = database.collection("tourGuide");
    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      console.log('I need a new jwt', user)
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

     // Logout
     app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
        console.log('Logout successful')
      } catch (err) {
        res.status(500).send(err)
      }
    })


    // Save or modify user email, status in DB
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email: email }
      const options = { upsert: true }
      const isExist = await usersCollection.findOne(query)
      console.log('User found?----->', isExist)
      if (isExist) return res.send(isExist)
      const result = await usersCollection.updateOne(
        query,
        {
          $set: { ...user, timestamp: Date.now() },
        },
        options
      )
      res.send(result)
    })




    // pacakage get collection
   app.get("/package", async (req, res)=> {
      const cursor = packageCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

  //  one packages collection
  app.get("/packages/:id", async (req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await packageCollection.findOne(query);
      res.send(result);
  })
    
    // tourguide get
    app.get("/tourGuide", async (req, res)=> {
        const cursor = tourGuideCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })
     
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
















app.get("/", (req, res)=> {
  res.send("Explore in bangladesh")
})

app.listen(port, ()=> {
  console.log(`explore in banglade  on port ${port}`);
})


