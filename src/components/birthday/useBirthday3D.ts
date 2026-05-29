import { useEffect, useRef } from 'react';
import { FlameData } from './/types';
import * as THREE from 'three';

interface UseBirthday3DProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  heartsContainerRef: React.RefObject<HTMLDivElement | null>;
  triggerMessage: (text: string) => void;
}

export function useBirthday3D({
  canvasRef,
  containerRef,
  heartsContainerRef,
  triggerMessage,
}: UseBirthday3DProps) {
  const blowCandlesRef = useRef<() => void>(() => {});
  const launchFireworksRef = useRef<() => void>(() => {});
  const sendHeartRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Dynamic import Three.js ເພື່ອຮອງຮັບ SSR ຂອງ Next.js
    import('three').then((THREE) => {
      const canvas = canvasRef.current!;
      const container = containerRef.current!;

      const W = () => container.clientWidth;
      const H = () => container.clientHeight;

      // --- 1. SETUP SCENE & RENDERER ---
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W(), H());
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0010);

      const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100);
      camera.position.set(0, 4, 9);
      camera.lookAt(0, 1, 0);

      // --- 2. LIGHTS ---
      scene.add(new THREE.AmbientLight(0x220011, 0.8));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      dirLight.position.set(5, 10, 5);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const pinkLight = new THREE.PointLight(0xff69b4, 2, 15);
      pinkLight.position.set(-3, 3, 2);
      scene.add(pinkLight);

      const purpleLight = new THREE.PointLight(0xb44fff, 1.5, 15);
      purpleLight.position.set(3, 3, -2);
      scene.add(purpleLight);

      // --- 3. BUILD CAKE ---
      const cakeGroup = new THREE.Group();
      scene.add(cakeGroup);

      function makeLayer(r: number, h: number, y: number, color: number) {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, h, 48),
          new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 })
        );
        m.position.y = y;
        m.castShadow = true;
        m.receiveShadow = true;
        cakeGroup.add(m);
        return m;
      }
      makeLayer(2.4, 1.0, 0.5, 0xff69b4);
      makeLayer(1.7, 0.9, 1.85, 0xff1493);
      makeLayer(1.1, 0.8, 2.9, 0xcc0066);

      const frostMat = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.2 });
      [{ r: 2.42, h: 0.12, y: 0.94 }, { r: 1.72, h: 0.12, y: 2.25 }, { r: 1.12, h: 0.12, y: 3.24 }].forEach((d) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(d.r, d.r, d.h, 48), frostMat);
        m.position.y = d.y;
        cakeGroup.add(m);
      });

      const floorMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(3.2, 3.2, 0.12, 48),
        new THREE.MeshStandardMaterial({ color: 0x8800aa, roughness: 0.4 })
      );
      floorMesh.position.y = -0.06;
      floorMesh.receiveShadow = true;
      cakeGroup.add(floorMesh);

      // --- 4. CANDLES & FLAMES ---
      const candleColors = [0xffd700, 0x00ccff, 0xff4499, 0x44ff88, 0xffaa00, 0xff66cc, 0x66ffdd];
      const flames: FlameData[] = [];
      let candlesLit = true;

      const positions = [[0, 0], [0.7, 0.4], [-0.7, 0.4], [0.4, -0.7], [-0.4, -0.7], [0, 0.9], [0.6, -0.5]];
      positions.forEach((p, i) => {
        const cm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.07, 0.6, 12),
          new THREE.MeshStandardMaterial({ color: candleColors[i % candleColors.length] })
        );
        cm.position.set(p[0], 3.65, p[1]);
        cakeGroup.add(cm);

        const fl = new THREE.PointLight(0xffcc44, 1.2, 2);
        fl.position.set(p[0], 4.2, p[1]);
        scene.add(fl);

        const fm = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffff99 }));
        fm.position.set(p[0], 4.2, p[1]);
        cakeGroup.add(fm);
        flames.push({ light: fl, mesh: fm });
      });

      // --- 5. FIREWORKS (PARTICLES) ---
      const particles: THREE.Mesh[] = [];
      const pGeo = new THREE.SphereGeometry(0.05, 6, 6);

      function makeFirework(x: number, y: number, z: number, color: number) {
        for (let i = 0; i < 30; i++) {
          const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color }));
          m.position.set(x, y, z);
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const sp = 0.08 + Math.random() * 0.13;
          m.userData = {
            vx: Math.sin(phi) * Math.cos(theta) * sp,
            vy: Math.cos(phi) * sp + 0.04,
            vz: Math.sin(phi) * Math.sin(theta) * sp,
            life: 1.0,
            decay: 0.014 + Math.random() * 0.012,
          };
          scene.add(m);
          particles.push(m);
        }
      }

      // --- 6. INTERACTION (DRAG & ROTATE) ---
      let isDragging = false;
      let prevMouse = { x: 0, y: 0 };
      let rotY = 0;
      let rotX = 0;

      const onMouseDown = (e: MouseEvent) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
      const onTouchStart = (e: TouchEvent) => { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
      const onMouseUp = () => (isDragging = false);

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        rotY += (e.clientX - prevMouse.x) * 0.005;
        rotX += (e.clientY - prevMouse.y) * 0.003;
        rotX = Math.max(-0.5, Math.min(0.5, rotX));
        prevMouse = { x: e.clientX, y: e.clientY };
      };
      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        rotY += (e.touches[0].clientX - prevMouse.x) * 0.006;
        rotX += (e.touches[0].clientY - prevMouse.y) * 0.004;
        rotX = Math.max(-0.5, Math.min(0.5, rotX));
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('touchstart', onTouchStart);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchend', onMouseUp);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('touchmove', onTouchMove);

      // Raycaster (Click Cake)
      const raycaster = new THREE.Raycaster();
      const onClick = (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(cakeGroup.children, true);
        if (hits.length > 0) {
          const fwColors = [0xff69b4, 0xffd700, 0x00ffcc, 0xff4499, 0xaaddff, 0xffaa00, 0x88ff44];
          makeFirework(
            hits[0].point.x + (Math.random() - 0.5) * 2,
            hits[0].point.y + 2 + Math.random() * 2,
            hits[0].point.z,
            fwColors[Math.floor(Math.random() * fwColors.length)]
          );
          const msgs = ["ເຈົ້າຄືທຸກຢ່າງໃນຊີວິດຂ້ອຍ 💕", "ຮັກເຈົ້າເທົ່ານັ້ນ ຕລອດໄປ 🌹", "ຂໍໃຫ້ມີຄວາມສຸກທຸກວັນ 🎂", "ເຈົ້າສວຍທີ່ສຸດໃນໂລກ 💖"];
          triggerMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        }
      };
      canvas.addEventListener('click', onClick);

      // --- 7. ACTIONS INTERFACE (ຜູກໃຫ້ພາຍນອກເອີ້ນໃຊ້) ---
      blowCandlesRef.current = () => {
        candlesLit = !candlesLit;
        flames.forEach((f) => { f.light.intensity = candlesLit ? 1.2 : 0; f.mesh.visible = candlesLit; });
        triggerMessage(candlesLit ? '🕯️ ທຽນຈຸດໃໝ່ແລ້ວ ✨' : '🌬️ ເປົ່າທຽນແລ້ວ! ຈົ່ງໄດ້ຕາມຄວາມຝັນ 🌟');
        if (!candlesLit) {
          setTimeout(() => {
            candlesLit = true;
            flames.forEach((f) => { f.light.intensity = 1.2; f.mesh.visible = true; });
          }, 4000);
        }
      };

      launchFireworksRef.current = () => {
        const colors = [0xff69b4, 0xffd700, 0x00ffcc, 0xff4499, 0xaaddff, 0xffaa00, 0x88ff44];
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            makeFirework((Math.random() - 0.5) * 9, 4 + Math.random() * 4.5, (Math.random() - 0.5) * 4, colors[Math.floor(Math.random() * colors.length)]);
          }, i * 220);
        }
        triggerMessage('🎆 ສຸຂສັນວັນເກີດ! ທຸກຄຳຂໍໄດ້ດີ 🎇');
      };

      sendHeartRef.current = () => {
        const containerHtml = heartsContainerRef.current;
        if (!containerHtml) return;
        const heartEmojis = ['💖', '💗', '💕', '💓', '❤️', '💝', '💘'];
        for (let i = 0; i < 9; i++) {
          setTimeout(() => {
            const h = document.createElement('div');
            h.style.position = 'absolute';
            h.style.pointerEvents = 'none';
            h.style.animation = 'floatUp 3s ease-in forwards';
            h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            h.style.left = (8 + Math.random() * 84) + '%';
            h.style.bottom = '80px';
            h.style.fontSize = (16 + Math.random() * 22) + 'px';
            containerHtml.appendChild(h);
            setTimeout(() => h.remove(), 3200);
          }, i * 160);
        }
        triggerMessage('💖 ຮັກເຈົ້າຫຼາຍຫຼາຍ ຫຼາຍ 💕');
      };

      // Background Stars
      const starsGeo = new THREE.BufferGeometry();
      const starCount = 300;
      const sp = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) sp[i] = (Math.random() - 0.5) * 60;
      starsGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, sizeAttenuation: true })));

      // --- 8. ANIMATION LOOP ---
      let t = 0;
      let reqId: number;

      const animate = () => {
        reqId = requestAnimationFrame(animate);
        t += 0.016;
        if (!isDragging) rotY += 0.003;
        cakeGroup.rotation.y = rotY;
        cakeGroup.rotation.x = rotX;

        flames.forEach((f, i) => {
          if (f.mesh.visible) f.mesh.scale.setScalar(0.85 + Math.sin(t * 8 + i) * 0.2);
        });
        pinkLight.intensity = 1.5 + Math.sin(t * 1.3) * 0.5;
        purpleLight.intensity = 1.2 + Math.cos(t * 0.9) * 0.4;

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.userData.life -= p.userData.decay;
          if (p.userData.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
            continue;
          }
          p.position.x += p.userData.vx;
          p.position.y += p.userData.vy;
          p.position.z += p.userData.vz;
          p.userData.vy -= 0.003;
          (p.material as THREE.MeshBasicMaterial).opacity = p.userData.life;
          (p.material as THREE.MeshBasicMaterial).transparent = true;
          p.scale.setScalar(p.userData.life);
        }
        renderer.render(scene, camera);
      };

      animate();

      // Resize handler
      const handleResize = () => {
        renderer.setSize(W(), H());
        camera.aspect = W() / H();
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchend', onMouseUp);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('click', onClick);
      };
    });
  }, [canvasRef, containerRef, heartsContainerRef]);

  return {
    blowCandles: () => blowCandlesRef.current(),
    launchFireworks: () => launchFireworksRef.current(),
    sendHeart: () => sendHeartRef.current(),
  };
}