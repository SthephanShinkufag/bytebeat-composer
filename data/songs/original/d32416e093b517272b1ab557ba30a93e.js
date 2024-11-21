// 
//         ██
//       ██  ██
//     ██      ██
//       ██      
// ██      ██      ██
//   ██  ██      ██
//     ██      ██
//           ██
//         ██              ██
//           ██          ██  ██
//             ██      ██      ██
//                   ██  ██  ██  
//                 ██      ██       ██
//                       ██       ████
//                     ██       ██  ██  ██
//                            ██    ████
//                          ██      ██      ██
//                                ██          ██
//                              ██          ██  ██
//                                        ██
//                                      ██
//                                    ██
// By D3nschøt⊗
// ft used to set the speed to whatever
Tracker = 0, // disable tracker? (boolean)
ft = t*0.725625,

// secondary sequence
s = [(ft>>12)+3,(ft>>13)+3,ft>>14,ft>>15][(ft>>19)&3],
S = [0,1,0,4,0,1,0,12][s&7],

// primary sequence
e = [-5,2,7,10,-5,2,7,10,-5,2,7,10,-5,2,7,10,-5,2,7,10,-5,2,7,10,-5,2,7,10,10,2,7,2,10][(ft>>(12^S))&31]-4.766180595836,
ex = [-5,-2,0,-2][(ft>>17)&3]-4.766180595836,

//output
xp = (
((t*2**(e/12)+(t*2**(e/12)&t*2**(e/12)^ft>>7)-t*2**(e/12)*(ft>>11&(t*2**(e/12)%16?2:6)&ft>>11))&255)//bear @ celephais's code
+((t*2**(ex/12))&255)
+(sin((2**19)/((ft%(2**15)))/128*PI)*127+128)
+(((((t*1.75>>4)/9%256)*((t*1.75>>4)/5%256)*((t*1.75>>4)/4%256))&255)/256*(((-abs(ft)>>6)&256?0:1-(abs(ft)>>6&255)/256))*256&255)
)/4,

info = function(length) {
	var Hz = Hz=44100
	var string3 = "Time " + (floor(abs(t)/Hz/60))
	var string2 = [":"," "][(floor(t/Hz*2)&1)] + (floor(abs(t)/Hz/10)%6)
	var string7 = "" + ((floor(abs(t)/Hz))%10)
	var string4 = " Steps " + (floor(abs(t)>>16))
	var string5 = "." + (floor(abs(ft)>>14)%4+1)
	var string6 = "." + (floor(abs(ft)>>12)%16+1)
	var note = "\n Note:"+ ["C ","C#","D ","D#","E ","F ","F#","G ","G#","A ","A#","B "][(e+65)%12>>0]+(((e+65)/12)>>0)+" pitch "+2**(e/12)*4
	var note1 = "\n Note:"+ ["C ","C#","D ","D#","E ","F ","F#","G ","G#","A ","A#","B "][(ex+53)%12>>0]+(((ex+53)/12)>>0)+" pitch "+2**(ex/12)


	var Display ="Made by D3nschøt♪ " + ['┌','─','└','│','┘','─','┐','│'][(t>>13)&7] + "\n" + string3+string2+string7+string4+string5+string6+note+note1
	throw Display + "\nDC " +(((xp%256)-128))
},
Tracker?xp:((t/255%1)?xp:info())