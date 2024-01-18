// https://www.osar.fr/notes/waveguides/

sampleRate=44100,this.generatorFunction=t?this.generatorFunction:(function(){

var delayArray; //it's a circular buffer, it goes from the start to the end, and loops back. it takes the delayed sample, multiplies it by the feedback, adds the exciter, and then puts it back into the array (and outputs it too). it increments the delay pointer too.
var delayPointer = 0;
var exciterLowpass = [0,0]; //rotates at the exciter cutoff frequency, it goes right before the sample is mixed with the delay array. it is an x-y pair, it rotates left, and input is added to the x part, output is taken out of the y part. it rotates and decays at the same time.
var loopLowpass = [0,0]; //same as before, except placed right before the sample is pushed back to the array.
var delayInMs = 5;
var exciterCutoff = 2000;//hz
var loopCutoff = 1200;//hz


return function(time, sampleRate) {
    if (typeof delayArray == "undefined") delayArray = new Array(floor(sampleRate/1000 * delayInMs)).fill(0);
    function mix(a, b, pos) {
        return a*(1-pos) + b*pos
    };
    function rotate(point, rotationsPerSecond) {
        var angle = 2*PI*rotationsPerSecond/sampleRate;
        return [
            cos(angle)*point[0] - sin(angle)*point[1],
            sin(angle)*point[0] + cos(angle)*point[1]
        ];
    }
    function scale(point, scaleBy) {
        return [point[0]*scaleBy, point[1]*scaleBy];
    }

    var t = time%0.5;
    var sample = t<0.01?Math.random()*(1-(t%0.01)*100):0;
    sample *= 0.3;
    exciterLowpass = [exciterLowpass[0]+sample,exciterLowpass[1]];
    exciterLowpass = rotate(exciterLowpass, exciterCutoff);
    exciterLowpass = scale(exciterLowpass, 0.9);
    sample = exciterLowpass[1];
    
    sample += tanh(delayArray[delayPointer]*
        (time%4<2?0.9:-0.9)  // feedback switches between positive and negative
    );
    
    loopLowpass=[loopLowpass[0]+sample,loopLowpass[1]];
    loopLowpass = rotate(loopLowpass, loopCutoff);
    loopLowpass = scale(loopLowpass, 0.7);
    sample = loopLowpass[1];
    
    delayArray[delayPointer] = sample;
    delayPointer = ++delayPointer%delayArray.length;
    return sample;
}

})(),this.generatorFunction(t/sampleRate,sampleRate);