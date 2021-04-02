//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"welcome to your ToDo List"
})

const item2 = new Item({
  name:"Hit the + to add a task"
})

const item3 = new Item({
  name:"Tick the checkbox to remove a task"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err,result){
    if(result.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("added defaults to the array!");
        }
      });
      res.redirect("/");
    }
    else{
        res.render("list", {listTitle: "Today", newListItems: result});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err, result){
    if(!err)
    {
      if(!result)
      { //make a new list
        const list = new List({
          name: customListName,
          items:defaultItems
        })
          list.save();
          res.redirect("/" + customListName);
      }
      else{
        //show the existing list.
        res.render("list", {listTitle: result.name, newListItems: result.items})
      }
    }
  })

})

app.post("/", function(req, res){

const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item({
  name:itemName
})

if(listName === "Today"){
  item.save()
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err, result){
    result.items.push(item);
    result.save();
    res.redirect("/" + listName);
  })
}


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){           //meathod found in mongoose documentation
      if(!err){
        console.log("removal successfull");
        res.redirect("/");
      }
  });
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, result){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});




////background-image: -webkit-linear-gradient(65deg, #A683E3 50%, #E4E9FD 50%)
