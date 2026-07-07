import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';

const textureLoader = new THREE.TextureLoader();

// Caricamento textures per il braccio (Metal)
const texColorRobot = textureLoader.load('textures/metal_arm/Metal031_2K-JPG_Color.jpg');
const texNormalRobot = textureLoader.load('textures/metal_arm/Metal031_2K-JPG_NormalGL.jpg');
const texRoughnessRobot = textureLoader.load('textures/metal_arm/Metal031_2K-JPG_Roughness.jpg');

// Configurazione wrapping per la mappatura sul braccio
[texColorRobot, texNormalRobot, texRoughnessRobot].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
});


// Texture per le palline - Tema Cyberpunk
const texColorPallaCyber = textureLoader.load('textures/marble/Marble023_2K-JPG_Color.jpg');
const texNormalPallaCyber = textureLoader.load('textures/marble/Marble023_2K-JPG_NormalGL.jpg');
const texRoughPallaCyber = textureLoader.load('textures/marble/Marble023_2K-JPG_Roughness.jpg');

// Texture per le palline - Tema Industrial
const texColorPallaInd = textureLoader.load('textures/metal_ball/ChristmasTreeOrnament018_2K-JPG_Color.jpg');
const texNormalPallaInd = textureLoader.load('textures/metal_ball/ChristmasTreeOrnament018_2K-JPG_NormalGL.jpg');
const texRoughPallaInd = textureLoader.load('textures/metal_ball/ChristmasTreeOrnament018_2K-JPG_Roughness.jpg');

// Texture per le palline - Tema Retrowave
const texColorPallaRetro = textureLoader.load('textures/onyx/Onyx010_2K-JPG_Color.jpg');
const texNormalPallaRetro = textureLoader.load('textures/onyx/Onyx010_2K-JPG_NormalGL.jpg');
const texRoughPallaRetro = textureLoader.load('textures/onyx/Onyx010_2K-JPG_Roughness.jpg');

// Applichazione del wrapping a tutte
[texColorPallaCyber, texNormalPallaCyber, texRoughPallaCyber,
 texColorPallaInd, texNormalPallaInd, texRoughPallaInd,
 texColorPallaRetro, texNormalPallaRetro, texRoughPallaRetro].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
});


// Texture per il tavolo (pavimento)
const texColorTavolo = textureLoader.load('textures/metal_table/Metal009_2K-JPG_Roughness.jpg');
const texNormalTavolo = textureLoader.load('textures/metal_table/Metal009_2K-JPG_NormalGL.jpg');
const texRoughnessTavolo = textureLoader.load('textures/metal_table/Metal009_2K-JPG_Roughness.jpg');

[texColorTavolo, texNormalTavolo, texRoughnessTavolo].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2); // Ripete la texture sul tavolo per non farla sembrare sgranata
});


// Configurazione temi e difficiìoltà del gioco

const TEMI = {
    cyberpunk: { sfondo: 0x111116, braccio: 0x00d2ff, sferetta: 0xff3333, griglia: 0x00ffcc, grigliaSecondaria: 0xff007f, tavolo: 0x222225 },
    industrial: { sfondo: 0x391e1e, braccio: 0xffcc00, sferetta: 0x111111, griglia: 0xff6600, grigliaSecondaria: 0xffcc00, tavolo: 0x4b2222 },
    retrowave: { sfondo: 0x2b0f54, braccio: 0xff007f, sferetta: 0xffee00, griglia: 0x8f00ff, grigliaSecondaria: 0xffee00, tavolo: 0x1a053a }
};

const DIFFICOLTA = {
    facile: { numPalline: 3, raggioIniziale: 0.30, velocitaIniziale: 0.04, moltiplicatoreTimer: 1.0 },
    medio:  { numPalline: 2, raggioIniziale: 0.25, velocitaIniziale: 0.06, moltiplicatoreTimer: 1.0 },
    difficile: { numPalline: 1, raggioIniziale: 0.18, velocitaIniziale: 0.09, moltiplicatoreTimer: 1.0 }
};

let temaAttuale = 'cyberpunk';
let difficoltaAttuale = 'facile';


// Setup ambiente camera e luci
const scene = new THREE.Scene();
scene.background = new THREE.Color(TEMI[temaAttuale].sfondo);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);


// Setup parametri di navigazione della camera
// per permettere di poter girare intorno e zoommare
controls.enableDamping = true;   
controls.dampingFactor = 0.05;
controls.minDistance = 3;        
controls.maxDistance = 20;


// Illuminazione della Scena
// Luce anìmbientale
const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
scene.add(ambientLight);


const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);


// Spotlight sopra il braccio
const spotLight = new THREE.SpotLight(0xffffff, 40);
spotLight.position.set(0, 8, 0); 
spotLight.angle = Math.PI / 4;   
spotLight.penumbra = 0.5;        
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);


// Materiali per ciascun oggetto
// Materiale del Robot con logica PBR (Color, Normal, Specular/Roughness)
const matRobot = new THREE.MeshStandardMaterial({ 
    map: texColorRobot,              
    normalMap: texNormalRobot,           
    normalScale: new THREE.Vector2(0.15, 0.15),
    
    roughnessMap: texRoughnessRobot,    
    metalness: 0.8,                 
    
    //color: TEMI[temaAttuale].braccio     
});


// materiale del tavolo
const matTavolo = new THREE.MeshStandardMaterial({ 
    map: texColorTavolo, 
    normalMap: texNormalTavolo, 
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughnessMap: texRoughnessTavolo,
    color: TEMI[temaAttuale].tavolo 
});


// materiale sferette
const matSferetta = new THREE.MeshStandardMaterial({ 
    map: texColorPallaCyber,
    normalMap: texNormalPallaCyber,
    normalScale: new THREE.Vector2(0.2, 0.2),
    roughnessMap: texRoughPallaCyber,
    color: 0xffffff // Bianco di base così non altera i colori originali della texture delle palline
});


// Creazione oggetti dello scenario
// Tavolo
const geoTavolo = new THREE.BoxGeometry(10, 0.2, 10);
const tavolo = new THREE.Mesh(geoTavolo, matTavolo);
tavolo.position.y = -0.1;
tavolo.receiveShadow = true;
scene.add(tavolo);


// Griglia sopra la texture
let griglia = new THREE.GridHelper(10, 10, 0x333338, 0x333338);
griglia.position.y = 0.01;
scene.add(griglia);


// Creazione perimetro led del tavolo
let perimetroLedGroup = new THREE.Group();
scene.add(perimetroLedGroup);

function costruisciPerimetroLed() {

    while(perimetroLedGroup.children.length > 0) { 
        perimetroLedGroup.remove(perimetroLedGroup.children[0]); 
    }

    const coloreNeon = TEMI[temaAttuale].griglia;
    
    // Creiamo un materiale standard auto-illuminato (Emissive) per simulare l'effetto LED reale
    const matTuboNeon = new THREE.MeshStandardMaterial({
        color: coloreNeon,
        emissive: coloreNeon,
        emissiveIntensity: 2.0
    });

    const spessoreTubo = 0.03; 
    const lunghezzaLato = 10;

    // Generiamo i 4 lati del quadrato usando dei cilindri orizzontali
    for (let i = 0; i < 4; i++) {
        const geoTubo = new THREE.CylinderGeometry(spessoreTubo, spessoreTubo, lunghezzaLato, 8);
        const tubo = new THREE.Mesh(geoTubo, matTuboNeon);
        
        // Posizionamento e rotazione dei 4 segmenti sui bordi del tavolo
        if (i === 0) { tubo.position.set(0, 0.01, -5); tubo.rotation.z = Math.PI / 2; }
        if (i === 1) { tubo.position.set(0, 0.01, 5);  tubo.rotation.z = Math.PI / 2; }
        if (i === 2) { tubo.position.set(-5, 0.01, 0); tubo.rotation.x = Math.PI / 2; }
        if (i === 3) { tubo.position.set(5, 0.01, 0);  tubo.rotation.x = Math.PI / 2; }
        
        perimetroLedGroup.add(tubo);
    }
}
costruisciPerimetroLed();


// Creazione dei pali led verticali che partono dai 4 angoli del tavolo
// Gruppo che conterrà i 4 pali neon e le loro luci associate
const gruppoNeonVerticali = new THREE.Group();
scene.add(gruppoNeonVerticali);


// Array per salvare i riferimenti alle 4 luci, così da poterne cambiare il colore nel tema
let luciNeonVerticali = [];

function costruisciPaliNeon() {

    while(gruppoNeonVerticali.children.length > 0) { 
        gruppoNeonVerticali.remove(gruppoNeonVerticali.children[0]); 
    }
    luciNeonVerticali = [];

    const coloreNeon = TEMI[temaAttuale].griglia;
    const altezzaNeon = 40;
    const spessorePalo = 0.025; 

    const matPaloNeon = new THREE.MeshStandardMaterial({
        color: coloreNeon,
        emissive: coloreNeon,
        emissiveIntensity: 2.5
    });

    const posizioniAngoli = [
        { x: 5,  z: 5 },   
        { x: -5, z: 5 },   
        { x: 5,  z: -5 },  
        { x: -5, z: -5 }   
    ];

    posizioniAngoli.forEach(pos => {

        const geoPalo = new THREE.CylinderGeometry(spessorePalo, spessorePalo, altezzaNeon, 16);
        const paloMesh = new THREE.Mesh(geoPalo, matPaloNeon);
        paloMesh.position.set(pos.x, altezzaNeon / 2, pos.z); // Centrato a metà altezza
        
        gruppoNeonVerticali.add(paloMesh);

        // Luce omnidirezionale associata all'angolo
        const lucePalo = new THREE.PointLight(coloreNeon, 5, 15);
        lucePalo.position.set(pos.x, altezzaNeon / 2, pos.z);
        gruppoNeonVerticali.add(lucePalo);
        luciNeonVerticali.push(lucePalo);
    });
}
costruisciPaliNeon();


// Creazione struttura gerarchica del braccio robot
const geoBase = new THREE.CylinderGeometry(0.8, 0.9, 0.3, 32);
const baseRobot = new THREE.Mesh(geoBase, matRobot);
baseRobot.position.y = 0.15;
baseRobot.castShadow = true;
scene.add(baseRobot);


// braccio inferiore
const geoBraccio1 = new THREE.CylinderGeometry(0.20, 0.20, 2.5, 16);
geoBraccio1.translate(0, 1.25, 0); 
const braccioInferiore = new THREE.Mesh(geoBraccio1, matRobot);
braccioInferiore.position.y = 0.15;
braccioInferiore.castShadow = true;
baseRobot.add(braccioInferiore);


// congiunzione braccia
const geoSferaSnodo = new THREE.SphereGeometry(0.20, 24, 24);
const snodoCentrale = new THREE.Mesh(geoSferaSnodo, matRobot);
snodoCentrale.position.y = 2.5; 
braccioInferiore.add(snodoCentrale);


// braccio superiore
const geoBraccio2 = new THREE.CylinderGeometry(0.20, 0.20, 2.0, 16);
geoBraccio2.translate(0, 1.0, 0); 
const braccioSuperiore = new THREE.Mesh(geoBraccio2, matRobot);
braccioSuperiore.castShadow = true;
snodoCentrale.add(braccioSuperiore); 


// congiunzione braccio e mano
const geoPolso = new THREE.CylinderGeometry(0.15, 0.20, 0.2, 16);
geoPolso.translate(0, 0.1, 0); 
const polso = new THREE.Mesh(geoPolso, matRobot);
polso.position.y = 2.0; 
braccioSuperiore.add(polso);


// mano del braccio
const calamita = new THREE.Group();
calamita.position.y = 0.2; 
polso.add(calamita);


// costruzione 3 dita per la presa meccanica
const dita = [];
const geoDito = new THREE.TorusGeometry(0.20, 0.04, 12, 24, Math.PI / 1.5);
for (let i = 0; i < 3; i++) {
    const ancoraggioDito = new THREE.Group();
    ancoraggioDito.rotation.y = (i * Math.PI * 2) / 3;
    ancoraggioDito.position.y = 0.15; 
    polso.add(ancoraggioDito);
    
    const ditoMesh = new THREE.Mesh(geoDito, matRobot);
    ditoMesh.position.set(0.04, 0.20, 0); 
    ditoMesh.rotation.z = -Math.PI / 2; 
    
    ancoraggioDito.add(ditoMesh);
    dita.push(ditoMesh); 
}


// Collegamento con l'interfaccia html per la gestione del gioco
// comprende gestione dei punti, selezione dei temi e della difficoltà
const elPunti = document.getElementById('txt-punti');
const elTempo = document.getElementById('txt-tempo');
const elPannello = document.getElementById('pannello-ui');
let giocoAvviato = false;


// radio button per la selezione della difficoltà
const elRadioDiff = document.querySelectorAll('input[name="diff"]');
elRadioDiff.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            difficoltaAttuale = e.target.value;
            generaBersaglio();
        }
    });
});


// radio button del cambio tema
// il cambio del tema prevede anche il cambio delle texture per le palline 
// in generale del colore di tutti gli elementi della scena
const elRadioTemi = document.querySelectorAll('input[name="tema"]');
elRadioTemi.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            temaAttuale = e.target.value;
            const t = TEMI[temaAttuale];
            
            scene.background.setHex(t.sfondo);
            //matRobot.color.setHex(t.braccio);
            matTavolo.color.setHex(t.tavolo);
            //matSferetta.color.setHex(t.sferetta);
            //matSferetta.color.setHex(0xffffff);

            switch(temaAttuale) {
                case 'cyberpunk':
                    matSferetta.map = texColorPallaCyber;
                    matSferetta.normalMap = texNormalPallaCyber;
                    matSferetta.roughnessMap = texRoughPallaCyber;
                    break;
                case 'industrial':
                    matSferetta.map = texColorPallaInd;
                    matSferetta.normalMap = texNormalPallaInd;
                    matSferetta.roughnessMap = texRoughPallaInd;
                    break;
                case 'retrowave':
                    matSferetta.map = texColorPallaRetro;
                    matSferetta.normalMap = texNormalPallaRetro;
                    matSferetta.roughnessMap = texRoughPallaRetro;
                    break;
            }
            
            // Three.js aggiorna i materiali delle palline con la texture diversa
            matSferetta.needsUpdate = true;

            //pointLightNeon.color.setHex(t.griglia); 
            if (typeof matNeonFisico !== 'undefined') matNeonFisico.color.setHex(t.griglia);

            scene.remove(griglia);
            griglia = new THREE.GridHelper(10, 10, 0x333338, 0x333338);
            griglia.position.y = 0.01;
            scene.add(griglia);
            
            // RIgenera perimetro e pali led con i nuovi colori
            costruisciPerimetroLed();
            costruisciPaliNeon();

            const elTitolo = document.getElementById('titolo-ui');
            if (elTitolo) {
                elTitolo.style.color = '#' + t.griglia.toString(16);
            }
        }
    });
});


// Gestione Pulsante START
const elBtnStart = document.getElementById('btn-start');
if (elBtnStart) {
    elBtnStart.addEventListener('click', () => {
        giocoAvviato = true;
        gameOver = false;
        tempoRimasto = 30.0;
        punteggio = 0;
        
        // Nasconde il pulsante start
        elBtnStart.classList.add('hidden');
        
        // Fa sparire il riquadro delle istruzioni
        const elIstruzioni = document.getElementById('istruzioni-overlay');
        if (elIstruzioni) elIstruzioni.classList.add('hidden');
        
        // Fa sparire le impostazioni
        const elDiffUi = document.getElementById('diff-ui');
        const elThemeUi = document.getElementById('theme-ui');
        if (elDiffUi) elDiffUi.classList.add('hidden');
        if (elThemeUi) elThemeUi.classList.add('hidden');
        
        // Nasconde i separtori
        const separatori = document.querySelectorAll('.separatore');
        separatori.forEach(sep => sep.classList.add('hidden'));

        generaBersaglio();
    });
}


// Logica del gioco
let bersagli = []; 
let punteggio = 0, tempoRimasto = 30.0, gameOver = false;
let dirX = 1, dirZ = 1;
const clock = new THREE.Clock();


// aggiunta delle posizioni per la mano e lo snodo del braccio 
// per far si che non possano oltrepassare la superfice del tavolo
const posizioneCalamitaMondo = new THREE.Vector3();
const posizioneSnodoMondo = new THREE.Vector3();


function generaBersaglio() {
    
    bersagli.forEach(b => scene.remove(b));
    bersagli = [];

    const conf = DIFFICOLTA[difficoltaAttuale];

    // Calcola i fattori di progressione in base al punteggio
    const fattoreVelocita = 1 + (punteggio * 0.10); // +10% velocità a punto
    const fattoreScala = Math.max(0.4, 1 - (punteggio * 0.05)); // Rimpicciolisce del 5% a punto

    const raggioVariato = conf.raggioIniziale * fattoreScala;
    const velocitaVariata = conf.velocitaIniziale * fattoreVelocita;

    // Diminuzione dinamica del numero di palline
    // Sottrae un numero di palline in base ai punti fatti, senza mai scendere sotto a 1 pallina rimasta
    const numPallineAttuali = Math.max(1, conf.numPalline - Math.floor(punteggio / 2)); 

    // Genera le palline rimanenti
    for (let i = 0; i < numPallineAttuali; i++) {
        const geoB = new THREE.SphereGeometry(raggioVariato, 16, 16);
        const nuovaPallina = new THREE.Mesh(geoB, matSferetta);
        nuovaPallina.castShadow = true;

        nuovaPallina.position.set((Math.random() - 0.5) * 8, raggioVariato, (Math.random() - 0.5) * 8);

        nuovaPallina.userData = {
            dirX: Math.random() > 0.5 ? 1 : -1,
            dirZ: Math.random() > 0.5 ? 1 : -1,
            velocita: velocitaVariata,
            raggioCollisione: raggioVariato
        };

        scene.add(nuovaPallina);
        bersagli.push(nuovaPallina);
    }
}
generaBersaglio();


// Mapping degli input da tastiera, i comandi per poter giocare
const tasti = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, KeyW: false, KeyS: false };
window.addEventListener('keydown', (e) => { if (e.code in tasti) tasti[e.code] = true; });
window.addEventListener('keyup', (e) => { if (e.code in tasti) tasti[e.code] = false; });


// Loop di animazione e rendering
function animate() {

    requestAnimationFrame(animate);
    if (gameOver) return;

    TWEEN.update(); 

    const delta = clock.getDelta();
    const confDiff = DIFFICOLTA[difficoltaAttuale];

    // Il timer comincia a scendere a gioco avviato
    if (giocoAvviato) {
        tempoRimasto -= delta * confDiff.moltiplicatoreTimer;
    }
    
    if (elPunti) elPunti.innerText = punteggio;
    if (elTempo) elTempo.innerText = Math.max(0, tempoRimasto).toFixed(1);

    if (tempoRimasto <= 0 && giocoAvviato) {
        gameOver = true;
        giocoAvviato = false;
        
        // Mostra il blocco di game over e assegna i punti
        const elGameOverUi = document.getElementById('game-over-ui');
        const elPuntiFinali = document.getElementById('txt-punti-finali');
        
        if (elPuntiFinali) elPuntiFinali.innerText = punteggio;
        if (elGameOverUi) elGameOverUi.classList.remove('hidden');
        
        return;
    }


    // movimwenti del braccio con i comandi
    const vRot = braccioInferiore.rotation.z;
    const vRotS = braccioSuperiore.rotation.z;

    if (tasti.ArrowLeft)  baseRobot.rotation.y += 0.04;
    if (tasti.ArrowRight) baseRobot.rotation.y -= 0.04;
    if (tasti.ArrowUp)    braccioInferiore.rotation.z += 0.03;
    if (tasti.ArrowDown)  braccioInferiore.rotation.z -= 0.03;
    if (tasti.KeyW)       braccioSuperiore.rotation.z += 0.04;
    if (tasti.KeyS)       braccioSuperiore.rotation.z -= 0.04;

    braccioInferiore.rotation.z = Math.max(-1.8, Math.min(1.8, braccioInferiore.rotation.z));
    braccioSuperiore.rotation.z = Math.max(-2.4, Math.min(2.4, braccioSuperiore.rotation.z));

    // controllo per far si che lo snodo e la mano del braccio non possano scendere aldilà del tavolo
    calamita.getWorldPosition(posizioneCalamitaMondo);
    snodoCentrale.getWorldPosition(posizioneSnodoMondo);
    if (posizioneCalamitaMondo.y < 0.35 || posizioneSnodoMondo.y < 0.30 ) {
        braccioInferiore.rotation.z = vRot;
        braccioSuperiore.rotation.z = vRotS;
    }

    if (giocoAvviato) {
        bersagli.forEach(b => {
            b.position.x += b.userData.velocita * b.userData.dirX;
            b.position.z += b.userData.velocita * b.userData.dirZ;
            
            // Rimbalzi sui bordi del tavolo
            if (Math.abs(b.position.x) > 4.5) b.userData.dirX *= -1;
            if (Math.abs(b.position.z) > 4.5) b.userData.dirZ *= -1;
        });
    }

    // Controllo delle collisioni con ciascuna pallina per verificare la presa
    if (giocoAvviato) {
        bersagli.forEach((b, index) => {
            const distanza = posizioneCalamitaMondo.distanceTo(b.position);
            if (distanza < (b.userData.raggioCollisione + 0.3)) {
                punteggio++;
                tempoRimasto = Math.min(30.0, tempoRimasto + 6.0);

                // Animazione di chiusura della pinza per la presa
                dita.forEach(d => d.rotation.z = -Math.PI / 3.25);

                // Riapre la pinza dopo 150 millisecondi 
                setTimeout(() => {
                    dita.forEach(d => d.rotation.z = -Math.PI / 2);
                }, 150);

                scene.remove(b);

                generaBersaglio();
            }
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();