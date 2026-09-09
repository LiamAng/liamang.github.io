import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const assetsPrefix = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/26.1/assets/minecraft/";

const assets = {
    images: {
    title: "/assets/minecraft_title.png",
    button: assetsPrefix + "textures/gui/sprites/widget/button.png",
    button_highlight: assetsPrefix + "textures/gui/sprites/widget/button_highlighted.png",
    text_feild: assetsPrefix + "textures/gui/sprites/widget/text_field.png",
    text_feild_highlight: assetsPrefix + "textures/gui/sprites/widget/text_field_highlighted.png",
    menu: assetsPrefix + "textures/gui/menu_background.png",
    menu_list: assetsPrefix + "textures/gui/menu_list_background.png",
    footer_separator: assetsPrefix + "textures/gui/footer_separator.png",
    header_separator: assetsPrefix + "textures/gui/header_separator.png",
    join: assetsPrefix + "textures/gui/sprites/world_list/join.png",
    join_highlight: assetsPrefix + "textures/gui/sprites/world_list/join_highlighted.png",
    panorama: [3, 1, 4, 5, 0, 2].map(i => `${assetsPrefix}textures/gui/title/background/panorama_${i}.png`)
    },
    fonts: { minecraftia: "/assets/minecraft.ttf" },
    audio: {
    menu_music: "/assets/beginning_2.opus",
    click: "/assets/random_click.opus"
    }
};

const countAssets = node =>
    typeof node === "string" ? 1 :
    Array.isArray(node) ? node.length :
        Object.values(node).reduce((sum, child) => sum + countAssets(child), 0);

const TOTAL_ASSETS = countAssets(assets);

const splash = document.getElementById("splash");
const splashText = document.getElementById("splash-text");
const bar = document.getElementById("progress");
const clickPrompt = document.getElementById("click-prompt");
const titleImg = document.getElementById("title");

let done = 0, loaded = false, started = false;
const step = () => { if (++done >= TOTAL_ASSETS) loaded = true; };
const track = (el, loadEvent = "load") => {
    el.addEventListener(loadEvent, step, { once: true });
    el.addEventListener("error", step, { once: true });
    return el;
};

const menuMusic = track(new Audio(assets.audio.menu_music), "canplaythrough");
menuMusic.loop = true;
menuMusic.preload = "auto";

track(titleImg).src = assets.images.title;

new FontFace("Minecraftia", `url("${assets.fonts.minecraftia}")`)
    .load().then(font => document.fonts.add(font)).catch(() => { }).finally(step);

const imageCache = [];

function loadImage(url, cssVar) {
    const img = new Image();
    imageCache.push(img);
    img.addEventListener("load", () => {
        document.documentElement.style.setProperty(cssVar, `url("${url}")`);
        step();
    }, { once: true });
    
    img.addEventListener("error", step, { once: true });
    
    img.src = url;
}

loadImage(assets.images.button, "--btn-bg");
loadImage(assets.images.text_feild, "--tf-bg");
loadImage(assets.images.button_highlight, "--btn-bg-hover");
loadImage(assets.images.text_feild_highlight, "--tf-bg-hover");
loadImage(assets.images.menu, "--m-bg");
loadImage(assets.images.menu_list, "--ml-bg");
loadImage(assets.images.footer_separator, "--fs");
loadImage(assets.images.header_separator, "--hs");
loadImage(assets.images.join, "--join");
loadImage(assets.images.join_highlight, "--join-hover");


const ctx = new AudioContext();
let clickBuffer = null;

fetch(assets.audio.click)
    .then(r => r.arrayBuffer())
    .then(data => ctx.decodeAudioData(data))
    .then(buffer => { clickBuffer = buffer; })
    .catch(() => { })
    .finally(step);

function playClick() {
    if (!clickBuffer) return;
    if (ctx.state !== "running") ctx.resume().catch(() => { });
    const src = ctx.createBufferSource();
    src.buffer = clickBuffer;
    src.connect(ctx.destination);
    src.start(0);
}

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("panorama"), antialias: true });
const camera = new THREE.PerspectiveCamera(85, 1, 0.05, 10);
const scene = new THREE.Scene();

const loader = new THREE.TextureLoader();
const materials = assets.images.panorama.map(url => {
    const t = loader.load(url, step, undefined, step);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.repeat.x = -1;
    t.offset.x = 1;
    return new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, depthTest: false, depthWrite: false });
});

scene.add(new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8), materials));

const resize = () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
addEventListener("resize", resize);
resize();
renderer.render(scene, camera);

const tickBar = () => {
    if (started) return;
    bar.value += ((loaded ? 100 : done / TOTAL_ASSETS * 100) - bar.value) * .1;
    if (loaded && bar.value > 99.5) {
    bar.value = 100;
    bar.classList.add("hide");
    clickPrompt.classList.add("show");
    return;
    }
    requestAnimationFrame(tickBar);
};
requestAnimationFrame(tickBar);

const startPanorama = () => {
    let prev = performance.now();
    renderer.setAnimationLoop(now => {
    const dt = Math.min(now - prev, 100);
    prev = now;
    scene.rotation.y += dt * 0.0000349;
    renderer.render(scene, camera);
    });
};

splash.addEventListener("click", () => {
    if (ctx.state !== "running") ctx.resume().catch(() => { });
    if (!loaded || started) return;
    started = true;
    splash.classList.add("hide");
    menuMusic.play().catch(() => { });
    startPanorama();
});

const pressEvent = window.PointerEvent ? "pointerdown" : "touchstart";
document.querySelectorAll("button").forEach(b => b.addEventListener(pressEvent, playClick));

const splashTexts = ["Hello!", "70% bug free!", "corny ba toh", "sorry.", "WELCOME!", "septic tank code", "nonstop larp"]

splashText.innerHTML = splashTexts[Math.floor(Math.random() * splashTexts.length)]
const menuList = document.getElementById("menu-list");

const flowcharts = [
    [
        "assets/flowchart/1.png",
        "Flowchart 1",
        "Print name 5 times",
        "Sequence",
        "assets/flowchart/1.png"
    ],
    [
        "assets/flowchart/2.png",
        "Flowchart 2",
        "Swap values",
        "Sequence",
        "assets/flowchart/2.png"
    ],
    [
        "assets/flowchart/3.png",
        "Flowchart 3",
        "Compute simple arithmetic",
        "Sequence",
        "assets/flowchart/3.png",
    ],
    [
        "assets/flowchart/4.png",
        "Flowchart 4",
        "Celsius to Fahrenheit",
        "Sequence",
        "assets/flowchart/4.png",
    ],
    [
        "assets/flowchart/5.png",
        "Flowchart 5",
        "Sales Computation",
        "Sequence",
        "assets/flowchart/5.png"
    ],
    [
        "assets/flowchart/6.png",
        "Flowchart 6",
        "Grade Average",
        "Sequence",
        "assets/flowchart/6.png"
    ],
    [
        "assets/flowchart/7.png",
        "Flowchart 7",
        "Square and Cube",
        "Sequence",
        "assets/flowchart/7.png"
    ],
    [
        "assets/flowchart/8.png",
        "Flowchart 8",
        "Rectangle Measures",
        "Sequence",
        "assets/flowchart/8.png"
    ],
    [
        "assets/flowchart/9.png",
        "Flowchart 9",
        "Circle Measures",
        "Sequence",
        "assets/flowchart/9.png"
    ],
    [
        "assets/flowchart/10.png",
        "Flowchart 10",
        "Triangle Measures",
        "Sequence",
        "assets/flowchart/10.png"
    ],
]

const projects = [

]
const menuSearch = document.getElementById("menu-search");

function populateMenu(contents, title) {
    menuSearch.value = "";
    document.getElementById("menu-title").innerHTML = title
    menuList.innerHTML="";
    if (contents.length < 1) {
        const message = document.createElement("p");
        message.style = "color: white"
        message.innerHTML = "Sorry wala pa. :("
        menuList.appendChild(message);
    } else
    for (var i = 0; i < contents.length; i++) {
        const stuff = contents[i];
        const content = document.createElement("div");
        content.classList.add("content")
        const clear = () => {
            Array.from(menuList.getElementsByClassName("content")).forEach( (el) => {
                el.classList.remove("selected")
            });
        }
        const open = () => {
            window.open(stuff[4]);
            clear();
        }
        content.innerHTML = `
            <div class="icon">
                <div class="whiteout"></div>
                <img src="${stuff[0]}">
                <button class="open"></button>
            </div>
            <div class="info">
                <p class="title">${stuff[1]}</p>
                <p class="description">${stuff[2]}</p>
                <p class="description">${stuff[3]}</p>
            </div>
        `
        content.addEventListener("click", () => {
            clear();
            content.classList.add("selected");
        });
        content.addEventListener("dblclick", () => {open(); playClick()});
        const openButton = content.querySelector(".open");
        openButton.addEventListener("click", (e) => {e.stopImmediatePropagation(); open(); playClick()})
        menuList.appendChild(content);
    }
    document.getElementById("menu-screen").style.visibility = "visible";
    document.getElementById("main-menu").style.visibility = "hidden";
}

document.getElementById("flowchart-button").onclick = () => { populateMenu(flowcharts, "Select Flowchart") };

document.getElementById("projects-button").onclick = () => { populateMenu(projects, "Select Project") }

menuSearch.oninput = () => {
    console.log(menuSearch.value)
    Array.from(menuList.getElementsByClassName("content")).forEach((content) => {
        if (content.innerHTML.includes(menuSearch.value)) {
            content.style.display = "flex"
        } else {
            content.style.display = "none"
        }
    });
}