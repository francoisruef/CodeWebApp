var http = require('http');
var dispatcher = require('./node_modules/httpdispatcher');

dispatcher.setStatic('resources');

http.createServer(handleRequest).listen(process.env.PORT);

function handleRequest(req, res) {
    console.log('Got request for ' + req.url);
    //res.writeHead(200, {'Content-Type': 'text/html'});
    //res.end('<h1>Hello Code and Azure Web Apps!</h1>');
    
    dispatcher.dispatch(req, res);
    dispatcher.dispatch(req, res);
    
}

dispatcher.onGet("/", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Main Page');
});	

dispatcher.onGet("/docs", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    //res.end('Page One');
    
    getDocs();
});


function getDocs() {
 
    // read lastDocID from database
    
    // get documents
    var httpDoc = require('http');
    
    //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
    var options = {
        host: 'https://mseapimgt.azure-api.net',
        path: '/mse/documents',
        headers: {'Ocp-Apim-Subscription-Key': '3ef9e13f1cae4dad9086feef67ded274'}
    };
    
    callback = function(response) {
        var str = '';
    
        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });
    
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
        });
        
        // write string to output
        res.end(str);
    }
    
    httpDoc.request(options, callback).end();   
    
    // push new documents to event hub
    
    // save last docID

};	

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


*/
