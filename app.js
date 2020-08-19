
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sathiya:ramwarsathiya@cluster0.i9spa.mongodb.net/todolistDB?retryWrites=true&w=majority",{useFindAndModify: false, useNewUrlParser : true, useUnifiedTopology : true});
const itemsSchema = new mongoose.Schema({
    name : {
      type : String,
      required : true
    }
});
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome"
});
const item2 = new Item({
  name : "And"
});
const item3 = new Item({
  name : "Thankyou"
});
const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name : {
      type : String,
      required : true
    },
    items : [itemsSchema]
});
const List = mongoose.model("List",listSchema);

Item.find(function(err,items){
  if(err){
    console.log(err);
  }else{
    const foundItems = items;
    if(foundItems.length == 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
      });
    }
  }
});

app.get("/", function(req, res) {
  Item.find(function(err,items){
    if(err){
      console.log(err);
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const foundList = req.body.list;
  const item = new Item({
    name : newItem
  });
  if(foundList === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: foundList}, function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/"+foundList);
    });
  }

});
app.post("/delete",function(req,res){
  if(req.body.list === "Today"){
    Item.deleteOne({_id: req.body.checkbox},function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: req.body.list},{$pull: {items: {_id: req.body.checkbox}}},function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/"+req.body.list);
      }
    });
  }
});

app.get("/:parameter", function(req,res){
  const userInput = _.capitalize(req.params.parameter);
  List.findOne({name: userInput},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      if(!results){
        const list = new List({
          name : userInput,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+userInput);
      }
      else{
        res.render("list",{listTitle: results.name, newListItems: results.items})
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT, function() {
  console.log("Server has started");
});
