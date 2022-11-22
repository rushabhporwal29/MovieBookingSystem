const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();

// Movies Data
const movies = JSON.parse(fs.readFileSync('movies.json'));

// Express App
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

var mysql = require('mysql');

var con = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT
});

con.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
  app.listen(process.env.PORT, process.env.HOST);
  console.log("Listening at port " + process.env.PORT);
// con.end();
});

//register view engine
app.set("view engine", "ejs");

// 3rd party middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static("public"));


// Routers
app.get("/", (req, res) => {
	res.render("index");
});

app.get("/signUp",(req,res)=>{
	res.render("signUp")
})

app.get("/home",(req,res)=>{
	res.render("home",{status:"", movies:movies});
})

app.post("/",(req,res)=>{
	console.log(req.body);	
	let values = "'"+req.body.username+"',"+"'"+req.body.name+"',"+"'"+req.body.password+"'";
	let query = "SELECT `password` FROM `movie_booking`.`User` WHERE Username='"+req.body.username+"';";
	con.connect((err)=>{
		con.query(query,(err,result,fields)=>{
			if (err){
				console.log("#Error:",err);
				res.json({result:err, status:0});
			} 
			if (result){
				// console.log("#Result",result);
				// console.log("##########",result[0]['password'],req.body.password);
				if (result[0]['password']==req.body.password){
					res.json({status:1});
				}else{
					res.json({status:0});
				}
			} 
			if (fields) console.log("#Fields",fields);
		})
	})
})

app.post("/signUp",(req,res)=>{
	console.log(req.body);
	let values = "'"+req.body.username+"',"+"'"+req.body.name+"',"+"'"+req.body.password+"'";
	let query = 'INSERT INTO `movie_booking`.`User`(`Username`,`Name`,`Password`)VALUES('+values+');'
	con.connect((err)=>{
		con.query(query,(err,result,fields)=>{
			if (err){
				console.log("#Error:",err);
				res.json({result:err, status:0});
			} 
			if (result){
				console.log("Result",result);
				res.json({result:result, status:1});
			} 
			if (fields) console.log("#Fields",fields);
		})
	})
});

app.post("/booking",(req,res)=>{
	console.log(req.body);
	let values = "'"+req.body.name+"',"+"'"+req.body.email+"',"+"'"+req.body.movie+"',"+req.body.numTicket+","+"'"+req.body.showDate+"'";
	let query = 'INSERT INTO `movie_booking`.`Bookings`(`name`,`email`,`movie`,`numticket`,`showdate`)VALUES('+values+');'
	con.connect((err)=>{
		con.query(query,(err,result,fields)=>{
			if (err){
				console.log("#Error:",err);
				res.render("home",{status:0});
			}
			if (fields) console.log("#Fields",fields); 
			if (result){
				console.log("#Result",result);
				res.render("home",{status:{id:result.insertId},movies:movies});
			} 
			
		})
	})
	
})
