const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster10.oop5ill.mongodb.net/?retryWrites=true&w=majority&appName=Cluster10`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_KEY_BASE64, 'base64').toString('utf8')
);;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


app.get('/', (req, res) => {
  res.send('hellou')
})

app.listen(port, () => {
  console.log(`port is running ${port}`)
})


const verifyToken = async (req, res, next) => {
  
  const AuthHeader = req.headers?.authorization

  if (!AuthHeader || !AuthHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'unauthorized access' })
  }

  const token = AuthHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.decoded = decoded
    next()
  }
  catch (error) {
    return res.status(401).send({ message: 'error' })
  }

}

async function run() {
  try {
    const CourseList = client.db("A11B11").collection('Courses')
    const UserList = client.db("A11B11").collection('users')

    await client.connect();

    app.get('/courses', async (req, res) => {
      const List = CourseList.find()
      const result = await List.toArray()
      res.send(result)
    })

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await CourseList.findOne(query)
      res.send(result)
    })

    app.get('/courses/user/:email', verifyToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const result = await CourseList.find({ email }).toArray();
      res.send(result);
    })

    app.post('/addcourses', async (req, res) => {
      const newCourse = req.body;
      const result = await CourseList.insertOne(newCourse)
      res.send(result)
    })

    app.patch('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateddata = req.body;
      const update = { $set: updateddata };

      const result = await CourseList.updateOne(filter, update)
      res.send(result)
    })

    app.delete('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await CourseList.deleteOne(query)
      res.send(result)

    })



    app.post("/login", async (req, res) => {
      const { email } = req.body;
      let user = await UserList.findOne({ email });
      if (!user) {
        const result = await UserList.insertOne(req.body);
        return res.send(result)
      }
      res.send(user)
    })

    app.get("/users/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const result = await UserList.findOne(query);
      res.json(result)
    })

    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const updatedData = req.body
      const filter = { email: email };
      const update = {
        $set: {
          enrolledcourses: updatedData.updatedcourses
        }
      };

      const result = await UserList.updateOne(filter, update);

      res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    //await client.close();
  }
}
run().catch(console.dir);