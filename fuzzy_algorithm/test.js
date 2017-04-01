var fs = require("fs");
var java = require("java");
java.classpath.push("commons-lang3-3.1.jar");
java.classpath.push("commons-io.jar");
java.classpath.push("jfuzzylite.jar");

var FileReader = java.newInstanceSync("java.io.FileReader", "inputTime.txt");
var timeReader = java.newInstanceSync('java.io.BufferedReader', FileReader);
    FileReader = java.newInstanceSync("java.io.FileReader", "inputBandwidth.txt");
var bandwidthReader = java.newInstanceSync('java.io.BufferedReader', FileReader);

var fuzzyAl = require('./fuzzy-nodejs.js');
fuzzyAl.initiateSeassion();
fuzzyAl.initiateFuzzy();

timeValue = java.callMethodSync(timeReader, "readLine");
bandwidthValue = java.callMethodSync(bandwidthReader, "readLine");

while(true){
    timeValue = java.callMethodSync(timeReader, "readLine");
    bandwidthValue = java.callMethodSync(bandwidthReader, "readLine");
    if (timeValue == null || bandwidthValue == null) {
        break;
    }
    fuzzyAl.fuzzyAlgorithm(parseFloat(timeValue), parseFloat(bandwidthValue));
}
java.callMethodSync(timeReader, "close");
java.callMethodSync(bandwidthReader, "close");
