/*
*
* Kevvviiinnn Stage 39
* By Symfonikev (Kevin Phetsomphou)
*
* Ported by MarioFan171 (Me)
*
* Made this for fun, I am not affiliated with Symfonikev, 
* Megaman Rock Force Development Team and Capcom
*
* If you had played Megaman Rock Force, you know for sure
* that's Shock Man's Theme
*
* Listen to the original:
* https://www.youtube.com/watch?v=xrad5JjnA7w
*
*/


/* Change this variable to adjust the Pitch for the main melodies:
(1 = Default, 2 = Higher Accuracy to the original) */

trans = 1,

//Here's the code below:

// Notes
x = 0,
F = 1,
Fs = 19/18,
G = 9/8,
Ab = 19/16,
A = 5/4,
As = 4/3,
B = 17/12,
C = 3/2,
Cs= 19/12,
D = 19/11,
Eb= 43/24,
E = 15/8,

// Instruments

melody1=(([
 F, F, F, F, F*2, F*2, 3/2, 3/2, F*2, F*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2, As*2, As*2,
 F, F, F, F, F*2, F*2, 3/2, 3/2, F*2, F*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2, As*2, As*2,
 C*2, C*2, C*2, C*2, C*2, C*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, x, x,
x, x, G*2, G*2, Ab*2, Ab*2, x, x, G*2, G*2, x, x, Ab*2, Ab*2, x, x, G*2, G*2, x, x, G*2, G*2, x, x, Ab*2, Ab*2, As*2, As*2, Ab*2, Ab*2, G*2, G*2, F*2, F*2,
 F, F, F, F, F*2, F*2, 3/2, 3/2, F*2, F*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2, As*2, As*2,
 F, F, F, F, F*2, F*2, 3/2, 3/2, F*2, F*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2, As*2, As*2,
 C*2, C*2, C*2, C*2, C*2, C*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Cs*2, Cs*2, Cs*2, Cs*2, C*2, C*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, C*2, C*2, C*2, C*2, C*2, C*2, C*2, C*2, C*2,
C*2, C*2, C*2, C*2, C*2, x, x, x, x, F*2, F*2, G*2, G*2, x, x, Ab*2, Ab*2, x, x, C*2, C*2, x, x,

// Second Part

 F*4, F*4, F*4, F*4, F*4, F*4, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, F*4, F*4, F*4, F*4, C*2, C*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2,
 Eb, Eb, Eb, Eb, F*2, F*2, G*2, G*2, G*2, G*2, Eb*2, Eb*2, x, x, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, Ab*2, Ab*2, x, x,
 F*4, F*4, F*4, F*4, F*4, F*4, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, F*4, F*4, F*4, F*4, C*2, C*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2,
 Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, 
 F*4, F*4, F*4, F*4, F*4, F*4, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, F*4, F*4, F*4, F*4, C*2, C*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2,
Eb, Eb, Eb, Eb, F*2, F*2, G*2, G*2, G*2, G*2, As*2, As*2, x, x, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, F*4, F*4, F*4, F*4, G*4, G*4, G*4, G*4, Eb*2, Eb*2, x, x,
 F*4, F*4, F*4, F*4, F*4, F*4, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, F*4, F*4, F*4, F*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, G*4, G*4, G*4, G*4, Eb*2, Eb*2, Eb*2, Eb*2, 
F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, F*4, x, x, x, x, C*2, C*2, Eb*2, Eb*2, F*4, F*4,

// Third Part

 Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, F*4, F*4, F*4, F*4, F*4, F*4, C*2, C*2, C*2, C*2, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, F*4, F*4, F*4, F*4, F*4, F*4, G*4, G*4, G*4, G*4,
 Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, G*4, G*4, G*4, G*4, F*4, F*4, F*4, F*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, C*2, C*2, C*2, C*2,
 Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, F*4, F*4, F*4, F*4, F*4, F*4, G*4, G*4, G*4, G*4, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, As*4, As*4, As*4, As*4, 
 C*4, C*4, C*4, C*4, C*4, C*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, As*4, C*2, C*2, Eb*2, Eb*2, F*4, F*4,
 Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, F*4, F*4, F*4, F*4, F*4, F*4, C*2, C*2, C*2, C*2, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, F*4, F*4, F*4, F*4, F*4, F*4, G*4, G*4, G*4, G*4,
 Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, G*4, G*4, G*4, G*4, F*4, F*4, F*4, F*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, G*4, C*2, C*2, C*2, C*2,
 Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, F*4, F*4, F*4, F*4, F*4, F*4, G*4, G*4, G*4, G*4, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, Ab*4, As*4, As*4, As*4, As*4, 
 C*4, C*4, C*4, C*4, C*4, C*4, As*4, As*4, As*4, As*4, As*4, As*4, Ab*4, Ab*4, Ab*4, Ab*4, G*4, G*4, G*4, G*4, G*4, G*4, F*4, F*4, F*4, F*4, F*4, F*4, Eb*2, Eb*2, Eb*2, Eb*2, 

// Ending

F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, F*2, 
x, x, x, x, x, x, F, F, C, C, Eb, Eb, x, x, F*2, F*2, x, x, Eb, Eb, x, x, F*2, F*2, x, x, Eb, Eb, C, C, As, As,
][(2*t>>13)%832]*(trans*t)*(19/21)>>2&127)+(t>>7)&128),

melody2=(([
x, x, x, x, F, F, F, F, C, C, Eb, Eb, x, x, F*2, F*2, x, x, Eb, Eb, x, x, F*2, F*2, x, x, G*2, G*2, G*2, G*2, Eb, Eb, Eb, Eb,
x, x, F, F, F, F, C, C, Eb, Eb, x, x, F*2, F*2, x, x, Eb, Eb, x, x, F*2, F*2, x, x, G*2, G*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Cs, Cs, F*2, F*2, Ab*2, Ab*2, F*2, F*2, Ab*2, Ab*2, Cs*2, Cs*2, F*4, F*4, Cs*2, Cs*2, F*4, F*4, Ab*4, Ab*4, Cs*4, Cs*4, Ab*8, F*8, Cs*8, Ab*4, F*4, Cs*4, Ab*2, F*2,
Eb, Eb, F*2, F*2, F*2, F*2, Eb, Eb, Eb, Eb, F*2, F*2, F*2, F*2, Eb, Eb, x, x, Eb, Eb, x, x, F*2, F*2, G*2, G*2, F*2, F*2, Eb, Eb, C, C,
x, x, x, x, F, F, F, F, C, C, Eb, Eb, x, x, F*2, F*2, x, x, Eb, Eb, x, x, F*2, F*2, x, x, G*2, G*2, G*2, G*2, Eb, Eb, Eb, Eb,
x, x, F, F, F, F, C, C, Eb, Eb, x, x, F*2, F*2, x, x, Eb, Eb, x, x, F*2, F*2, x, x, G*2, G*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, x, x, Ab*2, Ab*2, Ab*2, Ab*2, x, x, Ab*2, Ab*2, x, x, Ab*2, Ab*2, Ab*2, Ab*2, x, x, G*2, G*2, G*2, G*2, G*2, G*2, Eb, Eb,
F*2, C, F*2, C/2, F*2, C, F*2, C/2, F*2, C, F*2, G*2, Eb, As, F, G*2, Eb, As, F, Ab*2, F*2, C, Ab, Ab*2, F*2, C, Ab, F, Ab, C, F*2, Ab*2, C*2, F*4, 

// Second Part

 x, x, F*4, F*4, F*4, F*4, F*4, F*4, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, F*4, F*4, F*4, F*4, C*2, C*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2,
 Eb, Eb, Eb, Eb, F*2, F*2, G*2, G*2, G*2, G*2, Eb*2, Eb*2, x, x, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, Ab*2, Ab*2, x, x,
 F*4, F*4, F*4, F*4, F*4, F*4, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, F*4, F*4, F*4, F*4, C*2, C*2, C*2, C*2, C*2, C*2, As*2, As*2, As*2, As*2, As*2, As*2, x, x, 
Eb*4, Eb*4, x, x, Eb*4, Eb*4, x, x, Eb*4, Eb*4, x, x, Eb*4, Eb*4, x, x, Cs*4, Cs*4, x, x, Cs*4, Cs*4, C*4, C*4, x, x, C*4, C*4, As*4, As*4, x, x, 
F*4, F*4, Ab*4, Ab*4, C*4, C*4, Cs*4, Cs*4, F*4, F*4, Ab*4, Ab*4, C*4, C*4, Cs*4, Cs*4, F*4, F*4, Ab*4, Ab*4, C*4, C*4, F*4, F*4, Eb*4, Eb*4, F*4, F*4, C*4, C*4, Ab*4, Ab*4, 
Eb*2, Eb*2, G*4, G*4, As*4, As*4, C*4, C*4, Eb*2, Eb*2, G*4, G*4, As*4, As*4, C*4, C*4, Eb*2, Eb*2, G*4, G*4, As*4, As*4, Eb*2, Eb*2, Eb*4, Eb*4, Eb*2, Eb*2, As*4, As*4, G*4, G*4,
F*4, F*4, Ab*4, Ab*4, C*4, C*4, Cs*4, Cs*4, F*4, F*4, Ab*4, Ab*4, C*4, C*4, Cs*4, Cs*4, F*4, F*4, Ab*4, Ab*4, C*4, C*4, F*4, F*4, Eb*4, Eb*4, F*4, F*4, C*4, C*4, Ab*4, Ab*4,
Eb*4, Eb*4, Eb*2, Eb*2, G*4, G*4, Cs*4, Cs*4, Eb*2, Eb*2, G*4, G*4, C*4, C*4, Eb*2, Eb*2, G*4, G*4, As*4, As*4, Eb*2, Eb*2, G*4, G*4, Ab*4, Ab*4, Ab*2, Ab*2, G*4, G*4, F*4, x, 

// Third Part

 C*2, C*2, C*2, C*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, F*2, F*2, F*2, F*2, C*2, C*2, C*2, C*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2, 
 C*2, C*2, C*2, C*2, F*2, F*2, C*2, C*2, C*2, C*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, G*2, G*2, Eb, Eb, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, F*2, F*2, Eb, Eb, 
 C*2, C*2, C*2, C*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2, C*2, C*2, C*2, C*2, As*2, As*2, C*2, C*2, C*2, C*2, C*2, C*2, Cs*2, Cs*2, Cs*2, Cs*2, 
 G*2, Eb, C, As, G*2, Eb, C, As, G*2, Eb, C, As, G*2, Eb, C, As, F*2, As, G, D/2, F*2, As, Eb*2, As, G/2, Eb/2, G*2, Eb, C, As, G*2, Eb,
 C*2, C*2, C*2, C*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, F*2, F*2, F*2, F*2, C*2, C*2, C*2, C*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2,
 C*2, C*2, C*2, C*2, C*2, C*2, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, Ab*2, Ab*2, Ab*2, Ab*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Eb*2, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, Cs*2, Ab*2, Ab*2, Ab*2, Ab*2,
 C*2, C*2, C*2, C*2, As*2, As*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, Ab*2, As*2, As*2, As*2, As*2, C*2, C*2, C*2, C*2, As*2, As*2, C*2, C*2, C*2, C*2, C*2, C*2, Cs*2, Cs*2, Cs*2, Cs*2,
 C*2, Eb*2, F*4, Eb*2, C*2, Eb*2, G*4, Eb*2, C*2, Eb*2, Ab*4, Eb*2, C*2, Eb*2, As*4, Eb*2, C*2, Eb*2, F*4, Eb*2, C*2, Eb*2, G*2, Eb*2, C*2, Eb*2, Ab*4, Eb*2, C*2, Eb*2, Eb*4, Eb*2,

// Ending

F, F, F, F, F*2, F*2, 3/2, 3/2, F*2, F*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, F*2, F*2, Eb, Eb,
F, F, F, F, F*2, F*2, 3/2, 3/2, F*2, F*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, G*2, G*2, Ab*2, Ab*2, Ab*2, Ab*2, G*2, G*2, F*2, F*2, Eb, Eb,
][(2*t>>13)%832]*(trans*t)*(19/21)>>2&127)+(t>>9)&128)/(3/2),

bass=(25*sin(trans*t*(19/21)*[
 F, F, F, F, F*2, F*2, F, F, x, x, F, F, x, x, Eb/2, Eb/2, F, F, Ab, Ab, x, x, G, G, x, x, Eb/2, Eb/2, x, x, C/2, C/2,
 F, F, F, F, F*2, F*2, F, F, x, x, F, F, x, x, Eb/2, Eb/2, F, F, Ab, Ab, x, x, G, G, x, x, F, F, x, x, Eb/2, Eb/2,
 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, x, x, Cs, Cs, x, x, Ab, Ab, x, x, F, F,
 Eb/2, Eb/2, Eb/2, Eb/2, Eb, Eb, Eb/2, Eb/2, x, x, Eb/2, Eb/2, x, x, Eb/2, Eb/2, G, G, Ab, Ab, x, x, As, As, As, As, Ab, Ab, G, G, F, F,
 F, F, F, F, F*2, F*2, F, F, x, x, F, F, x, x, Eb/2, Eb/2, F, F, Ab, Ab, x, x, G, G, x, x, Eb/2, Eb/2, x, x, C/2, C/2,
 F, F, F, F, F*2, F*2, F, F, x, x, F, F, x, x, Eb/2, Eb/2, F, F, Ab, Ab, x, x, G, G, x, x, F, F, x, x, Eb/2, Eb/2,
 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, x, x, Cs, Cs, x, x, Ab, Ab, x, x, F, F,
Eb/2, Eb/2, G, G, As, As, Eb, Eb, Eb, Eb, As, As, Eb, Eb, As, As, G*2, G*2, Ab*2, Ab*2, Ab, Ab, As*2, As*2, x, x, Ab*2, Ab*2, G*2, G*2, F, F,

// Second Part 

 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, x, x, Cs, Cs, x, x, Ab, Ab, x, x, F, F, 
 C/2, C/2, C/2, C/2, C, C, C/2, C/2, x, x, C/2, C/2, x, x, G/2, G/2, C/2, C/2, C/2, C/2, x, x, C/2, C/2, x, x, G/2, G/2, Cs/2, Cs/2, Cs/2, Cs/2,
 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, x, x, Cs, Cs, x, x, Ab, Ab, x, x, F, F, 
 C/2, C/2, C/2, C/2, C, C, C/2, C/2, x, x, C/2, C/2, x, x, G/2, G/2, C/2, C/2, C/2, C/2, x, x, C/2, C/2, x, x, G/2, G/2, Cs/2, Cs/2, Cs/2, Cs/2,
 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Ab/2, Ab/2, Cs, Cs, Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, x, x, Cs/2, Cs/2, x, x, Ab/2, Ab/2, Cs/2, Cs/2,
 C/2, C/2, C/2, C/2, C, C, C/2, C/2, x, x, G/2, G/2, C, C, C/2, C/2, C/2, C/2, C, C, x, x, C/2, C/2, x, x, G/2, G/2, C/2, C/2,
 Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, C/2, C/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, x, x, Cs/2, Cs/2, x, x, Cs/2, Cs/2,
 C/2, C/2, C/2, C/2, C/2, C/2, C/2, C/2, x, x, C/2, C/2, x, x, Cs/2, C/2, (t>>5)/10, x, (t>>3)/10, x, (t>>5)/10, x, (t>>3)/10, x, (t>>5)/10, x, (t>>3)/10, x, (t>>7)/10, (t>>8)/10, (t>>7)/10, (t>>8)/10, (t>>7)/10, (t>>8)/10, (t>>7)/10, (t>>8)/10,

// Third Part

 F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, C/2, C/2, F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, F, F, 
 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Eb/2, Eb/2, Eb/2, Eb/2, Eb, Eb, Eb/2, Eb/2, x, x, C/2, C/2, F, F, Eb/2, Eb/2,
  F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, C/2, C/2, F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, F, F, 
 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Eb/2, Eb/2, Eb/2, Eb/2, Eb, Eb, Eb/2, Eb/2, x, x, C/2, C/2, F, F, Eb/2, Eb/2,
 F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, C/2, C/2, F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, F, F, 
 Cs/2, Cs/2, Cs/2, Cs/2, Cs, Cs, Cs/2, Cs/2, x, x, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Cs/2, Eb/2, Eb/2, Eb/2, Eb/2, Eb, Eb, Eb/2, Eb/2, x, x, C/2, C/2, F, F, Eb/2, Eb/2,
 F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, C/2, C/2, F, F, F, F, F*2, F*2, F, F, x, x, Eb/2, Eb/2, Eb/2, Eb/2, F, F, 
 Ab, Ab, Ab, Ab, Ab*2, Ab*2, Ab, Ab, x, x, Ab, Ab, Ab, Ab, Ab, Ab, G, G, G, G, G*2, G*2, G, G, x, x, G, G, G, G, G, G, 

// Ending

 F, F, F, F, F*2, F*2, F, F, x, x, F, F, x, x, Eb/2, Eb/2, F, F, Ab, Ab, x, x, G, G, x, x, Eb/2, Eb/2, x, x, C/2, C/2,
 F, F, F, F, F*2, F*2, F, F, x, x, F, F, x, x, Eb/2, Eb/2, F, F, Ab, Ab, x, x, G, G, x, x, (t>>5)/10, (t>>3)/10,  (t>>5)/10, (t>>5)/10, (t>>3)/10, (t>>3)/10, 
][(2*t>>13)%832]/41)+25)*1.5,

// Percussions

drums1=random()*(-t&4095)/150+(2*t*sin(t>>3)&511)*(-t&8191)/24E3*'10000000'[7&2*t>>13],

drums2=random()*(-t&4095)/150+(t*sin(t>>2)&511)*(-t&8191)/24E3*'00001000'[7&2*t>>13],

drums3=random()*(-t&4095)/150+(2*t*sin(t>>5)&511)*(-t&8191)/24E3*'00101010'[7&2*t>>13]/2,

// Formula

[(melody1+melody2/(1.75))+bass^(drums1+drums3),(melody1/(2.25)+melody2)+(1.25*bass)^(drums2+drums3)]