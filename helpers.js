var crypto = require('crypto');
var https = require('https');

module.exports = {
    
    unflatten: function(data) {
        "use strict";
        if (Object(data) !== data || Array.isArray(data))
            return data;
        var result = {}, cur, prop, idx, last, temp;
        for(var p in data) {
            cur = result, prop = "", last = 0;
            do {
                idx = p.indexOf(".", last);
                temp = p.substring(last, idx !== -1 ? idx : undefined);
                cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp)) ? [] : {}));
                prop = temp;
                last = idx + 1;
            } while(idx >= 0);
            cur[prop] = data[p];
        }
        return result[""];
    },
    
    flatten: function(data) {
        var result = {};
        function recurse (cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            } else if (Array.isArray(cur)) {
                for(var i=0, l=cur.length; i<l; i++)
                    recurse(cur[i], prop ? prop+"."+i : ""+i);
                if (l == 0)
                    result[prop] = [];
            } else {
                var isEmpty = true;
                for (var p in cur) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop+"."+p : p);
                }
                if (isEmpty)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    },
   
    createEventHubSASToken: function (namespace, hubname, devicename, hours, my_key_name, my_key) {
    
        // Full Event Hub publisher URI
        var my_uri = 'https://' + namespace + '.servicebus.windows.net' + '/' + hubname + '/publishers/' + devicename + '/messages';
        
        // Create a SAS token
        // See http://msdn.microsoft.com/library/azure/dn170477.aspx
        function createSASToken(uri, key_name, key) {
            // Token expires in 24 hours
            var expiry = Math.floor(new Date().getTime()/3600*24);
        
            var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;
            var hmac = crypto.createHmac('sha256', key);
            hmac.update(string_to_sign);
            var signature = hmac.digest('base64');
            var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + key_name;
        
            return token;
        };
       
        var my_sas = createSASToken(my_uri, my_key_name, my_key);
        //console.log(my_sas);
        
        return my_sas;     
    },
       
    push2EventHub: function (payload, namespace, hubname, devicename, my_sas, counter) {
       
        console.log("push to eventhub");
        console.log("namespace:"+namespace+", hubname:"+hubname+", devicename:"+devicename+", my_sas:"+my_sas);
        console.log("payload length:"+payload.length);
        
        var options = {
            hostname: namespace + '.servicebus.windows.net',
            port: 443,
            path: '/' + hubname + '/publishers/' + devicename + '/messages',
            method: 'POST',
            headers: {
                'Authorization': my_sas,
                'Content-Length': payload.length,
                //'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
                'Content-Type': 'application/json'
            }
        };
        
        var req = https.request(options, function(res) {
            console.log("counter: "+counter+", statusCode: ", res.statusCode);
            //console.log("headers: ", res.headers);
        
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

};



