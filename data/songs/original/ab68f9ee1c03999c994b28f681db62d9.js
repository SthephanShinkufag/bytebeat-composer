t/=4,

q = `10*(t>>6|t|t>>(t>>16))+(7&t>>11)`,

h=t=>(eval(q)&255),

ce()/256-1;

function ce(){
    let out=h(t)/4;
    for (ij=1;ij<10;ij++){
        out+=h(t-(ij*(512+sin(t/8192*PI)*2)))/(ij);
    }
    return out/2;
}