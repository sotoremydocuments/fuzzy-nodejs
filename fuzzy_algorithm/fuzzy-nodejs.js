/*
    node-java: https://www.npmjs.com/package/java
    Fuzzylite: http://www.fuzzylite.com/. It provides jfuzzylite.jar
*/
var java = require('java');
var fs = require('fs');
java.classpath.push('commons-lang3-3.1.jar');
java.classpath.push('commons-io.jar');
java.classpath.push('jfuzzylite.jar');

var TRACEBACK_STEP = 6;
function  movingAverage( value, valueArr, averageArr,  step) {
    var array_size = TRACEBACK_STEP;
    var i;
    var temp = 0;
    if (step == 0) {
        valueArr[0] = value;
        averageArr[0] = value;
    } else {
        //
        if (step < array_size) {
            valueArr[step] = value;
            temp = averageArr[step - 1] + (value - averageArr[step - 1]) / (step + 1);
            averageArr[step] = temp;
        } else {
            temp = averageArr[array_size - 1] + (value - averageArr[array_size - 1]) / (step + 1);
            for (i = 0; i < array_size - 1; i++) {
                valueArr[i] = valueArr[i + 1];
                averageArr[i] = averageArr[i + 1];
            }
                valueArr[i] = value;
                averageArr[i] = temp;
        }
    }

    return temp;
}

/*
* length of these arrays below must equal, and it must not exceed
* TRACEBACK_STEP
*/
function fuzzficationInput( value,  average, step) {
    // fuzzification variables
    var array_size = TRACEBACK_STEP;
    var temp;
    var i;
    var fraction = 1;
    var maxDiff = -100000;
    var minDiff = 100000;
    var sumArr = 0;
    var endElement = 0;
    if (step < array_size) {
        for (i = 0; i < step; i++) {
            temp = Math.abs(value[i] - average[i]);
            sumArr += temp;
            if (temp > maxDiff) {
                maxDiff = temp;
            }
            if (temp < minDiff && temp != 0) {
                minDiff = temp;
            }
        }
        endElement = value[i - 1] - average[i - 1];
        fraction = 1.0 / step;
    } else {
        for (i = 0; i < array_size; i++) {
            temp = Math.abs(value[i] - average[i]);
            sumArr += temp;
            if (temp > maxDiff) {
                maxDiff = temp;
            }
            if (temp < minDiff) {
                minDiff = temp;
            }
        }
    endElement = value[i - 1] - average[i - 1];
    fraction = 1.0 / array_size;
    }

    var outputFuzzy = fraction * (1 / endElement) * sumArr * (minDiff / maxDiff);
    var outputFuzzyPredt = fraction * sumArr * (minDiff / maxDiff);
    var returnArr =[outputFuzzy, outputFuzzyPredt];

    return returnArr;
}

var bandwidthInputVariable;
var timeInputVariable;
var engineMatlab

function initiate_fuzzy(){
    var matlabString = fs.readFileSync('membership_function_pn.fis', 'utf8');
    var FisImporter = java.newInstanceSync('com.fuzzylite.imex.FisImporter');
    engineMatlab = java.callMethodSync(FisImporter, 'fromString', matlabString);
    var InputVariable = java.newInstanceSync('com.fuzzylite.imex.FisImporter');

    // get fuzzy variables input and output
    OutputVariable = java.callMethodSync(engineMatlab, 'getOutputVariable', 0);
    bandwidthInputVariable = java.callMethodSync(engineMatlab, 'getInputVariable', 0);
    timeInputVariable = java.callMethodSync(engineMatlab, 'getInputVariable', 1);
}

// algorithm implementation
var timeValue, bandwidthValue;
var bandArr = [];
var bandArrAverage = [];
var timeArr = [];
var timeArrAverage = [];
var step = 0;
var timePredict;
var bandPredict;
var timeAverage;
var bandAverage;

function initiate_seassion(){
    timeValue = 6.6135;
    bandwidthValue = 847.44;
    timeAverage = movingAverage(timeValue, timeArr, timeArrAverage, step);
    bandAverage = movingAverage(bandwidthValue, bandArr, bandArrAverage, step);
    step = 1;
}

function fuzzy_algorithm(timeValue, bandwidthValue) {
    timeAverage = movingAverage(timeValue, timeArr, timeArrAverage, step);
    bandAverage = movingAverage(bandwidthValue, bandArr, bandArrAverage, step);
    step += 1;
    var fuzzyTime = fuzzficationInput(timeArr, timeArrAverage, step);
    var fuzzyBandw = fuzzficationInput(bandArr, bandArrAverage, step);

    java.callMethodSync(bandwidthInputVariable, 'setInputValue', fuzzyBandw[0]);//
    java.callMethodSync(timeInputVariable, 'setInputValue', fuzzyTime[0]);//
    java.callMethodSync(engineMatlab, 'process');//
    var fuzzyOut = java.callMethodSync(OutputVariable, 'getOutputValue');//

    bandPredict = bandAverage + fuzzyBandw[1] * fuzzyOut;
    timePredict = timeAverage + fuzzyTime[1] * fuzzyOut;
    console.log(bandPredict + ", " + timePredict);
}


module.exports.fuzzyAlgorithm = fuzzy_algorithm;
module.exports.initiateSeassion = initiate_seassion;
module.exports.initiateFuzzy = initiate_fuzzy;
