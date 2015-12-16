var http = require('http');
var dispatcher = require('./node_modules/httpdispatcher');
var httpDoc = require('https');
var request = require('request');
var https = require('https');
var crypto = require('crypto');

//EventHub
var namespace = 'mse-demo';
var hubname = 'msehub';
var devicename ='test';
var my_sas = '';
// Shared access key (from Event Hub configuration)
var my_key_name = 'sending';
var my_key = 'key';

dispatcher.setStatic('resources');
createToken();
http.createServer(handleRequest).listen(8080);


function handleRequest(req, res) {
    console.log('Got request for ' + req.url);
    //res.writeHead(200, {'Content-Type': 'text/html'});
    //res.end('<h1>Hello Code and Azure Web Apps!</h1>');
    
    dispatcher.dispatch(req, res);
}

dispatcher.onGet("/", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    console.log('Main Page');
    res.end('Main Page');
});	

dispatcher.onGet("/docs", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    console.log('/docs');
    //res.end('Page One');
    
    var docs = getDocs(res);
    console.log('docs = '+docs);
    //res.end('docs output:'+docs);
});


function getDocs(res) {
 
    var str ='';
    var lastDocId = 0;
    // read lastDocID from database
    
    // get documents
    console.log('getting documents');
    
    var options = {
        host: 'mseapimgt.azure-api.net',
        port: 443,
        path: '/mse/documents',
        headers: {'Ocp-Apim-Subscription-Key': '3ef9e13f1cae4dad9086feef67ded274', 'Content-Type': 'application/json'},
        accept: '*/*'
    };
    
    callback = function(response) {    
        console.log('getting documents callback');

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });
    
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
            res.end(str);

            // push new documents to event hub
            lastDocId = push2EventHub(str, lastDocId);

            // save last docID
            console.log('lastDocId='+lastDocId);

        });
        
    }
    
    httpDoc.request(options, callback).end();
    
    
    

    // parse and return JSON object
    return str;
};

function push2EventHub(docsIn, lastDocId) {
    var jDocs = JSON.parse(docsIn);
    var docs = jDocs.documents;
    
    for(var i = 0; i < docs.length; i++) {
        var obj = docs[i];
    
        console.log(obj.id);
        callEventHub2(obj);
    }    
    
    return lastDocId;
}


function createToken() {
    
    
    // Full Event Hub publisher URI
    var my_uri = 'https://' + namespace + '.servicebus.windows.net' + '/' + hubname + '/publishers/' + devicename + '/messages';
    
    // Create a SAS token
    // See http://msdn.microsoft.com/library/azure/dn170477.aspx
    
    function create_sas_token(uri, key_name, key)
    {
        // Token expires in 24 hours
        var expiry = Math.floor(new Date().getTime()/1000+3600*24);
    
        var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;
        var hmac = crypto.createHmac('sha256', key);
        hmac.update(string_to_sign);
        var signature = hmac.digest('base64');
        var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + key_name;
    
        return token;
    }
    
    my_sas = create_sas_token(my_uri, my_key_name, my_key);
    
    console.log(my_sas);
        
}


function callEventHub2(doc) {
    
    var payload = JSON.stringify(doc);
    var my_sas = "";
    
    var options = {
        hostname: namespace + '.servicebus.windows.net',
        port: 443,
        path: '/' + hubname + '/publishers/' + devicename + '/messages',
        method: 'POST',
        headers: {
            'Authorization': my_sas,
            'Content-Length': payload.length,
            'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
        }
    };
    
    var req = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);
    
    res.on('data', function(d) {
            process.stdout.write(d);
        });
    });
    
    req.on('error', function(e) {
        console.error(e);
    });
    
    req.write(payload);
    req.end();
    
}


function callEventHub(doc) {
    
    var str = '';
    
    var options = {
        url: 'https://mse-demo.servicebus.windows.net/msehub/publishers/test/messages',
        //host: 'mse-demo.servicebus.windows.net',
        //port: 443,
        method: "POST",
        //path: '/msehub/publishers/test/messages',
        headers: {'Content-Type':'application/json', 'Authorization':'SharedAccessSignature sr=https%3a%2f%2fmse-demo.servicebus.windows.net%2fmsehub%2fpublishers%2ftest%2fmessages&sig=ZNFl4%2bxvNeRHfK%2bntyeXiLt84ylJWGDdOMW3hpRGvn4%3d&se=2050213276&skn=sending'},
        json: doc,
        accept: '*/*'
    };
    
    callback = function(response) {    
        console.log('push to eventhub: '+doc.id);
        console.log("statusCode: ", response.statusCode);

        /*
        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });
        
        response.on('error', function(err) {
            console.log(err);
        });        
    
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
        });
        */
        
    }
    
    function callback2(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('status 200');  
        }
        if (!error && response.statusCode == 201) {
            console.log('status 201');  
        }
        if (!error) {
            //var info = JSON.parse(JSON.stringify(body));
            //console.log(info);
            console.log(body);
        }
        else {
            console.log('Error happened: '+ error);
        }
    }
    
    request(options, callback2);
    
}	

dispatcher.onPost("/page2", function(req, res) {
    console.log('Page Two');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page Two');
});

/*
dispatcher.beforeFilter(/\//, function(req, res, chain) { //any url
    console.log("Before filter");
    chain.next(req, res, chain);
});

dispatcher.afterFilter(/\//, function(req, res) { //any url
    console.log("After filter");
    chain.next(req, res, chain);
});
*/

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
