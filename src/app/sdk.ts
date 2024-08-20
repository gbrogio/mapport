import * as THREE from "three";
import { generateUUID } from "../utils/uuid";

export type Mesh = THREE.Mesh<
	THREE.SphereGeometry,
	THREE.MeshBasicMaterial,
	THREE.Object3DEventMap
>;

export class MapPortSDK {
	private camera: THREE.PerspectiveCamera | null = null;
	private scene: THREE.Scene | null = null;
	private renderer: THREE.WebGLRenderer | null = null;

	private isUserInteracting = false;
	private mouseDownMouseX = 0;
	private mouseDownMouseY = 0;
	private lon = 0;
	private targetLon = 0;
	private mouseDownLon = 0;
	private lat = 0;
	private targetLat = 0;
	private mouseDownLat = 0;
	private phi = 0;
	private theta = 0;

	// Defina a escala de conversão (1 unidade = 1 metro)
	private readonly scale = 1;

	constructor(private container: HTMLElement) {}

	public addScene(mesh: Mesh) {
		this.scene?.add(mesh);
	}

	public createMesh(url: string) {
		const geometry = new THREE.SphereGeometry(500 * this.scale, 60, 40); // Ajuste a geometria
		geometry.scale(-1, 1, 1);
		const texture = new THREE.TextureLoader().load(url);
		texture.colorSpace = THREE.SRGBColorSpace;
		const material = new THREE.MeshBasicMaterial({ map: texture });
		const mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}

	public updateScene(mesh: Mesh, mesh2: Mesh) {
		this.scene?.remove(mesh);
		this.scene?.add(mesh2);
	}

	public removeMesh(mesh: Mesh) {
		this.scene?.remove(mesh);
	}

	public init() {
		console.log("init");
		this.camera = new THREE.PerspectiveCamera(
			75,
			this.container.clientWidth / this.container.clientHeight,
			1,
			1100 * this.scale, // Ajuste o alcance da câmera
		);
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(
			this.container.clientWidth,
			this.container.clientHeight,
		);
		this.renderer.setAnimationLoop(this.animate.bind(this));
		this.container.appendChild(this.renderer.domElement);

		this.container.style.touchAction = "none";
		this.container.addEventListener("pointerdown", this.onMouseDown.bind(this));
		document.addEventListener("pointermove", this.onMouseMove.bind(this));
		document.addEventListener("pointerup", this.onMouseUp.bind(this));
		document.addEventListener("wheel", this.onDocumentMouseWheel.bind(this));

		window.addEventListener("resize", this.onWindowResize.bind(this));
	}

	private onWindowResize() {
		if (!this.camera) return;

		this.camera.aspect =
			this.container.clientWidth / this.container.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer?.setSize(
			this.container.clientWidth,
			this.container.clientHeight,
		);
	}

	private onMouseDown(event: PointerEvent) {
		if (event.isPrimary === false) return;

		this.isUserInteracting = true;

		this.mouseDownMouseX = event.clientX;
		this.mouseDownMouseY = event.clientY;

		this.mouseDownLon = this.lon;
		this.mouseDownLat = this.lat;
	}

	private onMouseMove(event: PointerEvent) {
		if (event.isPrimary === false || !this.isUserInteracting) return;
		this.targetLon =
			(this.mouseDownMouseX - event.clientX) * 0.2 + this.mouseDownLon;
		this.targetLat =
			(event.clientY - this.mouseDownMouseY) * 0.2 + this.mouseDownLat;
	}

	private onMouseUp(event: PointerEvent) {
		if (event.isPrimary === false) return;
		this.isUserInteracting = false;
	}

	private onDocumentMouseWheel(event: WheelEvent) {
		if (!this.camera) return;
		const fov = this.camera.fov + event.deltaY * 0.05;
		this.camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
		this.camera.updateProjectionMatrix();
	}

	private animate() {
		if (!this.camera || !this.scene || !this.renderer) return;

		// Interpolação linear para suavizar o movimento
		this.lon += (this.targetLon - this.lon) * 0.1;
		this.lat += (this.targetLat - this.lat) * 0.1;

		this.lat = Math.max(-85, Math.min(85, this.lat));
		this.phi = THREE.MathUtils.degToRad(90 - this.lat);
		this.theta = THREE.MathUtils.degToRad(this.lon);

		const x = 500 * Math.sin(this.phi) * Math.cos(this.theta) * this.scale;
		const y = 500 * Math.cos(this.phi) * this.scale;
		const z = 500 * Math.sin(this.phi) * Math.sin(this.theta) * this.scale;

		this.camera.lookAt(x, y, z);
		this.renderer.render(this.scene, this.camera);
	}
}
