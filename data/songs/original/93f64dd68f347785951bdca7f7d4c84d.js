// Base 64 sample/wavetable sequencer test
// April 2024 - Sychamis

// Original song: Pokémon Gen1 Vermillion city, by Junichi Masuda


// Samples
const pulse = "ppppppppppppppppppppppppppppppppppppppppppppppDDDDDDDDDDDDDDD";
const wave = "vusqpmkigecaZXWWVVUVUUVVVWWXXXYYZZabbcdefgghijkklmnoppqrstuvv";
const noise = "sOXec3PRe2iYvVpydoWXjKxiivTXwqcwcefvcdbgRhvZwsuaxqyibepoPTroPTSqvrYiRhlcXMkVRf0iZuttUfyQcePtnOVliagXqnebgRgxrvstaxqyibePSSPjpPTSqwdPUOjikbKmSbePRYwsuTXwTsnQUjQSdjiitcpMkpNjwrwcd0hjijibRRYxdPstusvnPWgaglZOVOboOiwrvrXOVOvijgNUOiXPSebk1ZTObtWOautTYiJghldWrMidvfOuqybrmfyogceaMjvUsePrusvRckhtdlfYQRijj1YhwrweOavsVV0aTOlfQlPgccmePXzatkYuurxbTiYvUroOVOcec2gksdnQTSqweOucezkSRrTZhkfufPnNjuZxp0feZkladgqOURrtvenwtglaMjXOjvVPZvsVWyQckhVYoRogjjgouwcrlgwtturXNjvUrfOTSQiVZeexaqNVOauVqvfl0iVNdkhvUV0YaoQTpwdceaodqoOiXUzpxpxobebsYhSRSSQiwume0jTQUOcePSsePrWPUPvbTliZiuWOWkiijvtugkaLlutuePSXwsUZgOSYhMWiQhYpgNUqgNulWyogkUlhiiWrnPg0hjuvrxohikfUzbRSSQhxrwelgeOUObfOTWyqykSPZvfMdmRQapOWgagNvlSRsoNjvudcdeUcebecQXypyiZuurxcSkRSSrpNWMeahqPSfbgTQUoycpUgxspOVnXUznhlSSlNktcpNkvoMmmYga3encTgjgnvuePrwdovtsXNceoWWxSUOjVXwtrelgjKcthfUOiwrxbTihwsTihNTgki1iUmetgLcsvSaoc2gcdRlOjij1ZUm0YitctuSbedaS2YtmQgalzocdcrZfZvsXOjuvkgwspNjVYhMVoiLYeiwTtdRnflTn0glqgijtxikfT0ZgwtgMbtvgfZvfMdePrUgxsnemI0flrfmQTpwemdwcezlPhXWxspS2WckhvWiTQukiik0afylQgZmypYT2YVgautVQhlbebfymPiXVypxpzaUgiuWiSRTPbgmyjgylRSRYwrWU1ZUhTPWhSfnYhYjtXMlsdtuttveoVYhmrNUQSXwqcusYhSRRYrKmnPhylRSRslgkhkaToZMkVqturxkgwSYwrXPUPZwdcilQgZOUSkVypzihvUSQhylRTRtddcKecSjRSpcvsWU1XjpOhylQhlbctiijaTnetuume0ozZgxmQTRsnPTWzaTiSQgfoNXedcgrLkuuoNjvsvflgeOWfjgOTWxqxlSqvtgLelTOclhiLdeOumRSrtveOucebgSecKnencvrwkXwTYwrwmQTRtlgldWOXgUOhdvsvrXNjvTgyqYOVnXVlflhWlbJnpfrwqxjgxQccgrNVPYyafZmydnYOVmfsvrWVzoZLluoNWlglRqUYhNoLltwkfxX1XjrfcRRubgvZxdnxlSpcwdppUzPdlgylV0askihlycPtlfxTrtvRbdeZpfdySRgZnxruZycoVWxrWQRhqS1mhkRebKodqoOhzihwTXxpaekgOulfbgSfypycocwqyibePRYvunPTSqwdPVjRToYNkUZgNumPhwSYvTsmecdcebkiiubvsususvrxbfwTSSRSRSQYxdnXPTQSRRUiXwrWQTRSSQhxmPhYOVOVMmdSigwTSRSRXydoxkfaNVOWgZvTYvtfNVOiyjiigRihNTgjLvqwqdveOZxdoWRRtkafRkXwrXPhZm0ZhxnOjWWxqXU1YWfjtXiSedbmeowle0hZuttutUWycQsnQSSQhkbdcchlRSQYwsvsvrwlSRUiSRTQUPWhTQulSRTPVNkoOjjeUPUQRhkhipxpYOVOautunQTpWQSTjRRUjQgyQWLnlUNmkaedbLneoVgjjzoxQaturcusVQSeceVOvlRfbLdrxlQhkcbvdVsLYfZwryijgoqNixkSQUoxpbddcSjRSqWQhypzZiqNiwRbePSXxekiagYphMXghwrvrwpfmSpxlRRSRSe2fmcYoQSTOldWvueopOUQXycpUhvVjRRUiXxpflfzkSRruoNkuveQnMmdXoemHhZhvZycptwcRpybrmXvVObfmXUyQvikeWwtrelgvavuflaMltwbfyRivsUYiKdthiijTndveQlVyqxkf0hbdezkRSRsePsswdRlPVmgcebLedppNjwsusVWxrjcddPTPjjfTezozaTPatvpfdRQagNWiRTpwlRRsnQrpLncYpOfhjiifXzaslgwttuswkgxStePTSRTQukhucoPTQTQgevdd1iTQUPixlWzbSkQTPahMwikgoqNVPukfZmxqZgTPhetttWPhxlQgzjTOkUafQpeeQqVd0OxglrzglqgjiuaxdPYzZhuxajnYgQkWydOZwfmzaf0hkfQkWwSXycRpxdowmdebfagXV0aXvsutturZekgmYOUPUOivsuttURRTPagNVPUoYOUPZweOVOivUSRUmgcSPcceZPRhwtoPUpvsWPahLelSoZLncWxeOukgwSYwfkhagYqfbeckututurctusvmQSRSSroOVNcnQSTPjifTRTqpOUOauttVPgagTPVhTRsTZuunQTqpNktcpOWiRgmZgahwnNktbvsvrybUgkgopPSSPbfnwstXiRSRYvtfNUd1iUPWiRhkIgaTnZLlrcufNvjgxRbepnXjjftebiqxdowqxjYuunOiwTSRSqpOWlhafYPSfbfSfzpypaLdqyiafNVNmdWrNVnycQSWzbroOiXWkJaccrZfZuUrnRpxiiuwjjsfkigT0bQXybfyqwelgdQqbwdPTWypyjhykYiKelRRYxcQqwdPsoNXedbgWYgbdfTfzqwqYmypyiafNVOjvURRTpxcRQbddaPSgXWjLXmxqYNiwTtdRpYMlSckhtdmfxRZuVpxbfxsgZlhjvUWycPZvttvdcebmeRkQTQYwrwqybrnRRUiSQUPauheVMlnQTRUhgxsUhjjbMXl0ZTmfsvqYMkTand0jTPiWVzcowdQnMksdnd0Oeaitecfwuddbl0bquufNauttUXxdNceQlPTdiijgS2YivTgxrvtgkfthjhlRSQZvumVypykTObnRRsmSPbnRSsnPgbeVOvkSdebnrykSedccsvspNXfZvswlRQaoOhyjUOdlTPvikeRjSRtmQfbk1YtlRedcdrwRasYgYvrwlQeiiiuvlSQWgivsvfNWhSRqwdPSYqOtnNjUZoPSslhjeZxcqoPfgrwpzhjtYgiwsWPUPvbgwunRqXPVmfsiJgiiuWPhyjZgPrwbfXYhOrwbfXWwsVsdeYUypZhRhwYxpagTd3eeaipOg0hbeQruthijaTozZgYOixqyiiWXvtTZpPSYvughQjhmrMXhSf0iZutWkOjtcgNvlQf0hbfmykecdcePsswcVyqxqyafZNkifUQUPautUXwsuUSRUjQgagUQsUTQtlXwtpNkuWOkgmrLZddcfYVypZhSfypxpagTd2gcdQSRf0hbeQqxcRQbfQqxagWYgOTsdeYVxrWrfPqcutWkNksemezkRf1gdbgvvcShafPsuugKfahuwceaLlfPsufMbttUWzbqTafQmOjjccsvX1XkmXwsvnOjuZybrmRQWeleqmXvWiSSruttVrnezlPjhNTfyX0aTnethKfahtdec2glfPrweovuePrvenWVydOcddaS1ljhleVxsuWjPhxqycpWQg0hbeQRYvtTZgOttgMcnOhdwbfYWjKxihwqdtuTtbfYpgOtnNjtbuurdncebfaipQRhwsututvfhQiiMWOUQSfypdufOUPUPapOvkZgNVPUPvjiilzbRSSQgftutTZhMWNjvrXNkVrmRPbnRqWU0miiVNwhkrenPhykRfftfb3endSigxqcwdQqwenwmPukZhlZT0NeikgnvuqfkiilxrvUSQhxrwrXPTdcJodQSRgaMbtVVzbRRXzZZnflccfMdkiilxrwrwdQrtttVRSTPbmeZOTfaNVPUpvufNawePUQgaLncTgjgPSgwTXycpuveNbndddcrYNcePstusxjihS2YhYPUPauvflettVRTRrTgxspMkVSQiubqNXfZvfLdcezkRf1gldWvvdSiihOsveoUhilxtgmXVyoettVQYwqdoNjqLndXqNiyijhldwcrlhhOsuswkXvVoxdnXPUQukgxSZvsWQSffufakjRebLlttawqxjgxRaoPtnPUPujhXqndcfUPhetusbvsvmPhxqYMltXOWkibRpVflgeHpp0gkscutuTZgNZyahpPRfevdQpcvemYc2ljYhxle0nhkSpvtgMwkTnzijhMcealgldWwtfOsttuswdoUhjkaNVPTWyoesvrWPUPapMloQSfaNWOvjjigRgxSUOiXpuureddbMctuURSpvrvRaoPgaKocSOleqneyRYwdOautVrfbfbndRlPivZxqxp0ZujbcgqOURSXydovtggTRSUigwTRgxqXOVnzhiVZpPqXOjVYvtUslfxSYxdjPivZyafbfhyohahvavttunQstweoqNWNdlfZNavggSRSrtwbYodzpYNiYNlgmycQrVWxRatvRblhucndbgRhki2XiuuswkXwsVVzbRRTQtmQfccmePTRfcdbsvrxbRQZvsvmQTPahLdmRRUjRSSrgNvlSRsnPUmflfbgSfbgSfzoyo0hbsxjafOUQTRsnPUoxcQSSRgahRgYVtLYMdrxkXwTtlSPcmSQujitdnRSroOiXpgb2hTdebltuYzaUhYvtuoOvjafc1hVNejjgnvvcXqOUpuurYMmeppOiYPTeaS1mdcdrYNavfhQivvkifVqb3gceOUoxdnxcQqwdPrVWyPejiUalhudmfZnvtglzagxqwqYNkuUWzbQTQhWXhZgafbSQZuVpvtutufLdkgwTSRTPbfPrwceaOURSsdeZUyqXPURpcvsXjQhYPSfzjRf0hZvgKebThagNvkhjKyYitwbfamydndveNavsvSZtwkZfQlQSegmQUoyafxRiwtpNjWWycnefMXfasYgYwrwlSpyjiuvlSOckigTzcPViSRrswemfeOumPgZNbutvmeceZvSaoQRYvtsxijgnqNWiSSSSqvsXiQhwTSSqWPhyjZhkaMkuTZhNtsutTaecguddaPSfanxrtawrXOjvsWQTqqLlTaoQqXNkhgXzbslgxSXxqxjhwTtddcfTRSsdexYxqxlRSpbxcqoPTTkQgziZvheWLnkZgOulgxrVflh4VkVsmSoesvSZuuqelfylPikdWMlsxbThYvttTgkIgZhxmQUodvdQqwdRkQg0gcdqScbhoXiNtsvrcuugl0YhXQRgxRhwSYwrXObgkhkgahQgYUypxqxqyjYwfgSRSRSSRslfyqXOUPVNjWqoQrVQTRSWznhiiuVQUOboNjvvdcbMXNwijgNautVRRfal0ZUiRfbLeqxPebhqT1YaoPfgqzatjkfpnfxrVfySssvTtlTmhjiuXNlrflgxqyagWYgczrhMUVyqYnxdNcfOVjPhwSagNumQtlXijgsihkhkgmxqxkYwsutusWQTQtmQSRSQgZOTdddWNWMcrYNbtvmPUOckigUsMXhSRSrtwdppNjvURfbLdqadcenWVyPclgwttvpgkiilzbRSSQhwsutUYhMWMlfNVNjWqoQSXycQRXxpenPVhZhLdnPhxmPhwshLxhleRihjJfbealzbqtwdQrutuTXxeNcddaNVblglfPrusXOjvtsvemZMkUYqOVOautVWxRukTOcmRdkgkrflSQukhwrwcezkQhYohMVU1ZUhYwrdoNXfcdezkQgylQgyo0YbkjfRiigORihmwufnvufOZvrYNbsYMddRmNleWpdlO5UmmWycpuvencxbrlgvVPatvlWxStkhWYpPTslgvbuveopNidwdd0PktYghxqdugjiiivunPtmWxqwsiJghkfopOVObfOtsvrYiRSRtceaOTe0jSRpbvrXNddRlPixlPiiP5TojcdSiYxeletgk0ZfzihvulfyRYwdPtnQTrncecdcdhlQffsvrvrwqyjhwsWQTRTQTQtdQqWPUPVOWkiiiuVQUPUOiwrxbeZOTRQagOTWxrXQTRSrfOVjQhYPTSpdoPtmV0aTOksyhkeqmgjKedPTpvsXoxdPudQqXOjvTYjhkhivTZgajqwruudchsuunQSSQZuusWPUoYOURmOVmZMktVQTqpNiwRbddbMkiddddgsutUXwsututtWPhahSRSRTRrUYvtoOUPUOktcpOWhTQUOdcezlPhwTSRToybThZhlZOUpVXjkzpxpZMlsctveOVNkUaec0OlfPSgxTrugkfshKekgxRatwkZgOsvdbilRTpxbfYVyqxlQhYUzobeVNYejtXiRgzjSRrvmd2gcdRlOkgS2YVm0YitbvgjiafYT1ZtkhwstusYhYvTsnQSTPjuvkhubpOUObfNawce0kSSSsfPraxcRlPVmgkf0iafnqMkvswdQruticdcRPcddaMjvrwdQSqtuSanRQaoRpYMkVsmSQukhvUWyogmQffuebdeUd2gjusawqyjagNumQsoPTRrugjiiijeVOjVXxrvsvsvShvVkQTQTQVmgkgylQTRTQhxqxbSjSQUOddRPdbhqOTSRtePTpwflZNXkijToYT0nbJoqzgksdoOiWXiLcuec1hiwTseQpcvfMxZisedd0iaglevenvufPsuswlXxeMdceaNVOvjihNtsuUSQgamzbpWPgZNbtuTYwrWU1YbnQeijTbmeobtjiuwjhwsutuUsePTrnQSTOksemSnfmRSQZga4emsxkTPatveOuePViRSqUgkhjjTprKmrdtuswkgmafaipOUPZvsutuuflZOVnYOVPSfzoaLlsXOVNcnQrTZgbdKYMxhjtcuttUSPiXredySRfaMkvsbwdnXVyPcnQroU0ljgmdrkihnrMjvsusXnxpbdlfOUPivUQhxqybRPbfnWXhNUXjKdsvrcwdPYybSoZLnphbTliahwTYjj2gkuuugkgrvTXycRQZuunOikbedQTkPVm";

// Instruments table
// Args: sample data (base 64), can loop ?, pitch function (semitones), volume function (0: silent; 1: full); n is time in seconds
let instruments = [
[pulse, true, n=>n*.1*sin(32*n), n=>.75 - n / 2],
[wave, true, n=>0, n=>1],
[noise, false, n=>0, n=>.4 - n * 4],
];

// Patterns table
// Args: for each note: sample index (base 64, blank if none), note, blank if none, "---" stop
let patterns = [
"CC-4     C-4 C-4 C-4     C-4 C-4 C-4     C-4 C-4 C-4     C-4 C-4",
"AE-4             C#4 E-4 F#4     A-4             B-4     A-4    ",
" G#4     F#4     E-4     F#4     A-4             F#4 G#4 A-4    ",
" E-4             C#4     E-4     A-4     G#4     B-4     A-4    ",
" G#4     E-4     F#4     A-4     C#4     D#4     E-4     F#4    ",
" E-4             C#4 E-4 F#4     A-4     G#4     F#4     A-4    ",
" G#4     E-4     F#4     G#4     F#4             E-4            ",
" F#4     G#4     F#4     A-4     G#4     B-4     A-4     C#5    ",
" D-5     C#5     B-4     A-4     G#4 A-4 B-4     C#5     D-5    ",
" A-4     D-5     G#4     C#5     F#4     B-4     G#4     A-4    ",
" B-4     A-4     G#4     F#4     E-4     F#4     G#4     A-4    ",
"AA-4                             D-5             C#5            ",
" B-4                     A-4 B-4 C#5                            ",
" B-4                     D-5 B-4 A-4                            ",
" B-4             C#5             D-5             E-5            ",
" F#5                             B-5                            ",
" A-5             G#5             F#5             E-5            ",
" F#5                             E-5                            ",
"BA-4     E-4     A-4     E-4     A-4     E-4     A-4     E-4    ",
" G#4     E-4     G#4     E-4     A-4     G#4     F#4     E-4    ",
" G#4     E-4     G#4     E-4     A-4     G#4     F#4     G#4    ",
" G#4     E-4     G#4     E-4     A-4     E-4     A-4     E-4    ",
" B-4     E-4     A-4     E-4     G#4     E-4     F#4     E-4    ",
" G#4     E-4     G#4     E-4     B-4     A-4     F#4     F#4    ",
" F#4     E-4     G#4     E-4     A-4     E-4     B-4     E-4    ",
" B-4     E-4     B-4     E-4     A-4     E-4     G#4     E-4    ",
];

// Sequence table
// Uses indexes from patterns above
let sequence = [
[0, 18, 1, 11],
[0, 19, 2, 12],
[0, 18, 3, 11],
[0, 20, 4, 13],
[0, 18, 1, 11],
[0, 21, 2, 12],
[0, 18, 5, 11],
[0, 21, 6, 13],
[0, 22, 7, 14],
[0, 23, 8, 15],
[0, 24, 9, 16],
[0, 25, 10, 17],
];


// Custom parameters
const samplesSampleRate = 16000;
const speed = 8;// Steps per second
const notesPerPattern = 16;
const canLoop = true;


// Engine
const base64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const notes = {
"C-":49,
"C#":50,
"D-":51,
"D#":52,
"E-":53,
"F-":54,
"F#":55,
"G-":56,
"G#":57,
"A-":58,
"A#":59,
"B-":60,
}


class Channel{

	SetInstrument (instrument){
		this.sample = instrument[0];
		this.pitchMod = instrument[2];
		this.volMod = instrument[3];
		this.canLoop = instrument[1];
	}

	SetNote (time, note){
		this.note = note;
		this.startTime = time;
		this.sampleIndex = 0;
	}

	Tick (time, sampleRate, samplesSampleRate){
		let freq = 2 ** ((this.note + this.pitchMod(time - this.startTime)) / 12);
		this.sampleIndex += ((freq / 2 ** ((97) / 12)) * (samplesSampleRate / sampleRate));// 97 is the base tone (C-4), but it can be changed to anything else
		

		if (this.canLoop){
			this.sampleIndex %= this.sample.length;
		} else {
			if (this.sampleIndex >= this.sample.length) this.sampleIndex = this.sample.length - 1;
		}
		
		return base64.indexOf(this.sample[int(this.sampleIndex)]) * max(0, min(this.volMod(time - this.startTime), 1))
	}
}

// Initializes the maximum amount of channels needed (if the highest amount of patterns played at the same time in a sequence is four, then four channels are created)
let numberOfChannels = 0;
for (let i = 0; i < sequence.length; i++){
	if (sequence[i].length > numberOfChannels) numberOfChannels = sequence[i].length;
}

let channels = [];
for (let i = 0; i < numberOfChannels; i++){
	channels[i] = new Channel();
	channels[i].SetNote(0, -Infinity);
}

// Player
let prevStep = 0;
let patternIndex = 0;
let noteIndex = -1;
return function(time, sampleRate){

	let output = 0;
	if (noteIndex / notesPerPattern < sequence.length){
		if (int(time * speed) % notesPerPattern != prevStep){
			noteIndex += 1;
			patternIndex = int(noteIndex / notesPerPattern);
			
			for (let channel = 0; channel < sequence[patternIndex].length; channel++){
				let pattern = patterns[sequence[patternIndex][channel]];
				let index = (noteIndex % notesPerPattern) * 4;

				if (pattern[index] != " "){// Instrument update
					channels[channel].SetInstrument(instruments[base64.indexOf(pattern[index])]);// Instrument change
				}
				let note = pattern[index + 1] + pattern[index + 2];
				if (note != "  "){// Note update
					channels[channel].SetNote(time, notes[note] + parseInt(pattern[index + 3]) * 12)// Makes the note value from the string and octave
				} else {
					if (note == "--"){// Note stop
						channels[channel].SetNote(time, -Infinity)
					}
				}
			}
		}
		let sr = sampleRate;
		prevStep = int(time * speed) % notesPerPattern;

		for (let channel = 0; channel < numberOfChannels; channel++){
			if (channels[channel].note > -Infinity) output += channels[channel].Tick(time, sr, samplesSampleRate);
		}
	} else {
		if (canLoop) noteIndex = -1;
	}
	return (output / numberOfChannels) / 32 - 1
}