const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ahv0a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db('Front-one')
        const productCollection = database.collection('products')
        const orderCollection = database.collection('orders')
        const reviewCollection = database.collection('review')

        //Get Product API
        app.get('/products', async (req, res) => {

            const cursor = productCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size)
            let products;
            const count = await cursor.count()
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products

            })
        })

        //add to data in server from UI 
        app.post('/products', async (req, res) => {
            const order = req.body;
            const result = await productCollection.insertOne(order);
            console.log(result)
            res.send(result)
        })

        //get orders to manage
        app.get('/orders', async (req, res) => {

            const cursor = orderCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size)
            let orders;
            const count = await cursor.count()
            if (page) {
                orders = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                orders = await cursor.toArray();
            }

            res.send({
                count,
                orders

            })
        })

        //get review from backEnd to show Review page
        app.get('/review', async (req, res) => {

            const cursor = reviewCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size)
            let reviews;
            const count = await cursor.count()
            if (page) {
                reviews = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                reviews = await cursor.toArray();
            }

            res.send({
                count,
                reviews

            })
        })

        // use PoST to get data by key
        app.post('/products/byKeys', async (req, res) => {
            console.log(req.body)
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productCollection.find(query).toArray();
            res.json(products);
        })

        //add order data
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
        })

        //add review data from UI(AddReview)
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        //update data
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    spotName: updatedUser.spotName,
                    duration: updatedUser.duration,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                },

            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        //delete data
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const result = await orderCollection.deleteOne(query)
            console.log('deleting user with id', id);
            res.json(result)

        })

    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Galaxy Travel is running')
});

app.listen(port, () => {
    console.log('Server running at port', port)
})

