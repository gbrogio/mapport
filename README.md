
# Pinport Mapport Extension

PinportMapportExtension is a TypeScript class designed to integrate the Pinport SDK with Mapport for adding interactive pins to 3D models. This extension allows for the seamless addition of pins into Pinport spaces by using Pinport's API to fetch pin data and the Pinport SDK to display them.

## Installation

To install the PinportMapportExtension along with the Pinport client, use the following command:

```bash
npm install @pinport/client @pinport/mapport
```

## Usage

### Importing and Initializing

To use the PinportMapportExtension, you need to import it and initialize an instance with your Pinport client:

```typescript
import { PinportClient } from "@pinport/client";
import { PinportMapportExtension } from "@pinport/mapport";

const pinport = new PinportClient("<api_url>", "<private_key>", {
  extensions: [PinportMapportExtension],
});
```

### Setting Up the Pinport SDK

To set up the Pinport SDK, use the `setupSdk` method of the PinportExtension instance. This method initializes the SDK and prepares it for adding pins.

```typescript
const sdkOptions = { 
  iframe: document.getElementById('pinport-iframe') as HTMLIFrameElement,
};

const pinportMapport = pinport.extensions.mapport
  .setupSdk("<pinport_sdk_key>", sdkOptions)
  .then((sdk) => {
    console.log("Pinport SDK setup complete.");
  })
  .catch((error) => {
    console.error("Error setting up Pinport SDK:", error);
  });
```

### Adding Pins

Once the SDK is set up, you can add pins to your Pinport model using the `addPins` method. This method takes an array of pins fetched from Pinport and adds them to the Pinport model.

PinportClient is a TypeScript client for interacting with the Pinport API. It allows for creating and retrieving pins on the Pinport platform.

```typescript
const pins = await pinport.getPins('meta1');
await pinportMapport.addPins(pins);
```

### Getting the Current Camera Position

To get the current position of the camera view, you can use the `getPosition` method. This method returns a promise that resolves to an object containing the position coordinates and the timestamp at which the position was computed.

```typescript
const currentPosition = await pinportMapport.getPosition();
console.log("Current position:", currentPosition);
```

### Transforming Tridimensional Position to Two-dimensional Position

To transform a tridimensional position into a two-dimensional position based on the width and height of the iframe, container, or provided size, you can use the `positionToCordsIframe` method. This method takes an optional position and size as parameters and returns a position object with `x` and `y` coordinates.

```typescript
const twoDimensionalPosition = pinportMapport.positionToCordsIframe();
console.log("Two-dimensional position:", twoDimensionalPosition);
```

## Moving the Camera to a Specific Position

To move the camera to a specific position in the Pinport model, you can use the `moveTo` method of the PinportMapportExtension instance. This method takes the target position as a parameter and animates the camera movement to that position.

```typescript
const targetPosition = { x: 0, y: 0, z: 0 };
await pinportMapport.moveTo(targetPosition);
```

## Moving the Camera to a Pin

To move the camera to a specific pin in the Pinport model, you can use the `moveToPin` method. This method takes the pin ID as a parameter and animates the camera movement to the location of the pin.

```typescript
const pinId = "pin1";
await pinportMapport.moveToPin(pinId);
```

This project is licensed under the MIT License. See the LICENSE file for details.
