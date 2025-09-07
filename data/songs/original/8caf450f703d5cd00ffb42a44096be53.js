BPM = 120,
A = 440,
T = t/180*BPM,
scale = [0,3,5,7,10], // minor pentatonic
t || (
    fx = Array(3e6).fill(0) // this array stores memory for the effects
),

fxi = 0, // iterates over the fx array
// replace all "(inp%256)"s with "inp" if you're using floatbeat
lp = (inp,w) => { // lowpass function (w - strength of effect (min: 0, max: 1))
    fx[fxi] += ((inp%256) - fx[fxi++]) * w
    return fx[fxi-1]
},

env = (a,r,t) => ( // attack, release, time
    a_ = min(1,t/a),
    r_ = 1-(t-a)/r,
    max(0,(t>a?r_:a_))
),

s = n => t/375*A*(2**(n/12))%256-128,
f = x => lp(s(scale[x%scale.length]+12*int(x/scale.length)-12),1/(1+(T%((2**20)/x)/100))),
X = [...Array(20).keys()].map(x=>f(x)).reduce((a,b)=>a+b,0)/5,
sdchn = min(1,T/8192%2),
kick = tanh(sin(cbrt(T%16384)*5))*64*(T/16384%1-1)*!(T&16384),
hihat = (random()-.5)*30*(T/8192%1-1)**10,
snare = cbrt(sin(cbrt(T%16384)*8)*max(0,1-T%16384/2e3)+lp(random()-.5,(1-T%16384/16384)/3)*(max(0,1-T%16384/2e3)+env(2000,4e3,(T-1e3)%16384)))*64*(T/16384%1-1)**5*!!(T&16384),
bas = (lp(t/375*A*(2**(scale[T>>16&3]/12))/8&64,1-T%16384/16384)-32)*(T/16384%1-1),

(X+bas)*sdchn+kick+hihat+snare