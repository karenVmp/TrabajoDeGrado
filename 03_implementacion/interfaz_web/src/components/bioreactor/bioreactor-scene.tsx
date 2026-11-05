import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
 
const addPipe = (
  parent: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material
) => {
  const direction = new THREE.Vector3().subVectors(end, start)
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 16),
    material
  )
  pipe.position.copy(start).add(end).multiplyScalar(0.5)
  pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  pipe.castShadow = true
  parent.add(pipe)
}
 
interface BioreactorSceneProps {
  estado?: string
  ph?: number
}
 
export const BioreactorScene = ({ estado = 'NORMAL', ph = 5.0 }: BioreactorSceneProps) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const estadoRef = useRef(estado)
  const phRef = useRef(ph)
 
  useEffect(() => {
    estadoRef.current = estado
    phRef.current = ph
  }, [estado, ph])
 
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
 
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(5.3, 3.6, 7.2)
 
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)
 
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1.75, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 3.5
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI * 0.82
 
    scene.add(new THREE.HemisphereLight(0xeaf4ed, 0x65756b, 2.1))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.1)
    keyLight.position.set(4, 7, 5)
    keyLight.castShadow = true
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xa4cbb5, 1.6)
    fillLight.position.set(-4, 3, -3)
    scene.add(fillLight)
 
    const vessel = new THREE.Group()
    const steel = new THREE.MeshStandardMaterial({ color: 0x71847b, metalness: 0.78, roughness: 0.29 })
    const brushedSteel = new THREE.MeshStandardMaterial({ color: 0xb8c5bc, metalness: 0.83, roughness: 0.24 })
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xd9e8df,
      metalness: 0.18,
      roughness: 0.18,
      transparent: true,
      opacity: 0.31,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x33463d, metalness: 0.55, roughness: 0.4 })
 
    const shellProfile = [
      new THREE.Vector2(0, 0.82),
      new THREE.Vector2(0.66, 0.82),
      new THREE.Vector2(0.82, 0.91),
      new THREE.Vector2(0.88, 1.08),
      new THREE.Vector2(0.88, 2.78),
      new THREE.Vector2(0.82, 2.96),
      new THREE.Vector2(0.65, 3.08),
      new THREE.Vector2(0, 3.12)
    ]
    const shell = new THREE.Mesh(new THREE.LatheGeometry(shellProfile, 64), glass)
    shell.castShadow = true
    shell.receiveShadow = true
    vessel.add(shell)
 
    const addRing = (y: number, radius: number, tube: number) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 64), brushedSteel)
      ring.rotation.x = Math.PI / 2
      ring.position.y = y
      ring.castShadow = true
      vessel.add(ring)
    }
    addRing(0.91, 0.78, 0.055)
    addRing(1.08, 0.875, 0.035)
    addRing(2.76, 0.875, 0.035)
    addRing(2.96, 0.78, 0.055)
 
    const topCap = new THREE.Mesh(
      new THREE.LatheGeometry([
        new THREE.Vector2(0, 3.09),
        new THREE.Vector2(0.55, 3.09),
        new THREE.Vector2(0.67, 3.14),
        new THREE.Vector2(0.57, 3.22),
        new THREE.Vector2(0.3, 3.27),
        new THREE.Vector2(0, 3.28)
      ], 64),
      brushedSteel
    )
    vessel.add(topCap)
 
    const bottomCap = new THREE.Mesh(
      new THREE.LatheGeometry([
        new THREE.Vector2(0, 0.57),
        new THREE.Vector2(0.3, 0.6),
        new THREE.Vector2(0.57, 0.67),
        new THREE.Vector2(0.69, 0.78),
        new THREE.Vector2(0, 0.82)
      ], 64),
      brushedSteel
    )
    vessel.add(bottomCap)
 
    // Aspa (impeller)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.95, 24), darkMetal)
    shaft.position.y = 2.1
    vessel.add(shaft)
 
    const impellerGroup = new THREE.Group()
    impellerGroup.position.y = 1.38
 
    const impellerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 24), brushedSteel)
    impellerGroup.add(impellerHub)
 
    const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x729380, metalness: 0.55, roughness: 0.32 })
    for (const angle of [0, Math.PI / 2]) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.07, 0.12), bladeMaterial)
      blade.rotation.y = angle
      blade.castShadow = true
      impellerGroup.add(blade)
    }
    vessel.add(impellerGroup)
 
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.36, 32), darkMetal)
    motor.position.y = 3.45
    motor.castShadow = true
    vessel.add(motor)
    const motorTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.08, 32), brushedSteel)
    motorTop.position.y = 3.67
    vessel.add(motorTop)
 
    for (const x of [-0.57, 0.57]) {
      for (const z of [-0.57, 0.57]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.12), steel)
        leg.position.set(x, 0.31, z)
        leg.castShadow = true
        vessel.add(leg)
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.2), darkMetal)
        foot.position.set(x, 0.035, z)
        vessel.add(foot)
      }
    }
 
    addPipe(vessel, new THREE.Vector3(0, 0.73, 0), new THREE.Vector3(0, 0.35, 0), 0.075, steel)
    addPipe(vessel, new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0.78, 0.35, 0), 0.075, steel)
    addPipe(vessel, new THREE.Vector3(0.86, 2.65, 0), new THREE.Vector3(1.17, 2.65, 0), 0.045, brushedSteel)
    addPipe(vessel, new THREE.Vector3(1.17, 2.65, 0), new THREE.Vector3(1.17, 2.05, 0), 0.045, brushedSteel)
 
    const pipeValve = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 16), darkMetal)
    pipeValve.position.set(1.17, 2.35, 0)
    vessel.add(pipeValve)
    const valveHandle = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.045, 0.07), brushedSteel)
    valveHandle.position.set(1.17, 2.35, 0)
    vessel.add(valveHandle)
 
    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.16, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x95aa9b, transparent: true, opacity: 0.7 })
    )
    floorRing.rotation.x = Math.PI / 2
    floorRing.position.y = 0.015
    vessel.add(floorRing)
    scene.add(vessel)
 
    // ===== BURBUJAS DE FERMENTACIÓN =====
    const BUBBLE_COUNT = 40
    const bubbles: {
      mesh: THREE.Mesh
      speed: number
      radius: number
      angle: number
      startY: number
      phase: number
    }[] = []
 
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0x7ec8a0,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.4
    })
 
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const size = 0.025 + Math.random() * 0.045
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(size, 8, 8),
        bubbleMat.clone()
      )
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * 0.6
      const startY = 0.9 + Math.random() * 1.8
      bubble.position.set(
        Math.cos(angle) * r,
        startY,
        Math.sin(angle) * r
      )
      scene.add(bubble)
      bubbles.push({
        mesh: bubble,
        speed: 0.004 + Math.random() * 0.008,
        radius: r,
        angle,
        startY,
        phase: Math.random() * Math.PI * 2
      })
    }
 
    // ===== LÍQUIDO =====
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x8bc4a0,
      transparent: true,
      opacity: 0.22,
      roughness: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const liquidProfile = [
      new THREE.Vector2(0, 0.85),
      new THREE.Vector2(0.62, 0.85),
      new THREE.Vector2(0.80, 0.95),
      new THREE.Vector2(0.85, 1.1),
      new THREE.Vector2(0.85, 2.0),
      new THREE.Vector2(0, 2.0)
    ]
    const liquid = new THREE.Mesh(new THREE.LatheGeometry(liquidProfile, 64), liquidMat)
    scene.add(liquid)
 
    // ===== ANIMACIÓN =====
    let frameId = 0
    let time = 0
 
    const getStateColor = () => {
      const e = estadoRef.current
      if (e === 'CRITICO') return new THREE.Color(0xc0392b)
      if (e === 'ALERTA') return new THREE.Color(0xe67e22)
      return new THREE.Color(0x7ec8a0)
    }
 
    const getBubbleSpeed = () => {
      const e = estadoRef.current
      if (e === 'CRITICO') return 1.8
      if (e === 'ALERTA') return 1.3
      return 1.0
    }
 
    const render = () => {
      time += 0.016
      controls.update()
 
      // Rotar aspa
      impellerGroup.rotation.y = time * 1.2
 
      // Color reactivo al estado
      const stateColor = getStateColor()
      const speedMult = getBubbleSpeed()
 
      // Animar burbujas
      bubbles.forEach((b, i) => {
        b.mesh.position.y += b.speed * speedMult
 
        // Movimiento lateral suave
        const wobble = Math.sin(time * 1.5 + b.phase) * 0.04
        b.mesh.position.x = Math.cos(b.angle + wobble) * b.radius
        b.mesh.position.z = Math.sin(b.angle + wobble) * b.radius
 
        // Pulso de tamaño
        const scale = 1 + Math.sin(time * 2 + i) * 0.08
        b.mesh.scale.setScalar(scale)
 
        // Color del estado
        ;(b.mesh.material as THREE.MeshPhysicalMaterial).color.lerp(stateColor, 0.05)
 
        // Reiniciar burbuja cuando llega arriba
        if (b.mesh.position.y > 2.9) {
          b.mesh.position.y = b.startY
          b.radius = Math.random() * 0.6
          b.angle = Math.random() * Math.PI * 2
        }
      })
 
      // Color del líquido reactivo
      liquidMat.color.lerp(stateColor, 0.03)
 
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(render)
    }
    render()
 
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    })
    resizeObserver.observe(host)
 
    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])
 
  return <div ref={hostRef} className='bioreactor-scene' />
}