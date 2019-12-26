//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _  = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://AanshSavla:Test123@cluster0-qftu2.mongodb.net/toDoListDB",{useNewURLParser:true});

const itemSchema = new mongoose.Schema({
  name:String
});

const listSchema = new mongoose.Schema({
  name:String,
  list:[itemSchema]
});


const List = mongoose.model("List",listSchema);
const Item =  mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Welcome to your To-Do-List!"
});

const item2 = new Item({
  name:"Hit + button to add new item"
});

const item3 = new Item({
  name:"<-- Hit this to delete the item"
});
const defaultItems = [item1,item2,item3];


 // const items=[];
 // const workItems = [];



app.get("/",function(req,res){
//  var day=date.getDate();
Item.find({},function(err,results){
  if(err){
    console.log(err);
  }
  else if(results.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Succesfully Entered");
      }
    });
res.redirect("/");
  }
  else{
    res.render("list",{title:"Today",newItem:results});
  }
});
});

app.post("/",function(req,res){
const itemName = req.body.addedItem;
const listName = req.body.add;
const newItem = new Item({
  name:itemName
});

if(listName==="Today")
{
    newItem.save();
    res.redirect("/");
}
else{
List.findOne({name:listName},function(err,result){
  result.list.push(newItem);
  result.save();
  res.redirect("/"+result.name);
});
}

});



app.post("/delete",function(req,res){
  const deleteItemId=req.body.checkbox;
  const listName = req.body.listName;
console.log(listName);
   if(listName==="Today")
   {
     Item.findByIdAndDelete(deleteItemId,function(err){
       if(err){
         console.log(err);
       }
       else{
         res.redirect("/");
       }
     });
   }

   else{
     List.findOneAndUpdate({name:listName},{$pull : {list:{_id:deleteItemId}}},function(err,result){
       if(err){
         console.log(err);
       }
       else{
         console.log("Deleted from present List");
         res.redirect("/"+listName);
       }
     });
   }

});


app.get("/about",function(req,res){
  res.render("about");
});

app.get("/:newList",function(req,res){
const listName =_.capitalize(req.params.newList);

List.findOne({name:listName},function(err,result){
  if(!result){
    console.log("Not Found");
    const newList = new List({
      name:listName,
      list:defaultItems
  });
   newList.save();
   res.redirect("/"+listName);
}
else{
  res.render("list",{title:result.name,newItem:result.list});
  }
});
 });

 let port = process.env.PORT;
 if (port == null || port == "") {
   port = 8000;
 }
 app.listen(port);


app.listen(port,function(){
  console.log("Started server on port 3000.");
});
