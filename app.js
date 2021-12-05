const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const config = require(__dirname + "/config.js");

mongoose.connect(config.connection);

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist",
});

const item2 = new Item({
    name: "Hit the + button to add a new item",
});

const item3 = new Item({
    name: "Check an item to delete",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// get the home route and render the user interface
app.get("/", function (req, res) {
    const day = date.getDate();

    Item.find(function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (!err) {
                    console.log("success");
                }
            });
            res.redirect("/");
        } else {
            res.render("todo.ejs", { listTitle: day, newItemList: foundItems, });
        }

    });



});

// push new todo in the items array 
app.post("/", function (request, response) {
    const day = date.getDate();
    let itemName = request.body.inputField;
    let listName = request.body.button;

    const addItem = new Item({
        name: itemName,
    });

    if (listName === day) {
        addItem.save();
        response.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(addItem);
            foundList.save();
            response.redirect("/" + listName);
        })
    }

});

// render the about page
app.get("/about", function (req, res) {
    res.render("about.ejs");
});



app.post("/delete", function (req, res) {
    const day = date.getDate();
    const itemName = req.body.listName;
    const deleteItem = req.body.check;

    if (itemName === day) {
        Item.deleteOne({ _id: deleteItem }, function (err) {
            if (!err) {
                res.redirect("/");
            }
        });

    } else {
        List.findOneAndUpdate({ name: itemName }, { $pull: { items: { _id: deleteItem } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + itemName);
            }
        })

    }


});


app.get("/:customName", function (req, res) {
    let customListName = req.params.customName.slice(0, 1).toUpperCase() + req.params.customName.slice(1).toLowerCase();

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //   create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                });

                list.save();

                res.redirect("/" + customListName);
            } else {
                // show an existing list
                res.render("todo.ejs", { listTitle: foundList.name, newItemList: foundList.items, });
            }
        }
    });



});




app.listen(process.env.PORT || 3000, function () {
    console.log("server now running successfully");
});