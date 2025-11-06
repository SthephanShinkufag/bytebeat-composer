// HydroCORE X (rawstyle remix of HydroCORE)

// i spent way too much time on this

// i'm supposed to be asleep right now

// i don't regret it though

BPM=120,
sR=sampleRate=48e3,
sPB=samplesPerBeat=32768,
tt=(t/sR*256)*440*2**(-6/12),
ts=t*abs(BPM/((60*sR)/sPB)),
dsp=1, // set to 0 to disable dsp visuals to hopefully improve performance (and as a bonus you'll annoy me because that's literally why i made over half the code)
lm=(a,mn=50,mx=-50)=>min(mn,max(mx,sqrt(cbrt(abs(a))**1.1)*9)),

// feeshbread's reverb and filters

t||(fb1=fb2=0,wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,
lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),
hpf=highPassFilter=(a,c)=>a-lpf(a,c),
bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),
bbf=bandBoostFilter=(a,hc,lc,v)=>a+bpf(a,hc,lc)*v,
nf=notchFilter=(a,lc, hc)=>(hpf(a, hc)+lpf(a,lc))/1.75,
lbf=lowBoostFilter=(a,c,v)=>a+lpf(a,c)*v,
hbf=highBoostFilter=(a,c,v)=>a+hpf(a,c)*v,
n=noise=c=>(ni=fxi++,fx[ni]??=0,fx[ni]=fx[ni]+(random()-.5-fx[ni])*c),
dly=multiTapDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;},
alpf=asyncLowPassFilter=(a,cu,cd)=>(si=fxi++,fx[si]??=0,sr=fx[si],fx[si]+=(a-sr)*(sr<a?cu:cd)),
cmp=compressor=(a,th,ra,at,rl,sc=a)=>(ci=fxi++,fx[ci],a/(alpf(max(abs(sc)-th,0),at,rl)/th*ra+1))),
fxi=0,
dt=t,
q=(30*sR)/(BPM*2/3),
rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65},{t:q*1.005+wsin(t*1.005/256),m:.75,fb:.5}],[{t:11e2-wsin(t/230),m:.5,fb:.15},{t:13e3-wsin(t/270),m:.5,fb:.35},{t:14e3-wsin(t/280),m:.1,fb:.45},{t:4e4-wsin(t/400),m:.1,fb:.65},{t:q*.995-wsin(t*.995/256),m:.75,fb:.5}]],
mn=(a,mi,ma)=>max(min(a,ma),mi),

phase=sqrt(1E3*(ts%32768)**.9),
env=(ts/32768%128),
base=nf(abs(phase%128-96)+random()||0,.08,.01)*2,
iN=f=>isNaN(f)?0:f,
kc=(1-ts/8192%1)*!(ts>>13&3),
pt=ts%32768,
sc=sideChain=(ts/32768%1*.8+.2)*(1-kc)**2**3,
qs=quadSlice=((ts>>15&15)==15?~ts>>12&1:1),

lr=lr=>(

PITCH=tn=>tt*PI/256*(lr?1.005:.995)*pow(2,tn/12),

mel=[0,,7,,14,,10,,12,,7,3,,7,0,,0,,7,,14,,15,,17,,15,14,,,10,,],

bseq=[0,0,0,0,-4,-4,-2,-5],

chrd1=[0,0,0,0,0,0,-2,-2],
chrd2=[3,3,3,3,3,3,2,2],
chrd3=[7,7,7,7,8,8,5,7],

_kick    ='00111111111111110011111111111111000000000000000000000000'[ts>>18],
_snare   ='00001111111111110000000011111111000000000000000000000000'[ts>>18],
_hihat   ='00000000111111110011111111111111111111110000000000000000'[ts>>18],
_swells  ='11110000000000000011111111111111111100001111000000000000'[ts>>18],
_distkick='00000000000000000011111111111122000000000000000000000000'[ts>>18],
$distkick='00000000000000000011111111112235000000000000000000000000'[ts>>18],
_riser   ='00000000000011110000222200004444000000000000000000000000'[ts>>18],
_lead    ='11111111111111111111111111111111111111110000000010000000'[ts>>18],
_lead2   ='00000000000000000011111111111111111111111111111110000000'[ts>>18],
_bass    ='11111111111111110011111111111111111111111111111110000000'[ts>>18],
_chords  ='00001111111111110011111111111111111111110000000010000000'[ts>>18],

lead=iN(tan(sin((a=PITCH(mel[(ts>>13)%mel.length]))+asin(sin(a)*1.1)/16))),
lead2=iN(tan(sin((a=2*PITCH(mel[(ts>>13)%mel.length]))+asin(sin(a)*1.4)/16))),
bass=((bass_=x=>((PITCH(bseq[(ts>>17)%bseq.length])*20.25*x%256-128)/128))(1)+bass_(2)+bass_(3)+bass_(4))/5,
chords=((chords_=(chrd,x)=>((PITCH(chrd[(ts>>17)%chrd.length])*20.25*x%256-128)/128))(chrd1,1)+chords_(chrd2,1)+chords_(chrd3,1))/5,
kick=atan(1.5*sin(8*sqrt(pt)**.6))*kc*40,
snare=(atan(1.5*sin((1e7+(pt)*6.25)*(1-(1/(pt*5+.1))*2)/80/8))*54*(max((1-pt/32768*2),0)**1.8)*(ts>>15&1)+(fb1=bpf(fb1*.5+n(.5)*240*(1-((ts/65536+.5)%1))**2,.5,.5)*.1**(500/pt)))*qs,
hihat=n(.4)*(ts/8192%1-1)*sc*qs*100,
distkick=hbf(lpf(min(max(sin(9*cbrt(ts%(32768/$distkick)))*15*(ts/32768%1-1)**2,-.5),.5),.9),.7,2)*50,
swells=n(.05)*100*(ts/32768%1)*(ts/1048576%1-1)*qs,
riser=n(.05)*100*sc*(ts/1048576%1)*qs,

synths=

(lead*=_lead)+

(lead2*=_lead2*3)+

(bass*=_bass)+

(chords*=_chords),

synths=cmp(dly(synths,rvrbHeads[lr],.6,x=>tanh(bpf(x,.01,.8)/200)*100),20,1,.01,.2e-3)*(ts>>18>1?sc*1.5:1)*qs*5,

drums=(

(kick*=_kick)+

(snare*=_snare)+

(hihat*=_hihat)+

(distkick*=_distkick/1.5)
)/5,
	
noise=
((swells*=_swells*3)+

(riser*=_riser))/5,
(drums+synths+noise)/8),dsp?(t&511)==0?(()=>{ throw new EvalError

// I know, I know, this is an evaluation error when it's really supposed to be a normal error or... actually not an error at all... but I did it for the funnies stfu

// would've compressed the title, but escape() doesn't like the font characters. whatever. it just looks ugly imo

 (

`\n\n░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░      ░▒▓█▓▒░░▒▓█▓▒░        \n░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░        \n░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░        \n░▒▓████████▓▒░░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓██████▓▒░         ░▒▓██████▓▒░         \n░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░        \n░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░ \n░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░   ░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░`+eval(unescape(escape`恜湜渭⁛剁坓呙䱅⁒䕍䥘⁏䘠䡙䑒佃佒䕝‭⁜渭⁛剅剅䵉堠䉙⁅卌䅓䡍䅃䡉久崠ⴠ屮ⴠ孏剉䝉乁䰠剅䵉堠䉙⁐剉乃䕓卐剉千䥌䱁偔崠ⴠ屮ⴠ孏剉䝉乁䰠协乇•䡙䑒佘䥄䔢⁂夠䵁剉但䅎ㄷㅝ‭⁜湜湜渭⁛䑓倯噉单䅌䥚䅔䥏丠䑉卐䱁夠䉙⁅卌䅓䡍䅃䡉久崠ⴠ屮ⴠ孔䥍䔠䑉卐䱁夠䉙⁐剉乃䕓卐剉千䥌䱁偔崠ⴠ屮ⴠ孃佖䕒⁏䘠≃佒䔢⁆剏䴠呈䔠啎䑅剔䅌䔠体吠䉙⁔佂夠䙏塝‭⁜湜渭⁛坈夠䑉䐠䤠呙偅⁔䡉匠䵕䍈⁁乄⁗䡙⁄䥄⁉⁔奐䔠䥔⁉丠䅌䰠䍁偓⁌佌崠ⴠ屮怫恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫ਊ੠屮簠㸾⁔⁉⁍⁅††††簠怫⡦汯潲⡡扳⡴⤯獒⼳㘰⼱〩⤫怺怫⡦汯潲⡡扳⡴⤯獒⼶〰⤥㘩⬨晬潯爨慢猨琩⽳刯㘰⤥㄰⤫怺怫⡦汯潲⡡扳⡴⤯獒⼱〩┶⤫⠨晬潯爨慢猨琩⽳利⤥㄰⤫怮怫⡦汯潲⡡扳⡴⤯獒⨱〩┱〩⬨晬潯爨慢猨琩⽳刪㄰〩┱〩⬨晬潯爨慢猨琩⽳刪ㅥ㌩┱〩⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫੠屮屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼⁼簠䰠䔠䘠吠†††⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨汲⠰⤪㌲⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼⁼簠删䤠䜠䠠吠††⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨汲⠱⤪㌲⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籜湠⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫੠屮簠⬫⁓⁙⁎⁔⁈⁓††籠⭠屵㈵㠸怮牥灥慴⡡扳⡦汯潲⡳祮瑨猪㠩⤫ㄩ⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫੠屮簠ⴭ⁌⁅⁁⁄‱†††籠⭠屵㈵㠸怮牥灥慴⡡扳⡦汯潲⡬敡搪㌲⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼‭ⴠ䰠䔠䄠䐠㈠††⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨汥慤㈪㌲⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼‭ⴠ䈠䄠匠匠†††⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨扡獳⨳㈩⤫ㄩ⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫੠屮簠ⴭ⁃⁈⁏⁒⁄⁓††籠⭠屵㈵㠸怮牥灥慴⡡扳⡦汯潲⡣桯牤猪㌲⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籜湠⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫੠屮簠⬫⁄⁒⁕⁍⁓†††籠⭠屵㈵㠸怮牥灥慴⡡扳⡦汯潲⡤牵浳⨸⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼‭ⴠ䬠䤠䌠䬠†††⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨歩捫⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼‭ⴠ删䄠圠䬠䤠䌠䬠⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨摩獴歩捫⨳⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼‭ⴠ匠丠䄠删䔠††⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨獮慲攪㈩⤫ㄩ⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫੠屮簠ⴭ⁈⁉⁈⁁⁔†††籠⭠屵㈵㠸怮牥灥慴⡡扳⡦汯潲⡨楨慴⨳⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籜湠⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怫੠屮簠⬫⁎⁏⁉⁓⁅†††籠⭠屵㈵㠸怮牥灥慴⡡扳⡦汯潲⡮潩獥⨸⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼‭ⴠ匠圠䔠䰠䰠匠†⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨獷敬汳⨲⤩⬱⤫੠屮簭ⴭⴭⴭⴭⴭⴭⴭⴭⴭ籠⬊恜湼‭ⴠ删䤠匠䔠删††⁼怫恜甲㔸㡠⹲数敡琨慢猨晬潯爨物獥爪㈩⤫ㄩ⬊恜湼ⴭⴭⴭⴭⴭⴭⴭⴭⴭ⵼怠`.replace(/u(..)/g,"$1%")))

)})():[lr(0),lr(1)]:[lr(0),lr(1)]