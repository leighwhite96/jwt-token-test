var express = require("express");
var app = express();
var _ = require("lodash");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

//hard coded users. This would obviously come from DB.

var users = [
  {
    id: 1,
    name: 'jonathanmh',
    password: '%2yx4'
  },
  {
    id: 2,
    name: 'test',
    password: 'test'
  }
];

app.use(passport.initialize());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

var jwtOptions = {};
//starts of empty. Properties added here:
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* fromAuthHeaderAsBearerToken() creates a new extractor that looks for
 the JWT in the authorization header with the scheme 'bearer'. In Postman
 in Authorisation header you put Bearer JWT.*/

jwtOptions.secretOrKey = 'wtfwebtokens';

/* jwtFromRequest is REQUIRED. It's a function that accepts a request
as the only paramaeter and returns either the JWT as a string or null.

secretOrKey is a string containing the secret. */

/* new JwtStrategy(options,verify) where options is an object literal
containing options to control how the token is extracted from the request
or verified. */

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  var user = users[_.findIndex(users, {id: jwt_payload.id})];
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

/* verify is a function that has parameters jwt_payload and done/next.
jwt_payload is an object literal containing the decoded JWT payload.

next is a passport error first callback accepting argumants done(error,user,info)

*/

passport.use(strategy);

app.get("/", function(req, res) {
  res.json({message: "Express is up!"});
});

app.post("/login", function(req, res) {
  if(req.body.name && req.body.password){
    var name = req.body.name;
    var password = req.body.password;
  }
  // usually this would be a database call:
  var user = users[_.findIndex(users, {name: name})];
  if( ! user ){
    res.status(401).json({message:"no such user found"});
  }

  if(user.password === req.body.password) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    var payload = {id: user.id};
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({message: "ok", token: token});
  } else {
    res.status(401).json({message:"passwords did not match"});
  }
});

app.get("/secret", passport.authenticate('jwt', { session: false }), function(req, res){
  res.json("Success! You can not see this without a token");
});

app.listen(3000, function() {
  console.log("Express running");
});
