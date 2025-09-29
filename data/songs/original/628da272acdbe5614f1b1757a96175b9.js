t?0:(
	mn=(a,mi=0,ma=255)=>min(max(a,mi),ma),
	f=[],
	bllp=(a,u,d=u)=>(
		f[fi] ??= 0,
		f[fi] = f[fi] < a ? max(f[fi]+u,a) : min(f[fi]-d,a),
		f[fi++]
	),
	llp=(a,u,d=u)=>(
		f[fi] ??= 0,
		f[fi] = f[fi] < a ? min(f[fi]+u,a) : max(f[fi]-d,a),
		f[fi++]
	),
	lhp=(a,u,d=u)=>a-llp(a,u,d),
	lhb=(a,u,b)=>a+lhp(a,u)*b,
	B = (()=>{
		function Buffer (size,sd=1) {
			this.a = Array.from({length:size},x=>0);
			this.s = size;
			this.sd = sd;
		}
		Buffer.prototype.read = function (i, offs = 0) {
			i = (i+this.s*this.sd-offs)/this.sd;
			const ii = i|0;
			const d = i-ii;
			const r = this.a[ii % this.s]*(1-d) + this.a[(ii+1) % this.s]*d;
			return r;
		};
		Buffer.prototype.write = function (i, v) {
			this.a[(i/this.sd % this.s)|0] = v;
		};
		return Buffer;
	})(),
	PPD = (()=>{
		function PingPongDelay (size,sd=1) {
			this.b = [new B(size,sd), new B(size,sd)];
		}
		PingPongDelay.prototype.fn = function (lr, i, a, t, fb, dw) {
			const r = this.b[lr].read(i,t);
			this.b[lr^1].write(i, a*lr+r*(lr?fb:1));
			return a*(1-dw)+r*dw||0;
		}
		return PingPongDelay;
	})(),
	ppd1=new PPD(3e4,1.5)
),fi=0,
mc=(t,lr)=>{
	let T=t;
	T=T*2**(7/12-1*(t>>17&1));
	return ((T*[0.8,0.25,.667,.667][t>>17&3]&T*(.39+.005*lr+.11*!!(t>>17&3)))&255)*.5
},
arp=((t*4/([[1,1.124,1.335,1.682,1.5,1.335,1.335,2][t>>17&7]*[1.5,1][t>>12&1],2.67,4,2][(t>>13)%3]))&255),
arp=llp(arp&196,70e3/(t%4096)),
Ke=t%(8192*[
1,0,1,1, 0,1,1,0 ,1,0,1,1, 0,1,1,1,
1,0,1,1, 0,1,1,1 ,1,0,1,1, 0,1,1,.5,
1,0,1,1, 0,1,1,0 ,1,0,1,1, 0,1,1,1,
1,0,1,1, 0,1,1,1 ,0,1,.5,1, 1,1,.5,.5,

1,0,1,1 ,0,1,1,0 ,1,1,0,1 ,1,0,1,1, 
1,1,0,1 ,1,0,1,1 ,0,.5,1,1 ,1,.25,.5,1,
1,1,0,1 ,1,0,1,1 ,0,1,.5,1 ,1,1,.5,1,
1,.5,.5,1 ,.5,.5,1,.5 ,1,.5,1,1 ,.5,.5,.25,.08,
][t>>13&127]),
Ke||=0,
KK=llp((3e4*(Ke)**.03)&128,1e5/Ke),
laser=llp(lhp((3e4*(t%(4096))**.03)&128,1),min(6e3/(t%(4096)),60)),
s=lr=>(
	mx=(
		lhp(
			llp(lhb(mc(t,lr?1:-1),6,2),50)
				*1.3
			+ppd1.fn(lr,t,lhb(arp,10,1)*.9,2e4,.5,.38)
		,.1)
		+llp(
			KK/2
			+laser/2
		,300)
		+100
	),
	min(max(mx*1.2,0),255)
),
[s(1),s(0)]