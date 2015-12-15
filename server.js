var http = require('http');
var dispatcher = require('./httpdispatcher');

dispatcher.setStatic('resources');

http.createServer(handleRequest).listen(process.env.PORT);

function handleRequest(req, res) {
    console.log('Got request for ' + req.url);
    //res.writeHead(200, {'Content-Type': 'text/html'});
    //res.end('<h1>Hello Code and Azure Web Apps!</h1>');
    
    dispatcher.dispatch(req, res);
    //dispatcher.dispatch(req, res);
    
}


dispatcher.onGet("/page1", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page One');
});	

dispatcher.onPost("/page2", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page Two');
});

dispatcher.beforeFilter(/\//, function(req, res, chain) { //any url
    console.log("Before filter");
    chain.next(req, res, chain);
});

dispatcher.afterFilter(/\//, function(req, res) { //any url
    console.log("After filter");
    chain.next(req, res, chain);
});

dispatcher.onError(function(req, res) {
    res.writeHead(404);
});

	
	/*
	GET /page1 => 'Page One'
	POST /page2 => 'Page Two'
	GET /page3 => 404
	GET /resources/images-that-exists.png => Image resource
	GET /resources/images-that-does-not-exists.png => 404
	*/
	

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
