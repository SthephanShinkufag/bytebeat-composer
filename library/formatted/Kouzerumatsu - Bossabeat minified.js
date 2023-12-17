// bossabeat; minification: Kouzerumatsukite (6 aug 2023)
sd =
	'NNNNNNNNNN  BB  BB  SSSSOOOONNNNNNN NNNNNNN NN  BBBBBBB NNNNNN  ' +
	'OOOOOOOOOO  CC  CC  OOOOLLLLJJJJJJJ JJJJJJJ JJ  7777777 JJJJJJ  ' +
	'NNNNNNNNNN  BB  BB  SSSSOOOONNNNNNN NNNNNNN NN  BBBBBBB NNNNNN  ' +
	'OOOOOOOOOO  CC  CC  OOOOLLLLJJJJJJJ JJJJJJJ JJ  7777777 JJJJJJ  ' +
	'NNNNNNNNNN  BB  BB  SSSSOOOONNNNNNN NNNNNNN NN  BBBBBBB NNNNNN  ' +
	'OOOOOOOOOO  CC  CC  OOOOLLLLJJJJJJJ JJJJJJJ JJ  7777777 JJJJJJ  ' +
	'QQQQQQQQQQ  EE  EE  QQQQOOOONNNNNNN NNNNNNN NN  BBBBBBB NNNNNN  ' +
	'SSSSSSSSSS  GG  GG  XXXXSSSSSSSSSSS SSSSSSS SS  GGGGGGG SSSSSS  ',
td =
	'            JJ  ECCCEE  GGGGEEEEEEEECC      GEEEEEEEKK  HHHHGG  ' +
	'GEEEEEEE    GEEE    HGGGHH  IHHHHHHHGGGG    KJJJJJJJLNP         ' +
	'            JJ  ECCCEE  GGGGEEEEEEEECC      GEEEEEEEEE  DCCCBB  ' +
	'A9999999    A99999  CCCC99  65555555444455  877777779BD         ' +
	'            JJ  ECCCEE  GGGGEEEEEEEECC      GEEEEEEEKK  HHHHGG  ' +
	'GEEEEEEE    GEEE    HGGGHH  IHHHHHHHGGGG    KJJJJJJJHHHHGG  DCCC' +
	'CCCCBBBBCC  FEEEEEEEGIK                             GGGGHH  HGGG' +
	'GGGGGGGGGGGGGGGGGGGGIKMO                                        ',
pd =
	'CGJNCGJNCGJNCGJNCGJNCGJNCGJNEGKNEGKNEGKNEGKNEGKNEGKNEGKNEGKNEGKN' +
	'EHLOEHLOEHLOEHLOEHLOEHLOEHLOGJLOGJLOGJLOGJLOGJLOGJLOGJLOGJLOGJLO' +
	'CGJNCGJNCGJNCGJNCGJNCGJNCGJNEGKNEGKNEGKNEGKNEGKNEGKNEGKNEGKNEGKN' +
	'EHLOEHLOEHLOEHLOEHLOEHLOEHLOFJLOFJLOFJLOFJLOFJLOFJLOFJLOFJLOFJLO' +
	'CGJNCGJNCGJNCGJNCGJNCGJNCGJNEGKNEGKNEGKNEGKNEGKNEGKNEGKNEGKNEGKN' +
	'EHLOEHLOEHLOEHLOEHLOEHLOEHLOGJLOGJLOGJLOGJLOGJLOGJLOGJLOGJLOGJLO' +
	'CEJNCEJNCEJNCEJNCEJNCEJNCEJNDGKNDGKNDGKNDGKNDGKNDGKNDGKNDGKNDGKN' +
	'EHLOEHLOEHLOEHLOEHLOEHLOEHLOGHLOGHLOGHLOGHLOGHLOGHLOGHLOGHLOGHLO',
qd =
	'      CGJ      CGJ         EGK      EGK   EGK         EHL      EHL         GLO      GLO   GLO   ' +
	'      CGJ      CGJ         EGK      EGK   EGK         EHL      EHL         FLO      FLO   FLO   ' +
	'      CGJ      CGJ         EGK      EGK   EGK         EHL      EHL         GLO      GLO   GLO   ' +
	'      CGJ      CGJ         DGK      DGK   DGK         EHL      EHL         CHL      CHL   CHL   ',

sr = 44100,
T = t / sr * 5,
F = x => x * T | 0,
f = x => 2 ** ((33 - parseInt(x, 36)) / 12) * 440,
tri = x => (x ^ -(x >> 8 & 1)) & 255,
squ = x => x & 256,
saw = x => x & 511,
swb = x => x & 2047,
noi = x => (sin(x ** 4) * 255) & 255,

1.5 * (
	tri(t * f(td[F(4) % 512 - 0]) >> 8) / 8 +
	tri(t * f(td[F(4) % 512 - 8]) >> 8) / 16 +
	swb(t * f(sd[F(4) % 512 - 0]) >> 8) / 64 +
	squ(t * f(qd[F(1) * 3 % 384 + 0]) >> 8) / 32 +
	squ(t * f(qd[F(1) * 3 % 384 + 1]) >> 8) / 32 +
	squ(t * f(qd[F(1) * 3 % 384 + 2]) >> 8) / 32 +
	saw(t * f(pd[F(1) * 4 % 512 + 0]) >> 8) / 48 +
	saw(t * f(pd[F(1) * 4 % 512 + 1]) >> 8) / 48 +
	saw(t * f(pd[F(1) * 4 % 512 + 2]) >> 8) / 48 +
	saw(t * f(pd[F(1) * 4 % 512 + 3]) >> 8) / 48 +
	noi((F(16) % 16 == 0) * int(t)) / 8 +
	noi((F(2) % 16 == 4) * int(t * .35)) / 6 * (1 - (2 * T) % 1) +
	noi((F(2) % 16 == 10) * int(t * .35)) / 6 * (1 - (2 * T) % 1) +
	noi((F(4) % 32 == 28) * int(t * .45)) / 6 * (1 - (2 * T) % 1) +
	noi((F(8) % 256 == 252) * int(t * .35)) / 8 +
	noi((F(8) % 512 == 496) * int(t * .35)) / 8);
