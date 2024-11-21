n='\n',a();function a(){
nt = t|0;
for(i=0;i<1024;i++)
{t = nt+i;
n+=String.fromCharCode(65+((t&t>>8)&255));
if(i%64==63){n+='\n'}}
if(t%64==63){throw n;}
return t&t>>8;}