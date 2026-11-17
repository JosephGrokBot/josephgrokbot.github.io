var e=[{id:`pulse`,label:`Pulse`},{id:`fractal`,label:`Fractal Bloom`},{id:`liquid`,label:`Liquid Warp`},{id:`jelly`,label:`Jelly`},{id:`tunnel`,label:`Tunnel`},{id:`presence`,label:`Presence`},{id:`lasers`,label:`Lasers`},{id:`terrain`,label:`Bass Terrain`}],t=[{id:`neon`,label:`Neon`},{id:`sunset`,label:`Sunset`},{id:`mono`,label:`Mono`}],n={neon:{a:`#5eead4`,b:`#e879f9`,c:`#fbbf24`,rgb:[[94,234,212],[232,121,249],[251,191,36]]},sunset:{a:`#fb7185`,b:`#fb923c`,c:`#fdba74`,rgb:[[251,113,133],[251,146,60],[253,186,116]]},mono:{a:`#f4f4f5`,b:`#a1a1aa`,c:`#d4d4d8`,rgb:[[244,244,245],[161,161,170],[212,212,216]]}},r=`
precision highp float;
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,i=`
precision highp float;
uniform vec2 uRes;
uniform vec3 uEye;
uniform vec3 uTarget;
uniform float uFov;
uniform float uTime;
uniform float uBreath;
uniform float uPulse;
uniform float uHeadTilt;
uniform float uArmOut;
uniform float uRim;
uniform float uShaft;
uniform float uFog;
uniform float uHaze;
uniform float uShock;
uniform float uShockR;
uniform float uQuality;
uniform float uDim;
uniform vec3 uRimCol;
uniform vec3 uCoreCol;
uniform vec3 uFogCol;
uniform vec3 uHorizon;

float sat(float x) { return clamp(x, 0.0, 1.0); }

vec3 tone(vec3 col) {
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  return max(col, vec3(0.0));
}

float smin(float a, float b, float k) {
  float h = sat(0.5 + 0.5 * (b - a) / k);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float capsule(vec3 p, vec3 a, vec3 b, float ra, float rb) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = sat(dot(pa, ba) / dot(ba, ba));
  return length(pa - ba * h) - mix(ra, rb, h);
}

vec2 rot(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

float mapFig(vec3 p) {
  float breath = 1.0 + uBreath * 0.03;
  p.x /= breath;
  p.z /= breath;
  p.y -= uBreath * 0.012;

  float d = capsule(p, vec3(0.0, 1.06, 0.0), vec3(0.0, 1.24, 0.01), 0.058, 0.06);
  d = smin(d, capsule(p, vec3(0.0, 1.22, 0.01), vec3(0.0, 1.44, 0.02), 0.062, 0.088), 0.05);
  d = smin(d, capsule(p, vec3(0.0, 0.94, 0.0), vec3(0.0, 1.10, 0.0), 0.074, 0.06), 0.04);

  vec3 hp = p - vec3(0.0, 1.52, 0.02);
  hp.yz = rot(hp.yz, -uHeadTilt);
  hp += vec3(0.0, 1.52, 0.02);
  float head = length((hp - vec3(0.0, 1.64, 0.03)) / vec3(0.074, 0.086, 0.076)) - 1.0;
  float neck = capsule(hp, vec3(0.0, 1.48, 0.02), vec3(0.0, 1.58, 0.03), 0.03, 0.026);
  d = smin(d, smin(head, neck, 0.028), 0.03);

  float ao = 0.22 + uArmOut * 0.55;
  vec3 shR = vec3(0.135, 1.38, 0.01);
  vec3 shL = vec3(-0.135, 1.38, 0.01);
  vec3 ar = p - shR;
  ar.xy = rot(ar.xy, -ao);
  d = smin(d, capsule(ar, vec3(0.0), vec3(0.02, -0.28, 0.03), 0.036, 0.028), 0.045);
  d = smin(d, capsule(ar, vec3(0.02, -0.26, 0.03), vec3(0.03, -0.54, 0.04), 0.028, 0.02), 0.028);
  vec3 al = p - shL;
  al.xy = rot(al.xy, ao);
  d = smin(d, capsule(al, vec3(0.0), vec3(-0.015, -0.28, 0.025), 0.036, 0.028), 0.045);
  d = smin(d, capsule(al, vec3(-0.015, -0.26, 0.025), vec3(-0.02, -0.54, 0.035), 0.028, 0.02), 0.028);

  d = smin(d, capsule(p, vec3(0.066, 0.95, 0.01), vec3(0.062, 0.50, 0.04), 0.052, 0.036), 0.03);
  d = smin(d, capsule(p, vec3(0.062, 0.52, 0.04), vec3(0.05, 0.04, 0.0), 0.036, 0.016), 0.022);
  d = smin(d, capsule(p, vec3(-0.066, 0.95, 0.02), vec3(-0.062, 0.50, 0.06), 0.052, 0.036), 0.03);
  d = smin(d, capsule(p, vec3(-0.062, 0.52, 0.06), vec3(-0.05, 0.04, 0.02), 0.036, 0.016), 0.022);
  return d;
}

vec3 figNormal(vec3 p) {
  float e = 0.005;
  vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * mapFig(p + k.xyy * e) +
    k.yyx * mapFig(p + k.yyx * e) +
    k.yxy * mapFig(p + k.yxy * e) +
    k.xxx * mapFig(p + k.xxx * e)
  );
}

float marchFig(vec3 ro, vec3 rd, float tmax, int steps) {
  float t = 0.02;
  for (int i = 0; i < 56; i++) {
    if (i >= steps || t > tmax) break;
    float d = mapFig(ro + rd * t);
    if (d < 0.0015 * t) return t;
    t += d;
  }
  return -1.0;
}

float vein(vec3 p) {
  float sternum = exp(-pow(p.x * 34.0, 2.0)) * exp(-pow((p.z - 0.04) * 22.0, 2.0));
  sternum *= sat((p.y - 0.95) * 3.0) * sat((1.50 - p.y) * 4.0);
  float ribs = exp(-pow(abs(abs(p.x) - 0.045) * 40.0, 2.0)) * exp(-pow((p.z - 0.05) * 24.0, 2.0));
  ribs *= sat((p.y - 1.16) * 8.0) * sat((1.40 - p.y) * 8.0);
  float armL = exp(-pow((p.y - (1.12 + p.x * 0.4)) * 22.0, 2.0)) * sat(-p.x - 0.12);
  float armR = exp(-pow((p.y - (1.12 - p.x * 0.4)) * 22.0, 2.0)) * sat(p.x - 0.12);
  float arms = (armL + armR) * exp(-pow(p.z * 18.0, 2.0)) * sat((1.42 - p.y) * 3.0) * sat((p.y - 0.86) * 4.0);
  return sat(sternum * 1.4 + ribs * 1.0 + arms * 0.8);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 fw = normalize(uTarget - uEye);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec2 puv = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;
  vec3 rd = normalize(puv.x * rt + puv.y * up + uFov * fw);
  vec3 ro = uEye;

  vec3 backDir = normalize(vec3(-0.18, 0.46, -1.0));
  float sun = pow(max(dot(rd, backDir), 0.0), 48.0);
  float sunMid = pow(max(dot(rd, backDir), 0.0), 8.0);
  float sunSoft = pow(max(dot(rd, backDir), 0.0), 2.0);
  float sunWash = pow(max(dot(rd, backDir), 0.0), 1.15);
  vec3 sky = uFogCol;
  sky += uRimCol * sunWash * 0.32 * uShaft;
  sky += uRimCol * sunSoft * 0.7 * uShaft;
  sky += uHorizon * sunMid * 0.7 * uShaft;
  sky += uRimCol * sun * 1.35 * uShaft;
  float horizon = exp(-pow((rd.y + 0.02) * 5.5, 2.0));
  sky += uHorizon * horizon * 0.32;
  float groundFog = exp(-sat(rd.y + 0.05) * 7.0) * 0.28 * uHaze;
  sky += mix(uHorizon, uRimCol, 0.35) * groundFog;
  vec3 shaftOrg = vec3(-0.04, 1.28, -0.35);
  vec3 oc = ro - shaftOrg;
  vec3 nrm = cross(rd, backDir);
  float n2 = dot(nrm, nrm);
  float beamDist = n2 > 1e-6 ? abs(dot(oc, nrm)) / sqrt(n2) : length(cross(oc, backDir));
  float beam = exp(-beamDist * beamDist * 1.7) * uShaft;
  sky += uRimCol * beam * 1.05;
  sky += uHorizon * beam * 0.4;
  sky *= uDim;

  int steps = uQuality > 0.5 ? 28 : 18;
  float tFloor = (0.0 - ro.y) / rd.y;
  float tFig = marchFig(ro, rd, 10.0, steps);

  vec3 col = sky;
  float mask = 0.0;

  if (rd.y < -0.002 && tFloor > 0.0 && tFloor < 14.0 && (tFig < 0.0 || tFloor < tFig)) {
    vec3 fp = ro + rd * tFloor;
    float r = length(fp.xz);
    float fade = sat(1.0 - r / 8.0);
    float fogF = 1.0 - exp(-uFog * tFloor * 0.9);
    vec3 reflDir = reflect(rd, vec3(0.0, 1.0, 0.0));
    vec3 fcol = mix(uFogCol, uHorizon, 0.55) * (0.45 + 0.3 * fade);
    float spec = pow(max(dot(reflDir, backDir), 0.0), 10.0) * 0.85 * fade;
    fcol += uRimCol * spec * uShaft;
    float blob = exp(-length(fp.xz / vec2(0.26, 0.6)) * 2.2);
    fcol = mix(fcol, uFogCol * 0.12 + uRimCol * 0.12, blob * 0.75 * fade);
    float contact = exp(-pow(r / 0.3, 2.0));
    fcol *= 1.0 - contact * 0.5;
    float ring = smoothstep(0.22, 0.0, abs(r - uShockR)) * uShock * fade;
    float halo = smoothstep(0.85, 0.0, abs(r - uShockR)) * uShock * 0.55 * fade;
    fcol += uCoreCol * (ring * 1.25 + halo * 0.6);
    float mist = sat(0.82 * fade * (1.0 - fogF * 0.3));
    col = mix(col, fcol, mist);
  }

  float tRing = abs(rd.y) > 0.002 ? (0.05 - ro.y) / rd.y : -1.0;
  if (uShock > 0.01 && tRing > 0.0 && tRing < 12.0 && (tFig < 0.0 || tRing < tFig)) {
    vec3 rp = ro + rd * tRing;
    float rdR = abs(length(rp.xz) - uShockR);
    float ringA = smoothstep(0.28, 0.0, rdR) * uShock * sat(1.0 - tRing / 9.0);
    col += uCoreCol * ringA * 0.95;
  }

  if (tFig > 0.0) {
    vec3 hp = ro + rd * tFig;
    vec3 n = figNormal(hp);
    vec3 V = normalize(ro - hp);
    float ndv = sat(dot(n, V));
    float fres = pow(1.0 - ndv, 2.4);
    float back = pow(sat(dot(n, backDir)), 1.05);
    vec3 base = vec3(0.012, 0.013, 0.016);
    float gloss = pow(sat(dot(reflect(-backDir, n), V)), 36.0);
    vec3 albedo = base * (0.65 + back * 0.4);
    albedo += uRimCol * 0.07;
    albedo += uRimCol * fres * uRim * (1.35 + back * 0.7);
    albedo += uRimCol * gloss * 0.4;
    float core = exp(-length((hp - vec3(0.0, 1.27, 0.05)) / vec3(0.026, 0.036, 0.02)));
    float lines = vein(hp);
    albedo += uCoreCol * (core * 1.45 + lines * 1.05) * uPulse;
    float fogF = 1.0 - exp(-uFog * tFig);
    float hazeF = uHaze * exp(-max(hp.y, 0.0) * 3.4);
    col = mix(albedo * uDim, mix(uFogCol, uHorizon, 0.2), sat(fogF + hazeF * 0.85));
    mask = 1.0;
  }

  gl_FragColor = vec4(tone(col), mask);
}
`,a=`
precision highp float;
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,o=`
precision highp float;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uAmount;
varying vec2 vUv;

void main() {
  vec2 dir = (uLight - vUv) / 12.0;
  vec2 uv = vUv;
  vec3 acc = vec3(0.0);
  float w = 1.0;
  float sum = 0.0;
  for (int i = 0; i < 12; i++) {
    uv += dir;
    vec4 s = texture2D(uScene, clamp(uv, 0.0, 1.0));
    float em = max(s.r, max(s.g, s.b)) * (1.0 - s.a);
    acc += s.rgb * em * w;
    sum += w;
    w *= 0.86;
  }
  vec3 col = acc / max(sum, 0.001) * uAmount;
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  gl_FragColor = vec4(col, 1.0);
}
`,s=`
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uRays;
uniform vec2 uRes;
uniform float uTime;
uniform float uRaysOn;
uniform float uGrain;
varying vec2 vUv;

float vigAmt(vec2 uv) {
  float d = length((uv - vec2(0.5, 0.44)) * vec2(1.15, 1.0));
  return clamp(1.0 - smoothstep(0.42, 1.12, d) * 0.72, 0.15, 1.0);
}

void main() {
  vec4 s = texture2D(uScene, vUv);
  vec3 col = s.rgb;
  if (uRaysOn > 0.5) col += texture2D(uRays, vUv).rgb;
  col *= vigAmt(vUv);
  float g = fract(sin(dot(gl_FragCoord.xy + vec2(uTime * 13.7, uTime * 7.1), vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * uGrain;
  float peak = max(col.r, max(col.g, col.b));
  if (peak > 0.78) col *= 0.78 / peak;
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}
`,c=`
precision highp float;
attribute vec4 aSeed;
uniform mat4 uViewProj;
uniform float uTime;
uniform float uGather;
uniform float uDim;
uniform float uShock;
uniform float uDissolve;
varying float vLife;
varying float vSize;
varying float vHue;

void main() {
  float id = aSeed.x;
  float phase = aSeed.y;
  float radius = aSeed.z;
  float life = aSeed.w;
  float t = uTime * (0.08 + fract(id * 1.7) * 0.12) + phase;
  float ang = id * 6.28318 + t * 0.35;
  float y = 0.15 + fract(id * 3.1 + t * 0.07) * 2.4;
  float r = mix(2.6, 0.55, uGather) * radius * (0.7 + 0.3 * sin(t + id));
  // dissolving wings throw extra sparks near the back
  r = mix(r, 0.2 + radius * 1.4, uDissolve * step(0.5, fract(id * 5.3)));
  vec3 p = vec3(cos(ang) * r, y, sin(ang) * r - 0.2);
  p.y += uShock * 0.12 * sin(id * 8.0);
  vec4 clip = uViewProj * vec4(p, 1.0);
  gl_Position = clip;
  float size = mix(5.0, 16.0, fract(id * 9.2));
  size *= (0.65 + life * 0.7) * (0.9 + uDim * 0.25);
  gl_PointSize = max(size / max(clip.w, 0.5), 2.5);
  vLife = life * uDim;
  vSize = size;
  vHue = fract(id * 2.17);
}

`,l=`
precision highp float;
uniform vec3 uA;
uniform vec3 uB;
uniform float uAlpha;
varying float vLife;
varying float vSize;
varying float vHue;

void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r = length(q);
  if (r > 1.0) discard;
  float core = exp(-r * r * 7.5);
  float ring = exp(-pow((r - 0.58) / 0.22, 2.0));
  vec3 col = mix(uA, uB, vHue);
  float a = (core * 0.85 + ring * 0.28) * vLife * uAlpha;
  gl_FragColor = vec4(col * (0.7 + core * 0.6), a);
}
`,u=`
precision highp float;
attribute vec3 aPos;
attribute vec3 aAttr;
uniform mat4 uViewProj;
uniform float uWing;
uniform float uDissolve;
uniform float uTime;
varying float vSpan;
varying float vEdge;
varying float vSide;

void main() {
  float side = aAttr.x;
  float span = aAttr.y;
  float edge = aAttr.z;
  float open = smoothstep(0.0, 0.55, uWing);
  float fold = mix(0.12, 1.0, open);
  float yaw = side * mix(0.25, 1.05, open);
  float lift = mix(-0.15, 0.35, open) + span * 0.2 * open;
  float flap = sin(uTime * 1.6 + span * 3.0) * 0.04 * open;
  // dissolve eats from the tips
  float gone = smoothstep(0.0, 1.0, uDissolve + span * 0.85);
  float live = 1.0 - gone;
  float c = cos(yaw + flap);
  float s = sin(yaw + flap);
  vec3 p = aPos;
  p.x *= fold * live;
  p.z *= live;
  vec3 q = vec3(c * p.x - s * p.z, p.y + lift * span, s * p.x + c * p.z);
  q += vec3(side * 0.04, 1.34, -0.08);
  gl_Position = uViewProj * vec4(q, 1.0);
  vSpan = span;
  vEdge = edge;
  vSide = side;
}
`,d=`
precision highp float;
uniform vec3 uCol;
uniform vec3 uHot;
uniform float uWing;
uniform float uDissolve;
uniform float uDim;
uniform sampler2D uMask;
uniform vec2 uRes;
varying float vSpan;
varying float vEdge;
varying float vSide;

void main() {
  if (uWing < 0.02) discard;
  vec2 uv = gl_FragCoord.xy / uRes;
  if (texture2D(uMask, uv).a > 0.45) discard;
  float gone = smoothstep(0.0, 1.0, uDissolve + vSpan * 0.85);
  if (gone > 0.95) discard;
  float shaft = exp(-pow(vEdge * 2.6, 2.0));
  float vane = exp(-pow(vEdge * 0.9, 2.0)) * (1.0 - vSpan * 0.18);
  float glow = exp(-pow(vEdge * 0.45, 2.0)) * 0.35;
  float tip = smoothstep(1.0, 0.45, vSpan);
  float a = (shaft * 1.15 + vane * 0.7 + glow) * uWing * (1.0 - gone) * tip * uDim;
  vec3 col = mix(uCol, uHot, shaft * 0.4);
  gl_FragColor = vec4(col, a);
}
`;function f(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.warn(`[presence] shader`,e.getShaderInfoLog(r)),e.deleteShader(r),null)):null}function p(e,t,n){let r=f(e,e.VERTEX_SHADER,t),i=f(e,e.FRAGMENT_SHADER,n);if(!r||!i)return null;let a=e.createProgram();return a?(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),e.getProgramParameter(a,e.LINK_STATUS)?a:(console.warn(`[presence] link`,e.getProgramInfoLog(a)),e.deleteProgram(a),null)):null}function m(e,t,n){let r={};for(let i of n)r[i]=e.getUniformLocation(t,i);return r}function h(e,t){let n=new Float32Array(16);for(let r=0;r<4;r++)for(let i=0;i<4;i++)n[r*4+i]=e[i]*t[r*4]+e[4+i]*t[r*4+1]+e[8+i]*t[r*4+2]+e[12+i]*t[r*4+3];return n}function g(e,t,n,r){let i=1/Math.tan(e/2),a=new Float32Array(16);return a[0]=i/t,a[5]=i,a[10]=(r+n)/(n-r),a[11]=-1,a[14]=2*r*n/(n-r),a}function _(e,t,n){let r=e[0]-t[0],i=e[1]-t[1],a=e[2]-t[2],o=Math.hypot(r,i,a)||1,s=r/o,c=i/o,l=a/o,u=n[1]*l-n[2]*c,d=n[2]*s-n[0]*l,f=n[0]*c-n[1]*s,p=Math.hypot(u,d,f)||1;u/=p,d/=p,f/=p;let m=c*f-l*d,h=l*u-s*f,g=s*d-c*u,_=new Float32Array(16);return _[0]=u,_[1]=m,_[2]=s,_[4]=d,_[5]=h,_[6]=c,_[8]=f,_[9]=g,_[10]=l,_[12]=-(u*e[0]+d*e[1]+f*e[2]),_[13]=-(m*e[0]+h*e[1]+g*e[2]),_[14]=-(s*e[0]+c*e[1]+l*e[2]),_[15]=1,_}function v(e){let t=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),t}function y(e,t,n){let r=e.createTexture(),i=e.createFramebuffer();if(!r||!i)return null;e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0);let a=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,null),a?{fbo:i,tex:r}:(e.deleteTexture(r),e.deleteFramebuffer(i),null)}function b(e,t,n,r){if(t.pw===n&&t.ph===r&&t.fbo&&t.fbo2)return;t.tex&&e.deleteTexture(t.tex),t.fbo&&e.deleteFramebuffer(t.fbo),t.tex2&&e.deleteTexture(t.tex2),t.fbo2&&e.deleteFramebuffer(t.fbo2);let i=y(e,n,r),a=y(e,n,r);t.fbo=i?.fbo??null,t.tex=i?.tex??null,t.fbo2=a?.fbo??null,t.tex2=a?.tex??null,t.pw=n,t.ph=r}function x(e){let t=[],n=[],r=0;for(let e of[-1,1]){for(let i=0;i<11;i++){let a=(i+.5)/11,o=(a-.04)*1.45,s=1.65+Math.sin(a*Math.PI)*.75,c=(a-.22)*.7,l=.22+a*.28;for(let n=0;n<=5;n++){let r=n/5,i=e*(.06+o*r*.85+r*r*.15),u=c*r+Math.sin(r*Math.PI)*.08,d=-.04-r*s-r*r*l,f=(.045+(1-r)*.03)*(.55+Math.sin(a*Math.PI)*.5);for(let n of[-1,1])t.push(i,u+n*f*.15,d+n*f*.02,e,r,n)}for(let e=0;e<5;e++){let t=r+e*2;n.push(t,t+1,t+2,t+1,t+3,t+2)}r+=12}for(let i=0;i<3;i++){let a=i/3,o=(i+1)/3;for(let n of[0,.55,1])for(let[r,i]of[[a,-1],[o,1]]){let a=(r-.04)*1.45,o=1.55+Math.sin(r*Math.PI)*.65,s=(r-.22)*.7,c=.2+r*.25,l=e*(.04+a*n*.85+n*n*.12),u=s*n+Math.sin(n*Math.PI)*.08,d=-.02-n*o-n*n*c;t.push(l,u,d,e,n,i*1.8)}let s=r;n.push(s,s+1,s+2,s+1,s+3,s+2,s+2,s+3,s+4,s+3,s+5,s+4),r+=6}}let i=e.createBuffer(),a=e.createBuffer();return!i||!a?null:(e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,new Float32Array(t),e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,a),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(n),e.STATIC_DRAW),{vbo:i,ibo:a,count:n.length,stride:6})}function S(e,t,n,r){if(r.quality===`low`||r.quality===`high`)return r.quality;let i=Math.max(t,n);return Math.max(e.canvas.width,e.canvas.height)+1<i*.7?`low`:`high`}function C(e,t){if(t)return t;let n=p(e,r,i),f=p(e,a,o),m=p(e,a,s),h=p(e,c,l),g=p(e,u,d);if(!n||!f||!m||!h||!g)return null;let _=x(e),y=e.createBuffer(),b=v(e);return!_||!y||!b?null:w(e,n,f,m,h,g,_,y,b)}function w(e,t,n,r,i,a,o,s,c){return T.set(s,c),{scene:t,godray:n,composite:r,particle:i,wingProg:a,sceneU:m(e,t,[`uRes`,`uEye`,`uTarget`,`uFov`,`uTime`,`uBreath`,`uPulse`,`uHeadTilt`,`uArmOut`,`uRim`,`uShaft`,`uFog`,`uHaze`,`uShock`,`uShockR`,`uQuality`,`uDim`,`uRimCol`,`uCoreCol`,`uFogCol`,`uHorizon`]),godU:m(e,n,[`uScene`,`uRes`,`uLight`,`uAmount`]),compU:m(e,r,[`uScene`,`uRays`,`uRes`,`uTime`,`uRaysOn`,`uGrain`]),partU:m(e,i,[`uViewProj`,`uTime`,`uGather`,`uDim`,`uShock`,`uDissolve`,`uA`,`uB`,`uAlpha`]),wingU:m(e,a,[`uViewProj`,`uWing`,`uDissolve`,`uTime`,`uCol`,`uHot`,`uDim`,`uMask`,`uRes`]),wings:o,particleBuf:s,particleCount:0,fbo:null,tex:null,fbo2:null,tex2:null,quality:`high`,pw:0,ph:0,tension:0,armed:!0,wing:0,wingHold:0,dissolve:0,shock:0,shockR:.3,drift:0,pose:0}}var T=new WeakMap;function E(e){let t=parseInt(e.replace(`#`,``),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function D(e,t,n,r,i,a,o,s,c,l,u){let d=S(e,a,o,l),f=!!l.reduceFlashing,p=s.drive<.22&&s.rms<.18,m=Math.min(1,s.drive*.7+s.rms*.45),v=s.kick,y=s.drop;i.tension=p?Math.max(0,i.tension-u*.7):Math.max(0,Math.min(1,i.tension+(m-.28)*u*.4)),y>.62&&i.armed&&(i.wing=1,i.wingHold=f?1.15:2.15,i.dissolve=0,i.shock=1,i.shockR=.28,i.armed=!1,i.pose=1),y<.14&&(i.armed=!0),i.wingHold>0?i.wingHold=Math.max(0,i.wingHold-u):i.wing>0&&(i.dissolve=Math.min(1,i.dissolve+u/1.55),i.wing=Math.max(0,1-i.dissolve)),i.shock=Math.max(0,i.shock-u*(f?1.6:1.15)),i.shock>0&&(i.shockR+=u*(1.7+m)),i.drift+=u*(.08+i.tension*.04);let x=+(i.wing>.15||i.dissolve>0&&i.dissolve<.85);i.pose+=(x-i.pose)*Math.min(1,1-Math.exp(-u*4.2));let C=globalThis.__mvPresenceForce;C&&(C.wing!=null&&(i.wing=C.wing),C.dissolve!=null&&(i.dissolve=C.dissolve),C.shock!=null&&(i.shock=C.shock),C.shockR!=null&&(i.shockR=C.shockR),C.pose!=null&&(i.pose=C.pose),C.tension!=null&&(i.tension=C.tension));let w=Math.min(1,(d===`low`?320:Math.min(a,o)<500?420:520)/Math.max(a,o)),D=Math.max(2,Math.round(a*w)),O=Math.max(2,Math.round(o*w));b(t,i,D,O),(n.width!==D||n.height!==O)&&(n.width=D,n.height=O),i.quality=d;let k=i.tension,A=Math.min(1,(p?.42:1)*(.78+k*.28+i.wing*.12+v*.06)),j=p?.32:.16-k*.04,M=p?.95:.55-k*.16+i.shock*.08,N=(.7+k*.45+i.wing*.3)*(f&&i.wing>.2?.75:1),ee=(.85+k*.25+i.wing*.35)*(f?.8:1),te=.35+s.bass*.8,P=.45+s.bass*.9+v*.35+i.wing*.2,ne=i.pose*.28,re=.12+i.pose*.55+k*.08,ie=.34+Math.sin(i.drift*.55)*.18,F=.2+Math.sin(i.drift*.31)*.03,ae=2.62-i.wing*.14-k*.06+Math.sin(i.drift*.2)*.05,oe=[0,.92,0],I=[Math.sin(ie)*ae*Math.cos(F),1.18+Math.sin(F)*ae*.85,Math.cos(ie)*ae*Math.cos(F)],se=1.68,L=D/Math.max(O,1),R=_(I,oe,[0,1,0]),ce=h(g(Math.atan(1/se)*2,L,.12,22),R),z=E(c.a),B=E(c.b),V=E(c.c),le=(e,t)=>{let n=(e[0]+e[1]+e[2])/3;return[Math.min(1,Math.max(0,n+(e[0]-n)*t)),Math.min(1,Math.max(0,n+(e[1]-n)*t)),Math.min(1,Math.max(0,n+(e[2]-n)*t))]},H=le([Math.min(1,z[0]*.5+B[0]*.5),Math.min(1,z[1]*.5+B[1]*.5),Math.min(1,z[2]*.5+B[2]*.5)],1.35),U=le([Math.min(1,B[0]*.75+z[0]*.2+V[0]*.15),Math.min(1,B[1]*.75+z[1]*.2+V[1]*.15),Math.min(1,B[2]*.75+z[2]*.2+V[2]*.15)],1.25),ue=[.015+z[0]*.03,.016+z[1]*.03,.02+z[2]*.035],W=[Math.min(1,z[0]*.35+V[0]*.15),Math.min(1,z[1]*.35+V[1]*.15),Math.min(1,z[2]*.35+V[2]*.15)],G=i.shock*(f?.35:.7);G>0&&(H[0]=Math.min(1,H[0]+G*.25),H[1]=Math.min(1,H[1]+G*.12),H[2]=Math.min(1,H[2]+G*.2),U[0]=Math.min(1,U[0]+G*.3),U[1]=Math.min(1,U[1]+G*.15),U[2]=Math.min(1,U[2]+G*.22));let K=r||T.get(i.particleBuf);if(!K||!i.fbo||!i.tex){e.fillStyle=`#050506`,e.fillRect(0,0,a,o);return}t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.viewport(0,0,D,O),i.fbo&&t.bindFramebuffer(t.FRAMEBUFFER,i.fbo),t.clearColor(.02,.02,.025,0),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(i.scene);let q=i.sceneU;if(t.uniform2f(q.uRes,D,O),t.uniform3f(q.uEye,I[0],I[1],I[2]),t.uniform3f(q.uTarget,oe[0],oe[1],oe[2]),t.uniform1f(q.uFov,se),t.uniform1f(q.uTime,s.time),t.uniform1f(q.uBreath,te),t.uniform1f(q.uPulse,P),t.uniform1f(q.uHeadTilt,ne),t.uniform1f(q.uArmOut,re),t.uniform1f(q.uRim,N),t.uniform1f(q.uShaft,ee),t.uniform1f(q.uFog,j),t.uniform1f(q.uHaze,M),t.uniform1f(q.uShock,i.shock),t.uniform1f(q.uShockR,i.shockR),t.uniform1f(q.uQuality,d===`low`?0:1),t.uniform1f(q.uDim,A),t.uniform3f(q.uRimCol,H[0],H[1],H[2]),t.uniform3f(q.uCoreCol,U[0],U[1],U[2]),t.uniform3f(q.uFogCol,ue[0],ue[1],ue[2]),t.uniform3f(q.uHorizon,W[0],W[1],W[2]),K){t.bindBuffer(t.ARRAY_BUFFER,K);let e=t.getAttribLocation(i.scene,`aPos`);t.enableVertexAttribArray(e),t.vertexAttribPointer(e,2,t.FLOAT,!1,0,0),t.drawArrays(t.TRIANGLES,0,3),t.disableVertexAttribArray(e)}t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,D,O),t.disable(t.BLEND),t.useProgram(i.composite);let J=i.compU;if(t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,i.tex),t.uniform1i(J.uScene,0),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,i.tex2??i.tex),t.uniform1i(J.uRays,1),t.uniform2f(J.uRes,D,O),t.uniform1f(J.uTime,s.time),t.uniform1f(J.uRaysOn,0),t.uniform1f(J.uGrain,d===`low`?.018:.03),K){t.bindBuffer(t.ARRAY_BUFFER,K);let e=t.getAttribLocation(i.composite,`aPos`);t.enableVertexAttribArray(e),t.vertexAttribPointer(e,2,t.FLOAT,!1,0,0),t.drawArrays(t.TRIANGLES,0,3),t.disableVertexAttribArray(e)}if(i.wing>.02){t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE),t.useProgram(i.wingProg);let e=i.wingU;t.uniformMatrix4fv(e.uViewProj,!1,ce),t.uniform1f(e.uWing,i.wing),t.uniform1f(e.uDissolve,i.dissolve),t.uniform1f(e.uTime,s.time),t.uniform3f(e.uCol,H[0],H[1],H[2]),t.uniform3f(e.uHot,U[0],U[1],U[2]),t.uniform1f(e.uDim,A),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,i.tex),t.uniform1i(e.uMask,0),t.uniform2f(e.uRes,D,O),t.bindBuffer(t.ARRAY_BUFFER,i.wings.vbo),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,i.wings.ibo);let n=t.getAttribLocation(i.wingProg,`aPos`),r=t.getAttribLocation(i.wingProg,`aAttr`);t.enableVertexAttribArray(n),t.enableVertexAttribArray(r),t.vertexAttribPointer(n,3,t.FLOAT,!1,24,0),t.vertexAttribPointer(r,3,t.FLOAT,!1,24,12),t.drawElements(t.TRIANGLES,i.wings.count,t.UNSIGNED_SHORT,0),t.disableVertexAttribArray(n),t.disableVertexAttribArray(r)}let Y=d===`low`?22:64,X=.22+k*.7;if(i.particleCount!==Y){let e=new Float32Array(Y*4);for(let t=0;t<Y;t++)e[t*4]=(t+1)*.618033,e[t*4+1]=t*17%100/100,e[t*4+2]=.4+t*13%10/16,e[t*4+3]=.3+t*11%10/14;t.bindBuffer(t.ARRAY_BUFFER,i.particleBuf),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW),i.particleCount=Y}t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE),t.useProgram(i.particle);let Z=i.partU;t.uniformMatrix4fv(Z.uViewProj,!1,ce),t.uniform1f(Z.uTime,s.time),t.uniform1f(Z.uGather,X),t.uniform1f(Z.uDim,A),t.uniform1f(Z.uShock,i.shock),t.uniform1f(Z.uDissolve,i.dissolve),t.uniform3f(Z.uA,H[0],H[1],H[2]),t.uniform3f(Z.uB,U[0],U[1],U[2]),t.uniform1f(Z.uAlpha,p?.35:.55+i.dissolve*.35+k*.15),t.bindBuffer(t.ARRAY_BUFFER,i.particleBuf);let Q=t.getAttribLocation(i.particle,`aSeed`);t.enableVertexAttribArray(Q),t.vertexAttribPointer(Q,4,t.FLOAT,!1,0,0),t.drawArrays(t.POINTS,0,i.particleCount),t.disableVertexAttribArray(Q),t.disable(t.BLEND);let $=globalThis;$.__mvPresenceBudget={quality:d,particles:i.particleCount,pw:D,ph:O},e.setTransform(1,0,0,1,0,0),e.drawImage(n,0,0,a,o)}var O=64;function k(){let e=[];for(let t=0;t<10;t++)e.push(t/10);return{trail:[],laserT:0,rings:e,bursts:[],burstArmed:!0,lastT:0,gpu:null,gpuChecked:!1,tunnel:null}}function A(e=0){return{time:e,rms:.05,bass:.05,mid:.05,treble:.04,beat:0,drop:0,kick:0,drive:1,bars:new Float32Array(48),wave:new Float32Array(96)}}function j(e,t){let r=n[e];return t>.5?{a:r.c,b:r.a,c:r.b,rgb:[r.rgb[2],r.rgb[0],r.rgb[1]]}:r}function M(e,t){return t%3==0?e.a:t%3==1?e.b:e.c}function N(e){return Math.max(.35,e.drive||1)}function ee(e,t,n,r,i,a,o={theme:`neon`,reduceFlashing:!0,dropFx:!0}){let s=a.lastT?Math.min(.05,Math.max(.001,r.time-a.lastT)):.016;a.lastT=r.time;let c=o.dropFx!==!1,l=j(o.theme,c?r.drop:0);e.clearRect(0,0,t,n),e.fillStyle=`#050506`,e.fillRect(0,0,t,n),i===`pulse`?te(e,t,n,r,a,l):i===`fractal`?K(e,t,n,r,a,l,o,s):i===`liquid`?q(e,t,n,r,a,l,o,s):i===`jelly`?me(e,t,n,r,a,l,o,s):i===`tunnel`?P(e,t,n,r,a,l,o,s):i===`presence`?he(e,t,n,r,a,l,o,s):i===`lasers`?ge(e,t,n,r,a,l,o,s):_e(e,t,n,r,l),c&&ve(e,t,n,r,a,l,o.reduceFlashing),e.globalAlpha=1}function te(e,t,n,r,i,a){let o=t*.5,s=n*.46,c=N(r),l=Math.min(t,n)*(.07+r.bass*.2*c+r.beat*.09*c),u=e.createRadialGradient(o,s,l*.2,o,s,l*3.2),d=a.rgb[0],f=a.rgb[1];u.addColorStop(0,`rgba(${d[0]}, ${d[1]}, ${d[2]}, ${.35+r.rms*.4})`),u.addColorStop(.45,`rgba(${f[0]}, ${f[1]}, ${f[2]}, ${.12+r.mid*.2})`),u.addColorStop(1,`rgba(5, 5, 6, 0)`),e.fillStyle=u,e.fillRect(0,0,t,n),e.beginPath(),e.fillStyle=`#f4f4f5`,e.globalAlpha=.85,e.arc(o,s,l*.45,0,Math.PI*2),e.fill(),e.globalAlpha=1;let p=r.bars.length,m=Math.max(2,t*.72/p-3),h=(t-p*(m+3))/2,g=n*.86;for(let t=0;t<p;t++){let i=r.bars[t]??0,o=Math.max(3,i*n*(.18+.22*c));e.fillStyle=M(a,t),e.globalAlpha=.45+i*.55,e.fillRect(h+t*(m+3),g-o,m,o)}e.globalAlpha=1;let _=r.wave[Math.floor(r.time*30)%r.wave.length]??0;i.trail.push({x:o+Math.sin(r.time*.7)*t*.22+_*t*.08,y:s+Math.cos(r.time*.55)*n*.12+(r.wave[8]??0)*n*.18}),i.trail.length>O&&i.trail.shift(),e.lineWidth=2,e.lineCap=`round`,e.lineJoin=`round`;for(let t=1;t<i.trail.length;t++){let n=i.trail[t-1],r=i.trail[t],o=t/i.trail.length;e.strokeStyle=M(a,Math.floor(o*3)),e.globalAlpha=o*.85,e.beginPath(),e.moveTo(n.x,n.y),e.lineTo(r.x,r.y),e.stroke()}e.globalAlpha=1}function P(e,t,n,r,i,a,o,s){let c=o.reduceFlashing!==!1,l=1-F(.1,.45,r.rms*.65+r.bass*.8+r.kick*.35),u=F(.15,.75,r.bass*.65+r.kick*.7+r.rms*.25),d=s/.0167,f=ae(e,t,n,o),p=oe(f,t,n),m=se(i,t,n,f);m.breath+=s*.7,r.drop>.62&&m.armed&&(m.lurch=1,m.armed=!1),r.drop<.14&&(m.armed=!0),m.lurch=Math.max(0,m.lurch-s/1.55);let h=Math.min(1,r.kick*.75+r.bass*.35+m.lurch*.4),g=1-Math.exp(-s*(c?7:18));m.glow+=(h-m.glow)*g;let _=m.lurch*m.lurch,v=(.016+u*.01)*d*(1-l*.94),y=Math.sin(m.breath)*.014*d,b=_*.028*d,x=Math.min(1.045,Math.max(.984,1+v*(1-l)+y*l+b)),S=Math.sin(r.time*.17)*(.006+u*.016)*d*(.2+.8*(1-l));m.spin+=S;let C=m.front,w=m.back,T=w.getContext(`2d`);if(!T)return;let E=m.w,D=m.h,O=E*.5,k=D*.5,A=.4+.6*(1-l),j=c?.78:1,M=m.glow,N=Math.min(E,D),ee=0;for(let e of a.rgb)ee=Math.max(ee,Math.max(...e)-Math.min(...e));let te=ee<28;m.depths.length!==p.rings&&(m.depths=I(p.rings)),m.planes.length!==p.planes&&(m.planes=I(p.planes));let P=.05+u*.27;P*=1-l*.8,P+=_*1.15,P*=1+M*.24;let L=m.depths;for(let e=0;e<L.length;e++){let t=L[e]+P*s;t>=1&&--t,L[e]=t}let R=m.planes,ce=P*1.22;for(let e=0;e<R.length;e++){let t=R[e]+ce*s;t>=1&&--t,R[e]=t}let z=.45+.55*(1-l),B=O+(Math.sin(r.time*.23)*.16+Math.sin(r.time*.07+1.2)*.06)*E*z,V=k+(Math.cos(r.time*.19)*.11+Math.sin(r.time*.11)*.04)*D*z,le=O+(B-O)*.1,H=k+(V-k)*.1,U=1+Math.sin(m.breath)*.04*l,ue=1+_*(c?.1:.18),W=m.lurch>.45?2:+(m.lurch>.2),G=m.spin*.65;T.setTransform(1,0,0,1,0,0),T.globalAlpha=1,T.globalCompositeOperation=`source-over`,T.fillStyle=`#050506`,T.fillRect(0,0,E,D),T.save(),T.translate(B,V),T.rotate(S),T.scale(x,x),T.translate(-B,-V),T.globalAlpha=l>.55?.968:.988,T.drawImage(C,0,0),T.restore();let K=l>.55?.035:.014;T.globalAlpha=1,T.fillStyle=`rgba(5, 5, 6, ${K})`,T.fillRect(0,0,E,D);let q=(e,t)=>{let n=a.rgb[(e%3+3)%3],r=Math.max(0,t)**.8;if(te){let e=Math.round(26+r*128);return`rgb(${e}, ${e}, ${e})`}let i=.22+r*.78;return`rgb(${Math.round(n[0]*i+5)}, ${Math.round(n[1]*i+5)}, ${Math.round(n[2]*i+6)})`},J=(e,t,n)=>{let r=a.rgb[(e%3+3)%3],i=Math.max(0,t)**.8;if(te){let e=Math.round(26+i*128);return`rgba(${e}, ${e}, ${e}, ${n})`}let o=.22+i*.78;return`rgba(${Math.round(r[0]*o+5)}, ${Math.round(r[1]*o+5)}, ${Math.round(r[2]*o+6)}, ${n})`},Y=(e,t=1)=>{let n=e**1.42;return{x:B+(le-B)*n,y:V+(H-V)*n,radius:N*(.03+n*.86)*U*t*ue,depth:n}},X=[];for(let e=0;e<L.length;e++)X.push(e);X.sort((e,t)=>L[e]-L[t]),ne(T,B,V,N,a,te,{bass:r.bass,glow:M,rush:_,dim:A,punch:j,reduce:c,rot:G,shift:W}),T.lineCap=`round`,T.lineJoin=`round`;let Z=Math.min(.22,(.08+M*.04)*A*j),Q=p.walls;for(let e=0;e<Q;e++){T.beginPath();let t=!1;for(let n=0;n<X.length;n++){let r=L[X[n]];if(r<.12||r>.9)continue;let i=Y(r),a=e/Q*Math.PI*2+G+(1-r)*.75,o=i.x+Math.cos(a)*i.radius,s=i.y+Math.sin(a)*i.radius;t?T.lineTo(o,s):(T.moveTo(o,s),t=!0)}t&&(T.strokeStyle=q(e+W,.65),T.globalAlpha=Z,T.lineWidth=Math.max(1,N*.0018),T.stroke())}for(let e=0;e<X.length;e++){let t=L[X[e]];if(t<.12||t>.88)continue;let n=Y(t);if(n.radius<6)continue;let r=Math.min(te?.5:.58,(.04+n.depth*.5)*A*j*(.74+M*.3)),i=G+(1-t)*.75;T.beginPath();for(let e=0;e<=6;e++){let t=i+e/6*Math.PI*2,r=n.x+Math.cos(t)*n.radius,a=n.y+Math.sin(t)*n.radius;e===0?T.moveTo(r,a):T.lineTo(r,a)}T.strokeStyle=q(X[e]+W,t),T.globalAlpha=r,T.lineWidth=Math.max(1,.8+n.radius*.008),T.stroke()}let $=[];for(let e=0;e<R.length;e++)$.push(e);$.sort((e,t)=>R[e]-R[t]);for(let e=0;e<$.length;e++){let t=$[e],n=R[t];if(n<.42||n>.985)continue;let r=Y(n,1.12);if(r.radius<10)continue;let i=F(.42,.58,n),a=1-F(.9,.985,n),o=Math.min(.55,(.12+r.depth*.28)*A*j*i*a*(.8+M*.25));o<.03||(T.globalAlpha=o,T.strokeStyle=q(t+W+1,Math.min(1,n+.15)),T.lineWidth=Math.max(1.2,r.radius*.018),re(T,r.x,r.y,r.radius,G+(1-n)*.5+t*.4,t%3),T.globalAlpha=o*.18,T.fillStyle=J(t+W,n,1),ie(T,r.x,r.y,r.radius*.92,G+(1-n)*.5+t*.4,t%3))}T.globalAlpha=1,m.front=w,m.back=C,e.save(),e.globalAlpha=1,e.imageSmoothingEnabled=!0,e.drawImage(w,0,0,t,n),e.restore(),globalThis.__mvTunnelBudget={quality:f,rings:p.rings,walls:p.walls,planes:p.planes,pw:E,ph:D}}function ne(e,t,n,r,i,a,o){let s=1+o.bass*.28+o.glow*.12+o.rush*(o.reduce?.18:.32),c=r*(.055+o.bass*.02)*s,l=i.rgb[o.shift%3],u=a?48:l[0],d=a?48:l[1],f=a?52:l[2],p=Math.min(.55,(.16+o.bass*.18+o.rush*.28)*o.dim*o.punch),m=e.createRadialGradient(t,n,0,t,n,c*3.2);if(m.addColorStop(0,`rgba(${u}, ${d}, ${f}, ${p})`),m.addColorStop(.45,`rgba(${u}, ${d}, ${f}, ${p*.35})`),m.addColorStop(1,`rgba(5, 5, 6, 0)`),e.globalAlpha=1,e.fillStyle=m,e.beginPath(),e.moveTo(t+c*3.2,n),e.arc(t,n,c*3.2,0,Math.PI*2),e.fill(),o.rush>.08){let r=o.reduce?4:6,i=Math.min(.28,o.rush*(o.reduce?.18:.28)*o.punch);e.strokeStyle=`rgba(${u}, ${d}, ${f}, 1)`,e.globalAlpha=i,e.lineWidth=Math.max(1,c*.08);for(let i=0;i<r;i++){let a=o.rot*.35+i/r*Math.PI*2;e.beginPath(),e.moveTo(t+Math.cos(a)*c*.7,n+Math.sin(a)*c*.7),e.lineTo(t+Math.cos(a)*c*(2.4+o.rush),n+Math.sin(a)*c*(2.4+o.rush)),e.stroke()}e.globalAlpha=1}let h=c*2.15,g=c*.85;e.beginPath(),e.moveTo(t,n-h),e.lineTo(t+g,n-h*.45),e.lineTo(t+g,n+h*.45),e.lineTo(t,n+h),e.lineTo(t-g,n+h*.45),e.lineTo(t-g,n-h*.45),e.closePath();let _=a?22:8;e.fillStyle=`rgba(${_}, ${_}, ${_+2}, 0.92)`,e.fill();let v=Math.min(.55,(.18+o.bass*.25+o.rush*.2)*o.dim*o.punch),y=e.createLinearGradient(t,n-h,t,n+h),b=a?200:230,x=Math.min(b,u+10),S=Math.min(b,d+10),C=Math.min(b,f+10);y.addColorStop(0,`rgba(${x}, ${S}, ${C}, 0)`),y.addColorStop(.5,`rgba(${x}, ${S}, ${C}, ${v})`),y.addColorStop(1,`rgba(${x}, ${S}, ${C}, 0)`),e.fillStyle=y,e.fill(),e.strokeStyle=`rgba(${u}, ${d}, ${f}, ${.55+o.glow*.25})`,e.lineWidth=Math.max(1.2,c*.12),e.globalAlpha=Math.min(.85,.45+o.glow*.3)*o.dim*o.punch,e.stroke(),e.beginPath(),e.moveTo(t,n-h*.42),e.lineTo(t+g*.42,n),e.lineTo(t,n+h*.42),e.lineTo(t-g*.42,n),e.closePath(),e.strokeStyle=`rgba(${x}, ${S}, ${C}, 0.7)`,e.lineWidth=Math.max(1,c*.07),e.stroke(),e.globalAlpha=1}function re(e,t,n,r,i,a){let o=r*(a===1?.92:1.15),s=r*(a===1?.92:.72);if(e.beginPath(),a===1)for(let r=0;r<=6;r++){let a=i+r/6*Math.PI*2,c=t+Math.cos(a)*o,l=n+Math.sin(a)*s;r===0?e.moveTo(c,l):e.lineTo(c,l)}else if(a===2){let r=Math.cos(i),a=Math.sin(i),c=Math.min(o,s)*.22;[[-o+c,-s],[o-c,-s],[o,-s+c],[o,s-c],[o-c,s],[-o+c,s],[-o,s-c],[-o,-s+c]].forEach((i,o)=>{let s=t+i[0]*r-i[1]*a,c=n+i[0]*a+i[1]*r;o===0?e.moveTo(s,c):e.lineTo(s,c)}),e.closePath()}else{let r=Math.cos(i*.15),a=Math.sin(i*.15);[[-o,-s],[o,-s],[o,s],[-o,s]].forEach((i,o)=>{let s=t+i[0]*r-i[1]*a,c=n+i[0]*a+i[1]*r;o===0?e.moveTo(s,c):e.lineTo(s,c)}),e.closePath()}e.stroke()}function ie(e,t,n,r,i,a){re(e,t,n,r,i,a),e.fill()}function F(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function ae(e,t,n,r){if(r.quality===`low`||r.quality===`high`)return r.quality;let i=Math.max(t,n);return Math.max(e.canvas.width,e.canvas.height)+1<i*.7?`low`:`high`}function oe(e,t,n){return e===`low`?{cap:400,rings:10,walls:5,planes:3}:Math.min(t,n)<500?{cap:520,rings:14,walls:6,planes:4}:{cap:640,rings:18,walls:8,planes:6}}function I(e){let t=[];for(let n=0;n<e;n++)t.push((n+.5)/e);return t}function se(e,t,n,r){let i=Math.max(t,n),a=oe(r,t,n),o=a.cap,s=i>o?o/i:1,c=Math.max(2,Math.round(t*s)),l=Math.max(2,Math.round(n*s)),u=e.tunnel;if(!u||u.w!==c||u.h!==l||u.quality!==r){let t=document.createElement(`canvas`),n=document.createElement(`canvas`);t.width=c,t.height=l,n.width=c,n.height=l;for(let e of[t,n]){let t=e.getContext(`2d`);t&&(t.fillStyle=`#050506`,t.fillRect(0,0,c,l))}u={front:t,back:n,w:c,h:l,quality:r,spin:u?.spin??0,breath:u?.breath??0,lurch:u?.lurch??0,armed:u?.armed??!0,glow:u?.glow??0,depths:u?.depths?.length===a.rings?u.depths:I(a.rings),planes:u?.planes?.length===a.planes?u.planes:I(a.planes)},e.tunnel=u}return u}var L=`
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,R=`
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
`,ce=`
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
`,z=`${ce}
${R}
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
`,B=`${ce}
${R}
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
`;function V(e,t){let n=n=>e.getUniformLocation(t,n);return{uRes:n(`uRes`),uZoom:n(`uZoom`),uFlow:n(`uFlow`),uRipple:n(`uRipple`),uHue:n(`uHue`),uBass:n(`uBass`),uKick:n(`uKick`),uTreble:n(`uTreble`),uRms:n(`uRms`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`)}}function le(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)||`Shader failed`),e.deleteShader(r),null)):null}function H(e,t){let n=le(e,e.VERTEX_SHADER,L),r=le(e,e.FRAGMENT_SHADER,t);if(!n||!r)return null;let i=e.createProgram();return i?(e.attachShader(i,n),e.attachShader(i,r),e.bindAttribLocation(i,0,`aPos`),e.linkProgram(i),e.deleteShader(n),e.deleteShader(r),e.getProgramParameter(i,e.LINK_STATUS)?i:(e.deleteProgram(i),null)):null}function U(e){if(e.gpu)return e.gpu;if(e.gpuChecked)return null;e.gpuChecked=!0;let t=document.createElement(`canvas`),n=t.getContext(`webgl`,{alpha:!1,antialias:!0,depth:!0,stencil:!1,preserveDrawingBuffer:!0,premultipliedAlpha:!1});if(!n)return null;let r=H(n,z),i=H(n,B);if(!r||!i)return null;let a=n.createBuffer();if(!a)return null;n.bindBuffer(n.ARRAY_BUFFER,a),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let o={canvas:t,gl:n,fractal:r,liquid:i,fractalU:V(n,r),liquidU:V(n,i),jelly:null,presence:null,buffer:a,zoom:0,hue:0,flow:0,ripple:0,pw:0,ph:0};return e.gpu=o,o}function ue(e){return e===`fractal`||e===`liquid`||e===`jelly`||e===`presence`}function W(e,t){return!ue(t)||!e.gpuChecked?!1:e.gpu?t===`jelly`?!e.gpu.jelly:t===`presence`&&!e.gpu.presence:!0}function G(e,t,n,r,i,a,o,s,c){let l=U(i);if(!l)return;l.gl.disable(l.gl.DEPTH_TEST),l.gl.disable(l.gl.CULL_FACE),l.gl.disable(l.gl.BLEND);let u=o.reduceFlashing!==!1,d=Math.min(1.2,r.bass),f=Math.min(1.2,r.rms),p=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),m=Math.min(1,r.treble),h=Math.min(1,r.drop);l.zoom+=s*(.04+f*.36+d*.1+h*.16),l.hue+=s*((u?.03:.055)+f*.03),l.flow+=s*(.018+f*.14+d*.08+h*.1),l.ripple+=s*(.7+p*(u?5.5:13)+h*2.4);let g=Math.max(t,n),_=g>680?680/g:1,v=Math.max(2,Math.round(t*_)),y=Math.max(2,Math.round(n*_)),b=l.gl;(l.pw!==v||l.ph!==y)&&(l.canvas.width=v,l.canvas.height=y,l.pw=v,l.ph=y,b.bindBuffer(b.ARRAY_BUFFER,l.buffer),b.bufferData(b.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),b.STATIC_DRAW));let x=c===`fractal`?l.fractal:l.liquid,S=c===`fractal`?l.fractalU:l.liquidU;b.viewport(0,0,v,y),b.useProgram(x),b.bindBuffer(b.ARRAY_BUFFER,l.buffer),b.enableVertexAttribArray(0),b.vertexAttribPointer(0,2,b.FLOAT,!1,0,0);let C=e=>[e[0]/255,e[1]/255,e[2]/255];b.uniform2f(S.uRes,v,y),b.uniform1f(S.uZoom,l.zoom),b.uniform1f(S.uFlow,l.flow),b.uniform1f(S.uRipple,l.ripple),b.uniform1f(S.uHue,l.hue),b.uniform1f(S.uBass,d),b.uniform1f(S.uKick,p),b.uniform1f(S.uTreble,m),b.uniform1f(S.uRms,f),b.uniform1f(S.uDrop,h),b.uniform1f(S.uReduce,+!!u);let w=C(a.rgb[0]),T=C(a.rgb[1]),E=C(a.rgb[2]);b.uniform3f(S.uA,w[0],w[1],w[2]),b.uniform3f(S.uB,T[0],T[1],T[2]),b.uniform3f(S.uC,E[0],E[1],E[2]),b.drawArrays(b.TRIANGLES,0,3),e.imageSmoothingEnabled=!0,e.drawImage(l.canvas,0,0,t,n)}function K(e,t,n,r,i,a,o,s){G(e,t,n,r,i,a,o,s,`fractal`)}function q(e,t,n,r,i,a,o,s){G(e,t,n,r,i,a,o,s,`liquid`)}var J=`
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
`,Y=`
precision mediump float;
uniform sampler2D uPrev;
uniform vec2 uRes;
void main() {
  gl_FragColor = texture2D(uPrev, gl_FragCoord.xy / uRes);
}
`;function X(e,t){let n=n=>e.getUniformLocation(t,n);return{uPrev:n(`uPrev`),uRes:n(`uRes`),uTime:n(`uTime`),uBass:n(`uBass`),uMid:n(`uMid`),uTreble:n(`uTreble`),uRms:n(`uRms`),uKick:n(`uKick`),uDrop:n(`uDrop`),uReduce:n(`uReduce`),uTension:n(`uTension`),uSmear:n(`uSmear`),uSnap:n(`uSnap`),uHue:n(`uHue`),uA:n(`uA`),uB:n(`uB`),uC:n(`uC`),uWave:n(`uWave[0]`)}}function Z(e,t,n){let r=e.createTexture();return r?(e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),r):null}function Q(e,t){let n=e.createFramebuffer();if(!n)return null;e.bindFramebuffer(e.FRAMEBUFFER,n),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0);let r=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;return e.bindFramebuffer(e.FRAMEBUFFER,null),r?n:null}function $(e,t,n,r){e.bindFramebuffer(e.FRAMEBUFFER,t),e.viewport(0,0,n,r),e.clearColor(.0196,.0196,.0235,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null)}function de(e,t,n,r){for(let n of t.tex)e.deleteTexture(n);for(let n of t.fbo)e.deleteFramebuffer(n);let i=Z(e,n,r),a=Z(e,n,r);if(!i||!a)return!1;let o=Q(e,i),s=Q(e,a);return!o||!s?!1:(t.tex=[i,a],t.fbo=[o,s],t.pw=n,t.ph=r,t.idx=0,t.ready=!1,$(e,o,n,r),$(e,s,n,r),t.ready=!0,!0)}function fe(e){if(e.jelly)return e.jelly;let t=e.gl,n=H(t,J),r=H(t,Y);if(!n||!r)return null;let i=Z(t,2,2),a=Z(t,2,2);if(!i||!a)return null;let o=Q(t,i),s=Q(t,a);if(!o||!s)return null;let c={program:n,copy:r,u:X(t,n),copyPrev:t.getUniformLocation(r,`uPrev`),copyRes:t.getUniformLocation(r,`uRes`),tex:[i,a],fbo:[o,s],idx:0,pw:2,ph:2,tension:0,smear:0,snap:0,armed:!0,hue:0,ready:!0};return $(t,o,2,2),$(t,s,2,2),e.jelly=c,c}function pe(e,t){e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}function me(e,t,n,r,i,a,o,s){let c=U(i);if(!c)return;let l=fe(c);if(!l)return;c.gl.disable(c.gl.DEPTH_TEST),c.gl.disable(c.gl.CULL_FACE),c.gl.disable(c.gl.BLEND);let u=o.reduceFlashing!==!1,d=Math.min(1.2,r.bass),f=Math.min(1.2,r.mid),p=Math.min(1,r.treble),m=Math.min(1.2,r.rms),h=Math.min(1,Math.max(r.kick,r.beat>.92?r.beat*.45:0)),g=Math.min(1,r.drop),_=Math.min(1,d*.55+m*.45);l.tension=d<.12&&m<.14&&g<.1?Math.max(0,l.tension-s*.85):Math.max(0,Math.min(1,l.tension+(_-.32)*s*.45)),g>.62&&l.armed&&(l.smear=1,l.armed=!1),g<.14&&(l.armed=!0);let v=l.smear;l.smear=Math.max(0,l.smear-s*(u?2.4:2)),v>.55&&l.smear<=.55&&(l.snap=1),l.snap=Math.max(0,l.snap-s*(u?3.2:2.8)),l.hue+=s*(.12+m*.2);let y=Math.max(t,n),b=y>960?960/y:1,x=Math.max(2,Math.round(t*b)),S=Math.max(2,Math.round(n*b)),C=c.gl;if((l.pw!==x||l.ph!==S)&&!de(C,l,x,S))return;(c.pw!==x||c.ph!==S)&&(c.canvas.width=x,c.canvas.height=S,c.pw=x,c.ph=S);let w=l.idx,T=1-l.idx,E=new Float32Array(8),D=r.wave,O=Math.max(1,D.length);for(let e=0;e<8;e++)E[e]=D[Math.min(O-1,Math.floor(e/8*O))]??0;C.bindFramebuffer(C.FRAMEBUFFER,l.fbo[T]),C.viewport(0,0,x,S),C.useProgram(l.program),pe(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[w]),C.uniform1i(l.u.uPrev,0),C.uniform2f(l.u.uRes,x,S),C.uniform1f(l.u.uTime,r.time),C.uniform1f(l.u.uBass,d),C.uniform1f(l.u.uMid,f),C.uniform1f(l.u.uTreble,p),C.uniform1f(l.u.uRms,m),C.uniform1f(l.u.uKick,h),C.uniform1f(l.u.uDrop,g),C.uniform1f(l.u.uReduce,+!!u),C.uniform1f(l.u.uTension,l.tension),C.uniform1f(l.u.uSmear,l.smear),C.uniform1f(l.u.uSnap,l.snap),C.uniform1f(l.u.uHue,l.hue);let k=e=>[e[0]/255,e[1]/255,e[2]/255],A=k(a.rgb[0]),j=k(a.rgb[1]),M=k(a.rgb[2]);C.uniform3f(l.u.uA,A[0],A[1],A[2]),C.uniform3f(l.u.uB,j[0],j[1],j[2]),C.uniform3f(l.u.uC,M[0],M[1],M[2]),C.uniform1fv(l.u.uWave,E),C.drawArrays(C.TRIANGLES,0,3),C.bindFramebuffer(C.FRAMEBUFFER,null),C.viewport(0,0,x,S),C.useProgram(l.copy),pe(C,c.buffer),C.activeTexture(C.TEXTURE0),C.bindTexture(C.TEXTURE_2D,l.tex[T]),C.uniform1i(l.copyPrev,0),C.uniform2f(l.copyRes,x,S),C.drawArrays(C.TRIANGLES,0,3),l.idx=T,e.imageSmoothingEnabled=!0,e.drawImage(c.canvas,0,0,t,n)}function he(e,t,n,r,i,a,o,s){let c=U(i);if(!c)return;let l=C(c.gl,c.presence);l&&(c.presence=l,D(e,c.gl,c.canvas,c.buffer,l,t,n,r,a,o,s))}function ge(e,t,n,r,i,a,o,s){let c=N(r),l=t*.5,u=n*.78,d=Math.hypot(t,n),f=r.beat*c;i.laserT+=s*(.35+r.rms*3.2*c+r.bass*1.4*c+f*2);for(let t=0;t<8;t++){let n=(t-7/2)*(.12+r.bass*.1*c),s=Math.sin(i.laserT+t*.65)*(.55+r.treble*c*.45),p=-Math.PI/2+n+s,m=l+Math.cos(p)*d,h=u+Math.sin(p)*d;e.strokeStyle=M(a,t),e.lineWidth=1.5+r.bass*16*c+(o.reduceFlashing?f*3:f*10),e.globalAlpha=Math.min(1,o.reduceFlashing?.22+r.rms*c*.45+f*.2:.18+r.rms*c*.4+f*.7),e.beginPath(),e.moveTo(l,u),e.lineTo(m,h),e.stroke()}e.globalAlpha=1;let p=28+r.bass*70*c+f*24,m=e.createRadialGradient(l,u,0,l,u,p);m.addColorStop(0,`rgba(244,244,245,${.55+r.beat*.4})`),m.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=m,e.beginPath(),e.arc(l,u,p,0,Math.PI*2),e.fill(),f>.55&&!o.reduceFlashing&&(e.fillStyle=`rgba(244,244,245,${.1*r.beat})`,e.fillRect(0,0,t,n))}function _e(e,t,n,r,i){let a=N(r),o=[];for(let e=0;e<16;e++){let i=e/15,s=[],c=.28+i*.95;for(let e=0;e<30;e++){let o=e/29,l=Math.min(r.bars.length-1,Math.floor(o*r.bars.length)),u=r.bars[l]??0,d=Math.sin(o*12+r.time*1.5+i*4)*.18*(.25+r.mid),f=u*(.3+r.bass*1.7*a)+d*(.6+a),p=t*.5+(o-.5)*t*1.2*c,m=n*(.22+i*.62)-f*n*.42*c;s.push({x:p,y:m})}o.push(s)}e.lineWidth=1.25;for(let t=0;t<16;t++){let n=o[t];e.beginPath();for(let t=0;t<30;t++){let r=n[t];t===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=M(i,t),e.globalAlpha=.25+t/16*.6,e.stroke()}for(let t=0;t<30;t+=2){e.beginPath();for(let n=0;n<16;n++){let r=o[n][t];n===0?e.moveTo(r.x,r.y):e.lineTo(r.x,r.y)}e.strokeStyle=i.b,e.globalAlpha=.2,e.stroke()}e.globalAlpha=1}function ve(e,t,n,r,i,a,o){r.drop>.72&&i.burstArmed&&(i.bursts.push({life:1}),o||i.bursts.push({life:.82}),i.burstArmed=!1),r.drop<.15&&(i.burstArmed=!0);let s=t*.5,c=n*.5,l=Math.min(t,n)*(o?.42:.62);if(!o&&r.drop>.05)e.fillStyle=`rgba(244,244,245,${r.drop*.2})`,e.fillRect(0,0,t,n);else if(r.drop>.05){let i=e.createRadialGradient(s,c,0,s,c,l);i.addColorStop(0,`rgba(244,244,245,${r.drop*.28})`),i.addColorStop(1,`rgba(244,244,245,0)`),e.fillStyle=i,e.fillRect(0,0,t,n)}for(let t of i.bursts){t.life-=o?.01:.016;let n=(1-t.life)*l;e.beginPath(),e.arc(s,c,Math.max(1,n),0,Math.PI*2),e.strokeStyle=a.c,e.lineWidth=o?3:8,e.globalAlpha=t.life*(o?.4:.9),e.stroke()}i.bursts=i.bursts.filter(e=>e.life>0),e.globalAlpha=1}export{ue as a,W as i,A as n,e as o,ee as r,t as s,k as t};