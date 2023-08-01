c=1.047,cs=1.107,d=1.174,ds=1.243,e=1.318,f=1.389,fs=1.476,g=1.568,gs=1.655,a=1.754,as=1.857,b=1.977,

mono=0,

T=t*1.10,BAR=T>>15,BAR2=T/(1<<15),

(t&65535)||(
drumpat="SHH0SH0HS0H0SHHH",
inst='011100100010101111011010011000000',
l1='23423423',
l2=[b,b,b,d*2,g,g,fs,as],
l3=[2,3.185,4,2,3.185,4,2,3.185],
snare1=0,
snare2=0
),

clam=(x)=>(min(1,max(0,x))),

snare1=(((snare1*31)+random())/32),S1=((snare1)*4)>2,
snare2=(((snare2*31)+random())/32),S2=((snare2)*4)>2,

main=(S,H,O)=>(

S=BAR>31?random():S,
H=BAR>31?((sin(t/(O?3:5))+1)/2):H,

rollin=(BAR>7?0:clam(BAR2-7)*S*128)|(BAR>31?0:clam(BAR2-31)*S*128),

drum1=drumpat[T>>12&15],
drum=(drum1=='S'?S:drum1=='H'?H:drum1)*(256-((T>>4)&255))/2,

A=t*l1[T>>12&7],
B=t*l3[T>>12&7],
lead=(x,y)=>(inst[[A,A,A,A,A,A,A,B][T>>15&7]*(O&BAR>27?1.01:1)*l2[BAR&7]>>x&31]*y),
superlead=(lead(6,64)+lead(5,32)+lead(4,16)+lead(3,8)+lead(2,4)+lead(1,2)+lead(0,1)),

(
	BAR>31?superlead:lead(6,64)
)+(rollin?rollin:(BAR>7?drum:0))
),
out=[main(S1, ((t>>4)*PI)&1 , false),main(S2, (((t>>3)/2)*PI)&1 ,true)],mono?out.reduce((a,b)=>(a+b)/2):out