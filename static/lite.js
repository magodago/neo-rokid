(function(){
var b=document.body;
b.style.cssText="background:#000;margin:0;overflow:hidden";
document.documentElement.style.background="#000";
var st=document.createElement("style");
st.textContent="body{background:#000!important}*{background-color:transparent!important}";
document.head.appendChild(st);
var cv=document.createElement("canvas");b.appendChild(cv);
cv.style.cssText="position:fixed;left:0;top:0";
[].forEach.call(b.children,function(e){if(e!==cv)e.style.display="none"});
var x=cv.getContext("2d"),W,H,CX,CY,R,niv=0,ns=0;
function m(){W=innerWidth||document.documentElement.clientWidth||480;
H=innerHeight||document.documentElement.clientHeight||640;
cv.width=W;cv.height=H;cv.style.width=W+"px";cv.style.height=H+"px";
CX=W/2;CY=H*0.34;R=Math.min(W,H)*0.20;}
addEventListener("resize",m);m();
window.NEO_NIVEL=function(v){niv=Math.max(0,Math.min(1,v));};
window.NEO_SET=window.NEO_TEXTO=window.NEO_TAP=function(){};
function path(pts){x.beginPath();
for(var i=0;i<pts.length;i++){var q=pts[i];
if(i)x.lineTo(q[0],q[1]);else x.moveTo(q[0],q[1]);}x.closePath();}
function blob(cy,t){var pts=[],N=72,a,rr;
for(var i=0;i<N;i++){a=i/N*Math.PI*2;
rr=R*(1+0.10*Math.sin(3*a+t*1.1)+0.06*Math.sin(5*a-t*0.9)
+0.035*Math.sin(8*a+t*1.7)+0.06*ns*Math.sin(2*a+t*3))*(1+0.028*Math.sin(t*1.5));
pts.push([CX+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
return pts;}
function cuerpo(cy,t,pts){
x.globalCompositeOperation="lighter";
var g=x.createRadialGradient(CX,cy,R*0.5,CX,cy,R*2.2);
g.addColorStop(0,"rgba(0,190,255,0.14)");g.addColorStop(1,"rgba(0,0,0,0)");
x.fillStyle=g;x.beginPath();x.arc(CX,cy,R*2.2,0,7);x.fill();
path(pts);
var g2=x.createRadialGradient(CX-R*0.30,cy-R*0.38,R*0.05,CX,cy,R*1.40);
g2.addColorStop(0,"rgba(205,255,255,0.40)");
g2.addColorStop(0.35,"rgba(0,200,248,0.20)");
g2.addColorStop(0.72,"rgba(130,50,230,0.15)");
g2.addColorStop(1,"rgba(0,0,0,0)");
x.fillStyle=g2;x.fill();
x.save();path(pts);x.clip();x.globalCompositeOperation="source-over";
var g3=x.createRadialGradient(CX,cy+R*0.85,0,CX,cy+R*0.85,R*1.15);
g3.addColorStop(0,"rgba(3,10,32,0.40)");g3.addColorStop(1,"rgba(0,0,0,0)");
x.fillStyle=g3;x.fillRect(CX-R*2.4,cy-R*2.4,R*4.8,R*4.8);
x.restore();
x.save();path(pts);x.clip();x.globalCompositeOperation="lighter";
var g4=x.createRadialGradient(CX-R*0.30,cy-R*0.40,0,CX-R*0.30,cy-R*0.40,R*0.62);
g4.addColorStop(0,"rgba(225,255,255,0.20)");
g4.addColorStop(0.45,"rgba(200,250,255,0.07)");
g4.addColorStop(1,"rgba(255,255,255,0)");
x.fillStyle=g4;x.fillRect(CX-R*1.2,cy-R*1.2,R*2.4,R*2.4);
x.restore();
x.strokeStyle="rgba(160,250,255,"+(0.30+0.35*ns)+")";
x.lineWidth=1.4;x.stroke();}
function barras(cy,t){if(ns<0.012)return;
var N=29,w=R*2.3,xi,h,env;
var base=cy+R*1.32;x.lineCap="round";
for(var i=0;i<N;i++){xi=CX-w/2+i*w/(N-1);
var u=i/(N-1)*2-1;env=Math.max(0,Math.cos(u*1.30));
h=(0.08+0.92*ns*(0.45+0.55*Math.abs(Math.sin(t*7+i*0.75))))*R*0.62*env;
x.strokeStyle="rgba(150,248,255,"+(0.18+0.62*ns)+")";
x.lineWidth=2;x.beginPath();x.moveTo(xi,base);x.lineTo(xi,base+h);x.stroke();}}
function loop(ts){var t=ts/1000;
if(!cv.parentNode)document.body.appendChild(cv);if(!W||!H)m();
ns=ns*0.85+niv*0.15;
var cy=CY+Math.sin(t*0.7)*4;
x.clearRect(0,0,W,H);
cuerpo(cy,t,blob(cy,t));
barras(cy,t);
x.globalCompositeOperation="source-over";
requestAnimationFrame(loop);}
requestAnimationFrame(loop);})();
