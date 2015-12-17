var http = require('http');
var dispatcher = require('./node_modules/httpdispatcher');
var httpDoc = require('https');
var request = require('request');
var https = require('https');

var helpers = require('./helpers');

//EventHub
var namespace = 'mse-demo';
var hubname = 'msehub';
var devicename ='test';
var my_sas = '';
// Shared access key (from Event Hub configuration)
var my_key_name = 'sending';
var my_key = '33Y/Hxudb4SN5DB0mLLD1VrrJj2PLfTxVmiEH+tBy3Q=';

var numDocs = 10;
var lastDocId = 0;

var port = process.env.PORT || 1337;

my_sas = helpers.createEventHubSASToken(namespace, hubname, devicename, 1000*24, my_key_name, my_key);
console.log("my_sas:"+my_sas);

dispatcher.setStatic('resources');

http.createServer(handleRequest).listen(port);


function handleRequest(req, res) {
    console.log('Got request for ' + req.url);
    dispatcher.dispatch(req, res);
}

dispatcher.onGet("/ping", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    console.log('Ping');
    res.end('Ping');
});	

dispatcher.onGet("/docs", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    console.log('/docs');
    //res.end('Page One');
    
    var docs = processDocs(helpers.push2EventHub);
    
    console.log('docs = '+docs);
    //res.end('docs output:'+docs);
});


function processDocs() {
 
    // read lastDocID from database
    // not implemented yet
    
    // get documents
    console.log('getting documents');
    
    var options = {
        host: 'mseapimgt.azure-api.net',
        port: 443,
        path: '/mse/documents',
        headers: {'Ocp-Apim-Subscription-Key': '3ef9e13f1cae4dad9086feef67ded274', 'Content-Type': 'application/json; charset=utf-8'},
        accept: '*/*'
    };
    
    var str ='';
    callback = function(response) {    
        console.log('getting documents callback');
        console.log("statusCode: ", response.statusCode);

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });
    
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {

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
    
    for(var i = 0; i < docs.length && i<numDocs; i++) {
        var obj = docs[i];
    
        console.log(obj.id);
        var payload = '';
        
        //var payload = JSON.stringify(doc);
        /*
        var payloadRaw = { 
                "id":obj.id,
                "publicationDate": obj.publicationDate,
                "channel": obj.channel.name,
                "languageCode": obj.language.code,
                "languageName": obj.language.name,
                //"score":obj.score.normalScore
        };
        payload = JSON.stringify(payloadRaw);
        */
        
        payload = JSON.stringify(helpers.flatten(obj));
        
        console.log("payload:"+payload);
        
        helpers.push2EventHub(payload, namespace, hubname, devicename, my_sas);
        
        var docId = parseInt(obj.id);
        if (docId > lastDocId) {
            docId = docId;
        }
        console.log("lastDocId:"+lastDocId);
        
    }    
    
    return lastDocId;
}



dispatcher.onPost("/page2", function(req, res) {
    console.log('Page Two');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page Two');
});

dispatcher.onError(function(req, res) {
    res.writeHead(404);
});