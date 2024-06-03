$=t/44100%72,

// the instrument function
// it can act as both a drum and a square wave
M=(x,o,s,p=1/2)=>(
    c=x[$*s%x.length|0],
    T=($%(1/s))*8E3|0,
    (
        c=="_"?1E3/T:
        c=="^"?cbrt(3**((T+128)/3)):
        c=="-"?sin(T**3)*max(0,2-(T>>9)):
        ($*2**((parseInt(c,36)+o)/12)*448)%2<p*2
    )&1
),

(
// drums & bass
// here i have a special technique to merge them together called XOR
(M("_ ^- ^^_ -^ _ --_ ^- ^^_ -^ _---",0,8)
^M(($>4&$<8)|($>20&$<24)
   ?"C OC HJC OJC CMO8 K7 HJC        "
   :$<24
   ?"C OC HJC OJC CMO8 K7 HJC JOC CMO"
   :$<56
   ?"C OC MO9 GL9GL9G8 K7 HJC JOC CMO"
   :"8 K8 JK8 8JK8JK8A MA JMB INBINBIC OC MOC JOCJOCJC OC MOC JOCJOCJ"
   +"8 K8 JK8 8JK8JK8A MA JMB INBINBIC OC MOC JOCJOCJB NB INA HM9HL9H"
,-24,8,1/3)
)

// main melody
+(($<7.5|$>=40?0:M($<8
   ?"57HJ"
   :"EEEEFFAAAA7777CCCCC 553322223333HHHH  MMMMFFFFMMMMJJHJEEFFFFHHJJ",
0,$<8?8:16))
// backing melody
+($<23.5?0:M($<24
   ?"35AC"
   :$<56
   ?"7777AA7777555557777 77AA555577778888  AAAACCCCEEEEFFEEAACCCCAACC"
   :"HJHHHHHH   FHJHFEEFFAACC77 AACEFEEEAAACCCCCCCCC                 "
   +"HJHHHHHH   FHJHFEEFFAACC77 AACEFEEEAAA7777777  577AACCEEFFEAAACC",
0,$<24|$>56?8:16)))/3*2
// arpeggio
+(($<24|$>=40)?0:M(
    "CCC   CJOCCC   CFJCJO999   CCC9GL99 9CGCGL999CGL"
   +"888   FKO888CFKFKOAAACCC   CFJCJOCCCCFJCJOCCCCFJ"
,0,24,1/4)/3*2)
)*85