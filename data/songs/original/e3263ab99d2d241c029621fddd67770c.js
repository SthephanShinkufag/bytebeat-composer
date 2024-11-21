f=(x,w)=>((w*2+(floor(((x*128)%w|(t>>(t%(8*w))/w)%w|(t>>128)%w)-((t>>(t%(8*w))/w)%w|(t>>128)%w)/2)%w/(w/256)))%256),
xp=
f(t*2**([0,2,3,7,2,3,7,5][[t>>13,t>>10&t>>13][t>>19&1]&7]/12-3),2**12)/3
+(t/4*2**([0,2,3,5][t>>17&3]/12))%256/4
+48*random()*(1-(t>>4)/256%1)*[1,1-(t/64&1&t>>13),1-(t/64&1&t>>13),1-(t/128&1&t>>12)][t>>14&3]
+sin((2**19/(t%2**13+1)*'10010100'[t>>13&7])/128*PI)*32+32,

r_DC = 0, //Reduce DC? (this is for in case your audio driver not sounding weird downsides it reduses 50% of the audio its 1)
vol = 0, //Volume is for the DC is off

this.ft??=0,ft=ft+(abs(xp%256)-ft)/512, // if you gonna use this tracker make sure your value doesn't go to NaN

info = function(length) {
	var d = r_DC>=1?(abs(xp%256)-ft)/2:abs(xp%256)/(vol?2:1)+(vol?64:0)-128
	var Hz = Hz=44100
	var string3= "Time " + (floor(abs(t)/Hz/60))
	var string2= [":"," "][(floor(abs(t)/Hz*2)&1)]+(floor(abs(t)/Hz/10)%6)
	var string7= "" + ((floor(abs(t)/Hz))%10)
	var string4= " Steps " + (floor(abs(t)>>16))
	var string5= "." + (floor(abs(t)>>14)%4+1)
	var string6= "." + (floor(abs(t)>>12)%16+1)
	var Display="Made by D3nschøt♪ " + ['┌','─','└','│','┘','─','┐','│'][(t>>13)&7]+"\n"+
					string3+string2+string7+string4+string5+string6
   var v_thing = [
'                               ','█                              ','██                             ',
'███                            ','████                           ','█████                          ',
'██████                         ','███████                        ','████████                       ',
'█████████                      ','██████████                     ','███████████                    ',
'████████████                   ','█████████████                  ','██████████████                 ',
'███████████████                ','████████████████               ','█████████████████              ',
'██████████████████             ','███████████████████            ','████████████████████           ',
'█████████████████████          ','██████████████████████         ','███████████████████████        ',
'████████████████████████       ','█████████████████████████      ','██████████████████████████     ',
'███████████████████████████    ','████████████████████████████   ','█████████████████████████████  ',
'██████████████████████████████ ','███████████████████████████████'][(abs(d)/4&31)]
	var volume_meter = '\n\n              <Master>\n⧸|'+v_thing+'|⧹'+'\n⧹|'+v_thing+'|⧸\n '
	throw Display + "\nDC " +(((d*16777216&4294967295)/16777216))+volume_meter
}, DC_r=r_DC>=1?(abs(xp%256)-ft)/2+128:abs(xp%256)/(vol?2:1)+(vol?64:0),
(t/8.15%1?DC_r:info())