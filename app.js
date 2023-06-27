require('dotenv').config();
const express = require('express');
const body = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const _ = require('lodash');

const app = express();

mongoose.connect(process.env.STRING, { useNewUrlParser: true });

const valuesSchema = new mongoose.Schema({
    name: String
});

const Value = mongoose.model("Value", valuesSchema);

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
        item.save().then(()=>{
            res.redirect('/');
        })  
    }
    else {
        List.findOne({ name: btn }).then((data) => {
            if(!data)
            {
                const first = new List({
                    name : btn,
                    item : item
                })
                first.save().then(()=>{
                    res.redirect("/" + btn);
                });
            }
            else{
                data.item.push(item)
                data.save().then(()=>{
                res.redirect("/" + btn);
            });
            }
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
            });
        res.redirect("/" + listName);
    }
})

app.get('/:postName', (req, res) => {
    const postName = _.capitalize(req.params.postName);

    List.findOne({ name: postName }).then((data) => {
        if(!data)
        res.render('list', {listvalue : postName , itemvalues: ""})
        else
            res.render('list', { listvalue: postName, itemvalues: data.item});
    });

});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running live on port');
})