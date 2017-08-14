 
 /**
  * @author: m*******, p*******, r*******
  * @author_url: fh-burgenland.at
  * @Description: This code is part of the MCCE Essay "Security analysis of a 
  * Cloud Voice Service of a Smart Connected Product Solution" and represent 
  * a Alexa Skill based on Javascript. 
  * This Alexa Skill connects to a Webservice (hosted by Umweltbundesamt GmbH)
  * which provides the ozone concentration at 1010 Vienna, Stephansplatz. 
  * After parsing the JSON based result of the Webservice, the code generates
  * the speechtext for the Alexa Voice Service. In case of an exception, the 
  * code informs the user about it.
  * 
  * The URL of Umweltbundesamt is:
  * https://luft.umweltbundesamt.at/pub/ozonbericht/aktuell.json
  * 
  * Suggestion for improvement:
  * The IDs of the ozone measuing points are named after places or streets 
  * which makes it difficult for an user to name them correctly. However, 
  * the code can be adapted by using a key/value dictionary 
  * where the key is the name of the city or the state. 
  * Keep in mind, that some measuring points are not stationary but mobile.
  */
  
 /**
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *  
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  * You should have received a copy of the GNU General Public License
  * along with this program.
  */
 
 /**
  * AWS Lambda is a compute service that lets you run code without 
  * provisioning or managing servers. AWS Lambda executes your code only 
  * when needed and scales automatically, from a few requests per day to 
  * thousands per second.
  * At the time you create a Lambda function you specify a handler, 
  * a function in your code, that AWS Lambda can invoke when the 
  * service executes your code.
  * 
  * exports.handler:
  * handler - This name must match with the Handler name in the Configuration 
  *           section.
  * 
  * Paramters:
  * event – AWS Lambda uses this parameter to pass in event data to the handler.
  * context – AWS Lambda uses this parameter to provide your handler the 
  *           runtime information of the Lambda function that is executing.
  * callback – You can use the optional callback to return information 
  *            to the caller, otherwise return value is null.
  */
/////////////////////////////////////////
// Uncomment the following line 
// if you want to run script in netbeans
/////////////////////////////////////////
exports.handler = function( event, context ) {
/////////////////////////////////////////
    // to use the https client
    var http = require( 'https' );
 
    // the webserivce url we want
    var url = 'https://luft.umweltbundesamt.at/pub/ozonbericht/aktuell.json';

    // our http request in detail
    // first, send a request to url
    // second, response returns  
    http.get( url, function( response ) {
        
        // our buffer
        var data = '';
        
        // another chunk of data has been received, just append it to our buffer
        // remember: chunk is a bufferstream
        response.on( 'data', function( chunk ) { data += chunk ; } );

        // the whole response has been received
        response.on( 'end', function() {
            
            // remove spaces and invalid elements of the JSON
            // as Umweltbundesamt uses an invalid JSON format
            data.trim();
            data = data.substring(14, data.length - 5 );
            // we print everything to cloudwatch (amazon's logging console)
            console.log (data.toString() );
            
            // prepare speechtext
            var text = '';
            
            try {
                // parse the json-formatted data
                var json     = JSON.parse( data );

                var i = json.length - 1;
                var found = false;
                
                // we are searching for the id of Stefansplatz 09:STEF
                // as content changes constantly.
                //
                // other id's are :
                // Illmitz = 10:ILL1
                // St. Georgen im Lavanttal = 02:WO35
                // Wolfsberg Hauptschule = 02:WO15
                // consult json file if you need more id's
                while ( (! found) && (i >= 0) )
                {
                    id = json[i].id;
                    if ( id == '09:STEF') {
                        found = true;
                    } else {
                        i--;
                    }
                }

                // Extract name, timestamp and ozon1h             
                var name = json[i].name;
                var timestamp = json[i].ozon1hTimestamp_utc;
                var ozon1h = json[i].ozon1h;
            
                // prepare speech output
                text += "This is the most recent update of the " ;
                text += "ground-level ozone concentration at " + name;
                text += " from ";
                text += timestamp;
                text += ". The ozone concentration of the last hour is ";
                text += ozon1h + " micrograms per cubic meter of air. ";

                // there are three levels of ozonze concentration
                switch (true) {
                    case (ozon1h < 150):
                        text += "The ozone concentration is very low. " 
                        text += "No danger to human health exists.";
                    break;
                    case (ozon1h >= 150 && ozon1h < 240):
                        text += "The ozone concentration is medium. " 
                        text += "Ozone can cause damage to human health.";
                    break;
                    case (ozon1h > 240):
                        text += "The ozone concentration is very high. " 
                        text += "Danger to human health exists.";
                        text += "Please consult your doctor or pharmacist ";
                        text += "for more information.";
                        text += "Additionally, please consult the website of ";
                        text += "Federal Environment Agency for more details.";
                    break;
                    default:
                        text += "The measured value seems to be wrong or ";
                        text += "not available. Please consult the website of ";
                        text += "Federal Environment Agency for more information.";
                    break;
                }

                // log to cloudwatch
                console.log ( text );
            
                // speech and card output
                /////////////////////////////////////////
                // Uncomment the following line 
                // if you want to run script in netbeans
                /////////////////////////////////////////
                output( text, context );
                /////////////////////////////////////////
            } catch (err) {
                
                // Arrgh, something went wrong in the try-block .
                // Luckily, we log the error to cloudwatch
                console.log ( err.toString() );

                // inform the user                
                text += "Something went wrong while processing the data. ";
                text += "Please try again later.";
                
                // speech and card output
                /////////////////////////////////////////
                // Uncomment the following line 
                // if you want to run script in netbeans
                /////////////////////////////////////////
                output( text, context );
                /////////////////////////////////////////
                console.log ( text );
            } // end catch        
        } ); // end response
    } ); // end http.get

/////////////////////////////////////////
// Uncomment the following line 
// if you want to run script in netbeans
/////////////////////////////////////////
}; // end handler
/////////////////////////////////////////

/*
 * @file: speech and text output 
 * @author: marx, pellegrini, rottmann
 * @author_url: fh-burgenland.at 
 * @description: Speech output and card logging (Alexa App)
 * 
 * Paramters:
 * text – Contains the text vor alexa voice service.
 * context – AWS Lambda uses this parameter to provide runtime information
 */
/////////////////////////////////////////
// Uncomment the following function 
// if you want to run script in netbeans
/////////////////////////////////////////
function output( text, context ) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        card: {
            type: "Simple",
            title: "JService.io",
            content: text
        },
        shouldEndSession: true
    }; // end response
    
    // send our response to avs
    context.succeed( { response: response } );    
} // end output
/////////////////////////////////////////
