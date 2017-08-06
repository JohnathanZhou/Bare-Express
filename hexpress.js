// "use strict";
//
// var http = require('http');
// const querystring = require('querystring');
//
//
// module.exports = function () {
//   var useCallback = {};
//   var postCallback = {};
//   var getCallback = {};
//   var server = http.createServer(function(req, res) {
//     console.log('SOMEBODY MADE A REQUEST (url)', req.url);
//     console.log('SOMEBODY MADE A REQUEST (method)', req.method);
//     res.send = function(response) {
//       res.writeHead(200, {'Content-Type': 'text/plain'})
//       res.end(response);
//     }
//     res.json = function(response) {
//       res.writeHead(200, {'Content-Type': 'application/json'})
//       console.log('this is the response: ', response);
//       res.end(JSON.stringify(response))
//     }
//     var route = req.url.split('?')[0]
//     if (route === '/favicon.ico') {
//        route = '/'
//     }
//     var body = '';
//     req.on('readable', function() {
//         var chunk = req.read();
//         if (chunk) body += chunk;
//     });
//     req.on('end', function() {
//         // queryString is the querystring node built-in
//         console.log(req.method);
//         req.body = querystring.parse(body)
//         console.log(req.body);
//         if (!useCallback[route] === getCallback[route]) {
//           for (var key in useCallback) {
//             console.log('this is normal key: ',key);
//             console.log('this is the split key! ',key.split('/'), route);
//             if ('/' + key.split('/')[1] === (route)) {
//               if (req.method === 'GET') {
//                 useCallback[route](req, res)
//               }
//               else if (req.method === 'POST') {
//                 useCallback[route](req, res)
//               }
//             }
//           }
//         }
//         if (req.method === 'GET') {
//           getCallback[route](req, res)
//         }
//         else if (req.method === 'POST') {
//           postCallback[route](req, res)
//         }
//     });
//
//     console.log('this is the url url, it should match the route ',route);
//     req.query = JSON.stringify(querystring.parse(req.url.split('?')[1]));
//     console.log(JSON.stringify(req.query));
//   });
//
//   return {
//     get: function(route, callback) {
//       console.log('SOMEBODY CALLED GET', route);
//       if (!route) {
//         res.end('error')
//       }
//       if (!getCallback[route]) {
//         console.log('This shouldnt show');
//         getCallback[route] = callback
//         console.log('this is the function: ', getCallback[route]);
//       }
//     },
//     listen: function(port) {
//       console.log('SOMEBODY IS LISTENING', port);
//       server.listen(port);
//     },
//     post: function(route, callback) {
//       if (!postCallback[route]) {
//         postCallback[route] = callback
//       }
//     },
//     use: function(route, callback) {
//       useCallback[route] = callback
//       // getCallback[route] =  callback
//       // postCallback[route] = callback
//     }
//     // YOUR METHODS HERE
//   };
// };
"use strict";
var http = require('http');
var querystring = require('querystring');
var Handlebars = require('handlebars')
var fs = require('fs');

module.exports = function () {
  // YOUR CODE HERE
  var responseCallback = [];
  var server = http.createServer(function(req, res) {
    console.log('url',req.url)
    console.log('method',req.method)
    //URL SETTING
    var url = req.url;
    var route=url.split('?')[0];
    if(req.url ==='/favicon.ico'){
      url = '/'
    }
    if(url.split('?')[1]){
      req.query=JSON.stringify(querystring.parse(url.split('?')[1]))
    }
    //params
    var split;
    req.params = {}
    // if (url.includes(':')) {
    //   split = url.split('/')
    //   split.map((item, index) => {
    //     if (item[0] === ':') {
    //       req.params[item.split(':')[1]] = index
    //     }
    //   })
    // }
    res.send = function(response){
      console.log(response);
      res.end(response);
      res.writeHead(200);
    }
    res.json = function(response){
      response = JSON.stringify(response)
      res.end(response);
      res.writeHead(200);
    }
    //render
    res.render = function(name, options) {
      res.writeHead(200)
      var hbsfile = fs.readFileSync('./views/'+name, 'utf8');
      // var hbsfile = require('./views/'+name)
      // console.log(typeof );
      var template = Handlebars.compile(hbsfile.toString());
      res.end(template(options));
    }
    var found = false;
    var i = 0;
    var body = '';
    req.on('readable', function() {
      var chunk = req.read();
      if (chunk) body += chunk;
    });
    //Logic for all the requests
    req.on('end', function() {
      var split = url.split('/')
      for (var key in params) {
        params[key] = split[params[key]]
      }
      req.params = params
      // queryString is the querystring node built-in
      req.body = querystring.parse(body);
      //this is to apply use correctly
      while(!found){
        if(responseCallback[i].method === 'USE'){
          if(route.includes(responseCallback[i].route)){
            responseCallback[i].callback(req,res);
            found = true;
          }
        }
        if(responseCallback[i].route === route || responseCallback[i].route.split('/').length === route.split('/').length){
          if(responseCallback[i].method === req.method){
            responseCallback[i].callback(req,res)
            found = true;
          }
        }
        if(typeof responseCallback[i].route === 'function' ){
          responseCallback[i].route(req,res)
          found = true;
        }
        i++
        if (responseCallback.length = i) {
          found = true
        }
      }
    })
  })
  var params = {};
  return {
    get: function(route, callback) {

      // YOUR GET METHOD HERE
      if(route.split(':').length>1) {
        var obj ={
          route: route,
          method: 'GET',
          callback: callback
        }
        var split = route.split('/')
          split.map((item, index) => {
            if (item[0] === ':') {
              params[item.split(':')[1]] = index
            }
          })
      }
      var obj ={
        route: route,
        method: 'GET',
        callback: callback
      }
      responseCallback.push(obj)
    },
    listen: function(port){
      server.listen(port)
    },
    // YOUR METHODS HERE
    post: function(route, callback) {
      var obj ={
        route: route,
        method: 'POST',
        callback: callback
      }
      responseCallback.push(obj)
    },
    use: function(route, callback) {
      var obj ={
        route: route,
        method: 'USE',
        callback: callback
      }
      responseCallback.push(obj)
    }

  };
};
