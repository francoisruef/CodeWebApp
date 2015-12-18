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

var MODE_TEST = 1
var MODE_PROD = 2
var MODE = MODE_PROD;

var lastDocId = 0;
var NUM_DOCS = 100;

// test parameters
//var MODE = MODE_TEST;
var OBJ_ID = "20";

var port = process.env.PORT || 1337;

// test payload

TEST_PAYLOAD = 
{
  "@class": "TwitterDocument",
  "id": "10",
  "type": "POST",
  "uri": "http://twitter.com/abdulashid7763/statuses/677170029268443136",
  "publicationDate": "2015-12-16T16:54:50.000+0000",
  "acquisitionDate": "2015-12-16T16:55:04.940+0000",
  "modificationDate": 1450284905252,
  "publisher.id": "72613361",
  "publisher.name": "myName",
  "publisher.profileIcon": "https://pbs.twimg.com/profile_images/630545727329038336/QsB37J7V_normal.jpg",
  "publisher.channel.id": "18",
  "publisher.channel.name": "Microblogs",
  "publisher.channel.param": "Twitter",
  "publisher.screenName": "abdulashid7763",
  "publisher.displayName": "عبد الله رشيد",
  "publisher.externalId": "3411529743",
  "channel.id": "18",
  "channel.name": "Microblogs",
  "channel.param": "Twitter",
  "language.name": "Arabic",
  "language.code": "ar",
  "abstractText": "فيديوجستنية لقناة 24 الرياضية :سقوط محمد نور بـ المنشطات مكيدة دُبرت له بكاس شاهي <a href=\"https://t.co/4Rum8uIeeP\" target=\"_blank\">https://t.co/4Rum8uIeeP</a> … <a href=\"https://twitter.com/search?q=%23ksa&src=hash\" target=\"_blank\">#ksa</a> <a href=\"https://twitter.com/search?q=%23%D9%85%D9%83%D8%A9&src=hash\" target=\"_blank\">#مكة</a> <a href=\"https://twitter.com/search?q=%23%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9&src=hash\" target=\"_blank\">#المدينة</a> <a href=\"https://twitter.com/search?q=%23%D8%A7%D8%A8%D9%87%D8%A7&src=hash\" target=\"_blank\">#ابها</a> <a href=\"https://twitter.com/search?q=%23%D8%A7%D9%84%D8%AF%D9%85%D8%A7%D9%85&src=hash\" target=\"_blank\">#الدمام</a>",
  "score.normalScore": 2,
  "score.providerScore": 12,
  "score.provider": "KLOUT",
  "comments": 0,
  "externalId": "677170029268443136",
  "tags": "undefined",
  "assignedTo": "undefined",
  "hasEngagementHistory": false,
  "fullContentLength": 140,
  "searchItems.0": 116012,
  "twitterId": "677170029268443136",
  "retweet": false,
  "documentPlaceholder": false
  
};

PAYLOAD_STRUCTURE = 
{
  "@class": "TwitterDocument",
  "id": "10",
  "type": "POST",
  "uri": "http://twitter.com/abdulashid7763/statuses/677170029268443136",
  "publicationDate": "2015-12-16T16:54:50.000+0000",
  "acquisitionDate": "2015-12-16T16:55:04.940+0000",
  "modificationDate": 1450284905252,
  "publisher.id": "72613361",
  //"publisher.name": "myName",
  "publisher.profileIcon": "https://pbs.twimg.com/profile_images/630545727329038336/QsB37J7V_normal.jpg",
  "publisher.channel.id": "18",
  "publisher.channel.name": "Microblogs",
  "publisher.channel.param": "Twitter",
  //"publisher.screenName": "abdulashid7763",
  //"publisher.displayName": "عبد الله رشيد",
  "publisher.externalId": "3411529743",
  "channel.id": "18",
  "channel.name": "Microblogs",
  "channel.param": "Twitter",
  "language.name": "Arabic",
  "language.code": "ar",
  //"abstractText": "فيديوجستنية لقناة 24 الرياضية :سقوط محمد نور بـ المنشطات مكيدة دُبرت له بكاس شاهي <a href=\"https://t.co/4Rum8uIeeP\" target=\"_blank\">https://t.co/4Rum8uIeeP</a> … <a href=\"https://twitter.com/search?q=%23ksa&src=hash\" target=\"_blank\">#ksa</a> <a href=\"https://twitter.com/search?q=%23%D9%85%D9%83%D8%A9&src=hash\" target=\"_blank\">#مكة</a> <a href=\"https://twitter.com/search?q=%23%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9&src=hash\" target=\"_blank\">#المدينة</a> <a href=\"https://twitter.com/search?q=%23%D8%A7%D8%A8%D9%87%D8%A7&src=hash\" target=\"_blank\">#ابها</a> <a href=\"https://twitter.com/search?q=%23%D8%A7%D9%84%D8%AF%D9%85%D8%A7%D9%85&src=hash\" target=\"_blank\">#الدمام</a>",
  "score.normalScore": 2,
  "score.providerScore": 12,
  "score.provider": "KLOUT",
  //"comments": 0,
  "externalId": "677170029268443136",
  "tags": "undefined",
  "assignedTo": "undefined",
  "hasEngagementHistory": false,
  "fullContentLength": 140,
  "searchItems.0": 116012,
  "twitterId": "677170029268443136",
  "retweet": false,
  "documentPlaceholder": false,
  "sentiment.curated": false,
  "sentiment.polarity": "neutral",
  "embeddedMedia": "http://www.youtube.com/embed/BqnpUlWCVKw",  
};


my_sas = helpers.createEventHubSASToken(namespace, hubname, devicename, 1000*24, my_key_name, my_key);
console.log("my_sas:"+my_sas);

dispatcher.setStatic('resources');

http.createServer(handleRequest).listen(port);

// get latest doc
processDocs(true);


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
    
    var re = processDocs(false);
    
    console.log('/docs');
    res.end('/docs');
});


function processDocs(init) {
 
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
            push2EventHub(str, init);
            //console.log(str);            

        });
        
    }
    
    httpDoc.request(options, callback).end();
    
};

function push2EventHub(docsIn, init) {
    var jDocs = JSON.parse(docsIn);
    var docs = jDocs.documents;
    
    var processed = 0;
    var docId = 0;
    var maxDocId = 0;
    
    for(var i = 0; i < docs.length && i<NUM_DOCS; i++) {
        var obj = docs[i];
        
        docId = parseInt(obj.id);
        console.log("docId:"+docId);
        
        if (docId>lastDocId) {
            console.log("RAW:"+JSON.stringify(helpers.flatten(obj), null, "\t"));
            var payload = '';
                    
            if (MODE == MODE_TEST) {
                TEST_PAYLOAD.id = OBJ_ID;
                payload = helpers.flatten(TEST_PAYLOAD);
                payload = helpers.preprocessPayload(PAYLOAD_STRUCTURE, payload);
                payload = JSON.stringify(payload);
            } else {
                payload = helpers.flatten(obj);
                payload = helpers.preprocessPayload(PAYLOAD_STRUCTURE, payload);
                payload = JSON.stringify(payload);
            }
                
            console.log("payload:"+payload);
            
            if (!init) {
                helpers.push2EventHub(payload, namespace, hubname, devicename, my_sas, i);
            }
            processed = processed+1;
            
            
            if (docId > maxDocId) {
                maxDocId = docId;
            }
            console.log("maxDocId:"+maxDocId);
            console.log("processing payload :"+i);
        } else {
            console.log("document already processed");
        }
         
    }
    
    if (maxDocId > lastDocId) {
        lastDocId = maxDocId;    
    }
    
    // save last docID
    console.log('lastDocId='+lastDocId);
   
    return {"lastDocId": lastDocId, "processed": processed};
}



dispatcher.onPost("/page2", function(req, res) {
    console.log('Page Two');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page Two');
});

dispatcher.onError(function(req, res) {
    res.writeHead(404);
});