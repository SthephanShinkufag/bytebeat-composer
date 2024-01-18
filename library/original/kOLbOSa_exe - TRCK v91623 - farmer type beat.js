/*
    \==#==/  #===#  /===#  |  /
   	 |     |   /  #      | /
       |		 #==#   #      #=\
       |		 |   \  \===#  |  \ 

   we dont use notes, notes use you


		    9 / 16 / 2023 ver
*/



// tone base (256 whatevertones)

ht = t/16000*64,

// speed and relay settings

tempo = 8,
speed = 11,

bittempo = 15,

// whatever is this do not change that

counter = t>>tempo,
speedc = t>>speed,

// instruments

kick = "f0ff00fff000ffff0000fffff00000fffff000000ffffff0000000fffffff000",

sawtooth = "0000111122223333444455556666777788889999aaaabbbbccccddddeeeeffff",

square = 
"00000000000000000000000000000000ffffffffffffffffffffffffffffffff",

sine = 
"000011112223334466999aaabbbbccccccbbbbaaa99966443332221111000000",

pipe = 
"31425364758697a8b9cadbecfd31425364758697a8b9cadbecfd314253647586",



//functions for instruments

k = (div, norel=true) => norel ? parseInt(kick[(ht*div)&63],16)*8
									: parseInt(kick[(ht*div)&63],16)*(bittempo-((counter&bittempo)+1)+1)/2,
st = (div, norel=true) => norel ? parseInt(sawtooth[(ht*div)&63],16)*8
									: parseInt(sawtooth[(ht*div)&63],16)*(bittempo-((counter&bittempo)+1)+1)/2,
sq = (div, norel=true) => norel ? parseInt(square[(ht*div)&63],16)*8
									: parseInt(square[(ht*div)&63],16)*(bittempo-((counter&bittempo)+1)+1)/2,
sn = (div, norel=true) => norel ? parseInt(sine[(ht*div)&63],16)*8
									: parseInt(sine[(ht*div)&63],16)*(bittempo-((counter&bittempo)+1)+1)/2,
pp = (div, norel=true) => norel ? parseInt(pipe[(ht*div)&63],16)*8
									: parseInt(pipe[(ht*div)&63],16)*(bittempo-((counter&bittempo)+1)+1)/2,
ns = (div, norel=true) => norel ? (sin(t>>div)*6400)&7
									: ((sin(t>>div)*6400)&7)*(bittempo-((counter&bittempo)+1)+1)/2,



playlist = [
pp(300),pp(400),pp(500),pp(400),
pp(300),pp(400),pp(500),pp(400),
pp(300),pp(400),pp(500),pp(400),
pp(300),pp(400),pp(500),pp(400),
pp(300),pp(400),pp(600),pp(400),
pp(300),pp(400),pp(600),pp(400),
pp(300),pp(400),pp(550),pp(400),
pp(300),pp(400),pp(550),pp(400),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(600)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(600)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(600)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(600)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false),
pp(300),pp(400),pp(600),pp(400),
pp(300),pp(400),pp(600),pp(400),
pp(300),pp(400),pp(550),pp(400),
ns(1,false)*2,ns(1,false),
ns(1,false)*2,ns(1,false),
pp(300)+ns(3,false)*2+sq(200,false),pp(400),pp(500)+ns(1,false)*2,pp(400), // pp+ns+sq,pp,pp+ns,pp
pp(300)+ns(3,false)*2,pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2+sq(200,false),pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false)*4,
pp(300)+ns(3,false)*2+sq(300,false),pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2+sq(250,false),pp(400),pp(550)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false)*4,
pp(300)+ns(3,false)*2+sq(200,false),pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2+sq(200,false),pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false)*4,
pp(300)+ns(3,false)*2+sq(300,false),pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2+sq(250,false),pp(400),pp(550)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false)*4,
pp(300)+ns(3,false)*2,pp(400),pp(500),pp(400), // pp+ns,pp,pp+ns,pp
pp(300)+ns(3,false)*2,pp(400),pp(500),pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(500),pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false)*4,
pp(300)+ns(3,false)*2+sq(300,false),pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2+sq(250,false),pp(400),pp(550)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false)*4,
pp(300)+ns(3,false)*2+sq(200,false),pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2+sq(200,false),pp(400),pp(500)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(500)+ns(1,false)*2,pp(400)+ns(1,false)*4,
pp(300)+ns(3,false)*2+sq(300,false),pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(600)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2+sq(250,false),pp(400),pp(550)+ns(1,false)*2,pp(400),
pp(300)+ns(3,false)*2,pp(400),pp(550)+ns(1,false)*2,pp(400)+ns(1,false)*4,

],


playlist[speedc%playlist.length]/1.4