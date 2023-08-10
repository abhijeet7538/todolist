const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://mongo1:abhi123@cluster0.5xmiiul.mongodb.net/todolistDB');

const itemSchema = {
    name: String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: 'welcome'
});

const item2 = new Item({
    name: 'add'
});

const item3 = new Item({
    name: 'delete'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const LISt = mongoose.model("list", listSchema);

const port = 3000;

app.get('/', async function (req, res) {

    async function myitems() {
        const foundItems = await Item.find({});

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems);
            res.redirect("/");
        } else {
            res.render("list", { listtitle: 'Today', nlitems: foundItems });
        }
    }
    myitems();
});

app.post("/", function (req, res) {

    const itemName = req.body.nitem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        LISt.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
            .catch((err) => console.log(err));
    }

});

app.get("/:customListName", async function (req, res) {
    const custoListNme = _.capitalize(req.params.customListName);

    try {
        const foundList = await LISt.findOne({ name: custoListNme });

        if (!foundList) {
            const list = new LISt({
                name: custoListNme,
                items: defaultItems
            });

            await list.save();
            console.log("New list created successfully");
            res.redirect("/" + custoListNme); // Redirect to the newly created list page
        } else {
            res.render('list', { listtitle: foundList.name, nlitems: foundList.items });
        }
    } catch (err) {
        console.error("Error while finding/creating the list:", err);
    }
});




app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listNmae = req.body.listName;
    if (listNmae === "Today") {
        Item.findByIdAndRemove(checkedItemId)
            .then(() => {
                res.redirect("/")
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        LISt.findOneAndUpdate({ name: listNmae }, { $pull: { items: { _id: checkedItemId } } })
            .then(() => {
                res.redirect("/" + listNmae);
            })
            .catch((err) => {
                console.error("Error while updating list:", err);
                res.redirect("/" + listNmae);
            })
    }
})



app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(port, function () {
    console.log('server running');
});