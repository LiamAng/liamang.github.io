import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const supportedVersion = [
    "1.20.5", "1.21", "1.21.4", "1.21.5", 
    "1.21.6", "1.21.9", "1.21.11", "26.1", "26.2"
]

const versions = document.getElementById("versions");
const selectedVersion = localStorage.getItem("version") || "26.1"
supportedVersion.forEach((version) => {
    const button = document.createElement("button")
    button.classList.add("mc-button");
    button.innerHTML = version;
    button.style.width = "500px";
    button.style.maxWidth = "90vw";

    button.onclick = () => {
        localStorage.setItem("version", version);
        window.location.reload();
    }
    versions.appendChild(button);
})

document.getElementById("options-title").innerHTML = `Select Version (${selectedVersion})`

const assetsPrefix = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/refs/heads/"+ selectedVersion +"/assets/minecraft/";

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
const age = document.getElementById("age");
function timeSince(timestamp) {
  const start = new Date(timestamp);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();

  if (minutes < 0) {
    minutes += 60;
    hours--;
  }

  if (hours < 0) {
    hours += 24;
    days--;
  }

  if (days < 0) {
    months--;
    days += new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  return { years, months, days, hours, minutes };
}
const startPanorama = () => {
    let prev = performance.now();
    renderer.setAnimationLoop(now => {
        const time = timeSince(1201822740000);
        age.innerHTML = "Age: " + `${time.years}y, ${time.months}m, ${time.days}d, ${time.hours}h, ${time.minutes}m`;
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

const splashTexts = ["Hello!", "70% bug free!", "corny ba toh", "sorry.", "WELCOME!", "septic tank code", "nonstop larp", "No Games", "Unlimited Bacon"]

splashText.innerHTML = splashTexts[Math.floor(Math.random() * splashTexts.length)]
const menuList = document.getElementById("menu-list");

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
    document.getElementById("menu-screen").style.display = "flex";
    document.getElementById("main-menu").style.display = "none";
}

async function loadFlowcharts(selected = "Sequence") {
    const baseUrl = `/assets/flowcharts/${selected.toLowerCase()}`;
    const response = await(fetch(`${baseUrl}/index.json`));
    var flowcharts = []
    if (response.ok) {
        const flowchartIndex = await response.json()
        flowchartIndex.forEach((title, index) => {
            const url = `${baseUrl}/${index+1}.png`;
            const flowchart = [
                url,
                `Flowchart ${index+1}`,
                title,
                selected,
                url
            ]
            flowcharts.push(flowchart); 
        });
    }
    populateMenu(flowcharts, `${selected} Flowcharts`)
}

const tabs = document.getElementById("menu-options");
document.getElementById("flowchart-button").onclick = () => {
    tabs.innerHTML = "";
    const tabTitles = ["Sequence", "Selection", "Iteration"];
    tabTitles.forEach((tabTitle) => {
        const tab = document.createElement("button");
        tab.classList.add("mc-button");
        tab.innerHTML = tabTitle;
        tab.onclick = () => { loadFlowcharts(tabTitle) };
        tabs.appendChild(tab);
    });
    loadFlowcharts();
};

async function loadProjects(selected = "School") {
    const response = await(fetch(`/assets/projects/${selected.toLowerCase()}.json`));
    var projects = []
    if (response.ok) {
        projects = await response.json();
    }
    populateMenu(projects, `${selected} Flowcharts`)
}

document.getElementById("projects-button").onclick = () => {
    tabs.innerHTML = "";
    const tabTitles = ["School", "Hobby"];
    tabTitles.forEach((tabTitle) => {
        const tab = document.createElement("button");
        tab.classList.add("mc-button");
        tab.innerHTML = tabTitle;
        tab.onclick = () => { loadProjects(tabTitle) };
        tabs.appendChild(tab);
    });
    loadProjects();
}
document.getElementById("options-button").onclick = () => {
    document.getElementById("options-screen").style.display = "flex";
    document.getElementById("main-menu").style.display = "none";
};
document.getElementById("about-button").onclick = () => {
    document.getElementById("about-screen").style.display = "flex";
    document.getElementById("main-menu").style.display = "none";
};
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