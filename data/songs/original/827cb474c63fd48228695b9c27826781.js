// Title - Some Arcade Game Music (High cut filter version)
// 
// Author - Pentalogue Tridecalogue
//
// Song creation date — 9-th December 2025
//
// Song publication date — 26-rd December 2025
//
// Main key — B minor (h moll)

pST = 0,
hz = 432,
bpm = 150,
sr = 48000,

kv = 1,
siv1 = 1,
sav1 = 1, 
sav2 = 1, 

D=(x)=>{return x/(x**2+1)**0.5},mST1=[0,0,3,0,5,0,6,7,0,0,3,0,5,0,6,7,0,0,3,0,5,0,6,7,0,12,11,10,9,8,7,6,5,5,8,5,10,5,11,12,5,5,8,5,10,5,11,12,0,0,3,0,5,0,6,7,0,12,7,3,5,3,-2,-1,0,0,3,0,5,0,6,7,0,0,3,0,5,0,6,7,0,0,3,0,5,0,6,7,0,7,12,15,3,4,5,6,7,7,10,7,14,7,10,7,5,5,8,11,12,8,12,5,0,0,3,0,5,0,6,7,2,2,7,2,-2,7,-1,7][floor(2*bpm/60*t/sr)%128],mST2=[0,7,12,0,7,12,0,7,12,0,7,12,0,7,12,7,0,7,12,0,7,12,0,7,12,0,7,12,0,7,12,15,0,5,12,0,5,12,0,5,12,0,5,12,0,5,12,6,0,7,12,0,7,12,0,7,12,0,7,12,0,7,12,15,0,7,12,0,7,12,0,7,12,0,7,12,0,7,12,7,0,7,12,0,7,12,0,7,12,0,7,12,0,7,12,7,2,7,14,2,7,14,2,10,0,5,12,0,5,12,0,6,0,7,12,0,7,12,0,6,7,2,7,14,8,3,11,2][floor(2*bpm/60*t/sr)%128],mST3=[7,3,12,7,5,3,6,7,3,0,12,7,8,7,6,7,0,3,7,12,5,12,6,7,3,7,9,7,10,3,11,6,12,8,17,12,10,8,11,12,8,5,17,12,13,12,11,12,0,3,7,12,5,12,6,7,3,7,9,7,10,3,11,6,7,3,12,7,5,3,6,7,3,0,12,7,8,7,6,7,0,3,7,12,5,12,6,7,3,7,9,7,10,3,11,12,2,10,7,14,15,14,10,7,12,8,5,12,14,15,17,14,12,3,7,12,5,12,6,7,7,2,8,7,10,3,11,2][floor(2*bpm/60*t/sr)%128],mST4=[0,0,-2,0,0,-5,-2,0,3,-5,-2,0,0,-2,0,3,7,7,7,7,7,5,3,0,3,0,-2,0,0,-5,0,3,0,0,-2,0,0,-4,-2,0,3,-4,-2,0,0,-2,3,5,7,7,7,7,7,5,3,0,3,0,-2,0,0,-5,0,3,0,0,-2,0,0,-5,-2,0,3,-5,-2,0,0,-2,0,3,7,7,7,7,7,5,3,0,3,0,-2,0,0,-2,0,3,2,2,7,2,2,-2,3,2,3,-4,-2,0,0,2,3,5,7,7,7,7,7,5,3,0,2,-2,7,2,2,3,-1,2][floor(2*bpm/60*t/sr)%128],bsl=(t)%(60/bpm*sr),k=sin(150*(bsl)**0.1),rl=(1-((t/sr*bpm/60*2)%1)**4)*([1,0][floor(t/sr*bpm/60*2)%2]),sc=1-(1-((t/sr*bpm/60)%1))**2,si1=sin(2*PI*hz/2**4*t/sr*2**((mST1+pST+2)/12)),si2=sin(2*PI*hz/2**3*t/sr*2**((mST1+pST+2)/12)),sa1=(1-2*((hz/2**4*t/sr*2**((mST1+pST+2)/12))%1)),sa2=(1-2*((hz/2**3*t/sr*2**((mST1+pST+2-5/100)/12))%1)),sa3=(1-2*((hz/2**3*t/sr*2**((mST1+pST+2+5/100)/12))%1)),sa4=(1-2*((hz/2**3*t/sr*2**((mST1+pST+2)/12))%1)),sa5=(1-2*((hz/2**2*t/sr*2**((mST2+pST+2)/12))%1)),sa6=(1-2*((hz/2**1*t/sr*2**((mST2+pST+2)/12))%1)),

cutoffFreq = 500*2**(3-3*((t/sr*bpm/60*2*2)%1)),
filterOrder = 3,
resonance = (0.5**0.5)*3**([0,1][floor(t/sr*bpm/60/2*2)%2]),

signalWithoutK = 1.5*((si1/6+D(si2)/18)*siv1+(sa1/15+sa2/35+sa3/35+sa4/20)*sav1+(sa5/25+sa6/25)*sav2)*(1+kv*sc-kv),

(t==0) && (() => {
    window.filterStates1 = [];
    window.filterStates2 = [];
})(),

currentOrder = floor(typeof filterOrder === 'function' ? filterOrder() : filterOrder),
(currentOrder != window.prevOrder) && (() => {
    window.filterStates1 = [];
    window.filterStates2 = [];
    window.prevOrder = currentOrder;
})(),

currentCutoff = typeof cutoffFreq === 'function' ? cutoffFreq() : cutoffFreq,
currentResonance = typeof resonance === 'function' ? resonance() : resonance,

orderInt = currentOrder,
firstOrder = orderInt % 2,
secondOrder = floor(orderInt / 2),

filtered = (() => {
    let y = signalWithoutK;
    
    if (firstOrder) {
        if (!window.filterStates1[0]) {
            window.filterStates1[0] = {x1: 0, y1: 0};
        }
        let state = window.filterStates1[0];
        
        let w0 = 2 * PI * currentCutoff / sr;
        let g = tan(w0 / 2);
        let a0 = g + 1;
        let b0 = g / a0;
        let b1 = b0;
        let a1 = (g - 1) / a0;
        
        let output = b0 * y + b1 * state.x1 - a1 * state.y1;
        state.x1 = y;
        state.y1 = output;
        y = output;
    }
    
    for (let i = 0; i < secondOrder; i++) {
        if (!window.filterStates2[i]) {
            window.filterStates2[i] = {x1: 0, x2: 0, y1: 0, y2: 0};
        }
        let state = window.filterStates2[i];
        
        let w0 = 2 * PI * currentCutoff / sr;
        let Q = currentResonance;
        
        if (Q <= 0) Q = 0.0001;
        
        let g = tan(w0 / 2);
        let d = g * g + g / Q + 1;
        let b0 = g * g / d;
        let b1 = 2 * b0;
        let b2 = b0;
        let a1 = 2 * (g * g - 1) / d;
        let a2 = (g * g - g / Q + 1) / d;
        
        let output = b0 * y + b1 * state.x1 + b2 * state.x2 - a1 * state.y1 - a2 * state.y2;
        state.x2 = state.x1;
        state.x1 = y;
        state.y2 = state.y1;
        state.y1 = output;
        y = output;
    }
    return y;
})(),

filtered + 4/3*k*rl*kv/2