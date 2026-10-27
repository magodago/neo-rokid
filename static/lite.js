/* NEO lite — masa holográfica + estado real de la voz.
   Estados: EN ESPERA, ESCUCHANDO, PENSANDO, HABLANDO, SIN RED.
   Todo se dibuja en el canvas: en el HUD no hay HTML visible (fondo negro = transparente). */
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

/* ── paleta por estado ── */
var PAL={
  "EN ESPERA":[110,140,125],
  "TOCA PARA HABLAR":[110,140,125],
  "ESCUCHANDO":[70,220,255],
  "OYENDO":[70,220,255],
  "PENSANDO":[255,168,60],
  "TRANSCRIBIENDO":[255,168,60],
  "HABLANDO":[125,255,178],
  "SIN RED":[255,64,84],
  "ERROR DE RED":[255,64,84],
  "SIN MICRO":[255,64,84],
  "MIC SIN SENAL":[255,120,90],
  "MIC SIN SEÑAL":[255,120,90]
};
var col=[110,140,125], obj=[110,140,125];
var estado="EN ESPERA", frase="", fraseTs=0, turnos=0;

window.NEO_SET=function(s){
  if(!s)return;
  var t=(""+s).toUpperCase();
  estado=t;
  var p=PAL[t];
  if(!p){
    if(/SIN RED|ERROR|MICRO|SEÑAL|SENAL|FALLO|NO TE HE/.test(t)) p=PAL["SIN RED"];
    else if(/ESCUCH|OYENDO/.test(t)) p=PAL["ESCUCHANDO"];
    else if(/PENS|TRANSCR/.test(t)) p=PAL["PENSANDO"];
    else if(/HABL/.test(t)) p=PAL["HABLANDO"];
    else p=PAL["EN ESPERA"];
  }
  obj=p;
};
window.NEO_TEXTO=function(t){ frase=(""+t).replace(/\s+/g," ").trim(); fraseTs=Date.now(); };
window.NEO_TURNO=function(n){ turnos=(n|0); };
window.NEO_TAP=function(){};
window.NEO_PTT=function(){};

function rgb(a){return "rgba("+(col[0]|0)+","+(col[1]|0)+","+(col[2]|0)+","+a+")";}

function m(){W=innerWidth||document.documentElement.clientWidth||480;
H=innerHeight||document.documentElement.clientHeight||640;
cv.width=W;cv.height=H;cv.style.width=W+"px";cv.style.height=H+"px";
CX=W/2;CY=H*0.34;R=Math.min(W,H)*0.20;}
addEventListener("resize",m);m();

window.NEO_NIVEL=function(v){niv=Math.max(0,Math.min(1,v));};

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
g.addColorStop(0,rgb(0.20));g.addColorStop(1,"rgba(0,0,0,0)");
x.fillStyle=g;x.beginPath();x.arc(CX,cy,R*2.2,0,7);x.fill();
path(pts);
var g2=x.createRadialGradient(CX-R*0.30,cy-R*0.38,R*0.05,CX,cy,R*1.40);
g2.addColorStop(0,"rgba(235,255,255,0.34)");
g2.addColorStop(0.32,rgb(0.36));
g2.addColorStop(0.72,rgb(0.18));
g2.addColorStop(0.92,"rgba(130,50,230,0.10)");
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
x.strokeStyle=rgb(0.45+0.40*ns);
x.lineWidth=1.4;x.stroke();}

function barras(cy,t){
if(ns<0.012)return;
var N=29,w=R*2.3,xi,h,env;
var base=cy+R*1.32;x.lineCap="round";
for(var i=0;i<N;i++){xi=CX-w/2+i*w/(N-1);
var u=i/(N-1)*2-1;env=Math.max(0,Math.cos(u*1.30));
h=(0.08+0.92*ns*(0.45+0.55*Math.abs(Math.sin(t*7+i*0.75))))*R*0.62*env;
x.strokeStyle=rgb(0.18+0.62*ns);
x.lineWidth=2;x.beginPath();x.moveTo(xi,base);x.lineTo(xi,base+h);x.stroke();}}

function anillo(cy,t){ /* aro que respira mientras escucha */
x.globalCompositeOperation="lighter";
var pulso=0.5+0.5*Math.sin(t*2.2);
x.strokeStyle=rgb(0.14+0.22*pulso);
x.lineWidth=1.2;
x.beginPath();x.arc(CX,cy,R*(1.28+0.05*pulso),0,Math.PI*2);x.stroke();
x.globalCompositeOperation="source-over";}

function orbitas(cy,t){ /* tres puntos girando: está pensando */
x.globalCompositeOperation="lighter";
for(var i=0;i<3;i++){
var a=t*2.4+i*2.09, rr=R*1.34;
var px=CX+Math.cos(a)*rr, py=cy+Math.sin(a)*rr*0.55;
x.fillStyle=rgb(0.55+0.30*Math.sin(t*3+i));
x.beginPath();x.arc(px,py,2.6,0,7);x.fill();}
x.globalCompositeOperation="source-over";}

function envolver(t,max,ctx){
var pal=t.split(" "),lineas=[],act="";
for(var i=0;i<pal.length;i++){
var pue=act?act+" "+pal[i]:pal[i];
if(ctx.measureText(pue).width>max&&act){lineas.push(act);act=pal[i];}
else act=pue;}
if(act)lineas.push(act);
if(lineas.length>3){lineas=lineas.slice(0,3);lineas[2]=lineas[2].replace(/[.,;:]?$/,"")+"…";}
return lineas;}

function espaciado(txt,px,py,ex){
var ancho=0,i;
for(i=0;i<txt.length;i++)ancho+=x.measureText(txt.charAt(i)).width+ex;
var x0=px-ancho/2;
for(i=0;i<txt.length;i++){var c=txt.charAt(i);
x.fillText(c,x0,py);x0+=x.measureText(c).width+ex;}
return ancho;}

function textos(t){
var ahora=Date.now();
x.textAlign="center";x.textBaseline="middle";
/* respuesta: aparece y se apaga sola a los 9 s */
var alfa=frase?Math.max(0,Math.min(1,(9000-(ahora-fraseTs))/1500)):0;
if(alfa>0.01){
x.save();
x.font="600 15px ui-monospace,Menlo,monospace";
x.shadowColor="rgba(0,0,0,0.95)";x.shadowBlur=9;x.shadowOffsetY=1;
x.fillStyle="rgba(238,255,246,"+(0.94*alfa).toFixed(3)+")";
var ls=envolver(frase,W-44,x);
var y0=H*0.73-(ls.length-1)*10;
for(var i=0;i<ls.length;i++)x.fillText(ls[i],CX,y0+i*20);
x.restore();}
/* estado */
x.save();
x.font="500 11px ui-monospace,Menlo,monospace";
x.shadowColor="rgba(0,0,0,0.95)";x.shadowBlur=7;x.shadowOffsetY=1;
x.fillStyle="rgba(240,255,250,"+(0.86+0.10*Math.sin(t*3)).toFixed(3)+")";
var ancho=espaciado(estado,CX,H*0.935,2.2);
/* punto de color: dice el estado de un vistazo, sin leer */
x.shadowBlur=0;
x.fillStyle=rgb(0.95);
x.beginPath();x.arc(CX-ancho/2-11,H*0.935,3,0,7);x.fill();
x.restore();
/* turnos: puntitos discretos abajo a la derecha */
if(turnos>0){
x.fillStyle=rgb(0.35);
for(var k=0;k<Math.min(turnos,9);k++){
x.beginPath();x.arc(W-14-k*7,H-10,1.8,0,7);x.fill();}}
}

function loop(ts){var t=ts/1000;
if(!cv.parentNode)document.body.appendChild(cv);if(!W||!H)m();
for(var i=0;i<3;i++)col[i]+=(obj[i]-col[i])*0.12;
var escuchando=/ESCUCH|OYENDO/.test(estado);
var pensando=/PENS|TRANSCR/.test(estado);
var hablando=/HABL/.test(estado);
ns=ns*0.85+niv*0.15;
if(hablando){var f=0.42+0.30*Math.abs(Math.sin(t*6.5));if(f>ns)ns=ns*0.6+f*0.4;}
var cy=CY+Math.sin(t*0.7)*4;
x.clearRect(0,0,W,H);
if(escuchando)anillo(cy,t);
cuerpo(cy,t,blob(cy,t));
barras(cy,t);
if(pensando)orbitas(cy,t);
textos(t);
/* latido: punto verde arriba a la izquierda, un pulso por minuto */
var ph=(t%60)/60, pulso=ph<0.05?Math.sin(ph/0.05*Math.PI):0;
x.save();x.globalCompositeOperation="lighter";
x.fillStyle="rgba(43,255,136,"+(0.18+0.82*pulso).toFixed(2)+")";
x.shadowColor="rgba(43,255,136,"+(0.45+0.55*pulso).toFixed(2)+")";
x.shadowBlur=pulso>0?10:0;
x.beginPath();x.arc(14,14,3.4+1.8*pulso,0,7);x.fill();
x.restore();
x.globalCompositeOperation="source-over";
requestAnimationFrame(loop);}
requestAnimationFrame(loop);})();
