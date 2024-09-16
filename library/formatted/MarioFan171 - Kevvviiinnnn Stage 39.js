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

// Here's the code below:

// Notes
F = 1,
Fs = 19 / 18,
G = 9 / 8,
Ab = 19 / 16,
A = 5 / 4,
As = 4 / 3,
B = 17 / 12,
C = 3 / 2,
Cs = 19 / 12,
D = 19 / 11,
Eb = 43 / 24,
E = 15 / 8,
G0 = G / 2,
Ab0 = Ab / 2,
C0 = C / 2,
Cs0 = Cs / 2,
Eb0 = Eb / 2,
F2 = F * 2,
G2 = G * 2,
Ab2 = Ab * 2,
As2 = As * 2,
C2 = C * 2,
Cs2 = Cs * 2,
Eb2 = Eb * 2,
F4 = F * 4,
G4 = G * 4,
Ab4 = Ab * 4,
As4 = As * 4,
C4 = C * 4,
Cs4 = Cs * 4,
Eb4 = Eb * 4,

// Melodies
!t && (
	melody1 = [
		// First Part
		F, F, F, F, F2, F2, C, C, F2, F2, G2, G2, G2, G2, Ab2, Ab2, Ab2, Ab2, G2, G2, G2, G2, Ab2, Ab2, Ab2,
		Ab2, As2, As2, As2, As2, As2, As2, F, F, F, F, F2, F2, C, C, F2, F2, G2, G2, G2, G2, Ab2, Ab2, Ab2,
		Ab2, G2, G2, G2, G2, Ab2, Ab2, Ab2, Ab2, As2, As2, As2, As2, As2, As2, C2, C2, C2, C2, C2, C2, F2, F2,
		F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, 0, 0, 0, 0, G2, G2,
		Ab2, Ab2, 0, 0, G2, G2, 0, 0, Ab2, Ab2, 0, 0, G2, G2, 0, 0, G2, G2, 0, 0, Ab2, Ab2, As2, As2, Ab2,
		Ab2, G2, G2, F2, F2, F, F, F, F, F2, F2, C, C, F2, F2, G2, G2, G2, G2, Ab2, Ab2, Ab2, Ab2, G2, G2, G2,
		G2, Ab2, Ab2, Ab2, Ab2, As2, As2, As2, As2, As2, As2, F, F, F, F, F2, F2, C, C, F2, F2, G2, G2, G2,
		G2, Ab2, Ab2, Ab2, Ab2, G2, G2, G2, G2, Ab2, Ab2, Ab2, Ab2, As2, As2, As2, As2, As2, As2, C2, C2, C2,
		C2, C2, C2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Cs2, Cs2, Cs2, Cs2, C2, C2, C2, C2, C2, C2, As2, As2, As2,
		As2, As2, As2, Ab2, Ab2, Ab2, Ab2, C2, C2, C2, C2, C2, C2, C2, C2, C2, C2, C2, C2, C2, C2, 0, 0, 0, 0,
		F2, F2, G2, G2, 0, 0, Ab2, Ab2, 0, 0, C2, C2, 0, 0,

		// Second Part
		F4, F4, F4, F4, F4, F4, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, F4, F4, F4, F4, C2, C2, C2, C2, C2, C2, As2,
		As2, As2, As2, As2, As2, Ab2, Ab2, Ab2, Ab2, Eb, Eb, Eb, Eb, F2, F2, G2, G2, G2, G2, Eb2, Eb2, 0, 0,
		Cs2, Cs2, Cs2, Cs2, Cs2, Cs2, C2, C2, C2, C2, As2, As2, As2, As2, Ab2, Ab2, 0, 0, F4, F4, F4, F4, F4,
		F4, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, F4, F4, F4, F4, C2, C2, C2, C2, C2, C2, As2, As2, As2, As2, As2,
		As2, Ab2, Ab2, Ab2, Ab2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2,
		Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, F4, F4, F4, F4,
		F4, F4, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, F4, F4, F4, F4, C2, C2, C2, C2, C2, C2, As2, As2, As2, As2, As2,
		As2, Ab2, Ab2, Ab2, Ab2, Eb, Eb, Eb, Eb, F2, F2, G2, G2, G2, G2, As2, As2, 0, 0, Eb2, Eb2, Eb2, Eb2,
		Eb2, Eb2, F4, F4, F4, F4, G4, G4, G4, G4, Eb2, Eb2, 0, 0, F4, F4, F4, F4, F4, F4, Eb2, Eb2, Eb2, Eb2,
		Eb2, Eb2, F4, F4, F4, F4, Ab4, Ab4, Ab4, Ab4, Ab4, Ab4, G4, G4, G4, G4, G4, G4, Eb2, Eb2, Eb2, Eb2,
		F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, F4, 0, 0, 0, 0,
		C2, C2, Eb2, Eb2, F4, F4,

		// Third Part
		Ab4, Ab4, Ab4, Ab4, G4, G4, F4, F4, F4, F4, F4, F4, C2, C2, C2, C2, Ab4, Ab4, Ab4, Ab4, G4, G4, F4,
		F4, F4, F4, F4, F4, G4, G4, G4, G4, Ab4, Ab4, Ab4, Ab4, Ab4, Ab4, G4, G4, G4, G4, G4, G4, F4, F4, F4,
		F4, G4, G4, G4, G4, G4, G4, G4, G4, G4, G4, G4, G4, C2, C2, C2, C2, Ab4, Ab4, Ab4, Ab4, G4, G4, F4,
		F4, F4, F4, F4, F4, G4, G4, G4, G4, Ab4, Ab4, Ab4, Ab4, G4, G4, Ab4, Ab4, Ab4, Ab4, Ab4, Ab4, As4,
		As4, As4, As4, C4, C4, C4, C4, C4, C4, As4, As4, As4, As4, As4, As4, As4, As4, As4, As4, As4, As4,
		As4, As4, As4, As4, As4, As4, As4, As4, C2, C2, Eb2, Eb2, F4, F4, Ab4, Ab4, Ab4, Ab4, G4, G4, F4, F4,
		F4, F4, F4, F4, C2, C2, C2, C2, Ab4, Ab4, Ab4, Ab4, G4, G4, F4, F4, F4, F4, F4, F4, G4, G4, G4, G4,
		Ab4, Ab4, Ab4, Ab4, Ab4, Ab4, G4, G4, G4, G4, G4, G4, F4, F4, F4, F4, G4, G4, G4, G4, G4, G4, G4, G4,
		G4, G4, G4, G4, C2, C2, C2, C2, Ab4, Ab4, Ab4, Ab4, G4, G4, F4, F4, F4, F4, F4, F4, G4, G4, G4, G4,
		Ab4, Ab4, Ab4, Ab4, G4, G4, Ab4, Ab4, Ab4, Ab4, Ab4, Ab4, As4, As4, As4, As4, C4, C4, C4, C4, C4, C4,
		As4, As4, As4, As4, As4, As4, Ab4, Ab4, Ab4, Ab4, G4, G4, G4, G4, G4, G4, F4, F4, F4, F4, F4, F4, Eb2,
		Eb2, Eb2, Eb2,

		// Ending
		F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2, F2,
		F2, F2, F2, F2, F2, F2, F2, 0, 0, 0, 0, 0, 0, F, F, C, C, Eb, Eb, 0, 0, F2, F2, 0, 0, Eb, Eb, 0, 0,
		F2, F2, 0, 0, Eb, Eb, C, C, As, As
	],

	melody2 = [
		// First Part
		0, 0, 0, 0, F, F, F, F, C, C, Eb, Eb, 0, 0, F2, F2, 0, 0, Eb, Eb, 0, 0, F2, F2, 0, 0, G2, G2, G2, G2,
		Eb, Eb, Eb, Eb, 0, 0, F, F, F, F, C, C, Eb, Eb, 0, 0, F2, F2, 0, 0, Eb, Eb, 0, 0, F2, F2, 0, 0, G2,
		G2, G2, G2, G2, G2, Ab2, Ab2, Cs, Cs, F2, F2, Ab2, Ab2, F2, F2, Ab2, Ab2, Cs2, Cs2, F4, F4, Cs2, Cs2,
		F4, F4, Ab4, Ab4, Cs4, Cs4, Ab*8, F*8, Cs*8, Ab4, F4, Cs4, Ab2, F2, Eb, Eb, F2, F2, F2, F2, Eb, Eb,
		Eb, Eb, F2, F2, F2, F2, Eb, Eb, 0, 0, Eb, Eb, 0, 0, F2, F2, G2, G2, F2, F2, Eb, Eb, C, C, 0, 0, 0, 0,
		F, F, F, F, C, C, Eb, Eb, 0, 0, F2, F2, 0, 0, Eb, Eb, 0, 0, F2, F2, 0, 0, G2, G2, G2, G2, Eb, Eb, Eb,
		Eb, 0, 0, F, F, F, F, C, C, Eb, Eb, 0, 0, F2, F2, 0, 0, Eb, Eb, 0, 0, F2, F2, 0, 0, G2, G2, G2, G2,
		G2, G2, Ab2, Ab2, Ab2, Ab2, 0, 0, Ab2, Ab2, Ab2, Ab2, 0, 0, Ab2, Ab2, 0, 0, Ab2, Ab2, Ab2, Ab2, 0, 0,
		G2, G2, G2, G2, G2, G2, Eb, Eb, F2, C, F2, C0, F2, C, F2, C0, F2, C, F2, G2, Eb, As, F, G2, Eb, As, F,
		Ab2, F2, C, Ab, Ab2, F2, C, Ab, F, Ab, C, F2, Ab2, C2, F4,

		// Second Part
		0, 0, F4, F4, F4, F4, F4, F4, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, F4, F4, F4, F4, C2, C2, C2, C2, C2, C2,
		As2, As2, As2, As2, As2, As2, Ab2, Ab2, Ab2, Ab2, Eb, Eb, Eb, Eb, F2, F2, G2, G2, G2, G2, Eb2, Eb2, 0,
		0, Cs2, Cs2, Cs2, Cs2, Cs2, Cs2, C2, C2, C2, C2, As2, As2, As2, As2, Ab2, Ab2, 0, 0, F4, F4, F4, F4,
		F4, F4, Eb2, Eb2, Eb2, Eb2, Eb2, Eb2, F4, F4, F4, F4, C2, C2, C2, C2, C2, C2, As2, As2, As2, As2, As2,
		As2, 0, 0, Eb4, Eb4, 0, 0, Eb4, Eb4, 0, 0, Eb4, Eb4, 0, 0, Eb4, Eb4, 0, 0, Cs4, Cs4, 0, 0, Cs4, Cs4,
		C4, C4, 0, 0, C4, C4, As4, As4, 0, 0, F4, F4, Ab4, Ab4, C4, C4, Cs4, Cs4, F4, F4, Ab4, Ab4, C4, C4,
		Cs4, Cs4, F4, F4, Ab4, Ab4, C4, C4, F4, F4, Eb4, Eb4, F4, F4, C4, C4, Ab4, Ab4, Eb2, Eb2, G4, G4, As4,
		As4, C4, C4, Eb2, Eb2, G4, G4, As4, As4, C4, C4, Eb2, Eb2, G4, G4, As4, As4, Eb2, Eb2, Eb4, Eb4, Eb2,
		Eb2, As4, As4, G4, G4, F4, F4, Ab4, Ab4, C4, C4, Cs4, Cs4, F4, F4, Ab4, Ab4, C4, C4, Cs4, Cs4, F4, F4,
		Ab4, Ab4, C4, C4, F4, F4, Eb4, Eb4, F4, F4, C4, C4, Ab4, Ab4, Eb4, Eb4, Eb2, Eb2, G4, G4, Cs4, Cs4,
		Eb2, Eb2, G4, G4, C4, C4, Eb2, Eb2, G4, G4, As4, As4, Eb2, Eb2, G4, G4, Ab4, Ab4, Ab2, Ab2, G4, G4,
		F4, 0,

		// Third Part
		C2, C2, C2, C2, As2, As2, Ab2, Ab2, Ab2, Ab2, Ab2, Ab2, F2, F2, F2, F2, C2, C2, C2, C2, As2, As2, Ab2,
		Ab2, Ab2, Ab2, Ab2, Ab2, As2, As2, As2, As2, C2, C2, C2, C2, F2, F2, C2, C2, C2, C2, As2, As2, Ab2,
		Ab2, Ab2, Ab2, G2, G2, G2, G2, Eb, Eb, Ab2, Ab2, Ab2, Ab2, G2, G2, F2, F2, Eb, Eb, C2, C2, C2, C2,
		As2, As2, Ab2, Ab2, Ab2, Ab2, Ab2, Ab2, As2, As2, As2, As2, C2, C2, C2, C2, As2, As2, C2, C2, C2, C2,
		C2, C2, Cs2, Cs2, Cs2, Cs2, G2, Eb, C, As, G2, Eb, C, As, G2, Eb, C, As, G2, Eb, C, As, F2, As, G,
		D / 2, F2, As, Eb2, As, G0, Eb0, G2, Eb, C, As, G2, Eb, C2, C2, C2, C2, As2, As2, Ab2, Ab2, Ab2, Ab2,
		Ab2, Ab2, F2, F2, F2, F2, C2, C2, C2, C2, As2, As2, Ab2, Ab2, Ab2, Ab2, Ab2, Ab2, As2, As2, As2, As2,
		C2, C2, C2, C2, C2, C2, Cs2, Cs2, Cs2, Cs2, Cs2, Cs2, Ab2, Ab2, Ab2, Ab2, Eb2, Eb2, Eb2, Eb2, Eb2,
		Eb2, Cs2, Cs2, Cs2, Cs2, Cs2, Cs2, Ab2, Ab2, Ab2, Ab2, C2, C2, C2, C2, As2, As2, Ab2, Ab2, Ab2, Ab2,
		Ab2, Ab2, As2, As2, As2, As2, C2, C2, C2, C2, As2, As2, C2, C2, C2, C2, C2, C2, Cs2, Cs2, Cs2, Cs2,
		C2, Eb2, F4, Eb2, C2, Eb2, G4, Eb2, C2, Eb2, Ab4, Eb2, C2, Eb2, As4, Eb2, C2, Eb2, F4, Eb2, C2, Eb2,
		G2, Eb2, C2, Eb2, Ab4, Eb2, C2, Eb2, Eb4, Eb2,

		// Ending
		F, F, F, F, F2, F2, C, C, F2, F2, G2, G2, G2, G2, Ab2, Ab2, Ab2, Ab2, G2, G2, G2, G2, Ab2, Ab2, Ab2,
		Ab2, G2, G2, F2, F2, Eb, Eb, F, F, F, F, F2, F2, C, C, F2, F2, G2, G2, G2, G2, Ab2, Ab2, Ab2, Ab2, G2,
		G2, G2, G2, Ab2, Ab2, Ab2, Ab2, G2, G2, F2, F2, Eb, Eb
	],

	melodyBass = [
		// First Part
		F, F, F, F, F2, F2, F, F, 0, 0, F, F, 0, 0, Eb0, Eb0, F, F, Ab, Ab, 0, 0, G, G, 0, 0, Eb0, Eb0, 0, 0,
		C0, C0, F, F, F, F, F2, F2, F, F, 0, 0, F, F, 0, 0, Eb0, Eb0, F, F, Ab, Ab, 0, 0, G, G, 0, 0, F, F, 0,
		0, Eb0, Eb0, Cs0, Cs0, Cs0, Cs0, Cs, Cs, Cs0, Cs0, 0, 0, Cs0, Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0,
		0, 0, Cs, Cs, 0, 0, Ab, Ab, 0, 0, F, F, Eb0, Eb0, Eb0, Eb0, Eb, Eb, Eb0, Eb0, 0, 0, Eb0, Eb0, 0, 0,
		Eb0, Eb0, G, G, Ab, Ab, 0, 0, As, As, As, As, Ab, Ab, G, G, F, F, F, F, F, F, F2, F2, F, F, 0, 0, F,
		F, 0, 0, Eb0, Eb0, F, F, Ab, Ab, 0, 0, G, G, 0, 0, Eb0, Eb0, 0, 0, C0, C0, F, F, F, F, F2, F2, F, F,
		0, 0, F, F, 0, 0, Eb0, Eb0, F, F, Ab, Ab, 0, 0, G, G, 0, 0, F, F, 0, 0, Eb0, Eb0, Cs0, Cs0, Cs0, Cs0,
		Cs, Cs, Cs0, Cs0, 0, 0, Cs0, Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, 0, 0, Cs, Cs, 0, 0, Ab, Ab, 0,
		0, F, F, Eb0, Eb0, G, G, As, As, Eb, Eb, Eb, Eb, As, As, Eb, Eb, As, As, G2, G2, Ab2, Ab2, Ab, Ab,
		As2, As2, 0, 0, Ab2, Ab2, G2, G2, F, F,

		// Second Part
		Cs0, Cs0, Cs0, Cs0, Cs, Cs, Cs0, Cs0, 0, 0, Cs0, Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, 0, 0, Cs,
		Cs, 0, 0, Ab, Ab, 0, 0, F, F, C0, C0, C0, C0, C, C, C0, C0, 0, 0, C0, C0, 0, 0, G0, G0, C0, C0, C0,
		C0, 0, 0, C0, C0, 0, 0, G0, G0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs, Cs, Cs0, Cs0, 0, 0, Cs0,
		Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, 0, 0, Cs, Cs, 0, 0, Ab, Ab, 0, 0, F, F, C0, C0, C0, C0, C, C,
		C0, C0, 0, 0, C0, C0, 0, 0, G0, G0, C0, C0, C0, C0, 0, 0, C0, C0, 0, 0, G0, G0, Cs0, Cs0, Cs0, Cs0,
		Cs0, Cs0, Cs0, Cs0, Cs, Cs, Cs0, Cs0, 0, 0, Ab0, Ab0, Cs, Cs, Cs0, Cs0, Cs0, Cs0, Cs, Cs, 0, 0, Cs0,
		Cs0, 0, 0, Ab0, Ab0, Cs0, Cs0, C0, C0, C0, C0, C, C, C0, C0, 0, 0, G0, G0, C, C, C0, C0, C0, C0, C, C,
		0, 0, C0, C0, 0, 0, G0, G0, C0, C0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0,
		C0, C0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, 0, 0, Cs0, Cs0, 0, 0, Cs0, Cs0, C0, C0, C0, C0, C0,
		C0, C0, C0, 0, 0, C0, C0, 0, 0, Cs0, C0, (t>>5)/10, 0, (t>>3)/10, 0, (t>>5)/10, 0, (t>>3)/10, 0,
		(t>>5)/10, 0, (t>>3)/10, 0, (t>>7)/10, (t>>8)/10, (t>>7)/10, (t>>8)/10, (t>>7)/10, (t>>8)/10,
		(t>>7)/10, (t>>8)/10,

		// Third Part
		F, F, F, F, F2, F2, F, F, 0, 0, Eb0, Eb0, Eb0, Eb0, C0, C0, F, F, F, F, F2, F2, F, F, 0, 0, Eb0, Eb0,
		Eb0, Eb0, F, F, Cs0, Cs0, Cs0, Cs0, Cs, Cs, Cs0, Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Eb0, Eb0,
		Eb0, Eb0, Eb, Eb, Eb0, Eb0, 0, 0, C0, C0, F, F, Eb0, Eb0, F, F, F, F, F2, F2, F, F, 0, 0, Eb0, Eb0,
		Eb0, Eb0, C0, C0, F, F, F, F, F2, F2, F, F, 0, 0, Eb0, Eb0, Eb0, Eb0, F, F, Cs0, Cs0, Cs0, Cs0, Cs,
		Cs, Cs0, Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0, Cs0, Cs0, Eb0, Eb0, Eb0, Eb0, Eb, Eb, Eb0, Eb0, 0, 0, C0, C0,
		F, F, Eb0, Eb0, F, F, F, F, F2, F2, F, F, 0, 0, Eb0, Eb0, Eb0, Eb0, C0, C0, F, F, F, F, F2, F2, F, F,
		0, 0, Eb0, Eb0, Eb0, Eb0, F, F, Cs0, Cs0, Cs0, Cs0, Cs, Cs, Cs0, Cs0, 0, 0, Cs0, Cs0, Cs0, Cs0, Cs0,
		Cs0, Eb0, Eb0, Eb0, Eb0, Eb, Eb, Eb0, Eb0, 0, 0, C0, C0, F, F, Eb0, Eb0, F, F, F, F, F2, F2, F, F, 0,
		0, Eb0, Eb0, Eb0, Eb0, C0, C0, F, F, F, F, F2, F2, F, F, 0, 0, Eb0, Eb0, Eb0, Eb0, F, F, Ab, Ab, Ab,
		Ab, Ab2, Ab2, Ab, Ab, 0, 0, Ab, Ab, Ab, Ab, Ab, Ab, G, G, G, G, G2, G2, G, G, 0, 0, G, G, G, G, G, G,

		// Ending
		F, F, F, F, F2, F2, F, F, 0, 0, F, F, 0, 0, Eb0, Eb0, F, F, Ab, Ab, 0, 0, G, G, 0, 0, Eb0, Eb0, 0, 0,
		C0, C0, F, F, F, F, F2, F2, F, F, 0, 0, F, F, 0, 0, Eb0, Eb0, F, F, Ab, Ab, 0, 0, G, G, 0, 0,
		(t>>5)/10, (t>>3)/10, (t>>5)/10, (t>>5)/10, (t>>3)/10, (t>>3)/10
	]
),

// Instruments
instrument1 = (19 / 21 * trans * t * melody1[(2 * t >> 13) % 832] >> 2 & 127) + (t >> 7) & 128,
instrument2 = ((19 / 21 * trans * t * melody2[(2 * t >> 13) % 832] >> 2 & 127) + (t >> 9) & 128) / C,
bass = 1.5 * (25 * sin(19 / 21 * t * trans * melodyBass[(2 * t >> 13) % 832] / 41) + 25),

// Percussions
drums1 = random() * (-t & 4095) / 150 +
	(2 * t * sin(t >> 3) & 511) * (-t & 8191) / 24E3 * '10000000'[7 & 2 * t >> 13],
drums2 = random() * (-t & 4095) / 150 +
	(t * sin(t >> 2) & 511) * (-t & 8191) / 24E3 * '00001000'[7 & 2 * t >> 13],
drums3 = random() * (-t & 4095) / 150 +
	(2 * t * sin(t >> 5) & 511) * (-t & 8191) / 24E3 * '00101010'[7 & 2 * t >> 13] / 2,

// Formula
[
	(instrument1 + instrument2 / 1.75 + bass) ^ (drums1 + drums3),
	(instrument1 / 2.25 + instrument2 + 1.25 * bass) ^ (drums2 + drums3)
];
