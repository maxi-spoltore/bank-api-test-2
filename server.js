
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const sha512 = require("js-sha512");
const app = express();
const jwt_decode = require('jwt-decode');
require('dotenv').config();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


/***************/// Auth0 token validation config ////***************/

const { auth } = require('express-jwt');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');


const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_TENANT}.us.auth0.com/.well-known/jwks.json`,
  }),

  audience: "https://mybank-api-2.test",
  issuer: `https://${process.env.AUTH0_TENANT}.us.auth0.com/`,
  algorithms: ["RS256"],
});



const jwtAuthz = require('express-jwt-authz');
var jwtAuthzOptions = { customScopeKey: 'scope', customUserKey: 'auth' };



/*********************************************/


/***************/// API 1 (public)////***************/
app.get("/", async ( request, response) => {

  
    response.header("Access-Control-Allow-Origin", "*");
    response.send({"msg" : "Welcome to MyBank API 2"});
   
});


/***************///  API 2 (secured)////***************/
app.post("/transfer", checkJwt, jwtAuthz(['transfer:money'], jwtAuthzOptions) , async ( request, response) => {

  
    console.log("Account Reciever: " + request.body.reciever);
    console.log("Account Sender: " + request.body.sender);
    console.log("Account Amount: " + request.body.amount);
  
    
    response.header("Access-Control-Allow-Origin", "*");
    response.send({"transfer_confirmation_number": randomString()});

  
});
  
/*******************/// Random confirmation strings///***********************/

function randomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
   result += '-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result.toUpperCase();
}

/*********************************************/



app.use(express.static("public"));

app.get("/", (request, response) => {
  
  response.sendFile(__dirname + "/src/pages/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

const cors = require("cors"); 
app.use(cors());
