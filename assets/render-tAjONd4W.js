var e=[{id:`pulse`,label:`Pulse`},{id:`fractal`,label:`Fractal Bloom`},{id:`jelly`,label:`Jelly`},{id:`tunnel`,label:`Tunnel`},{id:`lasers`,label:`Lasers`},{id:`terrain`,label:`Bass Terrain`}],t=[{id:`neon`,label:`Neon`},{id:`sunset`,label:`Sunset`},{id:`mono`,label:`Mono`}],n={neon:{a:`#5eead4`,b:`#e879f9`,c:`#fbbf24`,rgb:[[94,234,212],[232,121,249],[251,191,36]]},sunset:{a:`#fb7185`,b:`#fb923c`,c:`#fdba74`,rgb:[[251,113,133],[251,146,60],[253,186,116]]},mono:{a:`#f4f4f5`,b:`#a1a1aa`,c:`#d4d4d8`,rgb:[[244,244,245],[161,161,170],[212,212,216]]}},r=64;function i(){let e=[];for(let t=0;t<10;t++)e.push(t/10);return{trail:[],laserT:0,rings:e,bursts:[],burstArmed:!0,lastT:0,gpu:null,gpuChecked:!1,tunnel:null}}function a(e=0){return{time:e,rms:.05,bass:.05,mid:.05,treble:.04,beat:0,drop:0,kick:0,drive:1,bars:new Float32Array(48),wave:new Float32Array(96)}}function o(e,t){let r=n[e];return t>.5?{a:r.c,b:r.a,c:r.b,rgb:[r.rgb[2],r.rgb[0],r.rgb[1]]}:r}function s(e,t){return t%3==0?e.a:t%3==1?e.b:e.c}function c(e){return Math.max(.35,e.drive||1)}function l(e,t,n,r,i,a,s={theme:`neon`,reduceFlashing:!0,dropFx:!0}){let c=a.lastT?Math.min(.05,Math.max(.001,r.time-a.lastT)):.016;a.lastT=r.time;let l=s.dropFx!==!1,f=o(s.theme,l?r.drop:0);e.clearRect(0,0,t,n),e.fillStyle=`#050506`,e.fillRect(0,0,t,n),i===`pulse`?u(e,t,n,r,a,f):i===`fractal`?k(e,t,n,r,a,f,s,c):i===`jelly`?z(e,t,n,r,a,f,s,c):i===`tunnel`?d(e,t,n,r,a,f,s,c):i===`lasers`?B(e,t,n,r,a,f,s,c):V(e,t,n,r,f),l&&H(e,t,n,r,a,f,s.reduceFlashing),e.globalAlpha=1}function u(e,t,n,i,a,o){let l=t*.5,u=n*.46,d=c(i),f=Math.min(t,n)*(.07+i.bass*.2*d+i.beat*.09*d),p=e.createRadialGradient(l,u,f*.2,l,u,f*3.2),m=o.rgb[0],h=o.rgb[1];p.addColorStop(0,`rgba(${m[0]}, ${m[1]}, ${m[2]}, ${.35+i.rms*.4})`),p.addColorStop(.45,`rgba(${h[0]}, ${h[1]}, ${h[2]}, ${.12+i.mid*.2})`),p.addColorStop(1,`rgba(5, 5, 6, 0)`),e.fillStyle=p,e.fillRect(0,0,t,n),e.beginPath(),e.fillStyle=`#f4f4f5`,e.globalAlpha=.85,e.arc(l,u,f*.45,0,Math.PI*2),e.fill(),e.globalAlpha=1;let g=i.bars.length,_=Math.max(2,t*.72/g-3),v=(t-g*(_+3))/2,y=n*.86;for(let t=0;t<g;t++){let r=i.bars[t]??0,a=Math.max(3,r*n*(.18+.22*d));e.fillStyle=s(o,t),e.globalAlpha=.45+r*.55,e.fillRect(v+t*(_+3),y-a,_,a)}e.globalAlpha=1;let b=i.wave[Math.floor(i.time*30)%i.wave.length]??0;a.trail.push({x:l+Math.sin(i.time*.7)*t*.22+b*t*.08,y:u+Math.cos(i.time*.55)*n*.12+(i.wave[8]??0)*n*.18}),a.trail.length>r&&a.trail.shift(),e.lineWidth=2,e.lineCap=`round`,e.lineJoin=`round`;for(let t=1;t<a.trail.length;t++){let n=a.trail[t-1],r=a.trail[t],i=t/a.trail.length;e.strokeStyle=s(o,Math.floor(i*3)),e.globalAlpha=i*.85,e.beginPath(),e.moveTo(n.x,n.y),e.lineTo(r.x,r.y),e.stroke()}e.globalAlpha=1}function d(e,t,n,r,i,a,o,s){let c=o.reduceFlashing!==!1,l=1-h(.1,.45,r.rms*.65+r.bass*.8+r.kick*.35),u=h(.15,.75,r.bass*.65+r.kick*.7+r.rms*.25),d=s/.0167,b=g(e,t,n,o),x=_(b,t,n),S=y(i,t,n,b);S.breath+=s*.7,r.drop>.62&&S.armed&&(S.lurch=1,S.armed=!1),r.drop<.14&&(S.armed=!0),S.lurch=Math.max(0,S.lurch-s/1.55);let C=Math.min(1,r.kick*.75+r.bass*.35+S.lurch*.4),w=1-Math.exp(-s*(c?7:18));S.glow+=(C-S.glow)*w;let T=S.lurch*S.lurch,E=(.016+u*.01)*d*(1-l*.94),D=Math.sin(S.breath)*.014*d,O=T*.028*d,k=Math.min(1.045,Math.max(.984,1+E*(1-l)+D*l+O)),A=Math.sin(r.time*.17)*(.006+u*.016)*d*(.2+.8*(1-l));S.spin+=A;let j=S.front,M=S.back,N=M.getContext(`2d`);if(!N)return;let P=S.w,F=S.h,I=P*.5,L=F*.5,R=.4+.6*(1-l),z=c?.78:1,B=S.glow,V=Math.min(P,F),H=0;for(let e of a.rgb)H=Math.max(H,Math.max(...e)-Math.min(...e));let U=H<28;S.depths.length!==x.rings&&(S.depths=v(x.rings)),S.planes.length!==x.planes&&(S.planes=v(x.planes));let W=.05+u*.27;W*=1-l*.8,W+=T*1.15,W*=1+B*.24;let G=S.depths;for(let e=0;e<G.length;e++){let t=G[e]+W*s;t>=1&&--t,G[e]=t}let K=S.planes,ee=W*1.22;for(let e=0;e<K.length;e++){let t=K[e]+ee*s;t>=1&&--t,K[e]=t}let te=.45+.55*(1-l),q=I+(Math.sin(r.time*.23)*.16+Math.sin(r.time*.07+1.2)*.06)*P*te,J=L+(Math.cos(r.time*.19)*.11+Math.sin(r.time*.11)*.04)*F*te,ne=I+(q-I)*.1,re=L+(J-L)*.1,ie=1+Math.sin(S.breath)*.04*l,ae=1+T*(c?.1:.18),Y=S.lurch>.45?2:+(S.lurch>.2),X=S.spin*.65;N.setTransform(1,0,0,1,0,0),N.globalAlpha=1,N.globalCompositeOperation=`source-over`,N.fillStyle=`#050506`,N.fillRect(0,0,P,F),N.save(),N.translate(q,J),N.rotate(A),N.scale(k,k),N.translate(-q,-J),N.globalAlpha=l>.55?.968:.988,N.drawImage(j,0,0),N.restore();let oe=l>.55?.035:.014;N.globalAlpha=1,N.fillStyle=`rgba(5, 5, 6, ${oe})`,N.fillRect(0,0,P,F);let Z=(e,t)=>{let n=a.rgb[(e%3+3)%3],r=Math.max(0,t)**.8;if(U){let e=Math.round(26+r*128);return`rgb(${e}, ${e}, ${e})`}let i=.22+r*.78;return`rgb(${Math.round(n[0]*i+5)}, ${Math.round(n[1]*i+5)}, ${Math.round(n[2]*i+6)})`},se=(e,t,n)=>{let r=a.rgb[(e%3+3)%3],i=Math.max(0,t)**.8;if(U){let e=Math.round(26+i*128);return`rgba(${e}, ${e}, ${e}, ${n})`}let o=.22+i*.78;return`rgba(${Math.round(r[0]*o+5)}, ${Math.round(r[1]*o+5)}, ${Math.round(r[2]*o+6)}, ${n})`},ce=(e,t=1)=>{let n=e**1.42;return{x:q+(ne-q)*n,y:J+(re-J)*n,radius:V*(.03+n*.86)*ie*t*ae,depth:n}},Q=[];for(let e=0;e<G.length;e++)Q.push(e);Q.sort((e,t)=>G[e]-G[t]),f(N,q,J,V,a,U,{bass:r.bass,glow:B,rush:T,dim:R,punch:z,reduce:c,rot:X,shift:Y}),N.lineCap=`round`,N.lineJoin=`round`;let le=Math.min(.22,(.08+B*.04)*R*z),ue=x.walls;for(let e=0;e<ue;e++){N.beginPath();let t=!1;for(let n=0;n<Q.length;n++){let r=G[Q[n]];if(r<.12||r>.9)continue;let i=ce(r),a=e/ue*Math.PI*2+X+(1-r)*.75,o=i.x+Math.cos(a)*i.radius,s=i.y+Math.sin(a)*i.radius;t?N.lineTo(o,s):(N.moveTo(o,s),t=!0)}t&&(N.strokeStyle=Z(e+Y,.65),N.globalAlpha=le,N.lineWidth=Math.max(1,V*.0018),N.stroke())}for(let e=0;e<Q.length;e++){let t=G[Q[e]];if(t<.12||t>.88)continue;let n=ce(t);if(n.radius<6)continue;let r=Math.min(U?.5:.58,(.04+n.depth*.5)*R*z*(.74+B*.3)),i=X+(1-t)*.75;N.beginPath();for(let e=0;e<=6;e++){let t=i+e/6*Math.PI*2,r=n.x+Math.cos(t)*n.radius,a=n.y+Math.sin(t)*n.radius;e===0?N.moveTo(r,a):N.lineTo(r,a)}N.strokeStyle=Z(Q[e]+Y,t),N.globalAlpha=r,N.lineWidth=Math.max(1,.8+n.radius*.008),N.stroke()}let $=[];for(let e=0;e<K.length;e++)$.push(e);$.sort((e,t)=>K[e]-K[t]);for(let e=0;e<$.length;e++){let t=$[e],n=K[t];if(n<.42||n>.985)continue;let r=ce(n,1.12);if(r.radius<10)continue;let i=h(.42,.58,n),a=1-h(.9,.985,n),o=Math.min(.55,(.12+r.depth*.28)*R*z*i*a*(.8+B*.25));o<.03||(N.globalAlpha=o,N.strokeStyle=Z(t+Y+1,Math.min(1,n+.15)),N.lineWidth=Math.max(1.2,r.radius*.018),p(N,r.x,r.y,r.radius,X+(1-n)*.5+t*.4,t%3),N.globalAlpha=o*.18,N.fillStyle=se(t+Y,n,1),m(N,r.x,r.y,r.radius*.92,X+(1-n)*.5+t*.4,t%3))}N.globalAlpha=1,S.front=M,S.back=j,e.save(),e.globalAlpha=1,e.imageSmoothingEnabled=!0,e.drawImage(M,0,0,t,n),e.restore(),globalThis.__mvTunnelBudget={quality:b,rings:x.rings,walls:x.walls,planes:x.planes,pw:P,ph:F}}function f(e,t,n,r,i,a,o){let s=1+o.bass*.28+o.glow*.12+o.rush*(o.reduce?.18:.32),c=r*(.055+o.bass*.02)*s,l=i.rgb[o.shift%3],u=a?48:l[0],d=a?48:l[1],f=a?52:l[2],p=Math.min(.55,(.16+o.bass*.18+o.rush*.28)*o.dim*o.punch),m=e.createRadialGradient(t,n,0,t,n,c*3.2);if(m.addColorStop(0,`rgba(${u}, ${d}, ${f}, ${p})`),m.addColorStop(.45,`rgba(${u}, ${d}, ${f}, ${p*.35})`),m.addColorStop(1,`rgba(5, 5, 6, 0)`),e.globalAlpha=1,e.fillStyle=m,e.beginPath(),e.moveTo(t+c*3.2,n),e.arc(t,n,c*3.2,0,Math.PI*2),e.fill(),o.rush>.08){let r=o.reduce?4:6,i=Math.min(.28,o.rush*(o.reduce?.18:.28)*o.punch);e.strokeStyle=`rgba(${u}, ${d}, ${f}, 1)`,e.globalAlpha=i,e.lineWidth=Math.max(1,c*.08);for(let i=0;i<r;i++){let a=o.rot*.35+i/r*Math.PI*2;e.beginPath(),e.moveTo(t+Math.cos(a)*c*.7,n+Math.sin(a)*c*.7),e.lineTo(t+Math.cos(a)*c*(2.4+o.rush),n+Math.sin(a)*c*(2.4+o.rush)),e.stroke()}e.globalAlpha=1}let h=c*2.15,g=c*.85;e.beginPath(),e.moveTo(t,n-h),e.lineTo(t+g,n-h*.45),e.lineTo(t+g,n+h*.45),e.lineTo(t,n+h),e.lineTo(t-g,n+h*.45),e.lineTo(t-g,n-h*.45),e.closePath();let _=a?22:8;e.fillStyle=`rgba(${_}, ${_}, ${_+2}, 0.92)`,e.fill();let v=Math.min(.55,(.18+o.bass*.25+o.rush*.2)*o.dim*o.punch),y=e.createLinearGradient(t,n-h,t,n+h),b=a?200:230,x=Math.min(b,u+10),S=Math.min(b,d+10),C=Math.min(b,f+10);y.addColorStop(0,`rgba(${x}, ${S}, ${C}, 0)`),y.addColorStop(.5,`rgba(${x}, ${S}, ${C}, ${v})`),y.addColorStop(1,`rgba(${x}, ${S}, ${C}, 0)`),e.fillStyle=y,e.fill(),e.strokeStyle=`rgba(${u}, ${d}, ${f}, ${.55+o.glow*.25})`,e.lineWidth=Math.max(1.2,c*.12),e.globalAlpha=Math.min(.85,.45+o.glow*.3)*o.dim*o.punch,e.stroke(),e.beginPath(),e.moveTo(t,n-h*.42),e.lineTo(t+g*.42,n),e.lineTo(t,n+h*.42),e.lineTo(t-g*.42,n),e.closePath(),e.strokeStyle=`rgba(${x}, ${S}, ${C}, 0.7)`,e.lineWidth=Math.max(1,c*.07),e.stroke(),e.globalAlpha=1}function p(e,t,n,r,i,a){let o=r*(a===1?.92:1.15),s=r*(a===1?.92:.72);if(e.beginPath(),a===1)for(let r=0;r<=6;r++){let a=i+r/6*Math.PI*2,c=t+Math.cos(a)*o,l=n+Math.sin(a)*s;r===0?e.moveTo(c,l):e.lineTo(c,l)}else if(a===2){let r=Math.cos(i),a=Math.sin(i),c=Math.min(o,s)*.22;[[-o+c,-s],[o-c,-s],[o,-s+c],[o,s-c],[o-c,s],[-o+c,s],[-o,s-c],[-o,-s+c]].forEach((i,o)=>{let s=t+i[0]*r-i[1]*a,c=n+i[0]*a+i[1]*r;o===0?e.moveTo(s,c):e.lineTo(s,c)}),e.closePath()}else{let r=Math.cos(i*.15),a=Math.sin(i*.15);[[-o,-s],[o,-s],[o,s],[-o,s]].forEach((i,o)=>{let s=t+i[0]*r-i[1]*a,c=n+i[0]*a+i[1]*r;o===0?e.moveTo(s,c):e.lineTo(s,c)}),e.closePath()}e.stroke()}function m(e,t,n,r,i,a){p(e,t,n,r,i,a),e.fill()}function h(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function g(e,t,n,r){if(r.quality===`low`||r.quality===`high`)return r.quality;let i=Math.max(t,n);return Math.max(e.canvas.width,e.canvas.height)+1<i*.7?`low`:`high`}function _(e,t,n){return e===`low`?{cap:400,rings:10,walls:5,planes:3}:Math.min(t,n)<500?{cap:520,rings:14,walls:6,planes:4}:{cap:640,rings:18,walls:8,planes:6}}function v(e){let t=[];for(let n=0;n<e;n++)t.push((n+.5)/e);return t}function y(e,t,n,r){let i=Math.max(t,n),a=_(r,t,n),o=a.cap,s=i>o?o/i:1,c=Math.max(2,Math.round(t*s)),l=Math.max(2,Math.round(n*s)),u=e.tunnel;if(!u||u.w!==c||u.h!==l||u.quality!==r){let t=document.createElement(`canvas`),n=document.createElement(`canvas`);t.width=c,t.height=l,n.width=c,n.height=l;for(let e of[t,n]){let t=e.getContext(`2d`);t&&(t.fillStyle=`#050506`,t.fillRect(0,0,c,l))}u={front:t,back:n,w:c,h:l,quality:r,spin:u?.spin??0,breath:u?.breath??0,lurch:u?.lurch??0,armed:u?.armed??!0,glow:u?.glow??0,depths:u?.depths?.length===a.rings?u.depths:v(a.rings),planes:u?.planes?.length===a.planes?u.planes:v(a.planes)},e.tunnel=u}return u}var b=`
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,x=`
precision mediump float;
uniform vec2 uRes;
uniform float uZoom;
uniform float uFlow;
uniform float uRipple;
uniform float uHue;
uniform float uBass;
uniform float uKick;
uniform float uTreble;
uniform float uRms;
uniform float uDrop;
uniform float uReduce;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;


vec3 ink(float t) {
  float x = fract(t) * 3.0;
  vec3 p = uA;
  vec3 q = uB;
  if (x >= 2.0) { p = uC; q = uA; x -= 2.0; }
  else if (x >= 1.0) { p = uB; q = uC; x -= 1.0; }
  return mix(p, q, smoothstep(0.0, 1.0, x));
}
vec3 tone(vec3 col) {
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.82) col *= 0.82 / peak;
  return col;
}

vec2 mirror(vec2 p, float n) {
  float ang = atan(p.y, p.x);
  float rad = length(p);
  float seg = 6.28318530718 / n;
  ang = mod(ang, seg);
  ang = abs(ang - seg * 0.5);
  return vec2(cos(ang), sin(ang)) * rad;
}
float motif(vec2 uv) {
  float breathe = 1.0 + uBass * 0.34 + uKick * mix(0.1, 0.46, 1.0 - uReduce);
  float bloom = 1.0 + uDrop * mix(0.55, 1.35, 1.0 - uReduce);
  vec2 p = uv / max(0.22, breathe * bloom);
  p = mirror(p, 8.0);
  float scale = 1.0;
  float glow = 0.0;
  for (int i = 0; i < 5; i++) {
    p = mirror(p, 6.0);
    p = abs(p) - vec2(0.42, 0.18);
    float k = 1.78;
    p *= k;
    scale *= k;
    float d = length(p) / scale;
    glow += exp(-d * 26.0);
    glow += exp(-abs(p.y) * 18.0 / scale) * 0.35;
  }
  float petal = 0.5 + 0.5 * sin(atan(uv.y, uv.x) * 8.0 + uHue * 2.0);
  return glow * 0.82 + petal * 0.18 * (0.35 + uTreble);
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float fade = fract(uZoom);
  float scale = exp2(fade);
  float near = motif(uv * scale);
  float far = motif(uv * scale * 2.0);
  float m = mix(far, near, fade);
  float calm = smoothstep(0.08, 0.55, uRms + uBass * 0.65);
  m = mix(m * 0.42, m, calm);
  vec2 cell = floor(gl_FragCoord.xy * (0.18 + uTreble * 0.28));
  float sparkle = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  float gate = mix(0.993, 0.95, clamp(uTreble, 0.0, 1.0));
  float spark = smoothstep(gate, 1.0, sparkle) * uTreble * mix(0.22, 0.85, 1.0 - uReduce) * calm;
  float energy = clamp(0.34 + uRms * 0.7 + uBass * 0.4 + uDrop * 0.28, 0.0, 1.15);
  vec3 col = ink(uHue + m * 0.55 + uDrop * 0.62);
  col *= (0.16 + m * 1.05) * energy;
  col += ink(uHue + 0.37 + uDrop) * spark;
  col = tone(col);
  float vig = smoothstep(1.2, 0.18, length(uv));
  vec3 bg = vec3(0.0196, 0.0196, 0.0235);
  float cover = clamp(vig * (0.28 + m * 0.9), 0.0, 1.0);
  float chroma = max(uA.r, max(uA.g, uA.b)) - min(uA.r, min(uA.g, uA.b));
  chroma = max(chroma, max(uB.r, max(uB.g, uB.b)) - min(uB.r, min(uB.g, uB.b)));
  chroma = max(chroma, max(uC.r, max(uC.g, uC.b)) - min(uC.r, min(uC.g, uC.b)));
  if (chroma < 0.12) {
    float neighbor = motif((uv + vec2(0.011, 0.005)) * scale);
    float edge = abs(near - neighbor);
    float ridge = smoothstep(0.01, 0.09, edge);
    float norm = m / (0.55 + uRms * 0.45 + uBass * 0.25 + uDrop * 0.35);
    float body = pow(smoothstep(0.55, 1.35, norm), 1.35);
    float shade = clamp(body * 0.22 + ridge * (0.55 + uDrop * 0.4), 0.0, 1.0);
    vec3 lo = uB * 0.08;
    vec3 hi = mix(uB, uC, 0.42 + uDrop * 0.2);
    col = mix(lo, hi, shade);
    float rad = length(uv);
    float ring = smoothstep(0.42, 0.86, rad) * smoothstep(1.22, 0.78, rad);
    col += hi * ring * uDrop * 0.45 * (0.35 + ridge);
    float peak = max(col.r, max(col.g, col.b));
    if (peak > 0.7) col *= 0.7 / peak;
    cover = clamp(vig * (0.35 + shade * 0.9), 0.0, 1.0);
  }
  col = mix(bg, col, cover);
  gl_FragColor = vec4(col, 1.0);
}
`;function S(e,t){let n=n=>e.getUniformLocation(t,n);return{uRes:n(`uRes`),uZoom:n(`uZoom`),uFlow:n(`uFlow`),uRipple:n(`uRipple`),uHue:n(`uHue`),uBass:n(`uBass`),uKick:n(`uKick`),uTreble:n(`uTreble`),uRms:n(`uRms`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`)}}function C(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)||`Shader failed`),e.deleteShader(r),null)):null}function w(e,t){let n=C(e,e.VERTEX_SHADER,b),r=C(e,e.FRAGMENT_SHADER,t);if(!n||!r)return null;let i=e.createProgram();return i?(e.attachShader(i,n),e.attachShader(i,r),e.bindAttribLocation(i,0,`aPos`),e.linkProgram(i),e.deleteShader(n),e.deleteShader(r),e.getProgramParameter(i,e.LINK_STATUS)?i:(e.deleteProgram(i),null)):null}function T(e){if(e.gpu)return e.gpu;if(e.gpuChecked)return null;e.gpuChecked=!0;let t=document.createElement(`canvas`),n=t.getContext(`webgl`,{alpha:!1,antialias:!0,depth:!0,stencil:!1,preserveDrawingBuffer:!0,premultipliedAlpha:!1});if(!n)return null;let r=w(n,x);if(!r)return null;let i=n.createBuffer();if(!i)return null;n.bindBuffer(n.ARRAY_BUFFER,i),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let a={canvas:t,gl:n,fractal:r,fractalU:S(n,r),jelly:null,buffer:i,zoom:0,hue:0,flow:0,ripple:0,pw:0,ph:0};return e.gpu=a,a}function E(e){return e===`fractal`||e===`jelly`}function D(e,t){return!E(t)||!e.gpuChecked?!1:!e.gpu||t===`jelly`&&!e.gpu.jelly}function O(e,t,n,r,i,a,o,s){let c=T(i);if(!c)return;c.gl.disable(c.gl.DEPTH_TEST),c.gl.disable(c.gl.CULL_FACE),c.gl.disable(c.gl.BLEND);let l=o.reduceFlashing!==!1,u=Math.min(1.2,r.bass),d=Math.min(1.2,r.rms),f=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),p=Math.min(1,r.treble),m=Math.min(1,r.drop);c.zoom+=s*(.04+d*.36+u*.1+m*.16),c.hue+=s*((l?.03:.055)+d*.03),c.flow+=s*(.018+d*.14+u*.08+m*.1),c.ripple+=s*(.7+f*(l?5.5:13)+m*2.4);let h=Math.max(t,n),g=h>680?680/h:1,_=Math.max(2,Math.round(t*g)),v=Math.max(2,Math.round(n*g)),y=c.gl;(c.pw!==_||c.ph!==v)&&(c.canvas.width=_,c.canvas.height=v,c.pw=_,c.ph=v,y.bindBuffer(y.ARRAY_BUFFER,c.buffer),y.bufferData(y.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),y.STATIC_DRAW));let b=c.fractal,x=c.fractalU;y.viewport(0,0,_,v),y.useProgram(b),y.bindBuffer(y.ARRAY_BUFFER,c.buffer),y.enableVertexAttribArray(0),y.vertexAttribPointer(0,2,y.FLOAT,!1,0,0);let S=e=>[e[0]/255,e[1]/255,e[2]/255];y.uniform2f(x.uRes,_,v),y.uniform1f(x.uZoom,c.zoom),y.uniform1f(x.uFlow,c.flow),y.uniform1f(x.uRipple,c.ripple),y.uniform1f(x.uHue,c.hue),y.uniform1f(x.uBass,u),y.uniform1f(x.uKick,f),y.uniform1f(x.uTreble,p),y.uniform1f(x.uRms,d),y.uniform1f(x.uDrop,m),y.uniform1f(x.uReduce,+!!l);let C=S(a.rgb[0]),w=S(a.rgb[1]),E=S(a.rgb[2]);y.uniform3f(x.uA,C[0],C[1],C[2]),y.uniform3f(x.uB,w[0],w[1],w[2]),y.uniform3f(x.uC,E[0],E[1],E[2]),y.drawArrays(y.TRIANGLES,0,3),e.imageSmoothingEnabled=!0,e.drawImage(c.canvas,0,0,t,n)}function k(e,t,n,r,i,a,o,s){O(e,t,n,r,i,a,o,s)}var A=`
precision mediump float;
uniform sampler2D uPrev;
uniform vec2 uRes;
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uRms;
uniform float uKick;
uniform float uDrop;
uniform float uReduce;
uniform float uTension;
uniform float uSmear;
uniform float uSnap;
uniform float uHue;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uWave[8];

vec3 tone(vec3 col) {
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  return max(col, vec3(0.0));
}

vec2 jellyField(vec2 uv, vec2 p, float t) {
  float visc = 0.5 + uTension * 0.85;
  vec2 d = vec2(0.0);
  d += vec2(sin(p.y * 5.4 + t * 0.61), cos(p.x * 4.7 - t * 0.54)) * (0.048 * visc);
  d += vec2(sin(p.y * 9.2 - t * 0.88 + 1.7), cos(p.x * 8.1 + t * 0.74)) * (0.024 * visc);
  d += vec2(sin(p.x * 15.5 + p.y * 3.2 + t * 2.3), cos(p.y * 14.5 - t * 2.05)) * (0.01 + uMid * 0.042);
  d += vec2(sin((p.x + p.y) * 27.0 + t * 6.1), cos((p.x - p.y) * 25.0 - t * 5.3)) * (uTreble * 0.02);
  float sm = uSmear * mix(0.5, 1.0, 1.0 - uReduce);
  vec2 dir = vec2(sin(t * 0.67 + 0.4), cos(t * 0.52));
  d += dir * sm * 0.14;
  d += vec2(-p.y, p.x) * sm * 0.1;
  return d;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv - 0.5;
  float aspect = uRes.x / uRes.y;
  p.x *= aspect;

  float throb = 1.0 - uBass * 0.055 - uKick * mix(0.025, 0.07, 1.0 - uReduce);
  throb += uSnap * mix(0.035, 0.09, 1.0 - uReduce);
  throb -= uSmear * 0.045;
  throb -= uTension * 0.02;
  vec2 q = p * clamp(throb, 0.82, 1.16);
  q += jellyField(uv, p, uTime);
  q.x /= aspect;
  vec2 suv = clamp(q + 0.5, 0.015, 0.985);

  vec3 prev = texture2D(uPrev, suv).rgb;
  float luma = dot(prev, vec3(0.30, 0.59, 0.11));
  float decay = mix(0.93, 0.8, smoothstep(0.42, 0.8, luma));
  decay *= mix(1.0, 0.9, uSmear);
  prev *= decay;

  vec3 seed = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = vec2(
      sin(uTime * (0.33 + fi * 0.11) + fi * 2.05),
      cos(uTime * (0.28 + fi * 0.09) + fi * 1.35)
    ) * (0.26 * (1.0 + uBass * 0.28));
    float r = 0.085 + uBass * 0.05 + uKick * 0.03 * step(fi, 0.5);
    float g = exp(-dot(p - c, p - c) / max(0.004, r * r));
    vec3 col = i == 0 ? uA : (i == 1 ? uB : uC);
    seed += col * g * (0.2 + uRms * 0.28);
  }

  float wx = clamp((p.x / max(0.2, aspect * 0.85) + 1.0) * 0.5, 0.0, 0.999);
  float wi = wx * 7.0;
  int i0 = int(floor(wi));
  float wf = fract(wi);
  float w0 = 0.0;
  float w1 = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i == i0) w0 = uWave[i];
    if (i == i0 + 1) w1 = uWave[i];
  }
  float amp = mix(w0, w1, wf);
  float ribbonY = p.y - 0.02 - amp * (0.16 + uMid * 0.1);
  ribbonY -= 0.05 * sin(p.x * 7.0 + uTime * 1.3) * (0.3 + uMid);
  float ribbon = exp(-ribbonY * ribbonY * 260.0);
  seed += uC * ribbon * (0.16 + uTreble * 0.3 + uMid * 0.12);

  float core = exp(-dot(p, p) * (5.5 - uBass * 1.8));
  seed += mix(uA, uB, 0.5 + 0.5 * sin(uHue)) * core * (0.07 + uBass * 0.12);

  vec3 shock = mix(uC, uA, 0.45);
  float shockAmt = (uSmear * 0.4 + uSnap * 0.55 + uDrop * 0.12) * mix(0.4, 1.0, 1.0 - uReduce);
  prev = mix(prev, prev * (0.7 + 0.55 * shock), shockAmt * 0.4);
  seed += shock * shockAmt * core * 0.55;

  vec3 col = prev + seed;
  col = tone(col);
  float vig = smoothstep(1.18, 0.32, length(p));
  vec3 bg = vec3(0.0196, 0.0196, 0.0235);
  col = mix(bg, col, vig);
  gl_FragColor = vec4(col, 1.0);
}
`,j=`
precision mediump float;
uniform sampler2D uPrev;
uniform vec2 uRes;
void main() {
  gl_FragColor = texture2D(uPrev, gl_FragCoord.xy / uRes);
}
`;function M(e,t){let n=n=>e.getUniformLocation(t,n);return{uPrev:n(`uPrev`),uRes:n(`uRes`),uTime:n(`uTime`),uBass:n(`uBass`),uMid:n(`uMid`),uTreble:n(`uTreble`),uRms:n(`uRms`),uKick:n(`uKick`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uTension:n(`uTension`),uSmear:n(`uSmear`),uSnap:n(`uSnap`),uHue:n(`uHue`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`),uWave:n(`uWave[0]`)}}function N(e,t,n){let r=e.createTexture();return r?(e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),r):null}function P(e,t){let n=e.createFramebuffer();if(!n)return null;e.bindFramebuffer(e.FRAMEBUFFER,n),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0);let r=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindFramebuffer(e.FRAMEBUFFER,null),r?n:null}function F(e,t,n,r){e.bindFramebuffer(e.FRAMEBUFFER,t),e.viewport(0,0,n,r),e.clearColor(.0196,.0196,.0235,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null)}function I(e,t,n,r){for(let n of t.tex)e.deleteTexture(n);for(let n of t.fbo)e.deleteFramebuffer(n);let i=N(e,n,r),a=N(e,n,r);if(!i||!a)return!1;let o=P(e,i),s=P(e,a);return!o||!s?!1:(t.tex=[i,a],t.fbo=[o,s],t.pw=n,t.ph=r,t.idx=0,t.ready=!1,F(e,o,n,r),F(e,s,n,r),t.ready=!0,!0)}function L(e){if(e.jelly)return e.jelly;let t=e.gl,n=w(t,A),r=w(t,j);if(!n||!r)return null;let i=N(t,2,2),a=N(t,2,2);if(!i||!a)return null;let o=P(t,i),s=P(t,a);if(!o||!s)return null;let c={program:n,copy:r,u:M(t,n),copyPrev:t.getUniformLocation(r,`uPrev`),copyRes:t.getUniformLocation(r,`uRes`),tex:[i,a],fbo:[o,s],idx:0,pw:2,ph:2,tension:0,smear:0,snap:0,armed:!0,hue:0,ready:!0};return F(t,o,2,2),F(t,s,2,2),e.jelly=c,c}function R(e,t){e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}function z(e,t,n,r,i,a,o,s){let c=T(i);if(!c)return;let l=L(c);if(!l)return;c.gl.disable(c.gl.DEPTH_TEST),c.gl.disable(c.gl.CULL_FACE),c.gl.disable(c.gl.BLEND);let u=o.reduceFlashing!==!1,d=Math.min(1.2,r.bass),f=Math.min(1.2,r.mid),p=Math.min(1,r.treble),m=Math.min(1.2,r.rms),h=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),g=Math.min(1,r.drop),_=Math.min(1,d*.55+m*.45);l.tension=d<.12&&m<.14&&g<.1?Math.max(0,l.tension-s*.85):Math.max(0,Math.min(1,l.tension+(_-.32)*s*.45)),g>.62&&l.armed&&(l.smear=1,l.armed=!1),g<.14&&(l.armed=!0);let v=l.smear;l.smear=Math.max(0,l.smear-s*(u?2.4:2)),v>.55&&l.smear<=.55&&(l.snap=1),l.snap=Math.max(0,l.snap-s*(u?3.2:2.8)),l.hue+=s*(.12+m*.2);let y=Math.max(t,n),b=y>960?960/y:1,x=Math.max(2,Math.round(t*b)),S=Math.max(2,Math.round(n*b)),C=c.gl;if((l.pw!==x||l.ph!==S)&&!I(C,l,x,S))return;(c.pw!==x||c.ph!==S)&&(c.canvas.width=x,c.canvas.height=S,c.pw=x,c.ph=S);let w=l.idx,E=1-l.idx,D=new Float32Array(8),O=r.wave,k=Math.max(1,O.length);for(let e=0;e<8;e++)D[e]=O[Math.min(k-1,Math.floor(e/8*k))]??0;C.bindFramebuffer(C.FRAMEBUFFER,l.fbo[E]),C.viewport(0,0,x,S),C.useProgram(l.program),R(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[w]),C.uniform1i(l.u.uPrev,0),C.uniform2f(l.u.uRes,x,S),C.uniform1f(l.u.uTime,r.time),C.uniform1f(l.u.uBass,d),C.uniform1f(l.u.uMid,f),C.uniform1f(l.u.uTreble,p),C.uniform1f(l.u.uRms,m),C.uniform1f(l.u.uKick,h),C.uniform1f(l.u.uDrop,g),C.uniform1f(l.u.uReduce,+!!u),C.uniform1f(l.u.uTension,l.tension),C.uniform1f(l.u.uSmear,l.smear),C.uniform1f(l.u.uSnap,l.snap),C.uniform1f(l.u.uHue,l.hue);let A=e=>[e[0]/255,e[1]/255,e[2]/255],j=A(a.rgb[0]),M=A(a.rgb[1]),N=A(a.rgb[2]);C.uniform3f(l.u.uA,j[0],j[1],j[2]),C.uniform3f(l.u.uB,M[0],M[1],M[2]),C.uniform3f(l.u.uC,N[0],N[1],N[2]),C.uniform1fv(l.u.uWave,D),C.drawArrays(C.TRIANGLES,0,3),C.bindFramebuffer(C.FRAMEBUFFER,null),C.viewport(0,0,x,S),C.useProgram(l.copy),R(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[E]),C.uniform1i(l.copyPrev,0),C.uniform2f(l.copyRes,x,S),C.drawArrays(C.TRIANGLES,0,3),l.idx=E,e.imageSmoothingEnabled=!0,e.drawImage(c.canvas,0,0,t,n)}function B(e,t,n,r,i,a,o,l){let u=c(r),d=t*.5,f=n*.78,p=Math.hypot(t,n),m=r.beat*u;i.laserT+=l*(.35+r.rms*3.2*u+r.bass*1.4*u+m*2);for(let t=0;t<8;t++){let n=(t-7/2)*(.12+r.bass*.1*u),c=Math.sin(i.laserT+t*.65)*(.55+r.treble*u*.45),l=-Math.PI/2+n+c,h=d+Math.cos(l)*p,g=f+Math.sin(l)*p;e.strokeStyle=s(a,t),e.lineWidth=1.5+r.bass*16*u+(o.reduceFlashing?m*3:m*10),e.globalAlpha=Math.min(1,o.reduceFlashing?.22+r.rms*u*.45+m*.2:.18+r.rms*u*.4+m*.7),e.beginPath(),e.moveTo(d,f),e.lineTo(h,g),e.stroke()}e.globalAlpha=1;let h=28+r.bass*70*u+m*24,g=e.createRadialGradient(d,f,0,d,f,h);g.addColorStop(0,`rgba(244,244,245,${.55+r.beat*.4})`),g.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=g,e.beginPath(),e.arc(d,f,h,0,Math.PI*2),e.fill(),m>.55&&!o.reduceFlashing&&(e.fillStyle=`rgba(244,244,245,${.1*r.beat})`,e.fillRect(0,0,t,n))}function V(e,t,n,r,i){let a=c(r),o=[];for(let e=0;e<16;e++){let i=e/15,s=[],c=.28+i*.95;for(let e=0;e<30;e++){let o=e/29,l=Math.min(r.bars.length-1,Math.floor(o*r.bars.length)),u=r.bars[l]??0,d=Math.sin(o*12+r.time*1.5+i*4)*.18*(.25+r.mid),f=u*(.3+r.bass*1.7*a)+d*(.6+a),p=t*.5+(o-.5)*t*1.2*c,m=n*(.22+i*.62)-f*n*.42*c;s.push({x:p,y:m})}o.push(s)}e.lineWidth=1.25;for(let t=0;t<16;t++){let n=o[t];e.beginPath();for(let t=0;t<30;t++){let r=n[t];t===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=s(i,t),e.globalAlpha=.25+t/16*.6,e.stroke()}for(let t=0;t<30;t+=2){e.beginPath();for(let n=0;n<16;n++){let r=o[n][t];n===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=i.b,e.globalAlpha=.2,e.stroke()}e.globalAlpha=1}function H(e,t,n,r,i,a,o){r.drop>.72&&i.burstArmed&&(i.bursts.push({life:1}),o||i.bursts.push({life:.82}),i.burstArmed=!1),r.drop<.15&&(i.burstArmed=!0);let s=t*.5,c=n*.5,l=Math.min(t,n)*(o?.42:.62);if(!o&&r.drop>.05)e.fillStyle=`rgba(244,244,245,${r.drop*.2})`,e.fillRect(0,0,t,n);else if(r.drop>.05){let i=e.createRadialGradient(s,c,0,s,c,l);i.addColorStop(0,`rgba(244,244,245,${r.drop*.28})`),i.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=i,e.fillRect(0,0,t,n)}for(let t of i.bursts){t.life-=o?.01:.016;let n=(1-t.life)*l;e.beginPath(),e.arc(s,c,Math.max(1,n),0,Math.PI*2),e.strokeStyle=a.c,e.lineWidth=o?3:8,e.globalAlpha=t.life*(o?.4:.9),e.stroke()}i.bursts=i.bursts.filter(e=>e.life>0),e.globalAlpha=1}export{E as a,D as i,a as n,e as o,l as r,t as s,i as t};