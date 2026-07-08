(() => {
  const canvas = document.getElementById("blackhole");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const gl =
    canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    }) || canvas.getContext("experimental-webgl");

  if (!gl) {
    canvas.classList.add("fallback");
    return;
  }

  const vsSource = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;

    uniform vec2 u_res;
    uniform float u_time;
    uniform float u_spin;

    #define PI 3.14159265359
    #define TWO_PI 6.28318530718

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float starField(vec2 uv, float t) {
      float stars = 0.0;
      for (int i = 0; i < 3; i++) {
        float scale = exp2(float(i) * 1.7 + 3.0);
        vec2 id = floor(uv * scale);
        vec2 f = fract(uv * scale) - 0.5;
        float n = hash(id + float(i) * 17.0);
        float d = length(f + (hash(id.yx + 3.1) - 0.5) * 0.55);
        float twinkle = 0.65 + 0.35 * sin(t * (1.2 + n * 3.0) + n * 40.0);
        float s = smoothstep(0.03, 0.0, d) * step(0.92, n) * twinkle;
        stars += s * (0.35 + 0.65 * n);
      }
      return stars;
    }

    // Soft noise for disk turbulence
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.05;
        a *= 0.5;
      }
      return v;
    }

    // Approximate gravitational lensing deflection (Schwarzschild-inspired)
    vec2 lensUV(vec2 uv, float rs) {
      float r = length(uv);
      float deflection = rs / max(r, 0.001);
      float warp = 1.0 + deflection * 0.85 + pow(deflection, 2.0) * 0.35;
      return uv / warp;
    }

    vec3 accretionColor(float angle, float radius, float t) {
      // Interstellar / Gargantua: warm gold with Doppler shift
      float doppler = 0.55 + 0.45 * cos(angle - t * 0.15);
      vec3 hot = vec3(1.0, 0.92, 0.72);
      vec3 warm = vec3(1.0, 0.55, 0.18);
      vec3 cool = vec3(0.55, 0.35, 0.95);
      vec3 base = mix(cool, warm, smoothstep(0.2, 0.85, doppler));
      base = mix(base, hot, pow(doppler, 2.2) * 0.75);

      float bands = fbm(vec2(angle * 1.8 - t * 0.35, radius * 4.0 + t * 0.08));
      float glow = smoothstep(0.15, 0.55, bands) * 0.55 + 0.45;
      return base * glow;
    }

    void main() {
      vec2 res = u_res;
      vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);

      // Slight vertical bias so the disk reads like the film stills
      uv.y *= 1.05;
      uv *= 1.15;

      float t = u_time;
      float spin = u_spin;

      // Event horizon / photon sphere scales
      float rs = 0.22;
      float photon = rs * 1.5;
      float diskInner = rs * 1.85;
      float diskOuter = 0.92;

      vec2 luv = lensUV(uv, rs * 0.95);
      float r = length(uv);
      float lr = length(luv);

      // Background stars (lensed)
      float starRot = spin * 0.08;
      float cs = cos(starRot);
      float sn = sin(starRot);
      vec2 starUV = mat2(cs, -sn, sn, cs) * luv;
      float stars = starField(starUV * 1.4, t);

      // Deep space base
      vec3 col = vec3(0.01, 0.012, 0.02);
      col += stars * vec3(0.85, 0.9, 1.0);

      // Soft nebula wash
      float neb = fbm(luv * 2.2 + vec2(t * 0.01, -t * 0.007));
      col += vec3(0.04, 0.03, 0.07) * smoothstep(0.35, 0.8, neb) * 0.55;

      // Accretion disk via lensed polar coords
      float ang = atan(luv.y, luv.x) + spin;
      float diskMask = smoothstep(diskInner, diskInner + 0.04, lr) *
                       smoothstep(diskOuter, diskOuter - 0.12, lr);

      // Flatten disk (edge-on-ish with lensing wrap)
      float thickness = 0.045 + 0.02 * sin(ang * 2.0 + t * 0.2);
      float diskPlane = exp(-pow(luv.y / thickness, 2.0));

      // Gravitational lensing wraps the far side above/below the hole
      float wrap = exp(-pow((abs(luv.y) - 0.08) / 0.11, 2.0)) *
                   smoothstep(diskInner * 0.7, diskInner + 0.1, lr) *
                   smoothstep(0.75, 0.35, lr);

      float disk = max(diskPlane * diskMask, wrap * 0.85 * diskMask);
      disk *= 0.75 + 0.25 * fbm(vec2(ang * 2.5 - spin * 2.0, lr * 6.0));

      vec3 diskCol = accretionColor(ang, lr, t);
      col += diskCol * disk * 1.35;

      // Bright inner photon ring
      float ring = smoothstep(0.02, 0.0, abs(r - photon));
      ring += 0.45 * smoothstep(0.05, 0.0, abs(r - photon * 1.08));
      float ringAng = atan(uv.y, uv.x) + spin * 1.4;
      float ringBright = 0.55 + 0.45 * cos(ringAng);
      col += vec3(1.0, 0.85, 0.55) * ring * ringBright * 1.8;

      // Secondary lensed ring (film-like double image)
      float ring2 = smoothstep(0.018, 0.0, abs(r - photon * 0.78));
      col += vec3(1.0, 0.7, 0.35) * ring2 * 0.9 * ringBright;

      // Soft corona
      float corona = pow(smoothstep(1.1, 0.25, r), 2.2);
      col += vec3(0.35, 0.2, 0.08) * corona * 0.18;

      // Event horizon — pure black core with soft falloff
      float horizon = smoothstep(rs * 0.98, rs * 1.12, r);
      col *= horizon;

      // Subtle vignette
      float vig = smoothstep(1.35, 0.35, length(uv * vec2(0.85, 1.0)));
      col *= mix(0.55, 1.0, vig);

      // Film-ish tone
      col = pow(max(col, 0.0), vec3(0.92));
      col *= 1.08;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) {
    canvas.classList.add("fallback");
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    canvas.classList.add("fallback");
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const aPos = gl.getAttribLocation(program, "a_pos");
  const uRes = gl.getUniformLocation(program, "u_res");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uSpin = gl.getUniformLocation(program, "u_spin");

  gl.useProgram(program);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = Math.floor(window.innerWidth * dpr);
    height = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, width, height);
    }
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  const start = performance.now();
  let frameId = 0;

  function frame(now) {
    const t = (now - start) * 0.001;
    const spin = prefersReducedMotion ? 0.4 : t * 0.22;

    gl.uniform2f(uRes, width, height);
    gl.uniform1f(uTime, prefersReducedMotion ? 8.0 : t);
    gl.uniform1f(uSpin, spin);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (!prefersReducedMotion) {
      frameId = requestAnimationFrame(frame);
    }
  }

  frameId = requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else if (!prefersReducedMotion) {
      frameId = requestAnimationFrame(frame);
    }
  });
})();
