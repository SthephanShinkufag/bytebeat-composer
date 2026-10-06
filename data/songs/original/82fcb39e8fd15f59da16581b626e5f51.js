disp = 0,

wv = t => (y = t % 256, 127 > y ? y : 2 * (256 - y)),
ms = int(t / 1e4),
p = t / 1e4 % 16,
p2 = t / 1e4,
b = p % 4,
qn = p % 1,
rh = t => { for (i = m = 0; i < t.length; i++) b > t[i] && (m = b - t[i]); return m },

bt = beat = (len, spd, spd2 = 16384)=>(p2 * spd2 >> spd)%len,

pitch = (t, s = c1) => (
  a = (x, y) => t * 2 ** (((x[(ms >> y) % x.length]) / 12)) / .667,
  a(s, 2)
),

c = (s = c1) => pitch(t,s),

c1=[
0,0,3,3,-2,-2,0,0,
0,0,3,3,-2,-2,0,0,
0,0,3,3,5,7,0,0,
0,0,3,3,5,7,0,0
],
c2=[
3,3,7,7,2,2,3,3,
3,3,7,7,2,2,3,3,
3,3,7,7,8,10,3,3,
3,3,7,7,8,10,3,3
],
c3=[
7,7,10,10,5,5,7,7,
7,7,10,10,5,5,7,7,
7,7,10,10,12,14,7,7,
7,7,10,10,12,14,7,7
],
c4=[
10,10,14,15,12,14,15,15,
10,10,14,15,12,14,15,15,
15,15,17,19,19,19,12,15,
15,15,17,19,19,19,12,15
],

mel1=[
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,-2,-2,
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,-2,-2,
3,3,3,3,,,3,3,3,3,5,3,2,,2,2,
3,3,3,3,,,3,3,3,3,3,3,2,2,2,2,
-2,-2,-2,-2,,,-2,-2,-2,-2,-2,-2,-5,-5,-5,-5,
-2,-2,-2,-2,,,-2,-2,-2,-2,-2,-2,-5,-5,-5,-5,
0,0,0,0,,,0,0,0,0,2,0,-2,-2,-2,-2,
0,0,0,0,,,0,0,0,0,0,0,-2,-2,-2,-2,
][bt(128,12)],

mel2=[
0,0,7,7,7,7,7,7,7,7,7,7,8,7,5,7,
0,0,7,7,7,7,7,7,7,7,7,7,8,7,5,5,
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
0,0,0,0,0,0,0,0,0,0,0,0,2,0,-2,-2,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,
0,0,7,7,7,7,7,7,7,7,7,7,10,7,5,7,
0,0,7,7,7,7,7,7,7,7,7,7,10,7,5,7,
][bt(128,12)],

mel3=[
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
0,0,0,0,0,0,0,0,0,0,0,0,2,0,-2,-2,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,
-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-9,-7,-7,-7,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-3,-5,-5,
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,-2,-2,
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,,,
][bt(128,12)],

mel1R=[
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,0,-2,-2,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,0,-2,-2,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-2,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-2,-5,-5,
][bt(128,12)],

mel2R=[
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-5,-7,-7,
-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
][bt(128,12)],

mel3R=[
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-5,-7,-7,
-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,
-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,
-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
][bt(128,12)],

mL=[
0,0,0,,0,,0,,0,0,0,,0,
0,0,,0,,0,,0,,0,,0,,0,,0,0,
,,3,,3,,3,,3,,3,,3,,3,3,
3,,3,,3,,3,,3,,3,,3,,3,3,
3,,5,,5,,5,5,5,5,,,,,5,,
3,,2,2,2,,,,,,2,,2,,2,
,2,,3,,2,,0,0,0,,,,,,
,,,,,,,,,,,,,,,,,,,,
][bt(128,12)],

e1=x=>[x?mel1:mel1R,x?mel1:mel1R,x?mel2:mel2R,x?mel3:mel3R],

e2=[NaN,NaN,mL,mL,mL,mL,NaN,NaN],

echo = (t, u, m = 0, s = e1) => {
  a = (x, y) => t * 2 ** (x[((t/1e4)*4 >> y) % x.length] / 12) * 3 || 0
  base = a(e1(m ? 0 : 1 ), 7) * 2
  env = (1 - (16384 * t / 1e4 % 8192) / 12000)
  return ( (base & base / u ) % 256 ^ (base % 127 + base % 128) / 2 % 256 ) * env
},

bs = x => {
  a = (x, y) => t * 2 ** (x[((t/1e4)*4 >> y) % x.length] / 12) * 3 || 0
  base = a(c1, 4) / 2
  return (base ^ base / (2 * x) | base ^ base % 128) % 256
},

lead = x => {
  a = (x, y) => t * 2 ** (x[((t/1e4)*4 >> y) % x.length] / 12) * 3 || 0
  base = a(e2,7) * 2
  return (base % 128) + (base / (2 * x) % 128) & 128
},

cm=x=>(wv(c(c1)/x) - wv(c(c2)/x) + wv(c(c3)/x) - wv(c(c4)/x)
),

mainMelody = x =>
  (wv(t / 4) 
   - wv(t / 2 + qn * wv(t * (ms >> 2 & 15)) + wv(2 * t * (1 + (ms >> 5 & 3))))
  ) * 1.375 * (1 - rh([0, 1, 1.5, 2, 2.75, 3.5])) * (63 < ms % 256)
  +
  ((cm(1)+cm(x)+cm(x*1.01))/1.75

) 
  * (0.7 - rh([0, 0.75, 1.5, 2.5, 3.25])),

echoMelody = x =>
  echo(t, x ? 1.99 : 2.01, x ? 1 : 0 ) +
  echo(t - 12288, x ? 1.99 : 2.01, x ? 1 : 0 ) / 2 +
  echo(t - 24576, x ? 1.99 : 2.01, x ? 1 : 0 ) / 4 +
  echo(t - 36864, x ? 1.99 : 2.01, x ? 1 : 0 ) / 8,

bassMelody = x =>
bs(x?1.01:.99) * (0.7 - rh([0.75, 2.5, 1.5, 3, 3.25])),

leadMelody = x =>
lead(x?1.01:.99),

A = x =>(mainMelody(x?.99:1.01) * .2 + echoMelody(x?0:1) * .25) + bassMelody(x?0:1) * .25 + leadMelody(x?0:1)*.135 + 128,

sc=32>ms%256?1:min(1,max(0,3*qn-.3))*(0<ms%32),

M = x => max(0,min(255,sc*((4*A(x?0:1)-512)+random()*(16-p)**2/4)*.3-qn*(1-qn*(80>ms%128?2:4)%1)**4*80*random()*(63<ms%256)+wv(2*t+60*sin(25*b))*(31<ms%256)*(1>ms%32)*qn+wv(2E3*(1-qn)**9*(1+p%2))*max(0,1-5*qn)*(31<ms%256)+128)),

MM = [M(0),M(1)], 

info = function(length) {
var Title = "\nBaatyr.EXE - EDM Remix of Baatyr's Words (Баатырдыҥ сӧӧзи) by Muse Labs"

var Lyrics = [
"Кеен чӱмдӱ бу Алтайда,",
"Кеен чӱмдӱ бу Алтайда,",
"Кебис jараш бу jалаҥда,",
"Кебис jараш бу jалаҥда,",
"Ак тайганыҥ эдегинде,",
"Ак тайганыҥ эдегинде,",
"Ак талайдыҥ jарадында",
"Тегин эмес jӱрӱм jӱрген",
"Тегин эмес jӱрӱм jӱрген",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"",
"",
"",
"Ары кӧрзӧ, андый эмес,",
"Ары кӧрзӧ, андый эмес,",
"Бери кӧрзӧ, мындый эмес,",
"Бери кӧрзӧ, мындый эмес,",
"Ары кӧрзӧ - айудый,",
"Ары кӧрзӧ - айудый,",
"Бери кӧрзӧ - бӧрӱдий,",
"Коркор сӧс ол билбес",
"Коркор сӧс ол билбес",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"",
"",
"",
"Алтайынаҥ алкышту:",
"Алтайынаҥ алкышту:",
"Аткан огы чике тийер,",
"Аткан огы чике тийер,",
"Эткен эдим эптӱзи",
"Эткен эдим эптӱзи",
"Минген ады jаражы,",
"Айткан сӧзи чечени.",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"",
"",
"",
"Калганчыда баатыр айткан:",
"Калганчыда баатыр айткан:",
"Келер-келер бу чактарда",
"Келер-келер бу чактарда",
"Кебис jараш бу jалаҥда,",
"Кебис jараш бу jалаҥда,",
"Кеен чӱмдӱ бу Алтайда",
"Кеен чӱмдӱ бу Алтайда",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"",
"",
"",
][bt(64,15)]

var Roman = [
"Keen chu̇mdu̇ bu Altaĭda,",
"Keen chu̇mdu̇ bu Altaĭda,",
"Kebis jarash bu jalan͡gda,",
"Kebis jarash bu jalan͡gda,",
"Ak taĭganyn͡g ėdeginde,",
"Ak taĭganyn͡g ėdeginde,",
"Ak talaĭdyn͡g jaradynda",
"Tegin ėmes ju̇ru̇m ju̇rgen",
"Tegin ėmes ju̇ru̇m ju̇rgen",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"",
"",
"",
"Ary kȯrzȯ, andyĭ ėmes,",
"Ary kȯrzȯ, andyĭ ėmes,",
"Beri kȯrzȯ, myndyĭ ėmes,",
"Beri kȯrzȯ, myndyĭ ėmes,",
"Ary kȯrzȯ - aĭudyĭ,",
"Ary kȯrzȯ - aĭudyĭ,",
"Beri kȯrzȯ - bȯru̇diĭ,",
"Korkor sȯs ol bilbes",
"Korkor sȯs ol bilbes",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"",
"",
"",
"Altaĭynan͡g alkyshtu:",
"Altaĭynan͡g alkyshtu:",
"Atkan ogy chike tiĭer,",
"Atkan ogy chike tiĭer,",
"Ėtken ėdim ėptu̇zi",
"Ėtken ėdim ėptu̇zi",
"Mingen ady jarazhy,",
"Aĭtkan sȯzi checheni.",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"",
"",
"",
"Kalganchyda baatyr aĭtkan:",
"Kalganchyda baatyr aĭtkan:",
"Keler-keler bu chaktarda",
"Keler-keler bu chaktarda",
"Kebis jarash bu jalan͡gda,",
"Kebis jarash bu jalan͡gda,",
"Keen chu̇mdu̇ bu Altaĭda",
"Keen chu̇mdu̇ bu Altaĭda",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"",
"",
"",
][bt(64,15)]

var English = [
"On this beautifully enrobed Altai",
"On this beautifully enrobed Altai",
"On this plain, like a beautiful carpet",
"On this plain, like a beautiful carpet",
"On the slopes of the White Mountains",
"On the slopes of the White Mountains",
"On the shores of the White Sea",
"Life is not living in vain",
"Life is not living in vain",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"",
"",
"",
"Look there its not the same",
"Look there its not the same",
"Look at this, is it not so",
"Look at this, is it not so",
"Over there - it looks like a bear",
"Over there - it looks like a bear",
"Unknowing of the dreadful words",
"And here - it looks like a wolf",
"And here - it looks like a wolf",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"",
"",
"",
"This blessed Altai",
"This blessed Altai",
"His arrow strikes true",
"His arrow strikes true",
"His actions are quick",
"His actions are quick",
"His horse - beautiful",
"His words are elegant",
"Listen, listen, listen!",
"Listen, listen, listen!",
"Listen, listen, listen!",
"Listen, listen, listen!",
"Listen, listen, listen!",
"",
"",
"",
"Finally, Batyr said:",
"Finally, Batyr said:",
"In the future",
"In the future",
"On this plain, like a carpet",
"On this plain, like a carpet",
"On this beautifully enrobed Altai",
"On this beautifully enrobed Altai",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"",
"",
"",
][bt(64,15)]


// The meter code is from D3schnot

ds=0 // Downsampling
vol=0 //Volume
	var l = comp => ds>=1?(abs(comp%256)-ft)/2:abs(comp%256)/(vol?2:1)+(vol?64:0)-128

   var meter = [
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
'██████████████████████████████ ','███████████████████████████████'][(abs(l(M(0)+M(1)))/4&31)]
	var volume_meter = '\n\n              <Master>\n⧸|'+meter+'|⧹'+'\n⧹|'+meter+'|⧸\n '

throw Display =
Title +
"\n\n"+
"[------------] Lyrics [------------]"+
"\n"+
Lyrics+
"\n"+
Roman +
"\n" +
English +
"\n" +
"[----------------------------------]"+
"\n"+
volume_meter
},

disp>0||(t/8.15%1%1)?MM:info()