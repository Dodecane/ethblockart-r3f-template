import React, { useEffect, useMemo, useRef, Suspense } from "react";
import { applyProps, useThree } from "react-three-fiber";
import MersenneTwist from "mersenne-twister";
import { useGLTF } from "@react-three/drei/useGLTF";
import { toBN, fromWei } from "web3-utils";

/*
Create your Custom style to be turned into a EthBlock.art BlockStyle NFT

Basic rules:
 - use a minimum of 1 and a maximum of 4 "modifiers", modifiers are values between 0 and 1,
 - use a minimum of 1 and a maximum of 3 colors, the color "background" will be set at the canvas root
 - Use the block as source of entropy, no Math.random() allowed!
 - You can use a "shuffle bag" using data from the block as seed, a MersenneTwister library is provided

 Arguments:
  - block: the blockData, in this example template you are given 3 different blocks to experiment with variations, check App.js to learn more
  - mod[1-3]: template modifier arguments with arbitrary defaults to get your started
  - color: template color argument with arbitrary default to get you started

Getting started:
 - Write react-three-fiber code, consuming the block data and modifier arguments,
   make it cool and use no random() internally, component must be pure, output deterministic
 - Customize the list of arguments as you wish, given the rules listed below
 - Provide a set of initial /default values for the implemented arguments, your preset.
 - Think about easter eggs / rare attributes, display something different every 100 blocks? display something unique with 1% chance?

 - check out react-three-fiber documentation for examples!
*/

// Required style metadata
const styleMetadata = {
  name: "Orbs and Jewels",
  description: "",
  image: "",
  creator_name: "Dodecane",
  options: {
    mod1: 1,
    mod2: 1,
    color1: "#ffffff",
    background: "#ffffff",
  },
};

export { styleMetadata };

export default function CustomStyle({
  block,
  attributesRef,

  mod1 = 1, // Example: replace any number in the code with mod1, mod2, or color values
  mod2 = 1,
  color1 = "#ffffff",
  background = "#ffffff",
}) {
  console.log(`rendering`);

  // Props

  //   const { mod1, mod2, mod3, color1 } = options;

  // Refs
  const shuffleBag = useRef();
  const group = useRef();
  const hoistedValue = useRef();

  // Three
  const { size, camera } = useThree();
  const { width, height } = size;

  // Update custom attributes related to style when the modifiers change
  useEffect(() => {
    console.log("updating attributes...");
    attributesRef.current = () => {
      return {
        // This is called when the final image is generated, when creator opens the Mint NFT modal.
        // should return an object structured following opensea/enjin metadata spec for attributes/properties
        // https://docs.opensea.io/docs/metadata-standards
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema

        attributes: [
          {
            trait_type: "palette",
            value: hoistedValue.current.color,
          },
          {
            trait_type: "shape",
            value: hoistedValue.current.shape,
          },
        ],
      };
    };
  }, [hoistedValue.current, attributesRef]);

  // Handle correct scaling of scene as canvas is resized, and when generating upscaled version.
  useEffect(() => {
    console.log(`updating camera...`);
    let DEFAULT_SIZE = 500;
    let DIM = Math.min(width, height);
    let M = DIM / DEFAULT_SIZE;
    camera.zoom = M * 200;
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  // Colour palettes
  const blue1 = [
    "#008CD9",
    "#009FD9",
    "#037FBF",
    "#003990",
    "#4A5DA2",
    "#015EA3",
  ];
  const blue1mono = [
    "#008CD9",
    "#009FD9",
    "#037FBF",
    "#003990",
    "#4A5DA2",
    "#015EA3",
    "#3D413D",
    "#07050A",
  ];
  const blue2 = [
    "#003990",
    "#4A5DA2",
    "#015EA3",
    "#0F60A2",
    "#3BB3E5",
    "#989ED0",
  ];
  const blue2mono = [
    "#003990",
    "#4A5DA2",
    "#015EA3",
    "#0F60A2",
    "#3BB3E5",
    "#989ED0",
    "#C2C3BB",
    "#6A6F6D",
  ];
  const blue3 = [
    "#0F60A2",
    "#3BB3E5",
    "#989ED0",
    "#41B5DA",
    "#56C3EA",
    "#BBE2F1",
  ];
  const blue3mono = [
    "#0F60A2",
    "#3BB3E5",
    "#989ED0",
    "#41B5DA",
    "#56C3EA",
    "#BBE2F1",
    "#F0F0F4",
    "#E2E0D3",
  ];
  const red1 = [
    "#E7280E",
    "#C12823",
    "#A40022",
    "#760020",
    "#E94F09",
    "#A51052",
  ];
  const red1mono = [
    "#E7280E",
    "#C12823",
    "#A40022",
    "#760020",
    "#E94F09",
    "#A51052",
    "#3D413D",
    "#07050A",
  ];
  const red2 = [
    "#760020",
    "#E94F09",
    "#A51052",
    "#D12A78",
    "#EEB0BD",
    "#FCE5EB",
  ];
  const red2mono = [
    "#760020",
    "#E94F09",
    "#A51052",
    "#D12A78",
    "#EEB0BD",
    "#FCE5EB",
    "#C2C3BB",
    "#6A6F6D",
  ];
  const red3 = [
    "#D12A78",
    "#EEB0BD",
    "#FCE5EB",
    "#E1A4B3",
    "#F8CBC8",
    "#FEEDE5",
  ];
  const red3mono = [
    "#D12A78",
    "#EEB0BD",
    "#FCE5EB",
    "#E1A4B3",
    "#F8CBC8",
    "#FEEDE5",
    "#F0F0F4",
    "#E2E0D3",
  ];

  // Shuffle the random number bag when block changes
  const [mainRotation, jewelConfig, colours, scale, shape] = useMemo(() => {
    console.log(`shuffling...`);
    const { hash } = block;
    const seed = parseInt(hash.slice(0, 16), 16);
    shuffleBag.current = new MersenneTwist(seed);

    const gasPriceList = block.transactions.map((tx) => toBN(tx.gasPrice.hex));
    let ethTransferred = 0;
    let avgGasPrice = 0;
    if (block.transactions.length !== 0) {
      ethTransferred = fromWei(
        block.transactions
          .map((tx) => toBN(tx.value.hex))
          .reduce((a, b) => a.add(b))
      );
      avgGasPrice = fromWei(
        gasPriceList.reduce((a, b) => a.add(b)).div(toBN(gasPriceList.length)),
        "Gwei"
      );
    }
    console.log("ETH transferred: " + ethTransferred + " ETH");
    console.log("Average gas price: " + avgGasPrice + " Gwei");

    function getScale() {
      if (ethTransferred > 16384) {
        return 0.00001;
      } else {
        return (ethTransferred / 16384) * -0.00299 + 0.003;
      }
    }

    function randomRotation() {
      return [
        shuffleBag.current.random() * 2 * Math.PI,
        shuffleBag.current.random() * 2 * Math.PI,
        shuffleBag.current.random() * 2 * Math.PI,
      ];
    }

    function randomPositionOnHemisphere() {
      let a = 2 * Math.PI * shuffleBag.current.random();
      let b = Math.acos(1 - 2 * shuffleBag.current.random());
      let x = Math.sin(a) * Math.sin(b);
      let y = Math.cos(a) * Math.sin(b);
      let z = Math.abs(Math.cos(b)) * -1;
      return [x, y, z];
    }

    function randomColoursFromPalettes(palette1, palette2, palette3) {
      return [
        palette1[Math.floor(shuffleBag.current.random() * palette1.length)],
        palette2[Math.floor(shuffleBag.current.random() * palette2.length)],
        palette3[Math.floor(shuffleBag.current.random() * palette3.length)],
      ];
    }

    function selectColours() {
      let scale = avgGasPrice / 200;
      switch (true) {
        case scale <= 0.125:
          return [
            "cobalt blues",
            randomColoursFromPalettes(blue1, blue1, blue1mono),
          ];
        case scale <= 0.25:
          return [
            "bell blues",
            randomColoursFromPalettes(blue2, blue2, blue2mono),
          ];
        case scale <= 0.375:
          return [
            "turquoise blues",
            randomColoursFromPalettes(blue3, blue3, blue3mono),
          ];
        case scale <= 0.5:
          return [
            "reddish blues",
            randomColoursFromPalettes(blue3mono, red2mono, blue1mono),
          ];
        case scale <= 0.625:
          return [
            "bluish reds",
            randomColoursFromPalettes(red3mono, blue2mono, red1mono),
          ];
        case scale <= 0.75:
          return [
            "chablis reds",
            randomColoursFromPalettes(red3, red3, red3mono),
          ];
        case scale <= 0.875:
          return ["pink reds", randomColoursFromPalettes(red2, red2, red2mono)];
        default:
          return ["jam reds", randomColoursFromPalettes(red1, red1, red1mono)];
      }
    }

    function getShape() {
      let blockNumber = block.number;
      switch (true) {
        case blockNumber % 30 === 0:
          return "pentagonal delta orb";
        case blockNumber % 24 === 0:
          return "square delta orb";
        case blockNumber % 18 === 0:
          return "hexagonal jewel";
        case blockNumber % 15 === 0:
          return "pentagonal jewel";
        case blockNumber % 12 === 0:
          return "square jewel";
        default:
          return "Toshie's jewel";
      }
    }

    const mainRotation = randomRotation();
    let jewelConfig = [];
    for (let i = 0; i < ethTransferred; i++) {
      jewelConfig.push({
        position: randomPositionOnHemisphere(),
        rotation: randomRotation(),
      });
    }
    const colourConfig = selectColours();
    const colours = colourConfig[1];
    const scale = getScale();
    const shape = getShape();

    const attributes = {
      color: colourConfig[0],
      shape: shape,
    };
    hoistedValue.current = attributes;

    return [mainRotation, jewelConfig, colours, scale, shape];
  }, [block]);

  //Insert main model
  function Orb(props) {
    const group = useRef();
    const { nodes, materials } = useGLTF(props.path);
    return (
      <group
        ref={group}
        {...props}
        dispose={null}
        scale={[0.007, 0.007, 0.007]}
      >
        <mesh geometry={nodes.Body1.geometry}>
          <meshStandardMaterial color={props.colour1} />
        </mesh>
        <mesh geometry={nodes.Body2.geometry}>
          <meshStandardMaterial color={props.colour2} />
        </mesh>
        <mesh geometry={nodes.Body3?.geometry}>
          <meshStandardMaterial color={props.colour3} />
        </mesh>
      </group>
    );
  }

  //Insert small model
  function Jewel(props) {
    const group = useRef();
    const { nodes, materials } = useGLTF(props.path);
    return (
      <group
        ref={group}
        {...props}
        dispose={null}
        scale={[props.scale, props.scale, props.scale]}
      >
        <mesh geometry={nodes.Body1.geometry}>
          <meshPhysicalMaterial
            transparent={true}
            transmission={0.9}
            color={props.colour1}
          />
        </mesh>
        <mesh geometry={nodes.Body2.geometry}>
          <meshPhysicalMaterial
            transparent={true}
            transmission={0.9}
            color={props.colour2}
          />
        </mesh>
        <mesh geometry={nodes.Body3?.geometry}>
          <meshPhysicalMaterial
            transparent={true}
            transmission={0.9}
            color={props.colour3}
          />
        </mesh>
      </group>
    );
  }

  //Load jewelConfig
  function Jewels(props) {
    const jewels = jewelConfig.map((item, index) => (
      <Jewel
        key={index}
        path={props.path}
        colour1={props.colour1}
        colour2={props.colour2}
        colour3={props.colour3}
        position={item.position}
        rotation={item.rotation}
        scale={props.scale}
      />
    ));
    return jewels;
  }

  // Render the scene
  return (
    <group ref={group} position={[0, 0, 0]}>
      <directionalLight position={[0, 0, 1]} />
      <pointLight position={[0, 0, -0.5]} color={color1} />
      <Suspense fallback={null}>
        <group ref={group} rotation={[0, 0, mod1 * 2 * Math.PI]}>
          <Orb
            path={`models/${shape}.gltf`}
            rotation={mainRotation}
            colour1={colours[0]}
            colour2={colours[1]}
            colour3={colours[2]}
          />
        </group>
        <group ref={group} rotation={[0, 0, mod2 * 2 * Math.PI]}>
          <Jewels
            path={`models/${shape}.gltf`}
            colour1={colours[0]}
            colour2={colours[1]}
            colour3={colours[2]}
            scale={scale}
          />
        </group>
      </Suspense>
    </group>
  );
}
