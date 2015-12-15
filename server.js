var http = require('http');
var dispatcher = require('httpdispatcher');

http.createServer(handleRequest).listen(process.env.PORT);

function handleRequest(req, res) {
    console.log('Got request for ' + req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Hello Code and Azure Web Apps!</h1>');
    
    //dispatcher.dispatch(req, res);
    
}

/*
//For all your static (js/css/images/etc.) set the directory name (relative path).
dispatcher.setStatic('resources');

//A sample GET request    
dispatcher.onGet("/page1", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page One');
});    

//A sample POST request
dispatcher.onPost("/post1", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Got Post Data');
});

function getDocs() {
    // read lastDocID from database
    
    // get documents
    
    
    // push new documents to event hub
    
    // save last docID

}
*/
