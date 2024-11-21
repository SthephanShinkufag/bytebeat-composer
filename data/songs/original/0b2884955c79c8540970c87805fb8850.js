return function (time, sampleRate) { 
	function retval(num,req,arr=2){
		return num*((int(time*req)%arr)+1)
	}
	function kick(num,freq){
		return sin(num/(time*freq%1))
	}
	return (
	min(
		cos(
			(time*[retval(1400,8,8),retval(1600,4,4),retval(1700,4,4),retval(1700,4,8)][int(time/2)%4])
		),
	(time*8%2)-1)+kick(0.05,1)+kick(0.01,4)
	)/2
}