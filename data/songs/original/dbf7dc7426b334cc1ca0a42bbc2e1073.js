q = "t&4096?(t*(t^t%255)|t>>4)>>1:t>>3|(t&8192?t<<2:t)",

h=t=>(eval(q)%256),

ce();

function ce(){
    let out=h(t)/4;
    for (ij=1;ij<8;ij++){
        out+=h(t-(ij*900))/(ij*9);
    }
    return out/2+64;
}