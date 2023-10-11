import {
    AmbientLight,
    AxesHelper,
    Box3,
    BoxGeometry,
    Color,
    DirectionalLight,
    Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import BlockManager from "./Components/BlockManager";
import Game from "./Components/Game";

const canvas = document.querySelector(".canvas") as HTMLCanvasElement;

const scene = new Scene();

const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
);

camera.position.set(1, 2, 5);

const material = new MeshPhongMaterial();

const blockManager = new BlockManager();

const directionalLight = new DirectionalLight("white", 0.6);

directionalLight.position.set(5, 6, 3);

const ambientLight = new AmbientLight(0x404040, 0.7);

const axesHelper = new AxesHelper(5);

scene.add(ambientLight, directionalLight, axesHelper);

const renderer = new WebGLRenderer({ canvas });

camera.position.set(3.5, 4, 6);

renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

renderer.render(scene, camera);

let current: "x" | "z" = "x";
function animate() {
    requestAnimationFrame(animate);
    const speed = 0.15;
    const activeBlock = blockManager.getLastBlock();
    controls.update();

    if (current === "x") activeBlock.position.x += speed;

    if (current === "z") activeBlock.position.z += speed;

    renderer.render(scene, camera);
}

let y = 0;
const game = new Game();

function wrapMeshToBox(mesh: Mesh): Box3 {
    return new Box3().setFromObject(mesh);
}

function generateNewBlock(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
): Mesh {
    const color = new Color(`hsl(${30 + y * 4}, 100%, 50%)`);
    const geometry = new BoxGeometry(width, height, depth);
    const material = new MeshPhongMaterial({ color });

    const mesh = new Mesh(geometry, material);

    mesh.position.set(x, y, z);

    return mesh;
}

// predefine values

material.color = new Color(0xfb8e00);
const initialBlock = generateNewBlock(1.5, 0, 1.5, 3, 1, 3);
blockManager.addBlock(initialBlock);
scene.add(initialBlock);
renderer.render(scene, camera)

interface Line {
    start: number;
    end: number
}

interface Size {
    size: number,
    start: number,
    end: number
}

function getIntersection(line1: Line, line2: Line): Size {
    if (line1.end < line2.start || line2.end < line1.start) {
        return ({ size: 0, start: 0, end: 0 })
    }

    if (line2.start >= line1.start && line1.end <= line2.end) {
        return ({ size: Math.abs(line1.end - line2.start), start: line2.start, end: line1.end })
        // console.log('2', a2, b1, Math.abs(a2 - b1), Math.abs(b1 - a2))
    }

    if (line2.start <= line1.start && line1.end >= line2.end) {
        return ({ size: Math.abs(line2.end - line1.start), start: line1.start, end: line2.end })
        // console.log('3', a1, b2, Math.abs(a2 - b1), Math.abs(b1 - a2));
    }

    // add if  a1  a2  b2  b2 // line1.start  ------ line2.start ------ line2.end ------ line1.end

    return ({ size: 0, start: 0, end: 0 })
}

function changeSizeBlock(block: Mesh) {

}

window.addEventListener("click", () => {
    const isGameStarted = game.getIsGameStarted();
    // const meshSize = getMeshSize();
    let width = 3;
    let height = 1;
    let depth = 3;
    let meshSize = { width, height, depth }

    // const x = current === "x" ? -10 : 1.5;
    // const z = current === "z" ? -10 : 1.5;

    y = y + 1;

    // current = current === "x" ? "z" : "x"; // fix that

    const blocks = blockManager.getAllBlocks();

    if (blocks.length > 1) {
        const blocks = blockManager.getAllBlocks();
        const animatedBlock = blocks[blocks.length - 1]
        const animatedBox3 = wrapMeshToBox(animatedBlock);
        const stableBox3 = wrapMeshToBox(blocks[blocks.length - 2]);

        const minStable = stableBox3.min[current];
        const maxStable = stableBox3.max[current];
        const stableLine = { start: minStable, end: maxStable };

        const minAnimated = animatedBox3.min[current];
        const maxAnimated = animatedBox3.max[current];
        const animatedLine = { start: minAnimated, end: maxAnimated }


        // const size = getIntersection(minStable, maxStable, minAnimated, maxAnimated);
        const size = getIntersection(stableLine, animatedLine);
        // debugger;
        // const scale = (maxAnimated - minAnimated) / size.size;
        // meshSize.width = size.size;
        // console.log(size.size);
        // animatedBlock.position.setX(size.start)
        // animatedBlock.scale.x = scale
        scene.remove(animatedBlock);
        debugger;
        const block = generateNewBlock(size.size, y - 1, 1.5, size.size, meshSize.height, meshSize.depth);
        blockManager.addBlock(block);
        scene.add(block);
    }

    const activeBlock = generateNewBlock(-10, y, 1.5, meshSize.width, meshSize.height, meshSize.depth);

    blockManager.addBlock(activeBlock);

    scene.add(activeBlock);

    if (!isGameStarted) {
        game.setIsGameStarted(true);
        animate();
    }

    // camera.position.setY(camera.position.y + 1)

});