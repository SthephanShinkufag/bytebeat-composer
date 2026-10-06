// 3.9-KB Jaunty Tune
lr=lr=>
(SampleRate=32000, // in Jimmyoshi's words... lower this if there is lag wow (recommended 32000 or lower)
BPM=145,
ts=t/SampleRate,
beat=BPM*ts/60,
tick=(beat*2)%32,
ts1=ts*256,
ts2=ts+128,

C=261.63+lr/10,
D=293.66+lr/10,
E=329.63+lr/10,
F=349.23+lr/10,
G=392.00+lr/10,
A=440.00+lr/10,
B=493.88+lr/10,

chan=(start,end,note)=>(tick>=start-1&&tick<end-1)*note,

chan1=
	chan(1,2,C)+
	chan(4,5,E)+
	chan(5,5.125,B)+
	chan(5.125,6,C*2)+
	chan(6,7,G)+
	chan(8,10,E)+
	chan(11,11.125,F)+
	chan(11.125,12,G)+
	chan(13,15,D)+
	chan(17,18,C)+
	chan(20,21,G)+
	chan(21,21.125,B)+
	chan(21.125,22,C*2)+
	chan(22,23,E*2)+
	chan(24,25,C*2)+
	chan(26,27,B)+
	chan(28,29,G)+
	chan(30,31,D)+
	chan(31,32,B/2),

chan2=
	chan(2,2.5,C/2)+
	chan(3,4,C/2)+
	chan(6,6.5,C/2)+
	chan(7,8,C/2)+
	chan(10,10.5,C/2)+
	chan(11,12,C/2)+
	chan(14,14.5,G/4)+
	chan(15,16,G/4)+
	chan(18,18.5,C/2)+
	chan(19,20,C/2)+
	chan(22,22.5,C/2)+
	chan(23,24,C/2)+
	chan(26,26.5,C/2)+
	chan(27,28,C/2)+
	chan(29,30,B/4)+
	chan(31,33,G/4),

chan3=
	chan(1,2,C/4)+
	chan(2,3,C/2)+
	chan(3,4,C/4)+
	chan(4,5,C/2)+
	chan(5,6,C/4)+
	chan(6,7,C/2)+
	chan(7,8,C/4)+
	chan(8,9,C/2)+
	chan(9,10,C/4)+
	chan(10,11,C/2)+
	chan(11,12,C/4)+
	chan(12,13,C/2)+
	chan(13,14,G/4)+
	chan(14,15,G/2)+
	chan(15,16,G/4)+
	chan(16,17,G/2)+
	chan(17,18,C/4)+
	chan(18,19,C/2)+
	chan(19,20,C/4)+
	chan(20,21,C/2)+
	chan(21,22,C/4)+
	chan(22,23,C/2)+
	chan(23,24,C/4)+
	chan(24,25,C/2)+
	chan(25,26,C/4)+
	chan(26,27,C/2)+
	chan(27,28,C/4)+
	chan(28,29,C/2)+
	chan(29,30,B/4)+
	chan(30,31,G/2)+
	chan(31,32,B/4)+
	chan(32,33,G/2),

tick -= 1,

chan4=
	chan(1,2,C)+
	chan(4,5,E)+
	chan(5,5.125,B)+
	chan(5.125,6,C*2)+
	chan(6,7,G)+
	chan(8,10,E)+
	chan(11,11.125,F)+
	chan(11.125,12,G)+
	chan(13,15,D)+
	chan(17,18,C)+
	chan(20,21,G)+
	chan(21,21.125,B)+
	chan(21.125,22,C*2)+
	chan(22,23,E*2)+
	chan(24,25,C*2)+
	chan(26,27,B)+
	chan(28,29,G)+
	chan(30,31,D)+
	chan(31,32,B/2),

chan5=
	chan(2,2.5,C/2)+
	chan(3,4,C/2)+
	chan(6,6.5,C/2)+
	chan(7,8,C/2)+
	chan(10,10.5,C/2)+
	chan(11,12,C/2)+
	chan(14,14.5,G/4)+
	chan(15,16,G/4)+
	chan(18,18.5,C/2)+
	chan(19,20,C/2)+
	chan(22,22.5,C/2)+
	chan(23,24,C/2)+
	chan(26,26.5,C/2)+
	chan(27,28,C/2)+
	chan(29,30,B/4)+
	chan(31,33,G/4),

chan6=
	chan(1,2,C/4)+
	chan(2,3,C/2)+
	chan(3,4,C/4)+
	chan(4,5,C/2)+
	chan(5,6,C/4)+
	chan(6,7,C/2)+
	chan(7,8,C/4)+
	chan(8,9,C/2)+
	chan(9,10,C/4)+
	chan(10,11,C/2)+
	chan(11,12,C/4)+
	chan(12,13,C/2)+
	chan(13,14,G/4)+
	chan(14,15,G/2)+
	chan(15,16,G/4)+
	chan(16,17,G/2)+
	chan(17,18,C/4)+
	chan(18,19,C/2)+
	chan(19,20,C/4)+
	chan(20,21,C/2)+
	chan(21,22,C/4)+
	chan(22,23,C/2)+
	chan(23,24,C/4)+
	chan(24,25,C/2)+
	chan(25,26,C/4)+
	chan(26,27,C/2)+
	chan(27,28,C/4)+
	chan(28,29,C/2)+
	chan(29,30,B/4)+
	chan(30,31,G/2)+
	chan(31,32,B/4)+
	chan(32,33,G/2),

tick += 1,

noisechan=(start,end,note)=>(tick>=start-1&&tick<end-1)*note,

noise = (random()-random())+lr,
	
noiseFreq = 
	noisechan(2,2.125,noise)+
	noisechan(4,4.125,noise)+
	noisechan(6,6.125,noise)+
	noisechan(6.5,6.625,noise)+
	noisechan(7,7.75,noise)+
	noisechan(8,8.125,noise)+
	noisechan(10,10.125,noise)+
	noisechan(12,12.125,noise)+
	noisechan(14,14.125,noise)+
	noisechan(14.5,14.625,noise)+
	noisechan(15,15.75,noise)+
	noisechan(16,16.125,noise)+
	noisechan(18,18.125,noise)+
	noisechan(20,20.125,noise)+
	noisechan(22,22.125,noise)+
	noisechan(22.5,22.625,noise)+
	noisechan(23,23.75,noise)+
	noisechan(24,24.125,noise)+
	noisechan(26,26.125,noise)+
	noisechan(28,28.125,noise)+
	noisechan(30,30.125,noise)+
	noisechan(30.5,30.625,noise)+
	noisechan(31,31.75,noise),

out=(amplitude,frequencies,pulse)=>amplitude*2*(int(frequencies*ts1)%256<=pulse*2.56)-amplitude+3/4*(amplitude/64)*(abs(((255*frequencies*2*ts2)&255)-128)-96),
(out(24,chan1,64+lr)+out(24,chan2,50+lr)+out(30,chan3,80+lr)+out(5,chan4,64+lr)+out(5,chan5,50+lr)+out(5,chan6,80+lr)+out(40,noiseFreq))/256),[lr(-10),-lr(10)]