/*
 * abandoned communications building
 * beep-eep
 * for spring tracks ix
 *
 * use https://greggman.com/downloads/examples/html5bytebeat/html5bytebeat.html
 * at 44kHz, infix
 */

// originally at 22kHz
s = t/2,
128 + sin(s * (((sqrt(s) % 10) ^ 2) % 8)/16 + 

sin(s * (((sqrt(s) % 10) ^ 5) % 8)/16 +

sin(s * (((sqrt(s) % 10) ^ 6) % 10)/32) * (((sqrt(s) % 15) ^ 2) % 50)/16
) * (((sqrt(s) % 24) ^ 3) % 50)/8
) * (((sqrt(s) % 10) ^ 2) % 50) +

sin(((((s/100000)^(-10))%10000)%30)/200 * s) * ((((s/1000)^(-10))%10000)%30)/2 +

sin(s * 0.05) * (tan(s * 0.00001)%50) +

sin(s * 0.2 * ((s%50)/10)*((s%20)^(0.2))%5 * 
sin(s * 2.6 * ((s%50)/100000)*((s%20)^(0.2))%5)/2) * (tan(s/200000)%10)/2 +

sin(s * 0.1 * ((2^(((((s/500)%20)^(0.2))/10)%70))%60)) * 
((2^(((((s/5000)%30)^(0.02))/10)%70))%60)/(2 - (s/2000)%2 + 1)/4 + 

sin(s * ((sqrt((s/100)%100)^(log((s/10000)%10))%2)/1e3) * 
(log((s/10000)%((s/((sin(s*0.00001)*1e12)))%40) + 10)%10)) * 
(log((2)%((s/1)))%30)*5
