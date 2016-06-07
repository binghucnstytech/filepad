var express = require('express');
var compression = require('compression')
var auth = require('http-auth');
var request = require('superagent');
var bodyParser = require('body-parser')

var app = express();


// Authenticator
var basic = auth.basic({
        realm: "web"
    }, function (username, password, callback) { // Custom authentication method.
        callback(username === "admin" && password === "admin123");
    }
);

app.use(auth.connect(basic));

// Compression.
app.use(compression({filter: shouldCompress}))
function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        return true;
    }

    return compression.filter(req, res)
}

var port = 9002;

// Static
app.use(express.static('./public'));
app.listen(port);