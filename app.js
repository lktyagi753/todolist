const express = require('express');
const body = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const _ = require('lodash')

const app = express();

mongoose.connect("mongodb+srv://admin:Love7534@cluster0.cokfbhy.mongodb.net/todolistDB", { useNewUrlParser: true });

// var values = ["Buy Food","Cool Food","Eat Food"];
// var workarr = [];

const valuesSchema = new mongoose.Schema({
    name: String
});

const Value = mongoose.model("Value", valuesSchema);

const value1 = new Value
    ({
        name: "Welcome to your todolist"
    });

const value2 = new Value
    ({
        name: "Hit + to add new item"
    });

const value3 = new Value
    ({
        name: "<-- Hit to delete a item"
    });

const defaultArray = [value1, value2, value3];

const listSchema =
    ({
        name: String,
        item: [valuesSchema]
    });

const List = mongoose.model("List", listSchema);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("publlic"));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    Value.find({}).then(function (found) {
        if (found.length === 0) {
            Value.insertMany(defaultArray).then(function () {
                console.log("Successfully saved defult items to DB");
            })
                .catch(function (err) {
                    console.log(err);
                });;
            res.redirect('/');
        }
        else
            res.render('list', { listvalue: "Today", itemvalues: found })
    });
})

app.post('/', (req, res) => {
    const x = req.body.newItem;
    const btn = req.body.list;
    const item = new Value({
        name: x
    });
    if (btn === "Today") {
        item.save();
        res.redirect('/');
    }
    else {
        List.findOne({ name: btn }).then((data) => {
            data.item.push(item)
            data.save();
            res.redirect("/" + btn);
        });
    }
});

app.post('/delete', (req, res) => {
    const check = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Value.findByIdAndDelete({ _id: check }).then(function () {
            console.log("Successfully delete defult items to DB");
        })
            .catch(function (err) {
                console.log(err);
            });;
        res.redirect('/');
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { item: { _id: check } } })
            .then(function () {
                console.log("Successfully delete defult items to DB");
            })
            .catch(function (err) {
                console.log(err);
            });;
        res.redirect("/" + listName);
    }
})

app.get('/:postName', (req, res) => {
    const postName = _.capitalize(req.params.postName);

    List.findOne({ name: postName }).then((data) => {
        if (!data) {
            const list = new List
                ({
                    name: postName,
                    item: defaultArray
                })
            list.save();
            console.log("Successfully added list");
            res.redirect('/' + postName);
        }
        else {
            res.render('list', { listvalue: postName, itemvalues: data.item });
        }
    });

});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running live on port');
})