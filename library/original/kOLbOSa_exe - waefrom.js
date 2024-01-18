wf="0000ffff0000ffff0000ffffffff0000ffff0000ffffffff0000ffffffff",


(wfg(wf,
  t*((t>>12^t>>13|t>>11)%9)/8,
    10)+
wfg(wf,
    t*((t>>12^t>>13|t>>11)%8)/8,
    10)+
wfg(wf,
    t*((t>>14^t>>13|t>>14)%5)/32,
    10)

)/(255+((t>>((t>>14^t>>13|t>>14)&2?4:3)))%256)-1;

function wfg(wf,t,l){

    let out =  parseInt(wf[(t)%wf.length],16)*l;
    if(isNaN(out)){
        out = parseInt(wf[round(t)%wf.length],16)*l;
    }
   return out;
}

