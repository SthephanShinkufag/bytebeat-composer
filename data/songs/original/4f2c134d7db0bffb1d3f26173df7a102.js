Bpm = 125,
Hz = 48000,
tf = ((((t/(Hz/128)/60)*256)*Bpm))/2,

Pulse = (x,y)=>((t*y&255) >= (x&255))*255,
x = (tf>>12)&15,

zz = abs((tf>>8)%512-256), 
zzx = (tf>>11&63),
z= [30,30,23,26,25,26,23,23,30,26,28,28,26,28,23,23][x],
xx = (tf>>17)&3,
zx = [-1,2,4,2][xx],
xp = 
+Pulse(zz,0.25*round(2**(z/12)*16)/16*0.91875)/4
+Pulse(zzx,0.25*round(2**(zx/12)*16)/16*0.91875)/4
+(sin((2**19)/(((tf*"1000001000001000"[(tf>>12)&15]+1)%(2**12)))*PI/128)*128+128)/4
+(((((t*1.75>>4)/9%256)*((t*1.75>>4)/5%256)*((t*1.75>>4)/4%256))&255)/256*(((-abs(tf)>>6)&256?0:1-(abs(tf)>>6&255)/256))*256&255)/6
+(random(256)*1*((1-(abs(tf)>>4&255)/256))*256&255)/12
,


info = function(length) {
		var string3 = "Time " + (floor(abs(t)/Hz/60))
		var string2 = [":"," "][(floor(t/Hz*2)&1)] + (floor(abs(t)/Hz/10)%6)
		var string7 = "" + ((floor(abs(t)/Hz))%10)
		var string4 = " Steps " + (floor(abs(tf)>>16))
		var string5 = "." + (floor(abs(tf)>>14)%4+1)
		var string6 = "." + (floor(abs(tf)>>12)%16+1)

		var PWM1 = "PWM:" + ((zz&255)/100>>0)+((zz&255)/10>>0)%10+((zz&255))%10
		var Reg1 = " Reg:" + (((x&31)+1)/10>>0)+(((x&31)+1))%10
		var Pitch1 = " Pitch:" + round(2**(z/12)*16)/16
		var note1 = " Note:"+ ["C ","C#","D ","D#","E ","F ","F#","G ","G#","A ","A#","B "][(z+5)%12>>0]+(((z+5)/12)>>0)
		var synth1 = "\nSynth 1: " + PWM1 + Reg1 + note1 + Pitch1

		var PWM2 = "PWM:" + ((zzx&255)/100>>0)+((zzx&255)/10>>0)%10+((zzx&255))%10
		var Reg2 = " Reg:" + (((xx&31)+1)/10>>0)+(((xx&31)+1))%10
		var Pitch2 = " Pitch:" + round(2**(zx/12)*16)/16
		var note2 = " Note:"+ ["C ","C#","D ","D#","E ","F ","F#","G ","G#","A ","A#","B "][(zx+5)%12>>0]+(((zx+5)/12)>>0)
		var synth2 = "\nSynth 2: " + PWM2 + Reg2 + note2 + Pitch2

		var Display = "Made by D3nschøt " + ['┌','─','└','│','┘','─','┐','│'][(t>>13)&7] + "\n" + string3+string2+string7+string4+string5+string6 + synth1 + synth2
	throw Display + "\nDC " +((xp%256)-128)
},

(t/255%1)?xp:info()