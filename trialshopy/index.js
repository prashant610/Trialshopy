const express = require('express');
const session =require('express-session');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const Sellers= require('./models/Sellers');
const Product = require('./models/Product');
const Review = require('./models/Review');
const Category= require('./models/Category');
const Commission = require("./models/Commission");


const store=new session.MemoryStore();
const PORT = process.env.PORT||9000;
//middleware

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(session({
    secret:"your own secret key",
    cookie:{maxAge:3000000},
    resave:false,
    saveUninitialized:true,
    store
}))


//db connection
mongoose.connect('mongodb://localhost:27017/Sellers',()=>{
    console.log("connected");
});


//Authentication API

app.post('/auth/login',(req,res)=>{
  console.log(req.sessionID);
  const {username,pswd}=req.body;
  if(username && pswd){
      if(req.session.authenticated){
          res.status(200).json(req.session);
      }else{
          Sellers.findOne({email: username,
              password: pswd}).then(()=>{
                  req.session.authenticated=true,
                  req.session.user={username,pswd};
                  res.status(200).json(req.session);
              }).catch(()=>res.status(403).send('Bad Credentials'));
                  
      }
  }
  else{
      res.status(403).send('Bad Credentials');
  }
});

app.post('/auth/logout',(req,res)=>{
  const sid=req.sessionID;
  //console.log("session ID: "+sid);
  if(sid && req.session.authenticated){
      store.destroy(sid,(err)=>{
          if(err){
              res.status(505).send(err);
          }
          else {
              console.log(store);
              res.status(200).send("logged out");
          }
      });
  }
  else res.status(401).send("no sid aur or authenticated");
  
});

app.get('/auth/session',(req,res)=>{
  const sid=req.sessionID;
  store.get(sid,(error,session)=>{
      if(error){
          res.status(401).send(error);
      }
      else res.status(200).send(session);
  })
});


 
   
 
//Products API

app.get('/api/products', async (req,res)=>{
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, 'secret');
    if(decoded){
        const products = await Product.find();
    res.status(200).json({ products });
    }
    } catch (error) {
        console.log(error);
        return res.json({status: 'error', error:"Invalid token"});
        
    }
})
app.post('/api/products', async (req,res)=>{
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, 'secret');
        if(decoded){
        const { name, price } = req.body;
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully' });
        }
    } catch (error) {
        console.log(error);
        return res.json({status: 'error', error:"Invalid token"});
        
    }
})
// ...

// Products API

// ...

app.put('/products/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      const { name, price } = req.body;
  
      // Check if the product exists
      const existingProduct = await Product.findById(productId);
  
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Update product details
      existingProduct.name = name || existingProduct.name;
      existingProduct.price = price || existingProduct.price;
  
      await existingProduct.save();
  
      res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.delete('/products/:id', async (req, res) => {
    try {
      const productId = req.params.id;
  
      // Check if the product exists
      const existingProduct = await Product.findById(productId);
  
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Remove the product
      await existingProduct.remove();
  
      res.status(200).json({ message: 'Product removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // ...
  app.post('/products/bulk-upload', async (req, res) => {
    try {
      const productsToUpload = req.body.products; // Assuming the request body has a 'products' array
  
      // Validate the presence of products array in the request body
      if (!productsToUpload || !Array.isArray(productsToUpload)) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      // Use MongoDB's insertMany to insert multiple products at once
      const result = await Product.insertMany(productsToUpload);
  
      res.status(201).json({ message: 'Bulk upload successful', insertedProducts: result });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  // ...

// Category Management

// List Product Categories
app.get('/categories', async (req, res) => {
    try {
      // The 'Category' model for managing categories
      const categories = await Category.find();
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Create a New Category
  app.post('/categories', async (req, res) => {
    try {
      const { categoryName } = req.body;
  
      // The 'Category' model for managing categories
      const newCategory = new Category({ name: categoryName });
      await newCategory.save();
  
      res.status(201).json({ message: 'Category created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Update a Category
  app.put('/categories/:id', async (req, res) => {
    try {
      const categoryId = req.params.id;
      const { categoryName } = req.body;
  
      // The 'Category' model for managing categories
      const existingCategory = await Category.findById(categoryId);
  
      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      // Update category details
      existingCategory.name = categoryName || existingCategory.name;
      await existingCategory.save();
  
      res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Delete a Category
  app.delete('/categories/:id', async (req, res) => {
    try {
      const categoryId = req.params.id;
  
      // The 'Category' model for managing categories
      const existingCategory = await Category.findById(categoryId);
  
      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      // Remove the category
      await existingCategory.remove();
  
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // ...
  
// ...

// Commission Settings

// Search and Filter Products by Name, ID, or Category
app.get('/commissions/products', async (req, res) => {
    try {
      const { name, id, category } = req.query;
  
      // The 'Product' model for managing products
      const query = {};
  
      if (name) {
        query.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search
      }
  
      if (id) {
        query._id = id;
      }
  
      if (category) {
        query.category = category;
      }
  
      const products = await Product.find(query);
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Add Commission Settings for a Product
  app.post('/commissions/products', async (req, res) => {
    try {
      const { productID, commissionPercentage, parentCategoryID } = req.body;
  
      // The 'Commission' model for managing commission settings
      const newCommission = new Commission({
        productID,
        commissionPercentage,
        parentCategoryID,
      });
  
      await newCommission.save();
  
      res.status(201).json({ message: 'Commission settings added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // ...
  
// ...

// Commission Settings

// Update Existing Commission Setting with New Percentage or Category Association
app.put('/commissions/products/:id', async (req, res) => {
    try {
      const commissionId = req.params.id;
      const { commissionPercentage, parentCategoryID } = req.body;
  
      // The 'Commission' model for managing commission settings
      const existingCommission = await Commission.findById(commissionId);
  
      if (!existingCommission) {
        return res.status(404).json({ error: 'Commission setting not found' });
      }
  
      // Update commission details
      existingCommission.commissionPercentage = commissionPercentage || existingCommission.commissionPercentage;
      existingCommission.parentCategoryID = parentCategoryID || existingCommission.parentCategoryID;
  
      await existingCommission.save();
  
      res.status(200).json({ message: 'Commission setting updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get Commission Details for a Specific Product
  app.get('/commissions/products/:id', async (req, res) => {
    try {
      const productId = req.params.id;
  
      // The 'Commission' model for managing commission settings
      const commissionDetails = await Commission.findOne({ productID: productId });
  
      if (!commissionDetails) {
        return res.status(404).json({ error: 'Commission setting not found for the product' });
      }
  
      res.status(200).json({ commissionDetails });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Remove a Commission Setting for a Product
  app.delete('/commissions/products/:id', async (req, res) => {
    try {
      const commissionId = req.params.id;
  
      // The 'Commission' model for managing commission settings
      const existingCommission = await Commission.findById(commissionId);
  
      if (!existingCommission) {
        return res.status(404).json({ error: 'Commission setting not found' });
      }
  
      // Remove the commission setting
      await existingCommission.remove();
  
      res.status(200).json({ message: 'Commission setting removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // ...

// Review Management

// List Product Reviews
app.get('/reviews', async (req, res) => {
    try {
      // Assuming you have a 'Review' model for managing reviews
      const reviews = await Review.find();
      res.status(200).json({ reviews });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Reply to Reviews
  app.post('/reviews/respond', async (req, res) => {
    try {
      const { reviewId, responseText } = req.body;
  
      // The 'Review' model for managing reviews
      const existingReview = await Review.findById(reviewId);
  
      if (!existingReview) {
        return res.status(404).json({ error: 'Review not found' });
      }
  
      // Adding the response to the array of responses
      existingReview.responses.push({ text: responseText, timestamp: new Date() });
  
      await existingReview.save();
  
      res.status(201).json({ message: 'Review response added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  
  
      
  

//listening port
app.listen(PORT, '0.0.0.0', function(err) {
  console.log("Started listening on %s", PORT);
});