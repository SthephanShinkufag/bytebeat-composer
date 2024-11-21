t=3*t,patLength=16, bt=t>>19&(patLength-1),

tune=1.428, 

// WARNING: Do not take anything out of this "!&&t()" statement:

!t&&(

space='',

mel1a='7CF EF5 7AC HFEA',
mel1b='8CF8CF8C8CF8FHCFJCFJCFCFJCFJHFEC',
mel2a=' 7AC E87 0AC FAC',
mel2b='7AC CF8AF87 57A C5CFEFH 8CA CFA7',
mel3a='CJ M FHEF CJ M C8 CJ HFEC A CEH7 C F HJEF CJ M C8 CF 7AC8 7 CF87',
mel3b='78CH JEF ECA7 C7AC A75 CE7 57823 7CH JEF ECA7 C7AC ACH CHF CAEHJ',

melBasA='CFHJCF8A',
melBasAalt='CF8ACFHJ',
melBasA2='028A7A32',
melBasA2alt='7A32028A',
melBasB='88888888888888AACCCCCCCCCCCCCCAA',


// 3671937

seq1=t=>tune*(t/32)*2**(parseInt([

mel1a[(t>>13)%mel1a.length],
mel1a[(t>>13)%mel1a.length],
mel1a[(t>>13)%mel1a.length],
mel1b[(t>>13)%mel1b.length],
mel1a[(t>>13)%mel1a.length],
mel1a[(t>>13)%mel1a.length],
mel1a[(t>>13)%mel1a.length],
mel1a[(t>>13)%mel1a.length],
mel1a[(t>>13)%mel1a.length],
mel1b[(t>>13)%mel1b.length],
mel1a[(t>>13)%mel1a.length],
mel1a[(t>>13)%mel1a.length],
mel1b[(t>>13)%mel1b.length],

][bt],36)/12)||0,

seq2=t=>tune*(t/32)*2**(parseInt([

space,
space,
space,
space,
space,
mel2a[(t>>13)%mel2a.length],
mel2a[(t>>13)%mel2a.length],
mel2a[(t>>13)%mel2a.length],
mel2a[(t>>13)%mel2a.length],
mel2b[(t>>13)%mel2b.length],
mel2a[(t>>13)%mel2a.length],
mel2a[(t>>13)%mel2a.length],
mel2b[(t>>13)%mel2b.length],

][bt],36)/12)||0,

seq3=t=>tune*(t/32)*2**(parseInt([

space,
space,
space,
space,
space,
mel3a[(t>>13)%mel3a.length],
mel3a[(t>>13)%mel3a.length],
mel3a[(t>>13)%mel3a.length],
mel3a[(t>>13)%mel3a.length],
mel3b[(t>>13)%mel3b.length],
mel3a[(t>>13)%mel3a.length],
mel3a[(t>>13)%mel3a.length],
mel3b[(t>>13)%mel3b.length],

][bt],36)/12)||0,

seqBass=t=>tune*(t/32)*2**(parseInt([

space,
melBasA[(t/16>>13)%melBasA.length],
melBasA[(t/16>>13)%melBasA.length],
melBasB[(t>>13)%melBasB.length],
space,
melBasA[(t/16>>13)%melBasA.length],
melBasA[(t/16>>13)%melBasA.length],
melBasA[(t/16>>13)%melBasA.length],
melBasA[(t/16>>13)%melBasA.length],
melBasB[(t>>13)%melBasB.length],
melBasAalt[(t/16>>13)%melBasAalt.length],
melBasAalt[(t/16>>13)%melBasAalt.length],
melBasB[(t>>13)%melBasB.length]

][bt],36)/12)||0,

seqSubBass=t=>tune*(t/32)*2**(parseInt([

space,
melBasA2[(t/16>>13)%melBasA2.length],
melBasA2[(t/16>>13)%melBasA2.length],
melBasB[(t>>13)%melBasB.length],
space,
melBasA2[(t/16>>13)%melBasA2.length],
melBasA2[(t/16>>13)%melBasA2.length],
melBasA2[(t/16>>13)%melBasA2.length],
melBasA2[(t/16>>13)%melBasA2.length],
melBasB[(t>>13)%melBasB.length],
melBasA2alt[(t/16>>13)%melBasA2alt.length],
melBasA2alt[(t/16>>13)%melBasA2alt.length],
melBasB[(t>>13)%melBasB.length],

][bt],36)/12)||0

),

sfx=(random(t)/cbrt(t/10)),

del1=(1-t%8192/10E3),

i1=t=>((sin(seq1(t))/5+cos(seq1(t)*3)/8+cos(4*sin(seq1(t)*1.5)*sin(seq1(t)))/5*cos(seq1(t))*sin(seq1(t)/2))*del1)||0,

ins1L=i1(t)+i1(t-12288)/2+i1(t-24576)/4+i1(t-36864)/8+i1(t-49152)/16,
ins1R=i1(t)+i1(t-12288)/5+i1(t-24576)/10+i1(t-36864)/15+i1(t-49152)/20,

ins2=t>2621440&&cos(cbrt(sin(seq2(t)/4)))*(1-t%8192/16E3)*atan(tan(sin(seq2(t)/4+cbrt(cos(seq2(t))/2))/2))+atan(tan(seq2(t)/8))/20*atan(10*tan(seq2(t)/2))/1.5*atan(10*tan(seq2(t)*2))/3,

l1=t=>((sin(seq3(t))/2+sin(cos(seq3(t)*2))/6+sin(cos(seq3(t)*4))/10)/3)||0,

leadL=(l1(t)+l1(t-12288)/2)+l1(t-24576)/4+l1(t-36864)/8+l1(t-49152)/16,
leadR=(l1(t)+l1(t-12288)/5)+l1(t-24576)/10+l1(t-36864)/15+l1(t-49152)/20,

bass=(sin(seqBass(t)/2)/4*cos(seqBass(t)/4)/2+sin(seqBass(t)/8)/7*sin(seqBass(t)/4)+sin(seqSubBass(t)/2)/7)+cbrt(sin(seqBass(t)/4))/8+atan(tan(seqSubBass(t)/16))/8,

// t>2621440&&



!t&&(

drmseq1l='11011110101010111101111010111111',
drmseq1r='01101100101010110110110010010111',
drmseq2l='11011110101010111101111010111111',
drmseq2r='01101100101010110110110010010111',
drmseq3l='1010101010101010',
drmseq3r='0101010101010101'

),

drm1=t>262144&&random(t)/2.5*parseInt([

drmseq1l[(t>>13)%drmseq1l.length],
drmseq1l[(t>>13)%drmseq1l.length],
drmseq2l[(t>>13)%drmseq2l.length],
drmseq2l[(t>>13)%drmseq2l.length],
space,
drmseq3l[(t>>13)%drmseq3l.length],
drmseq3l[(t>>13)%drmseq3l.length],
drmseq3l[(t>>13)%drmseq3l.length],
drmseq3l[(t>>13)%drmseq3l.length],
drmseq3l[(t>>13)%drmseq3l.length],
drmseq3l[(t>>13)%drmseq3l.length],

][bt],2)*(1-t%8192/8E3)||0,

drm2=t>262144&&random(t)/2.5*parseInt([

drmseq1r[(t>>13)%drmseq1r.length],
drmseq1r[(t>>13)%drmseq1r.length],
drmseq2r[(t>>13)%drmseq2r.length],
drmseq2r[(t>>13)%drmseq2r.length],
space,
drmseq3r[(t>>13)%drmseq3r.length],
drmseq3r[(t>>13)%drmseq3r.length],
drmseq3r[(t>>13)%drmseq3r.length],
drmseq3r[(t>>13)%drmseq3r.length],
drmseq3r[(t>>13)%drmseq3r.length],
drmseq3r[(t>>13)%drmseq3r.length],

][bt],2)*(1-t%8192/8E3)||0,

skick=t>131072&&sin(2**(-t/256%32+8))/2,
kick=t>131072&&sin(2**(-t/512%32+8))/2,

basdrm=t<2621440&&(t>524288&&(300**((t*[[1,4,2,4,,4,2,8,4],[1,4,,4,2,4,8,16]][!(~t>>16&1)|0][7&t>>13]%32768)**.04)&128)/325),

basdrm2=(t>2621440&&(256*cbrt((t>>9)%64>>107?t&2047:t&4095)|(t>>13&1?64*t:0))&128)/300,

bell=t>524288&&sin(t)/4*(1-t%4095/3E3)/2,

metaldrmL=t>2621440&&(cbrt(sin((t/32)^3)/3+cos(t/64^3))*(1-t%8192/10E3))/1.75,

metaldrmR=t>2621440&&(cbrt(sin((t/32)^4)/3+cos(t/64^4))*(1-t%4096/4E3))/1.75,

[

bass+ins1L+ins2+leadL+sfx+(((t<2621440&&(drm1))+(t>2621440&&(drm1*1.5))+(drm2/3)+(kick+skick/2)+(basdrm-0.25)+bell+(basdrm2-0.25)+metaldrmL))/1.25

,bass+ins1R+ins2+leadR+sfx+(((t<2621440&&(drm2))+(t>2621440&&(drm2*1.5))+(drm1/3)+(skick+kick/2)+(basdrm-0.25)+bell+(basdrm2-0.25)+metaldrmR)/1.25
)

], [bass+ins1L+ins2+leadL,bass+ins1R+ins2+leadR]