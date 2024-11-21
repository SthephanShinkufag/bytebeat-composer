//rtttl player bytebeat
//19 sept 2023 - Kouzerumatsukite
t?(t=>{
  if(t>tl){
    tl += 256
    for(n of plyr){
      n.tick(tl*1250/14)
		}
  }
  var r = 0
  for(n of pwms)
    r += n.sample()
  return r*24
})(t):(_=>{
function PWM_fake(gain=1){
  this.dutyValue = 0
  this.phaseValue = 0
  this.freqValue = 1000
  this.gainValue = gain
  this.phaseValue = 0
  this.duty = function(value){
    this.dutyValue = value<<6
  }
  this.freq = function(value){
    this.freqValue = value*2
  }
  this.gain = function(value){
    this.gainValue = value
  }
  this.sample = function(){
    this.phaseValue += this.freqValue
    this.phaseValue &= 65535
    return this.dutyValue<this.phaseValue?this.gainValue:0
  }
}
function Rtttl(song){
  this.name = "new song"
  this.duration = 4
  this.octave = 6
  this.beat = 63
  this.notes = []
  var param, data
  [this.name,param,data] = song.split(":")
  this.notes = data.split(",")
  for(n of param.split(",")){
    if(n.startsWith("d"))
      this.duration = parseInt(n.split("=")[1].trim())
    if(n.startsWith("o"))
      this.octave = parseInt(n.split("=")[1].trim())
    if(n.startsWith("f"))
      this.beat = parseInt(n.split("=")[1].trim())
  }
}
function RtttlPlayer(rtttl, pwm, duty=512){
  this.playing = false
  this.stopped = false
  this.looped = false
  this.cursor = 0
  this.pwm = pwm
  this.pwm.freq(1000)
  this.pwm.duty(0)
  this.rtttl = rtttl
  this.duty = duty
  this.pitch = 0
  this.start = function(start_ms = 0, looped = false){
    this.stopped = false
    this.playing = true
    this.looped = looped
    this.cursor = 0
    this.next_us = start_ms*1000
    this.pwm.duty(0)
  }
  this.end = function(){
    if(this.playing&&!this.looped){
        this.stopped = true
        this.playing = false
        this.pwm.duty(0)
    }else{
        this.cursor = 0
    }
  }
  this.tick = function(ticks_us){
    if (ticks_us - this.next_us < 0) return
    if (this.stopped||!this.playing) return
    // read current note
    var note = this.rtttl.notes[this.cursor].trim().toLowerCase()
    if(note==""){this.end();this.tick(ticks_us);return}
    // parse note key
    var dur, oct, dot, key = "p"
    for(i of "cdefgabp")
        if (note.indexOf(i)+1) key = i
    if (note.indexOf("#")+1) key += "#"
    // parse dot rhythm
    notekey = note.split(".")
    dot = notekey.length - 1
    for(var k=0;k<dot;k++) key += "."
    // parse duration, and octave
    var splited = note.split(key)
    dur = splited[0]
    oct = splited[1]
    oct = oct.length?int(oct):this.rtttl.octave
    dur = dur.length?int(dur):this.rtttl.duration
    dur = 2/dur-1/dur*2**(-dot)

    if(key[0] == "p"){
      // pause or mute key
      this.pwm.duty(0)
      this.pitch = 0
      console.log("===",dur,"-")
    }else{
      // translate key to freq
      pitch = "ccddeffggaab".indexOf(key[0])
      pitch = key.indexOf("#")+1?pitch+1:pitch
      pitch = pitch + oct*12
      this.pitch = pitch
      freq = int(440*2**((pitch-9)/12-4))
      this.pwm.freq(freq)
      this.pwm.duty(this.duty)
      keynote = key.toUpperCase()
      if (key.length==1) keynote += "-"
      console.log(keynote+oct,dur,freq)
    }
    this.next_us += int(4000000*60/this.rtttl.beat*dur)
    this.cursor += 1
    if (this.cursor>=this.rtttl.notes.length) this.end()
  }
}
song = [
  new Rtttl("Kouzeru - Adventure's began:d=8,o=5,b=180:  e,d#,b4,e,p,d#,4e,p,d#,e,16d#.,32f,f#.,e.,4d#,4b.4,4e,d#,e.,16d#,e,4d#,f#,g#,4d#,  e,d#,b4,e,4p,4e,p,d#,e,d#,f#,e,d#,4b.4,p,b4,4e,d#,e,p,e,16p.,32d#,e,f#,g#,a,g#,  4p,e,4p,e,p,e,4p,e,16p.,32d#,e,f#,4d#,4p,e,p,16e.,32p,e,p,e,p,e,16p.,32d#,e,f#,g#,a,g#,  4p,e,4p,e,p,e,4p,e,16p.,32d#,e,f#,e,16d#,16p,2a.4,p.,16g#4,a.4,g#.4,a4,b4,p,b4,p,  4e.4,b4,4p,4b4,p,a.4,16p,g#4,4a4,b.4,16p,b4,a4,g#4,1e4,p,4f#4,d#4,p,  4e.4,b4,4p,4b.4,a.4,16p,g#4,4a4,b.4,32p,32a#4,16b4,16p,e,16d#,16p,2b.4,16a4,16p,c#,4b.4,a4,g#4,  e4,d#4,e4,b4,p,e4,4b4,p,16a4,16p,4g#4,a4,16b4,16p,b4,16p.,32a#4,b4,16a.4,32g4,g#4,4e4,p,e4,p,e.4,f#.4,g#.4,a.4,16g#.4,32f4,f#4,  e.4,d#.4,b4,4p,4b4,p,a4,p,g#4,4a4,b4,16p.,32a4,16b.4,32p,e,d#,4b4,p,4b4,p,a4,c#,4b4,p,4b4"),
  new Rtttl("Bass:d=4,o=3,b=180:2e,8e,8b2,e.,8d#,e,f#,8e,d#,2e,8e,d#.,e.,f#,d#,"),
  new Rtttl("Percussion:d=64,o=6,b=180:4p,c,c,c5,c4,c3,32p.,8p,4p,c,c,c5,c4,c3,32p.,8p,4p,c,c,c5,c4,c3,32p.,8p,4p,c,c,c5,c4,c3,32p.,8p,4p,c,c,c5,c4,c3,32p.,8p,4p,c,c,c5,c4,c3,32p.,8p,4p,c,c,c5,c4,c3,32p.,8p,4p,c,c,c5,c4,c3,32p.,c,c,c5,c4,c3,32p.,"),
  new Rtttl("Chord_A:d=2,o=4,b=180:1b.3,c#"),
  new Rtttl("Chord_B:d=2,o=4,b=180:1e.,f#"),
  new Rtttl("Chord_C:d=2,o=4,b=180:1g#.,a"),
  new Rtttl("Chord_D:d=2,o=4,b=180:1b.,c#5"),
]
pwms = [
  new PWM_fake(1),
  new PWM_fake(2),
  new PWM_fake(1),
  new PWM_fake(1),
  new PWM_fake(1),
  new PWM_fake(1),
  new PWM_fake(1),
]
plyr = [
  new RtttlPlayer(song[0],pwms[0],512),
  new RtttlPlayer(song[1],pwms[1],768),
  new RtttlPlayer(song[2],pwms[2],512),
  new RtttlPlayer(song[3],pwms[3],128),
  new RtttlPlayer(song[4],pwms[4],128),
  new RtttlPlayer(song[5],pwms[5],128),
  new RtttlPlayer(song[6],pwms[6],128),
]
for(p of plyr)
p.start(1000,true)
tl=0
})()