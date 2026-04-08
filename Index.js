const HTTP_PORT = process.env.PORT || 3000;

const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const app = express();
const readline = require("linebyline");
const fs = require("fs");
const session = require('client-sessions');
const randomStr = require("randomstring");
const mongoose = require("mongoose");
const Country = require("./Models/schemas")
const purchaseRouter = require("./Routes/purchase");
const connectDB = require("./db");

app.set("views", path.join(__dirname, "Views"));

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.engine(".hbs", exphbs.engine({											
    extname: ".hbs",                                                        
    defaultLayout: false,                                                  
    partialsDir: path.join(__dirname, "Views/Partials")
}));




var randomString = randomStr.generate();



app.use(session({														

    cookieName: "LoginCookie",
    secret: randomString,      										
    duration: 60 * 60 * 1000,										
    activeDuration: 10 * 60 * 1000,										
    httpOnly: true,                                                    
    secure: true,                                                          
    ephemeral: true                                                         
}));


app.use(express.static(path.join(__dirname, "Public")));


app.set("view engine", "hbs");     

app.use("/purchase", purchaseRouter);

app.get("/", async (req, res) => {
    if (!req.LoginCookie.user) {
        return res.redirect("/login");
  }
  try {
    await connectDB()
    const items = await Country.find({ status: "A" });

    let buttonOptions = items.map(item => {
      return {
        id: item._id,
        name: item.filename.split(".")[0],
        fileName: item.filename,
      };
    });

    let galInfo = {
      options: buttonOptions,
      picture: "Earth.jpg",
      username: req.LoginCookie.user,
      galleryName: "GALLERY",
      id: ""
    };

    res.render("handlebars", {
      data: galInfo
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading gallery");
  }
});

app.post("/", async function(req, res) {

    if (!req.LoginCookie || !req.LoginCookie.user) {
        return res.redirect("/login");
    }

    try {
        const items = await Country.find({ status: "A" });

        let buttonOptions = items.map(item => {
            return {
                id: item._id,
                name: item.filename.split(".")[0],
                fileName: item.filename,
            };
        });

       let selectedFile = req.body.country ? req.body.country : "Earth.jpg";
        let selectedItem = null;

        if (req.body.country) {
            selectedItem = await Country.findOne({ filename: selectedFile });
        }

        let galInfo = {
            options: buttonOptions,
            picture: selectedFile,
            username: req.LoginCookie.user,
            galleryName: req.body.country ? selectedFile.split(".")[0] : "GALLERY",
            id: selectedItem ? selectedItem._id.toString() : ""
        };
        
        res.render("handlebars", {
            data: galInfo
        });

    } catch (err) {
        console.log(err);
        res.send("Error Loading gallery");
    }
});  

app.get("/login", (req,res) => {   
    
    var loginData = {
        username: "",
        password: "",
        errorMessage: ""
    }
        res.render('login',{
            data:loginData
        });
});

app.post("/login", async function(req,res){
    
    var loginData = {
        username: "",
        password: "",
        errorMessage: ""
    }

let username = req.body.username;
let password = req.body.password;

   fs.readFile(path.join(__dirname, "User.JSON"), "utf-8",async (err,data) =>{
    if(err) (console.log(err)); 
    let userObj = JSON.parse(data);

    if(userObj.hasOwnProperty(username)){
        if(password == userObj[username]){

            await connectDB();
            req.LoginCookie.user = username

            await Country.updateMany(
                {},
                {$set:{status:"A"}}
            );

            return res.redirect("/");
        } else{
        loginData.username = username
        loginData.password = password
        loginData.errorMessage = "INVALID PASSWORD"
        return res.render('login',{
            data: loginData
        })
        }
    } else{
        loginData.username = username
        loginData.password = password
        loginData.errorMessage = "NOT A REGISTERED USERNAME"
        return res.render('login',{
            data: loginData
        })
    }
    })

})

app.post("/logout",function (req,res){
    req.LoginCookie.reset();
    res.redirect("/login");
})

app.get("/register",function(req,res){
    res.render("register")

})

app.post('/register', function(req,res){

    var registerData ={
        username:"",
        password:"",
        errorMessage:""

    }
    let username = req.body.username;
    let password = req.body.password;
    let confirmPass = req.body.password2;

    if (password === confirmPass){
        fs.readFile(path.join(__dirname, "User.JSON"), "utf-8", async (err,data)=>{
            if(err) throw err;

            let userObj = JSON.parse(data);

            userObj[username] = password;
            fs.writeFile(path.join(__dirname, "User.JSON"),JSON.stringify(userObj),(err) => {
                if (err) throw err;
                res.redirect("/login");
            })
        })
    }else{
        registerData.username = username
        registerData.password = password
        registerData.errorMessage = "Your passwords do not Match"
        res.render("register",{
            data:registerData
        })
    }

})


module.exports = app;