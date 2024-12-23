t%=5766785,//sr,seconds
hz=t/48000,//t/sr
t/=(1+(t>>0&1)),
t/=5.5,
a=t*2**'12345432'[7&t*4>>12],
b=t*2**'1242'[3&t>>10],
m1=(b*[1,1.2,1.8,2.7][3&t>>14])%256/3,
m2=(a*[1,1.2,1.8,2.7][3&t*4>>16]&64),
m3=(b*[1,1.2,1.8,2.7][3&t*4>>16]&64)%256*(-t/2&2047)/2E3,
m4=((sin(4e5/(t%4096+1500))*64)+64),
m5=t*[1,1.2,1.8,2.7][3&t*4>>16],
o=[m1,m2^m1,m3+(m2^m1),m4+(m3+(m2^m1))%256/1.3,fm=m4+(m3+(m2^m1)%256/1.3)|m5,fm,fm,fm][(t>>17)%8]%256*(-t&2047)/2E3,//main
song=function(n,a,l){var Display="\n"+n+" by "+a+" legth:";throw Display+int(hz)+"|"+l},//info
(t%9)?o:song("BUILDING OF METAL","gaham\n remix of a post in dolcan forums\n",120)//output