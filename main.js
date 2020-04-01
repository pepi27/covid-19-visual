const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const request = require('request');
const load = require('cheerio').load;
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 3000;

let dead;
let infected;
let recovered;


function getDataAll() {
  return request('https://www.worldometers.info/coronavirus/', function (err, resp, html) {
    if (!err && resp.statusCode === 200) {
      const $ = load(html);
      const counters = $('.maincounter-number').text();
      const n = counters.split('\n');
      infected = n[1];
      dead = n[3];
      recovered = n[5];
      console.log('pinged');
      io.emit('sent data', [infected, recovered, dead]);
    }
  });
}

function getDataSingle(socket) {
  return request('https://www.worldometers.info/coronavirus/', function (err, resp, html) {
    if (!err && resp.statusCode === 200) {
      const $ = load(html);
      const counters = $('.maincounter-number').text();
      const n = counters.split('\n');
      infected = n[1];
      dead = n[3];
      recovered = n[5];
      console.log('pinged');
      socket.emit('sent data', [infected, recovered, dead]);
    }
  });
}

io.on('connection', function (socket) {
  console.log('connected');
  getDataSingle(socket);
});

const reqeustDataLoop = setInterval(getDataAll, 60000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(PORT, function () {
  console.log(`Server is listening on port ${PORT}`);
});