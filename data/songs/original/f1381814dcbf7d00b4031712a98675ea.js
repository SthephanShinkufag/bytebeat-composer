sr=44100, // Sample rate

// Chords
q0="4_D_3_B2_92_92_94_D3_B2_92_92_923_C_2_A1_81_81_83_C2_A1_81_81_81",
q1="8_G_6_E4_D4_D4_D8_G6_E4_D4_D4_D47_F_5_D3_C3_C3_C7_F5_D3_C3_C3_C3",
q2="9_I98_G9_E9_E9_E9_I8_G9_E9_E9_E98_H87_F8_D8_D8_D8_H7_F8_D8_D8_D8",
q3="D_LDB_KD_ID_ID_ID_LB_KD_ID_ID_IDC_KCA_JC_HC_HC_HC_KA_JC_HC_HC_HC",
// Bass
b0="III_GG_EE_EE_GG_III_GG_EE_EE_GG_HHH_FF_DD_DD_FF_HHH_FF_DD_DD_FF_",
// Percussion
p0="KHHHSHKHHHKHSHHHKHHHSHKHHSKHSHKH",

// Note function
f=(n,i)=>2**((parseInt(n[int(t/i)%n.length],36)+3)/12)/4*448,
p=(n,i,v)=>{
	switch(n[int(t/i)%n.length]){
		case "K":return kik(t%i,v);break;
		case "H":return hat(t%i,v);break;
		case "S":return snr(t%i,v);break;
		default:return 0;
	}
},

// Waveforms
saw=(f,a)=>{x=(t/sr*f)%1*a;return isNaN(x)?0:x},

// Percussion
noi=(t,i)=>floor(t/i)**10%255/255,

kik=(t,v)=>{
	x=max(min((sin(sr/t/3)+1)/2*max(0,2-t/sr*32),1),0)*v;
	return isNaN(x)?0:x;
},
hat=(t,v)=>noi(t,1)*max(0,1-(t/sr*24))*v,
snr=(t,v)=>round(noi(t,sr/4096))*min(max(0,2-(t/sr*24)),1)*v,

v=128/4, // Chord volume

// Chords
saw(f(q0,sr/8),v-(t/sr*8)*v%v)+
saw(f(q1,sr/8),v-(t/sr*8)*v%v)+
saw(f(q2,sr/8),v-(t/sr*8)*v%v)+
saw(f(q3,sr/8),v-(t/sr*8)*v%v)+
// Bass
saw(f(b0,sr/8)/4,48)+
// Percussion
p(p0,sr/8,80)