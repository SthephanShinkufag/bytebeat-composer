t -= 256*16,
b = floor(t/8192),
x = floor(t/256)%32,
y = (t%8-3),
m = floor(t/131072),

J = n => n==[][0]?0:n,
R = n => tan(1/sin(n))&255,

spinline = 255*((x==0&&y==0)+[
	(x==0&&y>=0&&y<=3),
	(x==1&&y==1)+(x==2&&y==2),
	(y==0&&x>=0&&x<=3),
	(x==1&&y==-1)+(x==2&&y==-2),
	(x==0&&y>=-3&&y<=0)+(x==31&&y==-1)+(x==30&&y==-2),
	(y==0&&x>=29&&x<=31),
	(x==31&&y==1)+(x==30&&y==2),
	0
][b%8]),

snare = b%8==4?R(x+y*100+floor(t/256)):0,

fade = ((t/8192%16)/32)*R(x+y+floor(t/256)),

flipper = 255*[
	(x==0&&y>=-3&&y<=3)+(y==0&&x>=29&&x<=31),
	(y==0&&x>=0&&x<=3),
	(x==0&&y>=-3&&y<=3),
]["010101010101012201010101012012222"[b%32]],

kick = (100/(((t+16384)%32768)-16384)&1)*255,

bass = (t&(([1,2**(3/12),2**(2/12),2**(-2/12)][m%4]*t/440)&1))*t/128,

flipspin = (flipper|spinline),

final = (spinline|kick)*"1111111111110000"[b%16]+255*((x<=15&&y>=-3&&y<=0)|kick)*"0000000000001000"[b%16],

J([

spinline                , spinline                , spinline                , spinline                     ,
spinline|snare          , spinline|snare          , spinline|snare          , spinline|snare|fade          ,
flipper                 , flipper                 , flipper                 , flipper                      ,
flipspin                , flipspin                , flipspin|snare          , flipspin|snare|fade          ,
bass+kick               , bass+kick               , bass+kick               , bass+kick                    ,
bass+kick|spinline      , bass+kick|spinline      , bass+kick|spinline      , bass+kick|spinline|fade      ,
bass+kick|flipper|snare , bass+kick|flipper|snare , bass+kick|flipper|snare , bass+kick|flipper|snare      ,
bass+kick|flipspin|snare, bass+kick|flipspin|snare, bass+kick|flipspin|snare, bass+kick|flipspin|snare|fade,
bass|flipper            , bass|flipper            , bass|flipper            , bass|flipper                 ,
bass|flipper            , bass|flipper            , bass|flipper            , bass|flipper|fade            ,
spinline|kick           , spinline|kick           , spinline|kick           , final                        ,

][m])