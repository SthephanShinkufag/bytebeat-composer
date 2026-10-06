/* 

	I declare that this work is free to use. You may use any of the instruments or techniques I have shown here
	freely, without limitation. Therefore, credit is NOT required, but it is appreciated. I'd also love to see
	what you make! Feel free to send any of them to me via the comment section for this song on Battle of the
	Bits, or you may send it to me on Reddit: u/eSlashMachine

	Text font: https://patorjk.com/software/taag
	   	                               _            
		 _ __ ___   ___   ___  _ __  _ __(_)___  ___   
		| '_ ` _ \ / _ \ / _ \| '_ \| '__| / __|/ _ \  
		| | | | | | (_) | (_) | | | | |  | \__ \  __/_ 
		|_| |_| |_|\___/ \___/|_| |_|_|  |_|___/\___(_)

		"Say hello to night as the moon peeks over the horizon."
                                               

	HELLO ALL !!!

	This is my entry for bytebeat in Smackdown of the Signals. If you've been listening to my entries, you may 
	notice it sounds similar to my song "sunset," the song that scored me third place in Summer Chip XV. Well, 
	that is because this is the sequel to that song! "moonrise" follows a similar framework to that of sunset, 
	creating what I hope is a beautiful experience for your ears.

	This version is thoroughly formatted (which is where most of the short time I had to make this actually went). 
	Hopefully this will help you in your bytebeat journey, whether you are just starting or are experienced and 
	looking for new techniques! :-)

	So, with that fresh out of the way, let's get into this!

	This song is played best on dollchan.net/bytebeat. Floatbeat mode, 48k.

	I will make a thoroughly commented version in the future, but for now I do not have time.

	This code is horribly optimized, so performance suffers... I'm sorry!

	Song is 220s (3:40 mm:ss).

*/

t || ( // This statement makes it so that the code inside it is only executed once, which prevents a lot of lag.
	a = b = c = 0,
	Z = [], // FX array
	R = Array(l = 8192).fill(0),
	r = Array(l).fill(0),
	R2 = Array(l2 = 12288).fill(0),
	r2 = Array(l2 = 12288).fill(0)),
	X = 0,
	lp = (a, c) => ( 
		
		// 1 pole filters - these are by feeshbread because the implementation is simple and the result effective.

		Y = X ++,
		Z[Y] ??= 0,
		Z[Y] += (a - Z[Y]) * c
	),
	hp = (a, c) => (
		a - lp(a, c)
	),

	sampleRate = 48000,

	T = 392 / sampleRate, // The tone variable - Tuned to 392Hz, or G.

	mod = [n = 4, n - (t / 262144 % 1) * n][t >> 18 & 1], // Modulator.

	a += T * PI * 2 ** (
		[
			[0,3,5,7,10,7,5,3],
			[3,7,10,15,19,15,10,7],
			A = [-2,2,5,10,14,10,5,2], // Store variables in variables to save space
			A
		][t >> 17 & 3][t >> 13 & 7] / 12),

	b += c += (
	(T*2**(
		[
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,-2,0,
			3,3,3,3,3,3,3,3,
			3,3,3,3,3,3,3,2,
			3,0,-2,-2,-2,-2,-2,-2,
			-2,-2,-2,-2,-2,-2,-4,-5,
			-4,-5,-2,-2,-2,-2,-2,-2,
			-2,-2,-2,-2,-2,-2,-2,0
		][t>>13&63]/12-1))-c)/1e3,
lr=(lr,R,R2)=>(
	a1 = lp(atan(sin(a * lr) * (1 + abs(sin(t * PI / 262144)) * 8)) * (1 - t / 8192 % 1) ** mod / 4 * min(t / 8192 % 1, .01) / .01 * min(abs(sin(t * PI / 65536)), .001) / .001, .01) * 6 + R2[t % l2],
	R2[t % l2] = a1 / 2,

c1 = A => (
	abs(sin(t * lr * T * PI * 2 ** (
	[
		[0, 3, 7],
		[3, 7, 10],
		AA = [-2, 2, 5],
		AA
	][t >> 17 & 3][A] / 12 - 1
	))) / 4 - .125
) * min(M = t % 65536 / 24576 % 1, .04) / .04 * (1 - M) ** mod * min(abs(sin(t * PI / 65536)), .01) / .005,

c1 = c1(0)+c1(1)+c1(2)+R[t%l],R[t%l]=lp(c1/2,.4),
b1 = lp(((t*lr*32*T*2**([0,3,-2,-2][t>>17&3]/12)&127)+(sin(t*PI/131072)*32+64)&128)/256-.25,.01),
k1 = lp(tan(sin(cbrt(t%8192)*PI*2)*(1-t/8192%1))/2,t/8192%1)*3,
f1 = lp(k1,(t/32768%1)**4)*(t%524288>524288-32768),
p1 = '1000100001001000'[t>>13&15],
p3 = '1000100010010010'[t>>13&15],
p3i = '1000100010011010'[t>>13&15],
p2 = '00001000'[t>>13&7],
sc = (t / 2 ** 13 % 1) ** 12,
k2 = k1 * p1,
k3 = k1 * p3,
k3i = k1 * p3i,
s1 = hp(random() - random(), .4) * (1 - t / 2 ** 13 % 1) * min(t / 2 ** 13 % 1, .1) / .15 * p2,
h1 = hp(random() - random(), .9) * (1 - t / 2 ** 13 % 1) ** 8 * min(t / 2 ** 13 % 1, .1) / .02,
d1 = lp(hp(random() - random(), M=(1-t/524288%1)**8),M)/2,
u1 = lp(hp(random() - random(), M=(t/524288%1)**8),M)/2,

m1=lp(hp((b*lr*.995%1+b*lr%1+b*lr*1.005%1-1)/4,.01),.1)*2,
ar=[

// intro

	a1+d1,
	a1+lp(c1,(t/2**19%1)**4)+u1,
	a1+c1+b1+d1,
	hp(a1+c1+b1+u1,(t/524288%1)**21*(t%524288>524288-32768?1-t/32768%1:1))+f1,

// drop 1
	
	(a1+c1+b1+d1)*(p1==1?sc:1)+k2,
	(a1+c1+b1)*(p1==1?sc:1)+k2,
	(a1+c1+b1)*(p1==1?sc:1)+k2+s1,
	(a1+c1+b1+u1)*(p1==1?sc:1)+k2+s1,
	(a1+c1+b1+d1+lp(m1,(t/1048576%1)**4))*(p1==1?sc:1)+k2+s1+h1,
	(a1+c1+b1+u1+lp(m1,(t/1048576%1)**4))*(p1==1?sc:1)+k2+s1+h1,

// calm

	a1+c1+b1+m1+h1+d1,
	a1+c1+b1+m1+h1+f1+u1,

// drop 2

	(a1+c1+b1+m1+d1)*(p3==1?sc:1)+k3+h1,
	(a1+c1+b1+m1)*(p3==1?sc:1)+k3+h1,
	(a1+c1+b1+m1)*(p3i==1?sc:1)+k3i+s1+h1,
	(a1+c1+b1+m1+u1)*(p3i==1?sc:1)+k3i+s1+h1,

// outro

	(a1+c1+b1+m1+d1),
	(a1+c1+b1*(1-t/524288%1)+m1),
	(a1+c1+m1),
	lp(a1+c1+m1,(1-t/524288%1)**2),

],

hp(ar[t>>19]||0,.001)/2),

[lr(.995,R,R2),lr(1.005,r,r2)]