import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// A box has faces in this order: +x, -x, +y, -y, +z, -z.
// Opposite faces add up to 7, like a real die.
const FACE_VALUES = [3, 4, 1, 6, 2, 5];

const PIPS = {
  1: [[0.5, 0.5]],
  2: [[0.27, 0.27], [0.73, 0.73]],
  3: [[0.27, 0.27], [0.5, 0.5], [0.73, 0.73]],
  4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
  5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]],
  6: [[0.27, 0.25], [0.73, 0.25], [0.27, 0.5], [0.73, 0.5], [0.27, 0.75], [0.73, 0.75]],
};

const MOVIE_DIE = {
  body: { light: "#fff8ef", dark: "#d6cabb" },
  pip: { light: "#ff6b86", dark: "#b3122f" },
};
const SERIES_DIE = {
  body: { light: "#ff4b6c", dark: "#9f0e2b" },
  pip: { light: "#ffffff", dark: "#e6dede" },
};

// Paint one face of the die on a canvas
function faceTexture(value, scheme) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");

  const bg = g.createRadialGradient(size / 2, size / 2, size * 0.15, size / 2, size / 2, size * 0.78);
  bg.addColorStop(0, scheme.body.light);
  bg.addColorStop(1, scheme.body.dark);
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);

  for (const [px, py] of PIPS[value]) {
    const x = px * size;
    const y = py * size;
    const r = size * 0.085;

    // dark ring so the pip looks pressed into the die
    g.beginPath();
    g.arc(x, y, r * 1.18, 0, Math.PI * 2);
    g.fillStyle = "rgba(0,0,0,.28)";
    g.fill();

    const pg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    pg.addColorStop(0, scheme.pip.light);
    pg.addColorStop(1, scheme.pip.dark);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = pg;
    g.fill();
  }

  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function createDie(scheme) {
  const geometry = new RoundedBoxGeometry(1, 1, 1, 5, 0.12);
  const materials = FACE_VALUES.map(
    (v) =>
      new THREE.MeshPhysicalMaterial({
        map: faceTexture(v, scheme),
        roughness: 0.32,
        metalness: 0.05,
        clearcoat: 0.7,
        clearcoatRoughness: 0.25,
      })
  );
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  return mesh;
}

// Which face is pointing up? Check each local axis against world "up".
const LOCAL_AXES = [
  new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
];
function topValue(mesh) {
  let best = -2;
  let value = 1;
  LOCAL_AXES.forEach((axis, i) => {
    const up = axis.clone().applyQuaternion(mesh.quaternion).y;
    if (up > best) {
      best = up;
      value = FACE_VALUES[i];
    }
  });
  return value;
}

const rand = (min, max) => min + Math.random() * (max - min);

export default function DiceRoller({ onSettled }) {
  const mountRef = useRef(null);
  const cbRef = useRef(onSettled);
  cbRef.current = onSettled;

  useEffect(() => {
    const mount = mountRef.current;
    let cleanup = () => {};

    try {
      let disposed = false;
      let finished = false;
      let raf = 0;

      const finish = (values) => {
        if (finished) return;
        finished = true;
        cbRef.current?.(values);
      };

      /* ---------- renderer, camera, lights ---------- */
      const w = mount.clientWidth;
      const h = mount.clientHeight;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
      camera.position.set(0, 6.5, 5.2);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));

      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.position.set(3, 9, 4);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -5;
      sun.shadow.camera.right = 5;
      sun.shadow.camera.top = 5;
      sun.shadow.camera.bottom = -5;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 20;
      scene.add(sun);

      const rim = new THREE.PointLight(0xff3b62, 35, 20);
      rim.position.set(-4, 3, -3);
      scene.add(rim);

      // invisible floor that only shows shadows
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.ShadowMaterial({ opacity: 0.5 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      /* ---------- physics world ---------- */
      const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -45, 0) });
      world.allowSleep = true;

      const diceMat = new CANNON.Material("dice");
      const groundMat = new CANNON.Material("ground");
      world.addContactMaterial(
        new CANNON.ContactMaterial(diceMat, groundMat, { friction: 0.3, restitution: 0.42 })
      );
      world.addContactMaterial(
        new CANNON.ContactMaterial(diceMat, diceMat, { friction: 0.2, restitution: 0.3 })
      );

      // a plane's normal points along +z; rotate it so it faces into the play area
      const addPlane = (x, y, z, axis, angle) => {
        const b = new CANNON.Body({ mass: 0, material: groundMat });
        b.addShape(new CANNON.Plane());
        b.position.set(x, y, z);
        b.quaternion.setFromAxisAngle(axis, angle);
        world.addBody(b);
      };
      const X = new CANNON.Vec3(1, 0, 0);
      const Y = new CANNON.Vec3(0, 1, 0);
      addPlane(0, 0, 0, X, -Math.PI / 2);     // floor
      addPlane(0, 9, 0, X, Math.PI / 2);      // ceiling
      addPlane(-2.8, 0, 0, Y, Math.PI / 2);   // left wall
      addPlane(2.8, 0, 0, Y, -Math.PI / 2);   // right wall
      addPlane(0, 0, -1.9, Y, 0);             // back wall
      addPlane(0, 0, 1.9, Y, Math.PI);        // front wall

      /* ---------- the two dice ---------- */
      const dice = [MOVIE_DIE, SERIES_DIE].map((scheme, i) => {
        const mesh = createDie(scheme);
        scene.add(mesh);

        const side = i === 0 ? -1 : 1;
        const body = new CANNON.Body({
          mass: 1,
          material: diceMat,
          shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
          linearDamping: 0.04,
          angularDamping: 0.12,
          sleepSpeedLimit: 0.6,
          sleepTimeLimit: 0.5,
        });
        body.position.set(side * 1.2, rand(3.8, 4.6), rand(-0.6, 0.6));
        body.quaternion.setFromEuler(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
        // thrown toward the middle with a lot of spin
        body.velocity.set(-side * rand(1, 3.5), rand(-4, -1), rand(-3, 3));
        body.angularVelocity.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
        world.addBody(body);

        return { mesh, body };
      });

      /* ---------- animation loop ---------- */
      const clock = new THREE.Clock();
      let elapsed = 0;

      const loop = () => {
        if (disposed) return;
        raf = requestAnimationFrame(loop);

        const dt = Math.min(clock.getDelta(), 1 / 30);
        world.step(1 / 60, dt, 3);
        elapsed += dt;

        dice.forEach(({ mesh, body }) => {
          mesh.position.copy(body.position);
          mesh.quaternion.copy(body.quaternion);
        });
        renderer.render(scene, camera);

        // done when both dice fall asleep (or after 7s as a safety net)
        const asleep = dice.every((d) => d.body.sleepState === CANNON.Body.SLEEPING);
        if (!finished && elapsed > 1.2 && (asleep || elapsed > 7)) {
          finish(dice.map((d) => topValue(d.mesh)));
        }
      };
      loop();

      cleanup = () => {
        disposed = true;
        cancelAnimationFrame(raf);
        dice.forEach(({ mesh }) => {
          mesh.geometry.dispose();
          mesh.material.forEach((m) => {
            m.map?.dispose();
            m.dispose();
          });
        });
        floor.geometry.dispose();
        floor.material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    } catch (e) {
      // no WebGL? skip the animation and carry on
      console.error("Dice failed to start:", e);
      cbRef.current?.([]);
    }

    return () => cleanup();
  }, []);

  return <div className="dm-roller" ref={mountRef} />;
}