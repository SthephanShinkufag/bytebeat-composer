t ? 0 : (
	echos = [65e3, 57e3, 43e3, 31e3, 26e3, 19e3].map(x => Array(x).fill(0)),
	nextchange = 1e4 + floor(random()*2e4),
	phase = 0,
	notes = [1/2, 3/4, 1, 9/8, 6/5, 4/3, 3/2, 5/3, 2, 9/4, 8/3, 3],
	note = floor(random()*notes.length),
	detune = pow(2, (2*random() - 1)/80),
	last = [0, 0]
),

t == nextchange ? (
	nextchange += 1e4 + floor(random()*1e4),
	phase = 0,
	note = floor(random()*notes.length),
	detune = pow(2, (2*random() - 1)/80)
) : 0,

arg = 330*notes[note]*detune*2*PI*phase/48e3,

src = sin(arg + 0.5*pow(2, -phase/1e3)*sin(arg))*min(phase/1e2, 1)*pow(2, -phase/2e3)/2,

phase++,

out = src + echos.map(e => e[t%e.length]).reduce((a, b) => a + b),

echos.map(e => e[t%e.length] = out/echos.length*0.75),

out