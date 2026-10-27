/* NEO lite — masa holográfica + estado real de la voz.
   Estados: EN ESPERA, ESCUCHANDO, PENSANDO, HABLANDO, SIN RED.
   Todo se dibuja en el canvas: en el HUD no hay HTML visible (fondo negro = transparente).
   Avisos: se abren con ?a=texto (los manda el Vigia) y se pintan a una sola línea. */
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
/* fuente pixel VT323, servida junto al HUD (sin depender de Google) */
var fst=document.createElement("style");
fst.textContent="@font-face{font-family:VT323;src:url('static/fonts/VT323.woff2') format('woff2'),url('fonts/VT323.woff2') format('woff2');font-display:block}";
document.head.appendChild(fst);
var F="VT323,ui-monospace,Menlo,monospace";
try{if(document.fonts&&document.fonts.load)document.fonts.load("20px VT323");}catch(e){}

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
var estado="EN ESPERA", frase="", fraseTs=0, turnos=0, modoMin=false;

/* lo que dice NEO (subtitulo) */
var dice="", diceTs=0, diceFin=0;
/* aviso a una linea */
var aviso="", avisoTs=0, avisoOn=false;

window.NEO_SET=function(s){
  if(!s)return;
  var t=(""+s).toUpperCase();if(t=="ESPERA")t="TOCA PARA HABLAR";
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

/* NEO habla: su frase sale escrita abajo mientras suena el audio */
window.NEO_DICE=function(t){ dice=(""+t).replace(/\s+/g," ").trim(); diceTs=Date.now(); diceFin=0; };
window.NEO_CALLA=function(){ if(dice) diceFin=Date.now(); };

/* aviso: ocupa la pantalla a una sola linea, sin la masa */
window.NEO_AVISO=function(t){
  aviso=(""+t).replace(/\s+/g," ").trim(); avisoTs=Date.now();
  avisoOn=aviso.length>0;
  if(avisoOn){ estado="AVISO"; obj=[120,235,170]; }
};
window.NEO_AVISO_OFF=function(){ avisoOn=false; aviso=""; estado="EN ESPERA"; };

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

function envolver(t,max,ctx,maxL){
maxL=maxL||3;
var pal=t.split(" "),lineas=[],act="";
for(var i=0;i<pal.length;i++){
var w=pal[i];
if(ctx.measureText(w).width>max){          /* palabra mas larga que el ancho: se trocea */
if(act){lineas.push(act);act="";}
var tro="";
for(var c=0;c<w.length;c++){
var p2=tro+w.charAt(c);
if(ctx.measureText(p2).width>max&&tro){lineas.push(tro);tro=w.charAt(c);}
else tro=p2;}
if(tro)act=tro;
continue;}
var pue=act?act+" "+w:w;
if(ctx.measureText(pue).width>max&&act){lineas.push(act);act=w;}
else act=pue;}
if(act)lineas.push(act);
if(lineas.length>maxL){lineas=lineas.slice(0,maxL);lineas[maxL-1]=lineas[maxL-1].replace(/[.,;:]?$/,"")+"…";}
return lineas;}

function espaciado(txt,px,py,ex){
var ancho=0,i;
for(i=0;i<txt.length;i++)ancho+=x.measureText(txt.charAt(i)).width+ex;
var x0=px-ancho/2;
for(i=0;i<txt.length;i++){var c=txt.charAt(i);
x.fillText(c,x0,py);x0+=x.measureText(c).width+ex;}
return ancho;}

/* ── vista minima: sin masa, solo texto y pixel ── */
function pintaMinimo(t,ahora){
var esc=/ESCUCH|OYENDO/.test(estado),pen=/PENS|TRANSCR/.test(estado),hab=/HABL/.test(estado);
x.save();
x.textAlign="center";x.textBaseline="middle";
/* marca */
x.font="15px "+F;
x.fillStyle=rgb(0.42+0.18*Math.sin(t*2));
espaciado("N E O",CX,H*0.072,2.4);
/* linea fina */
x.strokeStyle=rgb(0.17);x.lineWidth=1;
x.beginPath();x.moveTo(CX-W*0.24,H*0.112);x.lineTo(CX+W*0.24,H*0.112);x.stroke();
/* pixelera: cuadraditos que laten con la voz */
var N=38,paso=(W*0.72)/N,xi0=CX-W*0.36,yy=H*0.655;
for(var i=0;i<N;i++){
var u=Math.abs(i/(N-1)*2-1);
var env=Math.max(0,1-u*1.06);
var amp=0.16+0.84*(ns*0.8+0.20*Math.abs(Math.sin(t*7+i*0.62)));
var alto=2+11*env*amp*(hab?1.25:0.62);
var alfa=0.07+0.52*env*(0.30+0.70*amp);
x.fillStyle=rgb(alfa);
x.fillRect(xi0+i*paso,yy-alto/2,Math.max(2,paso*0.55),Math.max(2,alto));}
/* pensando: tres pixelitos girando */
if(pen){for(var k=0;k<3;k++){var a=t*2.3+k*2.09;
x.fillStyle=rgb(0.75);
x.fillRect(CX+Math.cos(a)*52,yy+Math.sin(a)*14-2,3,3);}}
x.restore();}


function textos(t){
var ahora=Date.now();
x.textAlign="center";x.textBaseline="middle";
/* respuesta: aparece y se apaga sola a los 9 s */
var alfa=frase?Math.max(0,Math.min(1,(9000-(ahora-fraseTs))/1500)):0;
if(alfa>0.01){
x.save();
x.font="19px "+F;
x.shadowColor="rgba(0,0,0,0.95)";x.shadowBlur=9;x.shadowOffsetY=1;
x.fillStyle="rgba(238,255,246,"+(0.94*alfa).toFixed(3)+")";
var ls=envolver(frase,W-44,x);
var y0=(modoMin?H*0.205:H*0.70)-(ls.length-1)*12;
for(var i=0;i<ls.length;i++)x.fillText(ls[i],CX,y0+i*24);
x.restore();}
/* NEO habla: subtitulo blanco mientras sueña el audio, se queda 4 s despues */
if(dice){
var fin=diceFin||ahora;
var a2=(ahora-fin<4000)?Math.min(1,(ahora-diceTs)/260):Math.max(0,(4000-(ahora-fin))/900);
if(a2>0.01){
x.save();
x.globalAlpha=Math.min(1,a2);
x.font="22px "+F;
x.shadowColor="rgba(0,120,140,0.85)";x.shadowBlur=12;
x.fillStyle="rgba(240,255,255,0.97)";
var ld=envolver(dice,W-46,x);
var yd=(modoMin?H*0.42:H*0.82)-(ld.length-1)*13;
for(var j=0;j<ld.length;j++)x.fillText(ld[j],CX,yd+j*26);
x.restore();}}
/* estado */
x.save();
x.font="15px "+F;
x.shadowColor="rgba(0,0,0,0.95)";x.shadowBlur=7;x.shadowOffsetY=1;
x.fillStyle="rgba(240,255,250,"+(0.86+0.10*Math.sin(t*3)).toFixed(3)+")";
var ancho=espaciado(estado,CX,H*0.935,1.8);
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

var t0Latido=(new Date()).getTime();
function punto(t){ /* punto de estado arriba a la derecha; late una vez por hora */
var err=/ERROR|SIN RED|SIN MICRO|SIN SENAL|FALLO/.test(estado);
var esc=/ESCUCH|OYENDO/.test(estado),pen=/PENS|TRANSCR/.test(estado),hab=/HABL/.test(estado);
var c=err?[255,64,84]:(esc?[70,220,255]:(pen?[255,168,60]:(hab?[125,255,178]:[120,235,170])));
var ahora=(new Date()).getTime(),ciclo=(ahora-t0Latido)%3600000;
var latido=ciclo<5000,per=latido?170:950;
var a=(latido?0.4:0.6)+0.4*(0.5+0.5*Math.sin(ahora/per));
var r=latido?5.5:4,px=W-16,py=16;
x.save();
var g=x.createRadialGradient(px,py,0,px,py,r*4);
g.addColorStop(0,"rgba("+c[0]+","+c[1]+","+c[2]+","+(0.5*a)+")");
g.addColorStop(1,"rgba("+c[0]+","+c[1]+","+c[2]+",0)");
x.fillStyle=g;x.beginPath();x.arc(px,py,r*4,0,7);x.fill();
x.fillStyle="rgba("+c[0]+","+c[1]+","+c[2]+","+a+")";x.beginPath();x.arc(px,py,r,0,7);x.fill();
if(latido){var f=(ciclo%1000)/1000;
x.strokeStyle="rgba("+c[0]+","+c[1]+","+c[2]+","+(0.5*(1-f))+")";x.lineWidth=1.2;
x.beginPath();x.arc(px,py,r+11*f,0,7);x.stroke();}
x.restore();}

/* ── aviso: una sola linea, sin masa, sobre negro ── */
function pintaAviso(t,ahora){
var e=Math.min(1,(ahora-avisoTs)/260);
x.save();x.globalAlpha=e;
/* halo tenue detras */
x.globalCompositeOperation="lighter";
var g=x.createRadialGradient(CX,H*0.5,0,CX,H*0.5,W*0.85);
g.addColorStop(0,"rgba(40,120,90,0.16)");g.addColorStop(1,"rgba(0,0,0,0)");
x.fillStyle=g;x.fillRect(0,0,W,H);
x.globalCompositeOperation="source-over";
/* marca */
x.textAlign="center";x.textBaseline="middle";
x.font="14px "+F;
x.fillStyle="rgba(120,235,170,"+(0.55+0.25*Math.sin(t*2)).toFixed(3)+")";
espaciado("N E O",CX,H*0.30,2.6);
/* linea fina */
x.strokeStyle="rgba(120,235,170,0.22)";x.lineWidth=1;
x.beginPath();x.moveTo(CX-W*0.20,H*0.35);x.lineTo(CX+W*0.20,H*0.35);x.stroke();
/* texto del aviso */
x.font="24px "+F;
x.shadowColor="rgba(0,0,0,0.9)";x.shadowBlur=8;
x.fillStyle="rgba(238,255,246,0.97)";
var la=envolver(aviso,W-54,x,5);
var ya=H*0.47-(la.length-1)*13;
for(var i=0;i<la.length;i++)x.fillText(la[i],CX,ya+i*27);
/* pista */
x.shadowBlur=0;
x.font="14px "+F;
x.fillStyle="rgba(150,200,180,0.42)";
espaciado("D I   H E C H O   O   L U E G O",CX,H*0.68,1.4);
x.restore();}

/* ── arranque: secuencia de encendido, 2,4 s ── */
var tBoot=null;
function pintaArranque(ahora){
if(tBoot===null)tBoot=ahora;
var e=ahora-tBoot;
if(e>2400)return false;
var u=e/2400;
x.save();
/* anillos que se abren */
x.globalCompositeOperation="lighter";
for(var i=0;i<3;i++){
var f=Math.max(0,Math.min(1,(u*1.5)-(i*0.12)));
if(f<=0)continue;
var rr=R*(0.45+1.8*f);
x.strokeStyle="rgba(120,235,180,"+(0.38*(1-f)).toFixed(3)+")";
x.lineWidth=1.2;
x.beginPath();x.arc(CX,H*0.42,rr,0,7);x.stroke();}
/* barrido vertical */
var sy=H*0.12+H*0.72*u;
x.strokeStyle="rgba(120,235,180,0.20)";x.lineWidth=1;
x.beginPath();x.moveTo(0,sy);x.lineTo(W,sy);x.stroke();
x.globalCompositeOperation="source-over";
/* N E O */
x.textAlign="center";x.textBaseline="middle";
x.font="40px "+F;
var aNeo=Math.max(0,Math.min(1,(e-200)/400))*(e>1900?Math.max(0,1-(e-1900)/400):1);
x.fillStyle="rgba(235,255,250,"+aNeo.toFixed(3)+")";
x.shadowColor="rgba(80,255,200,0.55)";x.shadowBlur=18;
espaciado("NEO",CX,H*0.42,9);
/* SISTEMAS EN LINEA */
x.font="14px "+F;
x.shadowBlur=8;
var aSis=Math.max(0,Math.min(1,(e-700)/400))*(e>1900?Math.max(0,1-(e-1900)/400):1);
x.fillStyle="rgba(150,255,215,"+aSis.toFixed(3)+")";
espaciado("S I S T E M A S   E N   L I N E A",CX,H*0.50,1.6);
/* linea que se cierra */
var f2=Math.max(0,Math.min(1,(e-400)/900));
x.strokeStyle="rgba(120,235,180,"+(0.30*(1-u)).toFixed(3)+")";x.lineWidth=1;
x.beginPath();x.moveTo(CX-W*0.30*f2,H*0.46);x.lineTo(CX+W*0.30*f2,H*0.46);x.stroke();
x.restore();
return true;
}

var qp={};
(function(){var s=(location.search||"").replace(/^\?/,"").split("&");
for(var i=0;i<s.length;i++){var p=s[i].split("=");
if(p[0]){try{qp[decodeURIComponent(p[0])]=decodeURIComponent((p[1]||"").replace(/\+/g,"%20"));}
catch(e){qp[p[0]]=p[1]||"";}}}})();
if(qp.a){window.NEO_AVISO(qp.a);}

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
var ahora=(new Date()).getTime();
var diceVivo=dice&&(ahora-(diceFin||ahora)<4000);
modoMin=(escuchando||pensando||hablando||diceVivo)&&!avisoOn;
if(avisoOn){
pintaAviso(t,ahora);
}else if(modoMin){
pintaMinimo(t,ahora);
}else{
if(escuchando)anillo(cy,t);
cuerpo(cy,t,blob(cy,t));
barras(cy,t);
if(pensando)orbitas(cy,t);
}
textos(t);
punto(t);
if(!avisoOn)pintaArranque(ahora);
x.globalCompositeOperation="source-over";
requestAnimationFrame(loop);}
requestAnimationFrame(loop);})();
