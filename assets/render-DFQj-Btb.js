var e=[{id:`pulse`,label:`Pulse`},{id:`fractal`,label:`Fractal Bloom`},{id:`liquid`,label:`Liquid Warp`},{id:`jelly`,label:`Jelly`},{id:`tunnel`,label:`Tunnel`},{id:`lasers`,label:`Lasers`},{id:`terrain`,label:`Bass Terrain`}],t=[{id:`neon`,label:`Neon`},{id:`sunset`,label:`Sunset`},{id:`mono`,label:`Mono`}],n={neon:{a:`#5eead4`,b:`#e879f9`,c:`#fbbf24`,rgb:[[94,234,212],[232,121,249],[251,191,36]]},sunset:{a:`#fb7185`,b:`#fb923c`,c:`#fdba74`,rgb:[[251,113,133],[251,146,60],[253,186,116]]},mono:{a:`#f4f4f5`,b:`#a1a1aa`,c:`#d4d4d8`,rgb:[[244,244,245],[161,161,170],[212,212,216]]}},r=64;function i(){let e=[];for(let t=0;t<10;t++)e.push(t/10);return{trail:[],laserT:0,rings:e,bursts:[],burstArmed:!0,lastT:0,gpu:null,gpuChecked:!1,tunnel:null}}function a(e=0){return{time:e,rms:.05,bass:.05,mid:.05,treble:.04,beat:0,drop:0,kick:0,drive:1,bars:new Float32Array(48),wave:new Float32Array(96)}}function o(e,t){let r=n[e];return t>.5?{a:r.c,b:r.a,c:r.b,rgb:[r.rgb[2],r.rgb[0],r.rgb[1]]}:r}function s(e,t){return t%3==0?e.a:t%3==1?e.b:e.c}function c(e){return Math.max(.35,e.drive||1)}function l(e,t,n,r,i,a,s={theme:`neon`,reduceFlashing:!0,dropFx:!0}){let c=a.lastT?Math.min(.05,Math.max(.001,r.time-a.lastT)):.016;a.lastT=r.time;let l=s.dropFx!==!1,f=o(s.theme,l?r.drop:0);e.clearRect(0,0,t,n),e.fillStyle=`#050506`,e.fillRect(0,0,t,n),i===`pulse`?u(e,t,n,r,a,f):i===`fractal`?O(e,t,n,r,a,f,s,c):i===`liquid`?k(e,t,n,r,a,f,s,c):i===`jelly`?z(e,t,n,r,a,f,s,c):i===`tunnel`?d(e,t,n,r,a,f,s,c):i===`lasers`?B(e,t,n,r,a,f,s,c):V(e,t,n,r,f),l&&H(e,t,n,r,a,f,s.reduceFlashing),e.globalAlpha=1}function u(e,t,n,i,a,o){let l=t*.5,u=n*.46,d=c(i),f=Math.min(t,n)*(.07+i.bass*.2*d+i.beat*.09*d),p=e.createRadialGradient(l,u,f*.2,l,u,f*3.2),m=o.rgb[0],h=o.rgb[1];p.addColorStop(0,`rgba(${m[0]}, ${m[1]}, ${m[2]}, ${.35+i.rms*.4})`),p.addColorStop(.45,`rgba(${h[0]}, ${h[1]}, ${h[2]}, ${.12+i.mid*.2})`),p.addColorStop(1,`rgba(5, 5, 6, 0)`),e.fillStyle=p,e.fillRect(0,0,t,n),e.beginPath(),e.fillStyle=`#f4f4f5`,e.globalAlpha=.85,e.arc(l,u,f*.45,0,Math.PI*2),e.fill(),e.globalAlpha=1;let g=i.bars.length,_=Math.max(2,t*.72/g-3),v=(t-g*(_+3))/2,y=n*.86;for(let t=0;t<g;t++){let r=i.bars[t]??0,a=Math.max(3,r*n*(.18+.22*d));e.fillStyle=s(o,t),e.globalAlpha=.45+r*.55,e.fillRect(v+t*(_+3),y-a,_,a)}e.globalAlpha=1;let b=i.wave[Math.floor(i.time*30)%i.wave.length]??0;a.trail.push({x:l+Math.sin(i.time*.7)*t*.22+b*t*.08,y:u+Math.cos(i.time*.55)*n*.12+(i.wave[8]??0)*n*.18}),a.trail.length>r&&a.trail.shift(),e.lineWidth=2,e.lineCap=`round`,e.lineJoin=`round`;for(let t=1;t<a.trail.length;t++){let n=a.trail[t-1],r=a.trail[t],i=t/a.trail.length;e.strokeStyle=s(o,Math.floor(i*3)),e.globalAlpha=i*.85,e.beginPath(),e.moveTo(n.x,n.y),e.lineTo(r.x,r.y),e.stroke()}e.globalAlpha=1}function d(e,t,n,r,i,a,o,s){let c=o.reduceFlashing!==!1,l=1-f(.1,.45,r.rms*.65+r.bass*.8+r.kick*.35),u=f(.15,.75,r.bass*.65+r.kick*.7+r.rms*.25),d=s/.0167,g=h(i,t,n);g.breath+=s*.7,r.drop>.62&&g.armed&&(g.lurch=1,g.armed=!1),r.drop<.14&&(g.armed=!0),g.lurch=Math.max(0,g.lurch-s/1.55);let _=Math.min(1,r.kick*.75+r.bass*.35+g.lurch*.4),v=1-Math.exp(-s*(c?7:18));g.glow+=(_-g.glow)*v;let y=(.016+u*.01)*d*(1-l*.94),b=Math.sin(g.breath)*.014*d,x=g.lurch*g.lurch*.02*d,S=Math.min(1.034,Math.max(.984,1+y*(1-l)+b*l+x)),C=Math.sin(r.time*.17)*(.006+u*.016)*d*(.2+.8*(1-l));g.spin+=C;let w=g.front,T=g.back,E=T.getContext(`2d`);if(!E)return;let D=g.w,O=g.h;E.setTransform(1,0,0,1,0,0),E.globalAlpha=1,E.globalCompositeOperation=`source-over`,E.fillStyle=`#050506`,E.fillRect(0,0,D,O),E.save(),E.translate(D*.5,O*.5),E.rotate(C),E.scale(S,S),E.globalAlpha=l>.55?.968:.988,E.drawImage(w,-D*.5,-O*.5),E.restore();let k=l>.55?.035:.014;E.globalAlpha=1,E.fillStyle=`rgba(5, 5, 6, ${k})`,E.fillRect(0,0,D,O);let A=D*.5,j=O*.5,M=.4+.6*(1-l),N=c?.78:1,P=g.glow,F=Math.min(D,O),I=0;for(let e of a.rgb)I=Math.max(I,Math.max(...e)-Math.min(...e));let L=I<28,R=p(D,O);(!g.depths||g.depths.length!==R)&&(g.depths=m(R));let z=.05+u*.27;z*=1-l*.8,z+=g.lurch*g.lurch*1.15,z*=1+P*.24;let B=g.depths;for(let e=0;e<B.length;e++){let t=B[e]+z*s;t>=1&&--t,B[e]=t}let V=.45+.55*(1-l),H=A+(Math.sin(r.time*.23)*.16+Math.sin(r.time*.07+1.2)*.06)*D*V,U=j+(Math.cos(r.time*.19)*.11+Math.sin(r.time*.11)*.04)*O*V,W=A+(H-A)*.1,ee=j+(U-j)*.1,te=1+Math.sin(g.breath)*.04*l,G=g.lurch>.45?2:+(g.lurch>.2),K=g.spin*.65,q=(e,t)=>{let n=a.rgb[(e%3+3)%3],r=Math.max(0,t)**.8;if(L){let e=Math.round(26+r*128);return`rgb(${e}, ${e}, ${e})`}let i=.22+r*.78;return`rgb(${Math.round(n[0]*i+5)}, ${Math.round(n[1]*i+5)}, ${Math.round(n[2]*i+6)})`},J=e=>{let t=e**1.42;return{x:H+(W-H)*t,y:U+(ee-U)*t,radius:F*(.03+t*.86)*te,depth:t}},Y=a.rgb[G%3],ne=L?48:Y[0],re=L?48:Y[1],ie=L?48:Y[2],X=E.createRadialGradient(H,U,0,H,U,F*.05);X.addColorStop(0,`rgba(${ne}, ${re}, ${ie}, ${Math.min(.12,.05*M*N)})`),X.addColorStop(1,`rgba(5, 5, 6, 0)`),E.fillStyle=X,E.beginPath(),E.arc(H,U,F*.05,0,Math.PI*2),E.fill(),E.lineCap=`round`,E.lineJoin=`round`;let Z=[];for(let e=0;e<B.length;e++)Z.push(e);Z.sort((e,t)=>B[e]-B[t]);let Q=R<28?10:14,$=Math.min(.2,(.07+P*.04)*M*N);for(let e=0;e<Q;e++){E.beginPath();for(let t=0;t<Z.length;t++){let n=B[Z[t]],r=J(n),i=e/Q*Math.PI*2+K+(1-n)*.75,a=r.x+Math.cos(i)*r.radius,o=r.y+Math.sin(i)*r.radius;t===0?E.moveTo(a,o):E.lineTo(a,o)}E.strokeStyle=q(e+G,.65),E.globalAlpha=$,E.lineWidth=Math.max(1,F*.0015),E.stroke()}E.setLineDash([Math.max(4,F*.012),Math.max(8,F*.022)]);for(let e=0;e<Q;e++){E.beginPath();for(let t=0;t<Z.length;t++){let n=B[Z[t]],r=J(n),i=(e+.5)/Q*Math.PI*2+K+(1-n)*.75,a=r.x+Math.cos(i)*r.radius,o=r.y+Math.sin(i)*r.radius;t===0?E.moveTo(a,o):E.lineTo(a,o)}E.strokeStyle=q(e+1+G,.4),E.globalAlpha=$*.65,E.lineWidth=1,E.stroke()}E.setLineDash([]);for(let e=0;e<Z.length;e++){let t=B[Z[e]],n=J(t);if(n.radius<1.5)continue;let r=Math.min(L?.5:.58,(.035+n.depth*.52)*M*N*(.74+P*.3)),i=K+(1-t)*.75;E.beginPath();for(let e=0;e<=6;e++){let t=i+e/6*Math.PI*2,r=n.x+Math.cos(t)*n.radius,a=n.y+Math.sin(t)*n.radius;e===0?E.moveTo(r,a):E.lineTo(r,a)}E.strokeStyle=q(Z[e]+G,t),E.globalAlpha=r,E.lineWidth=Math.max(1,.8+n.radius*.008),E.stroke()}E.globalAlpha=1,g.front=T,g.back=w,e.save(),e.globalAlpha=1,e.imageSmoothingEnabled=!0,e.drawImage(T,0,0,t,n),e.restore()}function f(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function p(e,t){return Math.min(e,t)<500?24:36}function m(e){let t=[];for(let n=0;n<e;n++)t.push((n+.5)/e);return t}function h(e,t,n){let r=Math.max(t,n),i=r>720?720/r:1,a=Math.max(2,Math.round(t*i)),o=Math.max(2,Math.round(n*i)),s=e.tunnel;if(!s||s.w!==a||s.h!==o){let t=document.createElement(`canvas`),n=document.createElement(`canvas`);t.width=a,t.height=o,n.width=a,n.height=o;for(let e of[t,n]){let t=e.getContext(`2d`);t&&(t.fillStyle=`#050506`,t.fillRect(0,0,a,o))}let r=p(a,o);s={front:t,back:n,w:a,h:o,spin:s?.spin??0,breath:s?.breath??0,lurch:0,armed:!0,glow:s?.glow??0,depths:s?.depths?.length===r?s.depths:m(r)},e.tunnel=s}return s}var g=`
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,_=`
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
`,v=`
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
`,y=`${v}
${_}
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
`,b=`${v}
${_}
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5;
  v += a * noise(p); p = p * 2.02 + vec2(8.3, 2.8); a *= 0.5;
  v += a * noise(p);
  return v;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float rad = length(uv);
  float rip = sin(rad * (12.0 + uTreble * 16.0) - uRipple);
  float kickAmp = uKick * mix(0.045, 0.16, 1.0 - uReduce);
  vec2 p = uv * (1.35 + uBass * 0.55);
  p += uv / max(rad, 0.04) * rip * kickAmp;
  p += vec2(uFlow * 0.12, uFlow * 0.05);
  float warp = 0.35 + uBass * 2.15 + uDrop * mix(0.9, 2.2, 1.0 - uReduce);
  vec2 q = vec2(fbm(p + vec2(0.0, uFlow)), fbm(p + vec2(5.2, 1.3) - uFlow * 0.8));
  vec2 r = vec2(fbm(p + warp * q + vec2(1.7, 9.2)), fbm(p + warp * q + vec2(8.3, 2.8)));
  float n = fbm(p + warp * r);
  float fine = noise(p * (7.0 + uTreble * 18.0) + uFlow) * uTreble;
  float v = clamp(n * 0.9 + fine * 0.22 + rip * kickAmp, 0.0, 1.0);
  float drive = smoothstep(0.04, 0.5, uRms + uBass * 0.8);
  v = mix(0.42 + (v - 0.5) * 0.55, v, drive);
  float energy = clamp(0.72 + uRms * 0.38 + uBass * 0.22 + uDrop * 0.28, 0.0, 1.2);
  vec3 col = ink(v * 1.7 + uHue * 0.65 + uDrop * 0.55);
  col *= (0.48 + v * 0.62) * energy;
  col = tone(col);
  float vig = smoothstep(1.28, 0.12, rad);
  vec3 bg = vec3(0.0196, 0.0196, 0.0235);
  col = mix(bg, col, vig * (0.62 + 0.38 * v));
  gl_FragColor = vec4(col, 1.0);
}
`;function x(e,t){let n=n=>e.getUniformLocation(t,n);return{uRes:n(`uRes`),uZoom:n(`uZoom`),uFlow:n(`uFlow`),uRipple:n(`uRipple`),uHue:n(`uHue`),uBass:n(`uBass`),uKick:n(`uKick`),uTreble:n(`uTreble`),uRms:n(`uRms`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`)}}function S(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)||`Shader failed`),e.deleteShader(r),null)):null}function C(e,t){let n=S(e,e.VERTEX_SHADER,g),r=S(e,e.FRAGMENT_SHADER,t);if(!n||!r)return null;let i=e.createProgram();return i?(e.attachShader(i,n),e.attachShader(i,r),e.bindAttribLocation(i,0,`aPos`),e.linkProgram(i),e.deleteShader(n),e.deleteShader(r),e.getProgramParameter(i,e.LINK_STATUS)?i:(e.deleteProgram(i),null)):null}function w(e){if(e.gpu)return e.gpu;if(e.gpuChecked)return null;e.gpuChecked=!0;let t=document.createElement(`canvas`),n=t.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!0,premultipliedAlpha:!1});if(!n)return null;let r=C(n,y),i=C(n,b);if(!r||!i)return null;let a=n.createBuffer();if(!a)return null;n.bindBuffer(n.ARRAY_BUFFER,a),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let o={canvas:t,gl:n,fractal:r,liquid:i,fractalU:x(n,r),liquidU:x(n,i),jelly:null,buffer:a,zoom:0,hue:0,flow:0,ripple:0,pw:0,ph:0};return e.gpu=o,o}function T(e){return e===`fractal`||e===`liquid`||e===`jelly`}function E(e,t){return!T(t)||!e.gpuChecked?!1:!e.gpu||t===`jelly`&&!e.gpu.jelly}function D(e,t,n,r,i,a,o,s,c){let l=w(i);if(!l)return;let u=o.reduceFlashing!==!1,d=Math.min(1.2,r.bass),f=Math.min(1.2,r.rms),p=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),m=Math.min(1,r.treble),h=Math.min(1,r.drop);l.zoom+=s*(.04+f*.36+d*.1+h*.16),l.hue+=s*((u?.03:.055)+f*.03),l.flow+=s*(.018+f*.14+d*.08+h*.1),l.ripple+=s*(.7+p*(u?5.5:13)+h*2.4);let g=Math.max(t,n),_=g>680?680/g:1,v=Math.max(2,Math.round(t*_)),y=Math.max(2,Math.round(n*_)),b=l.gl;(l.pw!==v||l.ph!==y)&&(l.canvas.width=v,l.canvas.height=y,l.pw=v,l.ph=y,b.bindBuffer(b.ARRAY_BUFFER,l.buffer),b.bufferData(b.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),b.STATIC_DRAW));let x=c===`fractal`?l.fractal:l.liquid,S=c===`fractal`?l.fractalU:l.liquidU;b.viewport(0,0,v,y),b.useProgram(x),b.bindBuffer(b.ARRAY_BUFFER,l.buffer),b.enableVertexAttribArray(0),b.vertexAttribPointer(0,2,b.FLOAT,!1,0,0);let C=e=>[e[0]/255,e[1]/255,e[2]/255];b.uniform2f(S.uRes,v,y),b.uniform1f(S.uZoom,l.zoom),b.uniform1f(S.uFlow,l.flow),b.uniform1f(S.uRipple,l.ripple),b.uniform1f(S.uHue,l.hue),b.uniform1f(S.uBass,d),b.uniform1f(S.uKick,p),b.uniform1f(S.uTreble,m),b.uniform1f(S.uRms,f),b.uniform1f(S.uDrop,h),b.uniform1f(S.uReduce,+!!u);let T=C(a.rgb[0]),E=C(a.rgb[1]),D=C(a.rgb[2]);b.uniform3f(S.uA,T[0],T[1],T[2]),b.uniform3f(S.uB,E[0],E[1],E[2]),b.uniform3f(S.uC,D[0],D[1],D[2]),b.drawArrays(b.TRIANGLES,0,3),e.imageSmoothingEnabled=!0,e.drawImage(l.canvas,0,0,t,n)}function O(e,t,n,r,i,a,o,s){D(e,t,n,r,i,a,o,s,`fractal`)}function k(e,t,n,r,i,a,o,s){D(e,t,n,r,i,a,o,s,`liquid`)}var A=`
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
`;function M(e,t){let n=n=>e.getUniformLocation(t,n);return{uPrev:n(`uPrev`),uRes:n(`uRes`),uTime:n(`uTime`),uBass:n(`uBass`),uMid:n(`uMid`),uTreble:n(`uTreble`),uRms:n(`uRms`),uKick:n(`uKick`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uTension:n(`uTension`),uSmear:n(`uSmear`),uSnap:n(`uSnap`),uHue:n(`uHue`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`),uWave:n(`uWave[0]`)}}function N(e,t,n){let r=e.createTexture();return r?(e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),r):null}function P(e,t){let n=e.createFramebuffer();if(!n)return null;e.bindFramebuffer(e.FRAMEBUFFER,n),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0);let r=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindFramebuffer(e.FRAMEBUFFER,null),r?n:null}function F(e,t,n,r){e.bindFramebuffer(e.FRAMEBUFFER,t),e.viewport(0,0,n,r),e.clearColor(.0196,.0196,.0235,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null)}function I(e,t,n,r){for(let n of t.tex)e.deleteTexture(n);for(let n of t.fbo)e.deleteFramebuffer(n);let i=N(e,n,r),a=N(e,n,r);if(!i||!a)return!1;let o=P(e,i),s=P(e,a);return!o||!s?!1:(t.tex=[i,a],t.fbo=[o,s],t.pw=n,t.ph=r,t.idx=0,t.ready=!1,F(e,o,n,r),F(e,s,n,r),t.ready=!0,!0)}function L(e){if(e.jelly)return e.jelly;let t=e.gl,n=C(t,A),r=C(t,j);if(!n||!r)return null;let i=N(t,2,2),a=N(t,2,2);if(!i||!a)return null;let o=P(t,i),s=P(t,a);if(!o||!s)return null;let c={program:n,copy:r,u:M(t,n),copyPrev:t.getUniformLocation(r,`uPrev`),copyRes:t.getUniformLocation(r,`uRes`),tex:[i,a],fbo:[o,s],idx:0,pw:2,ph:2,tension:0,smear:0,snap:0,armed:!0,hue:0,ready:!0};return F(t,o,2,2),F(t,s,2,2),e.jelly=c,c}function R(e,t){e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}function z(e,t,n,r,i,a,o,s){let c=w(i);if(!c)return;let l=L(c);if(!l)return;let u=o.reduceFlashing!==!1,d=Math.min(1.2,r.bass),f=Math.min(1.2,r.mid),p=Math.min(1,r.treble),m=Math.min(1.2,r.rms),h=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),g=Math.min(1,r.drop),_=Math.min(1,d*.55+m*.45);l.tension=d<.12&&m<.14&&g<.1?Math.max(0,l.tension-s*.85):Math.max(0,Math.min(1,l.tension+(_-.32)*s*.45)),g>.62&&l.armed&&(l.smear=1,l.armed=!1),g<.14&&(l.armed=!0);let v=l.smear;l.smear=Math.max(0,l.smear-s*(u?2.4:2)),v>.55&&l.smear<=.55&&(l.snap=1),l.snap=Math.max(0,l.snap-s*(u?3.2:2.8)),l.hue+=s*(.12+m*.2);let y=Math.max(t,n),b=y>960?960/y:1,x=Math.max(2,Math.round(t*b)),S=Math.max(2,Math.round(n*b)),C=c.gl;if((l.pw!==x||l.ph!==S)&&!I(C,l,x,S))return;(c.pw!==x||c.ph!==S)&&(c.canvas.width=x,c.canvas.height=S,c.pw=x,c.ph=S);let T=l.idx,E=1-l.idx,D=new Float32Array(8),O=r.wave,k=Math.max(1,O.length);for(let e=0;e<8;e++)D[e]=O[Math.min(k-1,Math.floor(e/8*k))]??0;C.bindFramebuffer(C.FRAMEBUFFER,l.fbo[E]),C.viewport(0,0,x,S),C.useProgram(l.program),R(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[T]),C.uniform1i(l.u.uPrev,0),C.uniform2f(l.u.uRes,x,S),C.uniform1f(l.u.uTime,r.time),C.uniform1f(l.u.uBass,d),C.uniform1f(l.u.uMid,f),C.uniform1f(l.u.uTreble,p),C.uniform1f(l.u.uRms,m),C.uniform1f(l.u.uKick,h),C.uniform1f(l.u.uDrop,g),C.uniform1f(l.u.uReduce,+!!u),C.uniform1f(l.u.uTension,l.tension),C.uniform1f(l.u.uSmear,l.smear),C.uniform1f(l.u.uSnap,l.snap),C.uniform1f(l.u.uHue,l.hue);let A=e=>[e[0]/255,e[1]/255,e[2]/255],j=A(a.rgb[0]),M=A(a.rgb[1]),N=A(a.rgb[2]);C.uniform3f(l.u.uA,j[0],j[1],j[2]),C.uniform3f(l.u.uB,M[0],M[1],M[2]),C.uniform3f(l.u.uC,N[0],N[1],N[2]),C.uniform1fv(l.u.uWave,D),C.drawArrays(C.TRIANGLES,0,3),C.bindFramebuffer(C.FRAMEBUFFER,null),C.viewport(0,0,x,S),C.useProgram(l.copy),R(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[E]),C.uniform1i(l.copyPrev,0),C.uniform2f(l.copyRes,x,S),C.drawArrays(C.TRIANGLES,0,3),l.idx=E,e.imageSmoothingEnabled=!0,e.drawImage(c.canvas,0,0,t,n)}function B(e,t,n,r,i,a,o,l){let u=c(r),d=t*.5,f=n*.78,p=Math.hypot(t,n),m=r.beat*u;i.laserT+=l*(.35+r.rms*3.2*u+r.bass*1.4*u+m*2);for(let t=0;t<8;t++){let n=(t-7/2)*(.12+r.bass*.1*u),c=Math.sin(i.laserT+t*.65)*(.55+r.treble*u*.45),l=-Math.PI/2+n+c,h=d+Math.cos(l)*p,g=f+Math.sin(l)*p;e.strokeStyle=s(a,t),e.lineWidth=1.5+r.bass*16*u+(o.reduceFlashing?m*3:m*10),e.globalAlpha=Math.min(1,o.reduceFlashing?.22+r.rms*u*.45+m*.2:.18+r.rms*u*.4+m*.7),e.beginPath(),e.moveTo(d,f),e.lineTo(h,g),e.stroke()}e.globalAlpha=1;let h=28+r.bass*70*u+m*24,g=e.createRadialGradient(d,f,0,d,f,h);g.addColorStop(0,`rgba(244,244,245,${.55+r.beat*.4})`),g.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=g,e.beginPath(),e.arc(d,f,h,0,Math.PI*2),e.fill(),m>.55&&!o.reduceFlashing&&(e.fillStyle=`rgba(244,244,245,${.1*r.beat})`,e.fillRect(0,0,t,n))}function V(e,t,n,r,i){let a=c(r),o=[];for(let e=0;e<16;e++){let i=e/15,s=[],c=.28+i*.95;for(let e=0;e<30;e++){let o=e/29,l=Math.min(r.bars.length-1,Math.floor(o*r.bars.length)),u=r.bars[l]??0,d=Math.sin(o*12+r.time*1.5+i*4)*.18*(.25+r.mid),f=u*(.3+r.bass*1.7*a)+d*(.6+a),p=t*.5+(o-.5)*t*1.2*c,m=n*(.22+i*.62)-f*n*.42*c;s.push({x:p,y:m})}o.push(s)}e.lineWidth=1.25;for(let t=0;t<16;t++){let n=o[t];e.beginPath();for(let t=0;t<30;t++){let r=n[t];t===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=s(i,t),e.globalAlpha=.25+t/16*.6,e.stroke()}for(let t=0;t<30;t+=2){e.beginPath();for(let n=0;n<16;n++){let r=o[n][t];n===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=i.b,e.globalAlpha=.2,e.stroke()}e.globalAlpha=1}function H(e,t,n,r,i,a,o){r.drop>.72&&i.burstArmed&&(i.bursts.push({life:1}),o||i.bursts.push({life:.82}),i.burstArmed=!1),r.drop<.15&&(i.burstArmed=!0);let s=t*.5,c=n*.5,l=Math.min(t,n)*(o?.42:.62);if(!o&&r.drop>.05)e.fillStyle=`rgba(244,244,245,${r.drop*.2})`,e.fillRect(0,0,t,n);else if(r.drop>.05){let i=e.createRadialGradient(s,c,0,s,c,l);i.addColorStop(0,`rgba(244,244,245,${r.drop*.28})`),i.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=i,e.fillRect(0,0,t,n)}for(let t of i.bursts){t.life-=o?.01:.016;let n=(1-t.life)*l;e.beginPath(),e.arc(s,c,Math.max(1,n),0,Math.PI*2),e.strokeStyle=a.c,e.lineWidth=o?3:8,e.globalAlpha=t.life*(o?.4:.9),e.stroke()}i.bursts=i.bursts.filter(e=>e.life>0),e.globalAlpha=1}export{T as a,E as i,a as n,e as o,l as r,t as s,i as t};