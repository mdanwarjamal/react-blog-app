import path from "path";
import express from 'express';
import bodyParser from 'body-parser';
import mongoose, { Schema } from 'mongoose';

const app = express();

app.use(express.static(path.join(__dirname,'/build')))
app.use(bodyParser.json());

const uri = "mongodb+srv://root:root@firstcluster.cdsyl.mongodb.net/blogs?retryWrites=true&w=majority"
const schema = new Schema({
    name:String,
    upvotes:Number,
    comments:Array
})
var Blogs = mongoose.model('Blogs',schema)

mongoose.connect(uri,{useNewUrlParser: true,
    useUnifiedTopology: true
  },(err)=>{
    console.log("MONGO DB connected",err)
})

app.get('/api/articles/:name',(req,res)=>{
    const articleName = req.params.name;
    Blogs.findOne({name:articleName},(err,blog)=>{
        res.send(blog)
    })
})

app.get('/api/articles/',(req,res)=>{
    Blogs.find({},(err,blogs)=>{
        res.send(blogs)
    })
})
app.post('/api/articles/:name/upvote',async (req,res)=>{
    try{
        const articleName = req.params.name;
        var blog = await Blogs.findOne({name:articleName});
        await Blogs.updateOne({name:articleName},{
                "$set":{
                    upvotes: blog.upvotes+1
                },
        });
        const updatedArticle =  await Blogs.findOne({name:articleName});
        res.sendStatus(200).send(updatedArticle);
    }catch(error){
        res.sendStatus(500).send("Could not upvote");
    }
})
app.post('/api/articles/:name/insert-new-article',(req,res)=>{
    const articleName = req.params.name;
    var blog = new Blogs({
        name:articleName,
        upvotes:0,
        comments:[]
    })
    blog.save(err=>{
        if(err)
            res.sendStatus(500)
        res.sendStatus(200)
    })
})

app.post('/api/articles/:name/add-comment',async (req,res)=>{
    try{
        const articleName = req.params.name;
        const {username,text} = req.body;
        var blog = await Blogs.findOne({name:articleName});
        await Blogs.updateOne({name:articleName},{
                "$set":{
                    comments: blog.comments.concat({username,text})
                },
        });
        const updatedArticle =  await Blogs.findOne({name:articleName});
        res.sendStatus(200).send(updatedArticle);
    }catch(error){
        res.sendStatus(500).send("Could not add comment");
    }
})

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname + "/build/index.html"))
})

app.listen(8000,() => console.log(`Server running at 8000...`))