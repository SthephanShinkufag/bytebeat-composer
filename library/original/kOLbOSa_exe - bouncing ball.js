xx=16,yy=16,f=q(xx,yy),draw(f),f[(t>>9)%yy][t%xx]/3.7*63;
//---------------------------//
function q(x,y){ // screen init
arr=Array(y);for(i=0;i<y;i++){arr[i]=Array(x)}return arr;
}
function draw(arr){ // drawing routine
t==0?px=2:0; // init once
t==0?py=2:0;
t==0?dpx=-1:0;
t==0?dpy=1:0;
for(y=0;y<yy;y++){for(x=0;x<xx;x++){arr[y][x]=0;}} // clr
if((px==xx-1)|(px==0)){t%8192==8191?dpx*=-1:0}; // if touches edges + on timing
if((py==yy-1)|(py==0)){t%8192==8191?dpy*=-1:0};
t%8192==8191?px+=dpx:0; // on timing
t%8192==8191?py+=dpy:0;
arr[px][py] = 15; // put px at this position
return arr;
}