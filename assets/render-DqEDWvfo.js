var e=[{id:`pulse`,label:`Pulse`},{id:`fractal`,label:`Fractal Bloom`},{id:`liquid`,label:`Liquid Warp`},{id:`jelly`,label:`Jelly`},{id:`tunnel`,label:`Tunnel`},{id:`presence`,label:`Presence`},{id:`lasers`,label:`Lasers`},{id:`terrain`,label:`Bass Terrain`}],t=[{id:`neon`,label:`Neon`},{id:`sunset`,label:`Sunset`},{id:`mono`,label:`Mono`}],n={neon:{a:`#5eead4`,b:`#e879f9`,c:`#fbbf24`,rgb:[[94,234,212],[232,121,249],[251,191,36]]},sunset:{a:`#fb7185`,b:`#fb923c`,c:`#fdba74`,rgb:[[251,113,133],[251,146,60],[253,186,116]]},mono:{a:`#f4f4f5`,b:`#a1a1aa`,c:`#d4d4d8`,rgb:[[244,244,245],[161,161,170],[212,212,216]]}},r=`
precision mediump float;
attribute vec3 aPos;
attribute vec3 aNrm;
attribute float aRegion;
uniform mat4 uMVP;
uniform mat4 uModel;
uniform float uBreath;
varying vec3 vW;
varying vec3 vN;
varying float vRegion;
void main() {
  vec3 p = aPos;
  float chest = aRegion;
  float inflate = 1.0 + uBreath * chest * 0.045;
  p.x *= inflate;
  p.z *= inflate;
  p.y += uBreath * (0.12 * chest + 0.04) * 0.08;
  vec4 w = uModel * vec4(p, 1.0);
  vW = w.xyz;
  vN = normalize(aNrm);
  vRegion = aRegion;
  gl_Position = uMVP * vec4(p, 1.0);
}
`,i=`
precision mediump float;
uniform vec3 uEye;
uniform vec3 uLightDir;
uniform vec3 uRimDir;
uniform vec3 uFillDir;
uniform vec3 uAlbedo;
uniform vec3 uLightCol;
uniform vec3 uRimCol;
uniform vec3 uFogCol;
uniform vec3 uHorizon;
uniform float uFog;
uniform float uHaze;
uniform float uRim;
uniform float uDim;
uniform float uReflect;
varying vec3 vW;
varying vec3 vN;
varying float vRegion;

vec3 tone(vec3 col) {
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  return max(col, vec3(0.0));
}

void main() {
  if (uReflect > 0.5 && vW.y > 0.02) discard;
  vec3 N = normalize(vN);
  if (uReflect > 0.5) N.y = -N.y;
  vec3 V = normalize(uEye - vW);
  vec3 L = normalize(uLightDir);
  vec3 R = reflect(-V, N);
  float ndv = max(dot(N, V), 0.0);
  float fres = pow(1.0 - ndv, 3.0);
  float sky = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 env = mix(uFogCol, uHorizon, smoothstep(0.25, 1.0, sky)) * 0.22;
  float spec = pow(max(dot(R, L), 0.0), 72.0);
  float soft = pow(max(dot(R, L), 0.0), 14.0);
  float wrap = max(dot(N, L) * 0.92 + 0.08, 0.0);
  float fill = max(dot(N, normalize(uFillDir)), 0.0) * 0.1;
  float rim = pow(1.0 - ndv, 3.2) * uRim * (0.2 + 0.9 * max(dot(N, normalize(uRimDir)), 0.0));
  float ao = 0.55 + 0.45 * clamp(vW.y / 1.7, 0.0, 1.0);
  vec3 metal = vec3(0.028, 0.03, 0.036) * (0.35 + wrap * 1.35 + fill) * ao;
  metal += uAlbedo * wrap * 0.12;
  metal += uHorizon * fill * 0.22;
  metal += env * fres * 0.45;
  metal += uLightCol * (spec * 0.9 + soft * 0.07);
  metal += uRimCol * rim * 0.85;
  metal *= uDim;
  if (uReflect > 0.5) metal *= 0.38;
  float dist = length(uEye - vW);
  float fog = 1.0 - exp(-uFog * dist);
  float haze = uHaze * exp(-max(vW.y, 0.0) * 2.4);
  metal = mix(metal, uFogCol, clamp(fog + haze * 0.65, 0.0, 0.88));
  gl_FragColor = vec4(tone(metal), 1.0);
}

`,a=`
precision mediump float;
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,o=`
precision mediump float;
uniform vec2 uRes;
uniform vec3 uHorizon;
uniform vec3 uFogCol;
uniform vec3 uGlow;
uniform float uHaze;
varying vec2 vUv;

vec3 tone(vec3 col) {
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  return col;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  float y = uv.y;
  float horizon = 0.38;
  vec3 col = mix(uFogCol * 0.7, mix(uFogCol, uHorizon, 0.18), smoothstep(0.0, horizon, y));
  col = mix(col, vec3(0.01, 0.01, 0.014), smoothstep(horizon, 0.88, y));
  float band = exp(-pow((y - horizon) * 6.5, 2.0));
  col += uHorizon * band * (0.28 + uHaze * 0.08);
  float glow = exp(-pow((y - horizon) * 2.8, 2.0)) * exp(-pow((uv.x - 0.5) * 1.05, 2.0));
  col += uGlow * glow * 0.24;
  float vig = smoothstep(1.15, 0.35, length((uv - vec2(0.5, 0.42)) * vec2(aspect, 1.0)));
  col *= 0.72 + 0.28 * vig;
  gl_FragColor = vec4(tone(col), 1.0);
}
`,s=`
precision mediump float;
attribute vec3 aPos;
attribute vec3 aNrm;
uniform mat4 uMVP;
varying vec3 vW;
void main() {
  vW = aPos;
  gl_Position = uMVP * vec4(aPos, 1.0);
}
`,c=`
precision mediump float;
uniform vec3 uEye;
uniform vec3 uHorizon;
uniform vec3 uFogCol;
uniform vec3 uShockCol;
uniform float uFog;
uniform float uHaze;
uniform float uShock;
uniform float uShockR;
uniform float uDim;
varying vec3 vW;

vec3 tone(vec3 col) {
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  return col;
}

void main() {
  float r = length(vW.xz);
  float dist = length(uEye - vW);
  float fog = 1.0 - exp(-uFog * dist * 0.85);
  float fade = smoothstep(14.0, 3.2, r);
  vec3 col = uFogCol * 0.7;
  float gloss = exp(-pow(vW.z * 0.12 + 0.4, 2.0)) * exp(-pow(vW.x * 0.18, 2.0));
  col += uHorizon * gloss * 0.12 * uDim;
  float contact = exp(-pow(r / 0.42, 2.0));
  col *= 1.0 - contact * 0.45;
  float ring = smoothstep(0.18, 0.0, abs(r - uShockR)) * uShock * fade;
  float halo = smoothstep(0.55, 0.0, abs(r - uShockR)) * uShock * 0.35 * fade;
  col += uShockCol * (ring * 0.85 + halo * 0.35);
  float alpha = (0.38 + uHaze * 0.16 + gloss * 0.12 + ring * 0.4) * fade * (1.0 - fog * 0.55);
  gl_FragColor = vec4(tone(col), clamp(alpha, 0.0, 0.72));
}
`,l=`
precision mediump float;
attribute vec3 aPos;
attribute float aLife;
uniform mat4 uMVP;
uniform float uSize;
varying float vLife;
void main() {
  vLife = aLife;
  gl_Position = uMVP * vec4(aPos, 1.0);
  gl_PointSize = uSize * (0.55 + aLife * 0.9) * (1.2 / max(gl_Position.w, 0.4));
}
`,u=`
precision mediump float;
uniform vec3 uColor;
uniform float uDim;
varying float vLife;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float a = exp(-d * 2.6) * vLife * 0.7 * uDim;
  vec3 col = uColor * (0.5 + 0.5 * (1.0 - d));
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  gl_FragColor = vec4(col, a);
}
`,d=`
precision mediump float;
attribute vec3 aPos;
attribute vec3 aNrm;
attribute float aSide;
attribute float aSpan;
uniform mat4 uMVP;
uniform mat4 uModel;
uniform float uWing;
varying vec3 vW;
varying vec3 vN;
varying float vSpan;
void main() {
  float fold = (1.0 - uWing) * 1.15;
  float s = aSide;
  float c = cos(fold);
  float si = sin(fold * s);
  // rotate around a vertical axis at the shoulder (~0.20, 1.40, 0)
  vec3 p = aPos;
  vec3 o = vec3(s * 0.20, 1.40, -0.02);
  vec3 d = p - o;
  // rotate toward the spine (around Y)
  float ca = cos(-s * fold);
  float sa = sin(-s * fold);
  vec3 r = vec3(d.x * ca - d.z * sa, d.y, d.x * sa + d.z * ca);
  // tuck downward when folded
  r.y -= fold * 0.18 * aSpan;
  r.z += fold * 0.12;
  p = o + r;
  vec4 w = uModel * vec4(p, 1.0);
  vW = w.xyz;
  vN = normalize(aNrm);
  vSpan = aSpan;
  gl_Position = uMVP * vec4(p, 1.0);
}
`,f=`
precision mediump float;
uniform vec3 uEye;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform float uDim;
uniform float uWing;
uniform vec3 uFogCol;
uniform float uFog;
varying vec3 vW;
varying vec3 vN;
varying float vSpan;

vec3 tone(vec3 col) {
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.72) col *= 0.72 / peak;
  return col;
}

void main() {
  if (uWing < 0.02) discard;
  vec3 N = normalize(vN);
  vec3 V = normalize(uEye - vW);
  float ndv = max(dot(N, V), 0.0);
  float fres = pow(1.0 - ndv, 1.8);
  float edge = smoothstep(0.0, 0.12, vSpan) * (1.0 - smoothstep(0.78, 1.0, vSpan));
  vec3 col = mix(uColor, uColor2, vSpan);
  col *= (0.25 + fres * 0.9) * edge * uWing * uDim;
  float dist = length(uEye - vW);
  float fog = 1.0 - exp(-uFog * dist);
  col = mix(col, uFogCol, fog * 0.35);
  gl_FragColor = vec4(tone(col), clamp(0.15 + fres * 0.55, 0.0, 0.85) * edge * uWing);
}
`;function p(){return{pos:[],nrm:[],attr:[],idx:[]}}function m(e,t,n,r){e.idx.push(t,n,r)}function h(e,t,n,r,i,a,o,s){let c=e.pos.length/3;e.pos.push(t,n,r);let l=Math.hypot(i,a,o)||1;return e.nrm.push(i/l,a/l,o/l),e.attr.push(s),c}function g(e,t,n,r,i,a,o,s,c=20,l=14){let u=e.pos.length/3;for(let u=0;u<=l;u++){let d=u/l*Math.PI,f=Math.sin(d),p=Math.cos(d);for(let l=0;l<=c;l++){let u=l/c*Math.PI*2,d=Math.cos(u),m=Math.sin(u),g=d*f,_=p,v=m*f,y=g/(i*i),b=_/(a*a),x=v/(o*o);h(e,t+g*i,n+_*a,r+v*o,y,b,x,s)}}let d=c+1;for(let t=0;t<l;t++)for(let n=0;n<c;n++){let r=u+t*d+n,i=r+d;m(e,r,i,r+1),m(e,r+1,i,i+1)}}function _(e,t,n,r,i,a,o,s,c,l,u=18){let d=i-t,f=a-n,p=o-r,g=Math.hypot(d,f,p)||1,_=d/g,v=f/g,y=p/g,b=0,x=1;Math.abs(v)>.9&&(b=1,x=0);let S=x*y-0*v,C=0*_-b*y,w=b*v-x*_,T=Math.hypot(S,C,w)||1;S/=T,C/=T,w/=T;let E=v*w-y*C,D=y*S-_*w,O=_*C-v*S,k=e.pos.length/3;for(let m=0;m<=12;m++){let g=m/12;g<.2?g/.2*-.5*Math.PI:g>.8&&(g-.8)/.2*.5*Math.PI;let b,x,T,k;if(g<.2){let e=g/.2;Math.PI-e*.5*Math.PI;let i=-Math.cos(e*.5*Math.PI)*s,a=Math.sin(e*.5*Math.PI);b=t+_*i,x=n+v*i,T=r+y*i,k=s*Math.max(a,.001),-1+e}else if(g>.8){let e=(g-.8)/.2,t=Math.sin(e*.5*Math.PI)*c,n=Math.cos(e*.5*Math.PI);b=i+_*t,x=a+v*t,T=o+y*t,k=c*Math.max(n,.001)}else{let e=(g-.2)/.6;b=t+d*e,x=n+f*e,T=r+p*e,k=s+(c-s)*e}for(let t=0;t<=u;t++){let n=t/u*Math.PI*2,r=Math.cos(n),i=Math.sin(n),a=S*r+E*i,o=C*r+D*i,s=w*r+O*i,c=a,d=o,f=s;if(g<.2){let e=g/.2,t=Math.cos(e*.5*Math.PI);c=a*Math.sin(e*.5*Math.PI)-_*t,d=o*Math.sin(e*.5*Math.PI)-v*t,f=s*Math.sin(e*.5*Math.PI)-y*t}else if(g>.8){let e=(g-.8)/.2,t=Math.sin(e*.5*Math.PI),n=Math.cos(e*.5*Math.PI);c=a*n+_*t,d=o*n+v*t,f=s*n+y*t}h(e,b+a*k,x+o*k,T+s*k,c,d,f,l)}}let A=u+1;for(let t=0;t<12;t++)for(let n=0;n<u;n++){let r=k+t*A+n,i=r+A;m(e,r,i,r+1),m(e,r+1,i,i+1)}}function v(e,t,n,r=22){let i=e.pos.length/3,a=t.length;for(let i=0;i<a;i++){let[o,s,c]=t[i],l=t[Math.max(0,i-1)],u=t[Math.min(a-1,i+1)],d=u[0]-l[0]||.001,f=u[1]-l[1];for(let t=0;t<=r;t++){let i=t/r*Math.PI*2,a=Math.cos(i),l=Math.sin(i);h(e,a*s,o,l*c,a,-f/d,l,n)}}let o=r+1;for(let t=0;t<a-1;t++)for(let n=0;n<r;n++){let r=i+t*o+n,a=r+o;m(e,r,r+1,a),m(e,r+1,a+1,a)}}function y(){let e=p(),t=.08;return v(e,[[.9,.07,.06],[.93,.12,.09],[.98,.128,.095],[1.06,.114,.088],[1.14,.102,.085],[1.22,.122,.118],[1.3,.148,.15],[1.36,.152,.155],[1.42,.168,.12],[1.455,.155,.1],[1.48,.09,.07],[1.505,.058,.052]],1),v(e,[[1.478,.055,.05],[1.51,.048,.046],[1.54,.046,.048],[1.562,.05,.055]],1,18),v(e,[[1.555,.048,.05],[1.57,.072,.078],[1.595,.088,.092],[1.63,.096,.102],[1.67,.1,.1],[1.71,.092,.09],[1.745,.07,.072],[1.77,.036,.04],[1.782,.012,.014]],.15,22),_(e,.155,1.4,.02,.285,1.14,.055,.06,.05,t,16),_(e,.27,1.18,.05,.315,.88,.065,.05,.042,t,16),g(e,.32,.83,.07,.036,.05,.028,t,14,10),_(e,-.155,1.4,.02,-.255,1.15,.045,.06,.05,t,16),_(e,-.24,1.19,.04,-.275,.89,.055,.05,.042,t,16),g(e,-.28,.84,.06,.036,.05,.028,t,14,10),_(e,.085,.92,.01,.1,.48,.04,.072,.055,0,16),_(e,.098,.54,.038,.098,.13,0,.055,.044,0,16),g(e,.1,.05,.07,.046,.036,.115,0,14,10),_(e,-.085,.92,.03,-.098,.48,.06,.072,.055,0,16),_(e,-.096,.54,.058,-.094,.13,.02,.055,.044,0,16),g(e,-.094,.05,.09,.046,.036,.115,0,14,10),e}function b(){let e=p();for(let t of[1,-1])for(let n=0;n<7;n++){let r=n/6,i=(-.15+r*1.25)*t,a=-.25+r*.85,o=.55+(1-Math.abs(r-.45))*.7,s=.035+(1-r)*.02,c=t*.2,l=i,u=a,d=Math.sin(l),f=Math.cos(u),p=Math.sin(u);d*f*t*0+Math.sin(l)*f,-Math.cos(l)*f;let g=Math.sin(l)*f,_=p,v=-Math.cos(l)*f,y=-v,b=0,x=g,S=Math.hypot(y,b,x)||1;y/=S,b/=S,x/=S;let C=e.pos.length/3;for(let t=0;t<=8;t++){let n=t/8,r=s*(1-n*.85)*(.7+.3*Math.sin(n*Math.PI)),i=Math.sin(n*Math.PI)*.12,a=c+g*o*n+y*0+0,l=1.4+_*o*n+i*.4,u=-.02+v*o*n-Math.sin(n*Math.PI)*.08;for(let t of[-1,1]){let i=y*t,o=x*t;h(e,a+y*r*t,l,u+x*r*t,i,.35,o,n)}}for(let t=0;t<8;t++){let n=C+t*2;m(e,n,n+1,n+2),m(e,n+1,n+3,n+2)}}return e}function x(){let e=p(),t=h(e,-16,0,-16,0,1,0,0),n=h(e,16,0,-16,0,1,0,0),r=h(e,16,0,16,0,1,0,0),i=h(e,-16,0,16,0,1,0,0);return m(e,t,n,r),m(e,t,r,i),e}function S(e,t,n){let r=t.pos.length/3,i=n?8:7,a=new Float32Array(r*i);for(let e=0;e<r;e++){let r=e*i;a[r]=t.pos[e*3],a[r+1]=t.pos[e*3+1],a[r+2]=t.pos[e*3+2],a[r+3]=t.nrm[e*3],a[r+4]=t.nrm[e*3+1],a[r+5]=t.nrm[e*3+2],a[r+6]=t.attr[e],n&&(a[r+7]=n[e])}let o=e.createBuffer(),s=e.createBuffer();if(!o||!s)return null;e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,a,e.STATIC_DRAW);let c=new Uint16Array(t.idx);return e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,s),e.bufferData(e.ELEMENT_ARRAY_BUFFER,c,e.STATIC_DRAW),{vbo:o,ibo:s,count:c.length,stride:i*4}}function C(e,t){let n=t.pos.length/3,r=Array(n);for(let e=0;e<n;e++)r[e]=t.pos[e*3]>=0?1:-1;return S(e,t,r)}function w(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)||`Presence shader failed`),e.deleteShader(r),null)):null}function T(e,t,n,r){let i=w(e,e.VERTEX_SHADER,t),a=w(e,e.FRAGMENT_SHADER,n);if(!i||!a)return null;let o=e.createProgram();if(!o)return null;e.attachShader(o,i),e.attachShader(o,a);for(let[t,n]of r)e.bindAttribLocation(o,t,n);return e.linkProgram(o),e.deleteShader(i),e.deleteShader(a),e.getProgramParameter(o,e.LINK_STATUS)?o:(console.error(e.getProgramInfoLog(o)||`Presence program failed`),e.deleteProgram(o),null)}function E(e,t,n){return e.getUniformLocation(t,n)}function D(e,t,n){let r={};for(let i in n)r[i]=E(e,t,n[i]);return r}function O(e,t){let n=new Float32Array(16);for(let r=0;r<4;r++)for(let i=0;i<4;i++)n[r*4+i]=e[i]*t[r*4]+e[4+i]*t[r*4+1]+e[8+i]*t[r*4+2]+e[12+i]*t[r*4+3];return n}function k(e,t,n,r){let i=1/Math.tan(e/2),a=new Float32Array(16);return a[0]=i/t,a[5]=i,a[10]=(r+n)/(n-r),a[11]=-1,a[14]=2*r*n/(n-r),a}function A(e,t,n,r,i,a,o=0,s=1,c=0){let l=e-r,u=t-i,d=n-a,f=Math.hypot(l,u,d)||1;l/=f,u/=f,d/=f;let p=s*d-c*u,m=c*l-o*d,h=o*u-s*l,g=Math.hypot(p,m,h)||1;p/=g,m/=g,h/=g;let _=u*h-d*m,v=d*p-l*h,y=l*m-u*p,b=new Float32Array(16);return b[0]=p,b[1]=_,b[2]=l,b[4]=m,b[5]=v,b[6]=u,b[8]=h,b[9]=y,b[10]=d,b[12]=-(p*e+m*t+h*n),b[13]=-(_*e+v*t+y*n),b[14]=-(l*e+u*t+d*n),b[15]=1,b}function j(e,t,n){let r=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);return r[12]=e,r[13]=t,r[14]=n,r}function M(e){let t=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);return t[5]=e,t}function ee(e){let t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10],u=t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)||1,d=(a*l-o*c)/u,f=(r*c-n*l)/u,p=(n*o-r*a)/u,m=(o*s-i*l)/u,h=(t*l-r*s)/u,g=(r*i-t*o)/u,_=(i*c-a*s)/u,v=(n*s-t*c)/u,y=(t*a-n*i)/u;return new Float32Array([d,f,p,m,h,g,_,v,y])}function N(e,t,n=!1){e.bindBuffer(e.ARRAY_BUFFER,t.vbo),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.ibo);let r=t.stride;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,3,e.FLOAT,!1,r,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,3,e.FLOAT,!1,r,12),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,1,e.FLOAT,!1,r,24),n?(e.enableVertexAttribArray(3),e.vertexAttribPointer(3,1,e.FLOAT,!1,r,28)):e.disableVertexAttribArray(3)}function te(e,t,n,r){if(r.quality===`low`||r.quality===`high`)return r.quality;let i=Math.max(t,n);return Math.max(e.canvas.width,e.canvas.height)+1<i*.7?`low`:`high`}function P(e,t){if(t)return t;let n=T(e,r,i,[[0,`aPos`],[1,`aNrm`],[2,`aRegion`]]),p=T(e,a,o,[[0,`aPos`]]),m=T(e,s,c,[[0,`aPos`],[1,`aNrm`]]),h=T(e,l,u,[[0,`aPos`],[2,`aLife`]]),g=T(e,d,f,[[0,`aPos`],[1,`aNrm`],[2,`aSpan`],[3,`aSide`]]);if(!n||!p||!m||!h||!g)return null;let _=S(e,y()),v=C(e,b()),w=S(e,x()),E=e.createBuffer();return!_||!v||!w||!E?null:{figure:n,backdrop:p,floor:m,particle:h,wingProg:g,figU:D(e,n,{uMVP:`uMVP`,uModel:`uModel`,uNrm:`uNrmMat`,uEye:`uEye`,uBreath:`uBreath`,uLightDir:`uLightDir`,uRimDir:`uRimDir`,uFillDir:`uFillDir`,uAlbedo:`uAlbedo`,uLightCol:`uLightCol`,uRimCol:`uRimCol`,uFogCol:`uFogCol`,uHorizon:`uHorizon`,uFog:`uFog`,uHaze:`uHaze`,uRim:`uRim`,uDim:`uDim`,uReflect:`uReflect`}),backU:D(e,p,{uRes:`uRes`,uHorizon:`uHorizon`,uFogCol:`uFogCol`,uGlow:`uGlow`,uHaze:`uHaze`}),floorU:D(e,m,{uMVP:`uMVP`,uEye:`uEye`,uHorizon:`uHorizon`,uFogCol:`uFogCol`,uShockCol:`uShockCol`,uFog:`uFog`,uHaze:`uHaze`,uShock:`uShock`,uShockR:`uShockR`,uDim:`uDim`}),partU:D(e,h,{uMVP:`uMVP`,uColor:`uColor`,uSize:`uSize`,uDim:`uDim`}),wingU:D(e,g,{uMVP:`uMVP`,uModel:`uModel`,uNrm:`uNrmMat`,uEye:`uEye`,uWing:`uWing`,uColor:`uColor`,uColor2:`uColor2`,uDim:`uDim`,uFogCol:`uFogCol`,uFog:`uFog`}),mesh:_,wings:v,floorBuf:w,particleBuf:E,particleCount:0,quality:`high`,pw:0,ph:0,tension:0,armed:!0,wing:0,wingHold:0,shock:0,shockR:.4,drift:0}}function F(e,t){let n=e.rgb[t];return[n[0]/255,n[1]/255,n[2]/255]}function I(e){let t=0;for(let n of e.rgb)t=Math.max(t,Math.max(...n)-Math.min(...n));return t}function L(e,t,n,r,i,a,o,s,c,l,u){let d=l.reduceFlashing!==!1,f=te(e,a,o,l),p=Math.min(1.2,s.bass),m=Math.min(1.2,s.rms),h=Math.min(1,s.drop),g=Math.min(1,Math.max(s.kick,s.beat>.92?s.beat*.45:0));Math.min(1.2,s.mid);let _=Math.min(1,p*.55+m*.45),v=p<.12&&m<.14&&h<.1;i.tension=v?Math.max(0,i.tension-u*.7):Math.max(0,Math.min(1,i.tension+(_-.28)*u*.4)),h>.62&&i.armed&&(i.wing=1,i.wingHold=d?.35:.55,i.shock=1,i.shockR=.28,i.armed=!1),h<.14&&(i.armed=!0),i.wingHold>0?i.wingHold=Math.max(0,i.wingHold-u):i.wing*=Math.exp(-u*(d?1.6:1.15)),i.wing<.02&&(i.wing=0),i.shock=Math.max(0,i.shock-u*(d?1.15:.9)),i.shock>0&&(i.shockR+=u*(d?3.2:4.2)*(.7+i.shock)),i.drift+=u*(.04+(v?.08:.02));let y=f===`low`?400:Math.min(a,o)<500?520:720,b=Math.max(a,o),x=b>y?y/b:1,S=Math.max(2,Math.round(a*x)),C=Math.max(2,Math.round(o*x));(n.width!==S||n.height!==C)&&(n.width=S,n.height=C),i.pw=S,i.ph=C,i.quality=f;let w=I(c)<28,T=F(c,0),E=F(c,1),D=F(c,2),P=w?[.02,.02,.023]:[.016+T[0]*.03,.016+T[1]*.03,.02+T[2]*.03],L=w?[.36,.36,.38]:T,R=w?[.42,.42,.44]:D,z=w?[.7,.7,.73]:[Math.min(.9,E[0]*1.15+.05),Math.min(.9,E[1]*1.15+.05),Math.min(.9,E[2]*1.15+.05)],B=w?[.45,.45,.44]:[Math.min(.65,D[0]*.7+T[0]*.15),Math.min(.65,D[1]*.7+T[1]*.15),Math.min(.65,D[2]*.7+T[2]*.15)],ne=w?[.045,.045,.05]:[.035+T[0]*.02,.035+T[1]*.02,.038+T[2]*.02],V=.42+.58*(1-(v?.7:0)),H=i.tension,U=Math.min(1,V*(.75+H*.35+i.wing*.15+g*.08)),W=v?.28:.14-H*.04,G=v?.85:.48-H*.15+i.shock*.08,re=(.55+H*.5+i.wing*.35)*(d&&i.wing>.2?.75:1),ie=(.35+p*.7)*(.65+.35*Math.sin(s.time*1.4)),ae=i.shock*(d?.35:.55)+i.wing*.15,K=[Math.min(.85,E[0]*(.7+ae)+T[0]*.2),Math.min(.85,E[1]*(.7+ae)+T[1]*.2),Math.min(.85,E[2]*(.7+ae)+T[2]*.2)],oe=.05,se=.95+Math.sin(i.drift*.4)*(v?.12:.05),q=.05+Math.cos(i.drift*.31)*(v?.04:.02),ce=3.85-i.wing*.22-H*.1,le=0+Math.sin(se)*ce*Math.cos(q),J=.7+Math.sin(q)*ce,Y=oe+Math.cos(se)*ce*Math.cos(q),ue=O(k(34*Math.PI/180,S/C,.15,30),A(le,J,Y,0,.92,oe)),X=j(0,0,0),Z=O(ue,X),de=ee(X),Q=M(-1),fe=O(ue,Q),pe=ee(Q),me=f===`low`?22:80,$=new Float32Array(me*4),he=.25+H*.7;for(let e=0;e<me;e++){let t=e*19.17+s.time*(.07+(v?.04:.02)),n=t*.7+e*.41,r=(.5+e%7*.35)*(2.4-he*1.4)+Math.sin(t*1.3)*.2,i=.08+e%11*.13+Math.sin(t*.9+e)*.1;$[e*4]=Math.cos(n)*r,$[e*4+1]=i,$[e*4+2]=Math.sin(n)*r*.85-.2,$[e*4+3]=.25+e*13%10/14+H*.25}t.bindBuffer(t.ARRAY_BUFFER,i.particleBuf),t.bufferData(t.ARRAY_BUFFER,$,t.DYNAMIC_DRAW),i.particleCount=me,t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,S,C),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.disable(t.BLEND),t.clearColor(.0196,.0196,.0235,1),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT),t.useProgram(i.backdrop),t.bindBuffer(t.ARRAY_BUFFER,r),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.disableVertexAttribArray(1),t.disableVertexAttribArray(2),t.disableVertexAttribArray(3),t.uniform2f(i.backU.uRes,S,C),t.uniform3f(i.backU.uHorizon,L[0],L[1],L[2]),t.uniform3f(i.backU.uFogCol,P[0],P[1],P[2]),t.uniform3f(i.backU.uGlow,R[0],R[1],R[2]),t.uniform1f(i.backU.uHaze,G),t.drawArrays(t.TRIANGLES,0,3);let ge=[.45,.75,.4],_e=[-.55,.2,-.8],ve=[-.2,.15,.6],ye=e=>{t.useProgram(i.figure),N(t,i.mesh);let n=i.figU;t.uniformMatrix4fv(n.uMVP,!1,e?fe:Z),t.uniformMatrix4fv(n.uModel,!1,e?Q:X),t.uniformMatrix3fv(n.uNrm,!1,e?pe:de),t.uniform3f(n.uEye,le,J,Y),t.uniform1f(n.uBreath,ie),t.uniform3f(n.uLightDir,ge[0],ge[1],ge[2]),t.uniform3f(n.uRimDir,_e[0],_e[1],_e[2]),t.uniform3f(n.uFillDir,ve[0],ve[1],ve[2]),t.uniform3f(n.uAlbedo,ne[0],ne[1],ne[2]),t.uniform3f(n.uLightCol,B[0],B[1],B[2]),t.uniform3f(n.uRimCol,z[0],z[1],z[2]),t.uniform3f(n.uFogCol,P[0],P[1],P[2]),t.uniform3f(n.uHorizon,L[0],L[1],L[2]),t.uniform1f(n.uFog,W),t.uniform1f(n.uHaze,G),t.uniform1f(n.uRim,re),t.uniform1f(n.uDim,U*(e?.85:1)),t.uniform1f(n.uReflect,+!!e),t.drawElements(t.TRIANGLES,i.mesh.count,t.UNSIGNED_SHORT,0)};if(t.enable(t.DEPTH_TEST),t.depthFunc(t.LEQUAL),t.enable(t.CULL_FACE),t.cullFace(t.BACK),f!==`low`&&(t.frontFace(t.CW),ye(!0),t.frontFace(t.CCW)),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.depthMask(!1),t.useProgram(i.floor),N(t,i.floorBuf),t.uniformMatrix4fv(i.floorU.uMVP,!1,Z),t.uniform3f(i.floorU.uEye,le,J,Y),t.uniform3f(i.floorU.uHorizon,L[0],L[1],L[2]),t.uniform3f(i.floorU.uFogCol,P[0],P[1],P[2]),t.uniform3f(i.floorU.uShockCol,K[0],K[1],K[2]),t.uniform1f(i.floorU.uFog,W),t.uniform1f(i.floorU.uHaze,G),t.uniform1f(i.floorU.uShock,i.shock),t.uniform1f(i.floorU.uShockR,i.shockR),t.uniform1f(i.floorU.uDim,U),t.drawElements(t.TRIANGLES,i.floorBuf.count,t.UNSIGNED_SHORT,0),t.depthMask(!0),t.disable(t.BLEND),ye(!1),i.wing>.02){t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE),t.depthMask(!1),t.disable(t.CULL_FACE),t.useProgram(i.wingProg),N(t,i.wings,!0);let e=i.wingU;t.uniformMatrix4fv(e.uMVP,!1,Z),t.uniformMatrix4fv(e.uModel,!1,X),t.uniformMatrix3fv(e.uNrm,!1,de),t.uniform3f(e.uEye,le,J,Y),t.uniform1f(e.uWing,Math.min(1,i.wing)),t.uniform3f(e.uColor,K[0],K[1],K[2]),t.uniform3f(e.uColor2,T[0],T[1],T[2]),t.uniform1f(e.uDim,U*(d?.7:1)),t.uniform3f(e.uFogCol,P[0],P[1],P[2]),t.uniform1f(e.uFog,W),t.drawElements(t.TRIANGLES,i.wings.count,t.UNSIGNED_SHORT,0),t.depthMask(!0),t.enable(t.CULL_FACE),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA)}t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE),t.depthMask(!1),t.useProgram(i.particle),t.bindBuffer(t.ARRAY_BUFFER,i.particleBuf),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,16,0),t.disableVertexAttribArray(1),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,1,t.FLOAT,!1,16,12),t.disableVertexAttribArray(3),t.uniformMatrix4fv(i.partU.uMVP,!1,Z),t.uniform3f(i.partU.uColor,R[0],R[1],R[2]),t.uniform1f(i.partU.uSize,f===`low`?6:10),t.uniform1f(i.partU.uDim,U*.85),t.drawArrays(t.POINTS,0,i.particleCount),t.depthMask(!0),t.disable(t.BLEND),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),globalThis.__mvPresenceBudget={quality:f,particles:i.particleCount,pw:S,ph:C},e.save(),e.globalAlpha=1,e.imageSmoothingEnabled=!0,e.drawImage(n,0,0,a,o),e.restore()}var R=64;function z(){let e=[];for(let t=0;t<10;t++)e.push(t/10);return{trail:[],laserT:0,rings:e,bursts:[],burstArmed:!0,lastT:0,gpu:null,gpuChecked:!1,tunnel:null}}function B(e=0){return{time:e,rms:.05,bass:.05,mid:.05,treble:.04,beat:0,drop:0,kick:0,drive:1,bars:new Float32Array(48),wave:new Float32Array(96)}}function ne(e,t){let r=n[e];return t>.5?{a:r.c,b:r.a,c:r.b,rgb:[r.rgb[2],r.rgb[0],r.rgb[1]]}:r}function V(e,t){return t%3==0?e.a:t%3==1?e.b:e.c}function H(e){return Math.max(.35,e.drive||1)}function U(e,t,n,r,i,a,o={theme:`neon`,reduceFlashing:!0,dropFx:!0}){let s=a.lastT?Math.min(.05,Math.max(.001,r.time-a.lastT)):.016;a.lastT=r.time;let c=o.dropFx!==!1,l=ne(o.theme,c?r.drop:0);e.clearRect(0,0,t,n),e.fillStyle=`#050506`,e.fillRect(0,0,t,n),i===`pulse`?W(e,t,n,r,a,l):i===`fractal`?he(e,t,n,r,a,l,o,s):i===`liquid`?ge(e,t,n,r,a,l,o,s):i===`jelly`?Ee(e,t,n,r,a,l,o,s):i===`tunnel`?G(e,t,n,r,a,l,o,s):i===`presence`?De(e,t,n,r,a,l,o,s):i===`lasers`?Oe(e,t,n,r,a,l,o,s):ke(e,t,n,r,l),c&&Ae(e,t,n,r,a,l,o.reduceFlashing),e.globalAlpha=1}function W(e,t,n,r,i,a){let o=t*.5,s=n*.46,c=H(r),l=Math.min(t,n)*(.07+r.bass*.2*c+r.beat*.09*c),u=e.createRadialGradient(o,s,l*.2,o,s,l*3.2),d=a.rgb[0],f=a.rgb[1];u.addColorStop(0,`rgba(${d[0]}, ${d[1]}, ${d[2]}, ${.35+r.rms*.4})`),u.addColorStop(.45,`rgba(${f[0]}, ${f[1]}, ${f[2]}, ${.12+r.mid*.2})`),u.addColorStop(1,`rgba(5, 5, 6, 0)`),e.fillStyle=u,e.fillRect(0,0,t,n),e.beginPath(),e.fillStyle=`#f4f4f5`,e.globalAlpha=.85,e.arc(o,s,l*.45,0,Math.PI*2),e.fill(),e.globalAlpha=1;let p=r.bars.length,m=Math.max(2,t*.72/p-3),h=(t-p*(m+3))/2,g=n*.86;for(let t=0;t<p;t++){let i=r.bars[t]??0,o=Math.max(3,i*n*(.18+.22*c));e.fillStyle=V(a,t),e.globalAlpha=.45+i*.55,e.fillRect(h+t*(m+3),g-o,m,o)}e.globalAlpha=1;let _=r.wave[Math.floor(r.time*30)%r.wave.length]??0;i.trail.push({x:o+Math.sin(r.time*.7)*t*.22+_*t*.08,y:s+Math.cos(r.time*.55)*n*.12+(r.wave[8]??0)*n*.18}),i.trail.length>R&&i.trail.shift(),e.lineWidth=2,e.lineCap=`round`,e.lineJoin=`round`;for(let t=1;t<i.trail.length;t++){let n=i.trail[t-1],r=i.trail[t],o=t/i.trail.length;e.strokeStyle=V(a,Math.floor(o*3)),e.globalAlpha=o*.85,e.beginPath(),e.moveTo(n.x,n.y),e.lineTo(r.x,r.y),e.stroke()}e.globalAlpha=1}function G(e,t,n,r,i,a,o,s){let c=o.reduceFlashing!==!1,l=1-K(.1,.45,r.rms*.65+r.bass*.8+r.kick*.35),u=K(.15,.75,r.bass*.65+r.kick*.7+r.rms*.25),d=s/.0167,f=oe(e,t,n,o),p=se(f,t,n),m=ce(i,t,n,f);m.breath+=s*.7,r.drop>.62&&m.armed&&(m.lurch=1,m.armed=!1),r.drop<.14&&(m.armed=!0),m.lurch=Math.max(0,m.lurch-s/1.55);let h=Math.min(1,r.kick*.75+r.bass*.35+m.lurch*.4),g=1-Math.exp(-s*(c?7:18));m.glow+=(h-m.glow)*g;let _=m.lurch*m.lurch,v=(.016+u*.01)*d*(1-l*.94),y=Math.sin(m.breath)*.014*d,b=_*.028*d,x=Math.min(1.045,Math.max(.984,1+v*(1-l)+y*l+b)),S=Math.sin(r.time*.17)*(.006+u*.016)*d*(.2+.8*(1-l));m.spin+=S;let C=m.front,w=m.back,T=w.getContext(`2d`);if(!T)return;let E=m.w,D=m.h,O=E*.5,k=D*.5,A=.4+.6*(1-l),j=c?.78:1,M=m.glow,ee=Math.min(E,D),N=0;for(let e of a.rgb)N=Math.max(N,Math.max(...e)-Math.min(...e));let te=N<28;m.depths.length!==p.rings&&(m.depths=q(p.rings)),m.planes.length!==p.planes&&(m.planes=q(p.planes));let P=.05+u*.27;P*=1-l*.8,P+=_*1.15,P*=1+M*.24;let F=m.depths;for(let e=0;e<F.length;e++){let t=F[e]+P*s;t>=1&&--t,F[e]=t}let I=m.planes,L=P*1.22;for(let e=0;e<I.length;e++){let t=I[e]+L*s;t>=1&&--t,I[e]=t}let R=.45+.55*(1-l),z=O+(Math.sin(r.time*.23)*.16+Math.sin(r.time*.07+1.2)*.06)*E*R,B=k+(Math.cos(r.time*.19)*.11+Math.sin(r.time*.11)*.04)*D*R,ne=O+(z-O)*.1,V=k+(B-k)*.1,H=1+Math.sin(m.breath)*.04*l,U=1+_*(c?.1:.18),W=m.lurch>.45?2:+(m.lurch>.2),G=m.spin*.65;T.setTransform(1,0,0,1,0,0),T.globalAlpha=1,T.globalCompositeOperation=`source-over`,T.fillStyle=`#050506`,T.fillRect(0,0,E,D),T.save(),T.translate(z,B),T.rotate(S),T.scale(x,x),T.translate(-z,-B),T.globalAlpha=l>.55?.968:.988,T.drawImage(C,0,0),T.restore();let le=l>.55?.035:.014;T.globalAlpha=1,T.fillStyle=`rgba(5, 5, 6, ${le})`,T.fillRect(0,0,E,D);let J=(e,t)=>{let n=a.rgb[(e%3+3)%3],r=Math.max(0,t)**.8;if(te){let e=Math.round(26+r*128);return`rgb(${e}, ${e}, ${e})`}let i=.22+r*.78;return`rgb(${Math.round(n[0]*i+5)}, ${Math.round(n[1]*i+5)}, ${Math.round(n[2]*i+6)})`},Y=(e,t,n)=>{let r=a.rgb[(e%3+3)%3],i=Math.max(0,t)**.8;if(te){let e=Math.round(26+i*128);return`rgba(${e}, ${e}, ${e}, ${n})`}let o=.22+i*.78;return`rgba(${Math.round(r[0]*o+5)}, ${Math.round(r[1]*o+5)}, ${Math.round(r[2]*o+6)}, ${n})`},ue=(e,t=1)=>{let n=e**1.42;return{x:z+(ne-z)*n,y:B+(V-B)*n,radius:ee*(.03+n*.86)*H*t*U,depth:n}},X=[];for(let e=0;e<F.length;e++)X.push(e);X.sort((e,t)=>F[e]-F[t]),re(T,z,B,ee,a,te,{bass:r.bass,glow:M,rush:_,dim:A,punch:j,reduce:c,rot:G,shift:W}),T.lineCap=`round`,T.lineJoin=`round`;let Z=Math.min(.22,(.08+M*.04)*A*j),de=p.walls;for(let e=0;e<de;e++){T.beginPath();let t=!1;for(let n=0;n<X.length;n++){let r=F[X[n]];if(r<.12||r>.9)continue;let i=ue(r),a=e/de*Math.PI*2+G+(1-r)*.75,o=i.x+Math.cos(a)*i.radius,s=i.y+Math.sin(a)*i.radius;t?T.lineTo(o,s):(T.moveTo(o,s),t=!0)}t&&(T.strokeStyle=J(e+W,.65),T.globalAlpha=Z,T.lineWidth=Math.max(1,ee*.0018),T.stroke())}for(let e=0;e<X.length;e++){let t=F[X[e]];if(t<.12||t>.88)continue;let n=ue(t);if(n.radius<6)continue;let r=Math.min(te?.5:.58,(.04+n.depth*.5)*A*j*(.74+M*.3)),i=G+(1-t)*.75;T.beginPath();for(let e=0;e<=6;e++){let t=i+e/6*Math.PI*2,r=n.x+Math.cos(t)*n.radius,a=n.y+Math.sin(t)*n.radius;e===0?T.moveTo(r,a):T.lineTo(r,a)}T.strokeStyle=J(X[e]+W,t),T.globalAlpha=r,T.lineWidth=Math.max(1,.8+n.radius*.008),T.stroke()}let Q=[];for(let e=0;e<I.length;e++)Q.push(e);Q.sort((e,t)=>I[e]-I[t]);for(let e=0;e<Q.length;e++){let t=Q[e],n=I[t];if(n<.42||n>.985)continue;let r=ue(n,1.12);if(r.radius<10)continue;let i=K(.42,.58,n),a=1-K(.9,.985,n),o=Math.min(.55,(.12+r.depth*.28)*A*j*i*a*(.8+M*.25));o<.03||(T.globalAlpha=o,T.strokeStyle=J(t+W+1,Math.min(1,n+.15)),T.lineWidth=Math.max(1.2,r.radius*.018),ie(T,r.x,r.y,r.radius,G+(1-n)*.5+t*.4,t%3),T.globalAlpha=o*.18,T.fillStyle=Y(t+W,n,1),ae(T,r.x,r.y,r.radius*.92,G+(1-n)*.5+t*.4,t%3))}T.globalAlpha=1,m.front=w,m.back=C,e.save(),e.globalAlpha=1,e.imageSmoothingEnabled=!0,e.drawImage(w,0,0,t,n),e.restore(),globalThis.__mvTunnelBudget={quality:f,rings:p.rings,walls:p.walls,planes:p.planes,pw:E,ph:D}}function re(e,t,n,r,i,a,o){let s=1+o.bass*.28+o.glow*.12+o.rush*(o.reduce?.18:.32),c=r*(.055+o.bass*.02)*s,l=i.rgb[o.shift%3],u=a?48:l[0],d=a?48:l[1],f=a?52:l[2],p=Math.min(.55,(.16+o.bass*.18+o.rush*.28)*o.dim*o.punch),m=e.createRadialGradient(t,n,0,t,n,c*3.2);if(m.addColorStop(0,`rgba(${u}, ${d}, ${f}, ${p})`),m.addColorStop(.45,`rgba(${u}, ${d}, ${f}, ${p*.35})`),m.addColorStop(1,`rgba(5, 5, 6, 0)`),e.globalAlpha=1,e.fillStyle=m,e.beginPath(),e.moveTo(t+c*3.2,n),e.arc(t,n,c*3.2,0,Math.PI*2),e.fill(),o.rush>.08){let r=o.reduce?4:6,i=Math.min(.28,o.rush*(o.reduce?.18:.28)*o.punch);e.strokeStyle=`rgba(${u}, ${d}, ${f}, 1)`,e.globalAlpha=i,e.lineWidth=Math.max(1,c*.08);for(let i=0;i<r;i++){let a=o.rot*.35+i/r*Math.PI*2;e.beginPath(),e.moveTo(t+Math.cos(a)*c*.7,n+Math.sin(a)*c*.7),e.lineTo(t+Math.cos(a)*c*(2.4+o.rush),n+Math.sin(a)*c*(2.4+o.rush)),e.stroke()}e.globalAlpha=1}let h=c*2.15,g=c*.85;e.beginPath(),e.moveTo(t,n-h),e.lineTo(t+g,n-h*.45),e.lineTo(t+g,n+h*.45),e.lineTo(t,n+h),e.lineTo(t-g,n+h*.45),e.lineTo(t-g,n-h*.45),e.closePath();let _=a?22:8;e.fillStyle=`rgba(${_}, ${_}, ${_+2}, 0.92)`,e.fill();let v=Math.min(.55,(.18+o.bass*.25+o.rush*.2)*o.dim*o.punch),y=e.createLinearGradient(t,n-h,t,n+h),b=a?200:230,x=Math.min(b,u+10),S=Math.min(b,d+10),C=Math.min(b,f+10);y.addColorStop(0,`rgba(${x}, ${S}, ${C}, 0)`),y.addColorStop(.5,`rgba(${x}, ${S}, ${C}, ${v})`),y.addColorStop(1,`rgba(${x}, ${S}, ${C}, 0)`),e.fillStyle=y,e.fill(),e.strokeStyle=`rgba(${u}, ${d}, ${f}, ${.55+o.glow*.25})`,e.lineWidth=Math.max(1.2,c*.12),e.globalAlpha=Math.min(.85,.45+o.glow*.3)*o.dim*o.punch,e.stroke(),e.beginPath(),e.moveTo(t,n-h*.42),e.lineTo(t+g*.42,n),e.lineTo(t,n+h*.42),e.lineTo(t-g*.42,n),e.closePath(),e.strokeStyle=`rgba(${x}, ${S}, ${C}, 0.7)`,e.lineWidth=Math.max(1,c*.07),e.stroke(),e.globalAlpha=1}function ie(e,t,n,r,i,a){let o=r*(a===1?.92:1.15),s=r*(a===1?.92:.72);if(e.beginPath(),a===1)for(let r=0;r<=6;r++){let a=i+r/6*Math.PI*2,c=t+Math.cos(a)*o,l=n+Math.sin(a)*s;r===0?e.moveTo(c,l):e.lineTo(c,l)}else if(a===2){let r=Math.cos(i),a=Math.sin(i),c=Math.min(o,s)*.22;[[-o+c,-s],[o-c,-s],[o,-s+c],[o,s-c],[o-c,s],[-o+c,s],[-o,s-c],[-o,-s+c]].forEach((i,o)=>{let s=t+i[0]*r-i[1]*a,c=n+i[0]*a+i[1]*r;o===0?e.moveTo(s,c):e.lineTo(s,c)}),e.closePath()}else{let r=Math.cos(i*.15),a=Math.sin(i*.15);[[-o,-s],[o,-s],[o,s],[-o,s]].forEach((i,o)=>{let s=t+i[0]*r-i[1]*a,c=n+i[0]*a+i[1]*r;o===0?e.moveTo(s,c):e.lineTo(s,c)}),e.closePath()}e.stroke()}function ae(e,t,n,r,i,a){ie(e,t,n,r,i,a),e.fill()}function K(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function oe(e,t,n,r){if(r.quality===`low`||r.quality===`high`)return r.quality;let i=Math.max(t,n);return Math.max(e.canvas.width,e.canvas.height)+1<i*.7?`low`:`high`}function se(e,t,n){return e===`low`?{cap:400,rings:10,walls:5,planes:3}:Math.min(t,n)<500?{cap:520,rings:14,walls:6,planes:4}:{cap:640,rings:18,walls:8,planes:6}}function q(e){let t=[];for(let n=0;n<e;n++)t.push((n+.5)/e);return t}function ce(e,t,n,r){let i=Math.max(t,n),a=se(r,t,n),o=a.cap,s=i>o?o/i:1,c=Math.max(2,Math.round(t*s)),l=Math.max(2,Math.round(n*s)),u=e.tunnel;if(!u||u.w!==c||u.h!==l||u.quality!==r){let t=document.createElement(`canvas`),n=document.createElement(`canvas`);t.width=c,t.height=l,n.width=c,n.height=l;for(let e of[t,n]){let t=e.getContext(`2d`);t&&(t.fillStyle=`#050506`,t.fillRect(0,0,c,l))}u={front:t,back:n,w:c,h:l,quality:r,spin:u?.spin??0,breath:u?.breath??0,lurch:u?.lurch??0,armed:u?.armed??!0,glow:u?.glow??0,depths:u?.depths?.length===a.rings?u.depths:q(a.rings),planes:u?.planes?.length===a.planes?u.planes:q(a.planes)},e.tunnel=u}return u}var le=`
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,J=`
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
`,Y=`
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
`,ue=`${Y}
${J}
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
`,X=`${Y}
${J}
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
`;function Z(e,t){let n=n=>e.getUniformLocation(t,n);return{uRes:n(`uRes`),uZoom:n(`uZoom`),uFlow:n(`uFlow`),uRipple:n(`uRipple`),uHue:n(`uHue`),uBass:n(`uBass`),uKick:n(`uKick`),uTreble:n(`uTreble`),uRms:n(`uRms`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`)}}function de(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)||`Shader failed`),e.deleteShader(r),null)):null}function Q(e,t){let n=de(e,e.VERTEX_SHADER,le),r=de(e,e.FRAGMENT_SHADER,t);if(!n||!r)return null;let i=e.createProgram();return i?(e.attachShader(i,n),e.attachShader(i,r),e.bindAttribLocation(i,0,`aPos`),e.linkProgram(i),e.deleteShader(n),e.deleteShader(r),e.getProgramParameter(i,e.LINK_STATUS)?i:(e.deleteProgram(i),null)):null}function fe(e){if(e.gpu)return e.gpu;if(e.gpuChecked)return null;e.gpuChecked=!0;let t=document.createElement(`canvas`),n=t.getContext(`webgl`,{alpha:!1,antialias:!0,depth:!0,stencil:!1,preserveDrawingBuffer:!0,premultipliedAlpha:!1});if(!n)return null;let r=Q(n,ue),i=Q(n,X);if(!r||!i)return null;let a=n.createBuffer();if(!a)return null;n.bindBuffer(n.ARRAY_BUFFER,a),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let o={canvas:t,gl:n,fractal:r,liquid:i,fractalU:Z(n,r),liquidU:Z(n,i),jelly:null,presence:null,buffer:a,zoom:0,hue:0,flow:0,ripple:0,pw:0,ph:0};return e.gpu=o,o}function pe(e){return e===`fractal`||e===`liquid`||e===`jelly`||e===`presence`}function me(e,t){return!pe(t)||!e.gpuChecked?!1:e.gpu?t===`jelly`?!e.gpu.jelly:t===`presence`&&!e.gpu.presence:!0}function $(e,t,n,r,i,a,o,s,c){let l=fe(i);if(!l)return;l.gl.disable(l.gl.DEPTH_TEST),l.gl.disable(l.gl.CULL_FACE),l.gl.disable(l.gl.BLEND);let u=o.reduceFlashing!==!1,d=Math.min(1.2,r.bass),f=Math.min(1.2,r.rms),p=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),m=Math.min(1,r.treble),h=Math.min(1,r.drop);l.zoom+=s*(.04+f*.36+d*.1+h*.16),l.hue+=s*((u?.03:.055)+f*.03),l.flow+=s*(.018+f*.14+d*.08+h*.1),l.ripple+=s*(.7+p*(u?5.5:13)+h*2.4);let g=Math.max(t,n),_=g>680?680/g:1,v=Math.max(2,Math.round(t*_)),y=Math.max(2,Math.round(n*_)),b=l.gl;(l.pw!==v||l.ph!==y)&&(l.canvas.width=v,l.canvas.height=y,l.pw=v,l.ph=y,b.bindBuffer(b.ARRAY_BUFFER,l.buffer),b.bufferData(b.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),b.STATIC_DRAW));let x=c===`fractal`?l.fractal:l.liquid,S=c===`fractal`?l.fractalU:l.liquidU;b.viewport(0,0,v,y),b.useProgram(x),b.bindBuffer(b.ARRAY_BUFFER,l.buffer),b.enableVertexAttribArray(0),b.vertexAttribPointer(0,2,b.FLOAT,!1,0,0);let C=e=>[e[0]/255,e[1]/255,e[2]/255];b.uniform2f(S.uRes,v,y),b.uniform1f(S.uZoom,l.zoom),b.uniform1f(S.uFlow,l.flow),b.uniform1f(S.uRipple,l.ripple),b.uniform1f(S.uHue,l.hue),b.uniform1f(S.uBass,d),b.uniform1f(S.uKick,p),b.uniform1f(S.uTreble,m),b.uniform1f(S.uRms,f),b.uniform1f(S.uDrop,h),b.uniform1f(S.uReduce,+!!u);let w=C(a.rgb[0]),T=C(a.rgb[1]),E=C(a.rgb[2]);b.uniform3f(S.uA,w[0],w[1],w[2]),b.uniform3f(S.uB,T[0],T[1],T[2]),b.uniform3f(S.uC,E[0],E[1],E[2]),b.drawArrays(b.TRIANGLES,0,3),e.imageSmoothingEnabled=!0,e.drawImage(l.canvas,0,0,t,n)}function he(e,t,n,r,i,a,o,s){$(e,t,n,r,i,a,o,s,`fractal`)}function ge(e,t,n,r,i,a,o,s){$(e,t,n,r,i,a,o,s,`liquid`)}var _e=`
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
`,ve=`
precision mediump float;
uniform sampler2D uPrev;
uniform vec2 uRes;
void main() {
  gl_FragColor = texture2D(uPrev, gl_FragCoord.xy / uRes);
}
`;function ye(e,t){let n=n=>e.getUniformLocation(t,n);return{uPrev:n(`uPrev`),uRes:n(`uRes`),uTime:n(`uTime`),uBass:n(`uBass`),uMid:n(`uMid`),uTreble:n(`uTreble`),uRms:n(`uRms`),uKick:n(`uKick`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uTension:n(`uTension`),uSmear:n(`uSmear`),uSnap:n(`uSnap`),uHue:n(`uHue`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`),uWave:n(`uWave[0]`)}}function be(e,t,n){let r=e.createTexture();return r?(e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),r):null}function xe(e,t){let n=e.createFramebuffer();if(!n)return null;e.bindFramebuffer(e.FRAMEBUFFER,n),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0);let r=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindFramebuffer(e.FRAMEBUFFER,null),r?n:null}function Se(e,t,n,r){e.bindFramebuffer(e.FRAMEBUFFER,t),e.viewport(0,0,n,r),e.clearColor(.0196,.0196,.0235,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null)}function Ce(e,t,n,r){for(let n of t.tex)e.deleteTexture(n);for(let n of t.fbo)e.deleteFramebuffer(n);let i=be(e,n,r),a=be(e,n,r);if(!i||!a)return!1;let o=xe(e,i),s=xe(e,a);return!o||!s?!1:(t.tex=[i,a],t.fbo=[o,s],t.pw=n,t.ph=r,t.idx=0,t.ready=!1,Se(e,o,n,r),Se(e,s,n,r),t.ready=!0,!0)}function we(e){if(e.jelly)return e.jelly;let t=e.gl,n=Q(t,_e),r=Q(t,ve);if(!n||!r)return null;let i=be(t,2,2),a=be(t,2,2);if(!i||!a)return null;let o=xe(t,i),s=xe(t,a);if(!o||!s)return null;let c={program:n,copy:r,u:ye(t,n),copyPrev:t.getUniformLocation(r,`uPrev`),copyRes:t.getUniformLocation(r,`uRes`),tex:[i,a],fbo:[o,s],idx:0,pw:2,ph:2,tension:0,smear:0,snap:0,armed:!0,hue:0,ready:!0};return Se(t,o,2,2),Se(t,s,2,2),e.jelly=c,c}function Te(e,t){e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}function Ee(e,t,n,r,i,a,o,s){let c=fe(i);if(!c)return;let l=we(c);if(!l)return;c.gl.disable(c.gl.DEPTH_TEST),c.gl.disable(c.gl.CULL_FACE),c.gl.disable(c.gl.BLEND);let u=o.reduceFlashing!==!1,d=Math.min(1.2,r.bass),f=Math.min(1.2,r.mid),p=Math.min(1,r.treble),m=Math.min(1.2,r.rms),h=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),g=Math.min(1,r.drop),_=Math.min(1,d*.55+m*.45);l.tension=d<.12&&m<.14&&g<.1?Math.max(0,l.tension-s*.85):Math.max(0,Math.min(1,l.tension+(_-.32)*s*.45)),g>.62&&l.armed&&(l.smear=1,l.armed=!1),g<.14&&(l.armed=!0);let v=l.smear;l.smear=Math.max(0,l.smear-s*(u?2.4:2)),v>.55&&l.smear<=.55&&(l.snap=1),l.snap=Math.max(0,l.snap-s*(u?3.2:2.8)),l.hue+=s*(.12+m*.2);let y=Math.max(t,n),b=y>960?960/y:1,x=Math.max(2,Math.round(t*b)),S=Math.max(2,Math.round(n*b)),C=c.gl;if((l.pw!==x||l.ph!==S)&&!Ce(C,l,x,S))return;(c.pw!==x||c.ph!==S)&&(c.canvas.width=x,c.canvas.height=S,c.pw=x,c.ph=S);let w=l.idx,T=1-l.idx,E=new Float32Array(8),D=r.wave,O=Math.max(1,D.length);for(let e=0;e<8;e++)E[e]=D[Math.min(O-1,Math.floor(e/8*O))]??0;C.bindFramebuffer(C.FRAMEBUFFER,l.fbo[T]),C.viewport(0,0,x,S),C.useProgram(l.program),Te(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[w]),C.uniform1i(l.u.uPrev,0),C.uniform2f(l.u.uRes,x,S),C.uniform1f(l.u.uTime,r.time),C.uniform1f(l.u.uBass,d),C.uniform1f(l.u.uMid,f),C.uniform1f(l.u.uTreble,p),C.uniform1f(l.u.uRms,m),C.uniform1f(l.u.uKick,h),C.uniform1f(l.u.uDrop,g),C.uniform1f(l.u.uReduce,+!!u),C.uniform1f(l.u.uTension,l.tension),C.uniform1f(l.u.uSmear,l.smear),C.uniform1f(l.u.uSnap,l.snap),C.uniform1f(l.u.uHue,l.hue);let k=e=>[e[0]/255,e[1]/255,e[2]/255],A=k(a.rgb[0]),j=k(a.rgb[1]),M=k(a.rgb[2]);C.uniform3f(l.u.uA,A[0],A[1],A[2]),C.uniform3f(l.u.uB,j[0],j[1],j[2]),C.uniform3f(l.u.uC,M[0],M[1],M[2]),C.uniform1fv(l.u.uWave,E),C.drawArrays(C.TRIANGLES,0,3),C.bindFramebuffer(C.FRAMEBUFFER,null),C.viewport(0,0,x,S),C.useProgram(l.copy),Te(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[T]),C.uniform1i(l.copyPrev,0),C.uniform2f(l.copyRes,x,S),C.drawArrays(C.TRIANGLES,0,3),l.idx=T,e.imageSmoothingEnabled=!0,e.drawImage(c.canvas,0,0,t,n)}function De(e,t,n,r,i,a,o,s){let c=fe(i);if(!c)return;let l=P(c.gl,c.presence);l&&(c.presence=l,L(e,c.gl,c.canvas,c.buffer,l,t,n,r,a,o,s))}function Oe(e,t,n,r,i,a,o,s){let c=H(r),l=t*.5,u=n*.78,d=Math.hypot(t,n),f=r.beat*c;i.laserT+=s*(.35+r.rms*3.2*c+r.bass*1.4*c+f*2);for(let t=0;t<8;t++){let n=(t-7/2)*(.12+r.bass*.1*c),s=Math.sin(i.laserT+t*.65)*(.55+r.treble*c*.45),p=-Math.PI/2+n+s,m=l+Math.cos(p)*d,h=u+Math.sin(p)*d;e.strokeStyle=V(a,t),e.lineWidth=1.5+r.bass*16*c+(o.reduceFlashing?f*3:f*10),e.globalAlpha=Math.min(1,o.reduceFlashing?.22+r.rms*c*.45+f*.2:.18+r.rms*c*.4+f*.7),e.beginPath(),e.moveTo(l,u),e.lineTo(m,h),e.stroke()}e.globalAlpha=1;let p=28+r.bass*70*c+f*24,m=e.createRadialGradient(l,u,0,l,u,p);m.addColorStop(0,`rgba(244,244,245,${.55+r.beat*.4})`),m.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=m,e.beginPath(),e.arc(l,u,p,0,Math.PI*2),e.fill(),f>.55&&!o.reduceFlashing&&(e.fillStyle=`rgba(244,244,245,${.1*r.beat})`,e.fillRect(0,0,t,n))}function ke(e,t,n,r,i){let a=H(r),o=[];for(let e=0;e<16;e++){let i=e/15,s=[],c=.28+i*.95;for(let e=0;e<30;e++){let o=e/29,l=Math.min(r.bars.length-1,Math.floor(o*r.bars.length)),u=r.bars[l]??0,d=Math.sin(o*12+r.time*1.5+i*4)*.18*(.25+r.mid),f=u*(.3+r.bass*1.7*a)+d*(.6+a),p=t*.5+(o-.5)*t*1.2*c,m=n*(.22+i*.62)-f*n*.42*c;s.push({x:p,y:m})}o.push(s)}e.lineWidth=1.25;for(let t=0;t<16;t++){let n=o[t];e.beginPath();for(let t=0;t<30;t++){let r=n[t];t===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=V(i,t),e.globalAlpha=.25+t/16*.6,e.stroke()}for(let t=0;t<30;t+=2){e.beginPath();for(let n=0;n<16;n++){let r=o[n][t];n===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=i.b,e.globalAlpha=.2,e.stroke()}e.globalAlpha=1}function Ae(e,t,n,r,i,a,o){r.drop>.72&&i.burstArmed&&(i.bursts.push({life:1}),o||i.bursts.push({life:.82}),i.burstArmed=!1),r.drop<.15&&(i.burstArmed=!0);let s=t*.5,c=n*.5,l=Math.min(t,n)*(o?.42:.62);if(!o&&r.drop>.05)e.fillStyle=`rgba(244,244,245,${r.drop*.2})`,e.fillRect(0,0,t,n);else if(r.drop>.05){let i=e.createRadialGradient(s,c,0,s,c,l);i.addColorStop(0,`rgba(244,244,245,${r.drop*.28})`),i.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=i,e.fillRect(0,0,t,n)}for(let t of i.bursts){t.life-=o?.01:.016;let n=(1-t.life)*l;e.beginPath(),e.arc(s,c,Math.max(1,n),0,Math.PI*2),e.strokeStyle=a.c,e.lineWidth=o?3:8,e.globalAlpha=t.life*(o?.4:.9),e.stroke()}i.bursts=i.bursts.filter(e=>e.life>0),e.globalAlpha=1}export{pe as a,me as i,B as n,e as o,U as r,t as s,z as t};