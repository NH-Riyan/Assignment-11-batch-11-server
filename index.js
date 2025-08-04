const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app=express();
const port=process.env.PORT || 3000

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

app.get('/',(req,res)=>{
    res.send('hellou')
})

app.listen(port,()=>
  {
      console.log(`port is running ${port}`)
  })

  async function run() {
    try {
        const CourseList = client.db("A11B11").collection('Courses')
      
      await client.connect();

      app.get('/courses',async(req,res)=>{
        const List = CourseList.find()
        const result=await List.toArray()
        res.send(result)
      })

      app.post('/addcourses',async(req,res)=>
        {
            const newCourse = req.body;
            const result = await CourseList.insertOne(newCourse)
            res.send(result)
        })
     
     // await client.db("admin").command({ ping: 1 });
     // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
     
      //await client.close();
    }
  }
  run().catch(console.dir);