import type { Pinport, PinportClient } from "@pinport/client";
import { MapPortSDK, type Mesh } from "./app/sdk";

type Vector3 = {
	x: number;
	y: number;
	z: number;
};

interface IntersectionResult {
	position: Vector3;
}

export class MapportExtension {
	constructor(
		private createPins: PinportClient<any>["createPins"],
		private getPins: PinportClient<any>["getPins"],
		private updatePins: PinportClient<any>["updatePins"],
		private deletePins: PinportClient<any>["deletePins"],
		private getMetadata: PinportClient<any>["getMetadata"],
	) {}
	/**
	 * Sets up the Mapport SDK with the provided configuration.
	 *
	 * @param container - An HTML element used to initialize the SDK with.
	 * @param options - Configuration options for the Mapport SDK setup.
	 * @param options.model - An optional ID used to associate the SDK with a specific space. Required if using the container option.
	 *
	 * @throws Error if neither an iframe nor a container is provided.
	 * @throws Error if using the container option without specifying a model.
	 *
	 * @returns An object with a method to add pins to the Mapport instance.
	 */
	async setupSdk(container: HTMLElement, model: "create" | string) {
		if (!container)
			throw Error("The Mapport SDK requires a container for initialization.");
		if (container && !model?.length)
			throw Error(
				"To use the container option, you need to set the 'model' property first.",
			);

		const mapportSdk = new MapPortSDK(container);
		mapportSdk.init();

		const mapport = null as any;
		const intersectionCache = null as any;
		const poseCache = null as any;

		return {
			/**
			 * Adds pins to the Mapport instance.
			 *
			 * @param pins - An optional array of Pinport.Pin objects to be added. If not provided, only existing pins associated with the model will be used.
			 *
			 * @throws Error if there is an issue with adding the pins or if the model is invalid.
			 *
			 * @returns A promise that resolves when the pins have been successfully added.
			 */
			addPins: (pins?: Pinport.Pin[]) => this.addPins(mapport, pins, model),

			/**
			 * Get the current position of the camera view.
			 *
			 * @throws Error if there is not able to get position.
			 *
			 * @returns A position like `{ position: { x: number, y: number, z: number }, time: number }`.
			 * @remark time - the timestamp at which the position was computed.
			 *
			 */
			getPosition: async (): Promise<IntersectionResult & { time: number }> =>
				new Promise((resolve, reject) => {
					if (!intersectionCache || !poseCache) {
						reject(new Error("Can't get current position."));
					}

					resolve(intersectionCache);
				}),

			/**
			 * Transform a tridimensional position into a two-dimensional position based on the width and height of the iframe, container, or provided size.
			 *
			 * @param position - Optional position to transform. If not provided, the current position in camera view will be used.
			 * @param size - The object with the width and height of the iframe, container, or provided size.
			 *
			 * @returns A position like `{ x: number, y: number }`.
			 */
			positionToCordsIframe: async (
				position?: Vector3,
				size?: { w: number; h: number },
			) => {
				const coord = {
					x: 0,
					y: 0,
				};

				return {
					x: coord.x,
					y: coord.y,
				};
			},

			/**
			 * Move to a specific position in model.
			 *
			 * @param position - The position you want to go to.
			 * @param orientation - Optional camera rotation, where it will look.
			 *
			 */
			moveTo(position: Vector3, orientation?: Vector3) {
				mapport.Mode.moveTo(mapport.Mode.Mode.INSIDE, {
					transition: mapport.Mode.TransitionType.FLY,
					position,
					rotation: orientation,
				});
			},

			/**
			 * Move to a specific pin in model.
			 *
			 * @param pid - The pin id.
			 *
			 */
			async moveToPin(pid: string) {
				await mapport.Mattertag.navigateToTag(
					pid,
					mapport.Mattertag.Transition.FLY,
				);
			},

			/**
			 * Add a scene to the Mapport instance.
			 *
			 * @param mesh - The mesh object to be added.
			 *
			 * @returns The created mesh object.
			 */
			addScene: (mesh: Mesh) => mapportSdk.addScene(mesh),

			/**
			 * Create a mesh to the Mapport instance.
			 *
			 * @param url - The url image to be added.
			 *
			 * @returns The created mesh object.
			 */
			createMesh: (url: string) => mapportSdk.createMesh(url),

			/**
			 * Update a scene in the Mapport instance.
			 *
			 * @param mesh - The mesh object to be updated.
			 * @param mesh2 - The new mesh object.
			 */
			updateScene: (mesh: Mesh, mesh2: Mesh) =>
				mapportSdk.updateScene(mesh, mesh2),

			/**
			 * Remove a scene from the Mapport instance.
			 *
			 * @param mesh - The mesh object to be removed.
			 */
			removeMesh: (mesh: Mesh) => mapportSdk.removeMesh(mesh),
		};
	}

	private async addPins(
		mapport: any,
		pins: Pinport.Pin[] = [],
		model?: string,
	) {
		if (!pins && !model)
			throw Error(
				"To add pins, provide either a pins array or a model in the setup configuration.",
			);

		if (model?.length) {
			try {
				const pinsToConcat = await this.getPins(model);
				pins.push(...pinsToConcat);
			} catch (e) {
				// biome-ignore lint/complexity/noUselessCatch: <explanation>
				throw e;
			}
		}

		const existingIds = new Set<string>();
		const pinsAttachments = await Promise.all(
			pins.map(async ({ html }, i) => ({
				attach: (await mapport!.Tag.registerSandbox(html))[0],
				index: i,
			})),
		);

		await Promise.all(
			pinsAttachments.map(async (attachment) => {
				const pin = pins[attachment.index];
				const pinId = pin.id;
				if (existingIds.has(pinId)) return;
				existingIds.add(pinId);

				await mapport!.Tag.add({
					id: pinId,
					anchorPosition: pin.position,
					stemVector: pin.offset,
					attachments: [attachment.attach],
					opacity: pin.opacity,
					stemVisible: pin.enableLine,
					color: pin.color || "#000",
					iconId: pin.icon?.length ? pin.icon : undefined,
				});
			}),
		);
	}
}
