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

texColorPallaCyber.colorSpace = THREE.SRGBColorSpace;
texColorPallaInd.colorSpace = THREE.SRGBColorSpace;
texColorPallaRetro.colorSpace = THREE.SRGBColorSpace;

// Applichazione del wrapping a tutte
[texColorPallaCyber, texNormalPallaCyber, texRoughPallaCyber,
 texColorPallaInd, texNormalPallaInd, texRoughPallaInd,
 texColorPallaRetro, texNormalPallaRetro, texRoughPallaRetro].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
});


// Texture per il tavolo (pavimento)
const texColorTavolo = textureLoader.load('textures/metal_table/Metal009_2K-JPG_Color.jpg');
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

renderer.outputColorSpace = THREE.SRGBColorSpace;

const pmrem = new THREE.PMREMGenerator(renderer);


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
// Luce ambientale
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
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

// Materiale per dettagli braccio robotico
const matMetalloChiaro = new THREE.MeshStandardMaterial({ 
    color: 0xE5E8EA,  
    normalMap: texNormalRobot,           
    normalScale: new THREE.Vector2(0.15, 0.15),  
    roughnessMap: texRoughnessRobot,
    metalness: 0.8
    
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
    normalScale: new THREE.Vector2(1.6, 1.6),
    roughnessMap: texRoughPallaCyber,
    color: 0xffffff, // Bianco di base così non altera i colori originali della texture delle palline
    metalness: 0.5
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
        lucePalo.position.set(pos.x, altezzaNeon / 24, pos.z);
        gruppoNeonVerticali.add(lucePalo);
        luciNeonVerticali.push(lucePalo);
    });
}
costruisciPaliNeon();


// Creazione struttura gerarchica del braccio robot
// Base meccanica a cerchi concentrici
const gruppoBase = new THREE.Group();
scene.add(gruppoBase);

gruppoBase.rotation.y = Math.PI;

const geoGradone1 = new THREE.CylinderGeometry(1.2, 1.3, 0.1, 32);
const gradone1 = new THREE.Mesh(geoGradone1, matMetalloChiaro);
gradone1.position.y = 0.05; 
gradone1.castShadow = true; gradone1.receiveShadow = true;
gruppoBase.add(gradone1);

const geoGradone2 = new THREE.CylinderGeometry(0.9, 0.9, 0.25, 32);
const gradone2 = new THREE.Mesh(geoGradone2, matRobot);
gradone2.position.y = 0.225; 
gradone2.castShadow = true; gradone2.receiveShadow = true;
gruppoBase.add(gradone2);

const geoGradone3 = new THREE.CylinderGeometry(0.95, 0.95, 0.05, 32);
const gradone3 = new THREE.Mesh(geoGradone3, matMetalloChiaro);
gradone3.position.y = 0.375; 
gradone3.castShadow = true; gradone3.receiveShadow = true;
gruppoBase.add(gradone3);

const geoGradone4 = new THREE.CylinderGeometry(0.65, 0.65, 0.25, 32);
const gradone4 = new THREE.Mesh(geoGradone4, matRobot);
gradone4.position.y = 0.525; 
gradone4.castShadow = true; gradone4.receiveShadow = true;
gruppoBase.add(gradone4);

const geoGradone5 = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32);
const gradone5 = new THREE.Mesh(geoGradone5, matMetalloChiaro);
gradone5.position.y = 0.70; 
gradone5.castShadow = true; gradone5.receiveShadow = true;
gruppoBase.add(gradone5);

const altezzaTotaleBase = 0.75;

// Snodo inferiore
// Piastre quadrate e perno cilindrico
const geoPiastraBase = new THREE.BoxGeometry(0.15, 0.5, 0.5);
const piastraBaseSian = new THREE.Mesh(geoPiastraBase, matRobot);
piastraBaseSian.position.set(-0.35, altezzaTotaleBase + 0.25, 0); 
piastraBaseSian.castShadow = true;
gruppoBase.add(piastraBaseSian);

const piastraBaseDest = new THREE.Mesh(geoPiastraBase, matRobot);
piastraBaseDest.position.set(0.35, altezzaTotaleBase + 0.25, 0);  
piastraBaseDest.castShadow = true;
gruppoBase.add(piastraBaseDest);

const geoPernoInf = new THREE.CylinderGeometry(0.12, 0.12, 0.80, 24);
geoPernoInf.rotateZ(Math.PI / 2); 
const pernoInferioreMesh = new THREE.Mesh(geoPernoInf, matMetalloChiaro);
pernoInferioreMesh.position.set(0, altezzaTotaleBase + 0.25, 0); 
pernoInferioreMesh.castShadow = true;
gruppoBase.add(pernoInferioreMesh);

const braccioInferiore = new THREE.Group();
braccioInferiore.position.set(0, altezzaTotaleBase + 0.25, 0); 
gruppoBase.add(braccioInferiore);

// Braccio inferiore
// Due piastre rettangolari laterali
const altezzaBraccio1 = 1.75;
const geoPiastraBraccio1 = new THREE.BoxGeometry(0.10, altezzaBraccio1, 0.35);
geoPiastraBraccio1.translate(0, altezzaBraccio1 / 2, 0); 

const piastraInfSinistra = new THREE.Mesh(geoPiastraBraccio1, matRobot);
piastraInfSinistra.position.x = -0.20; 
piastraInfSinistra.castShadow = true;
braccioInferiore.add(piastraInfSinistra);

const piastraInfDestra = new THREE.Mesh(geoPiastraBraccio1, matRobot);
piastraInfDestra.position.x = 0.20;  
piastraInfDestra.castShadow = true;
braccioInferiore.add(piastraInfDestra);

// Snodo centrale
// Perno cilindrico orizzontale
const geoSnodoCilindrico = new THREE.CylinderGeometry(0.12, 0.12, 0.55, 24);
geoSnodoCilindrico.rotateZ(Math.PI / 2); 
const snodoCentrale = new THREE.Mesh(geoSnodoCilindrico, matMetalloChiaro);
snodoCentrale.position.y = altezzaBraccio1; 
snodoCentrale.castShadow = true;
braccioInferiore.add(snodoCentrale);

// Braccio superiore
const braccioSuperiore = new THREE.Group();
braccioSuperiore.position.set(0, altezzaBraccio1, 0);
braccioInferiore.add(braccioSuperiore);

const altezzaBraccio2 = 2.0;
const geoBraccio2Pieno = new THREE.BoxGeometry(0.26, altezzaBraccio2, 0.25);
geoBraccio2Pieno.translate(0, altezzaBraccio2 / 2, 0); 

const braccioSuperioreMesh = new THREE.Mesh(geoBraccio2Pieno, matRobot);
braccioSuperioreMesh.castShadow = true;
braccioSuperiore.add(braccioSuperioreMesh);


const geoStaffaPolso = new THREE.BoxGeometry(0.32, 0.2, 0.25);
const staffaPolso = new THREE.Mesh(geoStaffaPolso, matRobot);
staffaPolso.position.y = altezzaBraccio2; 
staffaPolso.castShadow = true;
braccioSuperiore.add(staffaPolso);

// Snodo polso
const geoPernoPolso = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 16);
geoPernoPolso.rotateZ(Math.PI / 2); 
const pernoPolsoMesh = new THREE.Mesh(geoPernoPolso, matMetalloChiaro);
pernoPolsoMesh.position.y = altezzaBraccio2;
pernoPolsoMesh.castShadow = true;
braccioSuperiore.add(pernoPolsoMesh);

// Costruzione della mano
const calamita = new THREE.Group();
calamita.position.set(0, altezzaBraccio2, 0); 
braccioSuperiore.add(calamita);

// Le due piastre laterali del perno del polso
const geoPiastraMano = new THREE.BoxGeometry(0.06, 0.3, 0.2);

const piastraManoSinistra = new THREE.Mesh(geoPiastraMano, matRobot);
piastraManoSinistra.position.set(-0.2, 0.15, 0); 
piastraManoSinistra.castShadow = true;
calamita.add(piastraManoSinistra);

const piastraManoDestra = new THREE.Mesh(geoPiastraMano, matRobot);
piastraManoDestra.position.set(0.2, 0.15, 0);
piastraManoDestra.castShadow = true;
calamita.add(piastraManoDestra);

// Base rotonda mano che cogiunge le piastre e la mano
const geoCongiunzione = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 24);
const congiunzioneMano = new THREE.Mesh(geoCongiunzione, matRobot);
congiunzioneMano.position.y = 0.325; 
congiunzioneMano.castShadow = true;
calamita.add(congiunzioneMano);

// Struttura esagonale della mano
const geoAttuatoreMano = new THREE.CylinderGeometry(0.175, 0.25, 0.25, 6);
const attuatoreMano = new THREE.Mesh(geoAttuatoreMano, matRobot);
attuatoreMano.position.y = 0.425; 
attuatoreMano.castShadow = true;
calamita.add(attuatoreMano);

// Costruzione dei ganci e delle dita
const dita = [];
const geoDito = new THREE.TorusGeometry(0.16, 0.04, 12, 24, Math.PI / 1.125);

for (let i = 0; i < 3; i++) {
    const ancoraggioDito = new THREE.Group();
    // Posizione delle dita per essere equidistanti
    ancoraggioDito.rotation.y = (i * Math.PI * 2) / 3;
    
    ancoraggioDito.position.y = 0.6; 
    calamita.add(ancoraggioDito);
    
    // Il dito curvo applicato alla fine del gancio
    const ditoMesh = new THREE.Mesh(geoDito, matMetalloChiaro);
    ditoMesh.position.set(0.12, 0.05, 0); 
    ditoMesh.rotation.z = -Math.PI / 1.5; 
    ditoMesh.castShadow = true;
    
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
const elBtnStop = document.getElementById('btn-stop');
if (elBtnStart) {
    elBtnStart.addEventListener('click', () => {
        giocoAvviato = true;
        gameOver = false;
        tempoRimasto = 30.0;
        punteggio = 0;
        
        // Nasconde il pulsante start
        elBtnStart.classList.add('hidden');
        if (elBtnStop) elBtnStop.classList.remove('hidden'); // Mostra STOP
        
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

// Gestione pulsante STOP
if (elBtnStop) {
    elBtnStop.addEventListener('click', () => {
        giocoAvviato = false;
        elBtnStop.classList.add('hidden'); // Nasconde se stesso
        if (elBtnStart) elBtnStart.classList.remove('hidden'); // Rimostra START
        
        // Mostra di nuovo le impostazioni e le istruzioni per poter ripartire
        const elIstruzioni = document.getElementById('istruzioni-overlay');
        if (elIstruzioni) elIstruzioni.classList.remove('hidden');
        const elDiffUi = document.getElementById('diff-ui');
        const elThemeUi = document.getElementById('theme-ui');
        if (elDiffUi) elDiffUi.classList.remove('hidden');
        if (elThemeUi) elThemeUi.classList.remove('hidden');
        const separatori = document.querySelectorAll('.separatore');
        separatori.forEach(sep => sep.classList.remove('hidden'));
    });
}


// Logica del gioco
let bersagli = []; 

let bersagliPresi = [];

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

        let posX, posZ, distDallaBase;
        const raggioBaseRobot = 0.9; 
        const margineSicurezza = raggioBaseRobot + raggioVariato + 0.3; 

        do {
            // Estrae coordinate su tutto il quadrato del tavolo
            posX = (Math.random() - 0.5) * 9; 
            posZ = (Math.random() - 0.5) * 9;
            
            // Controlla la distanza dal centro (0,0) per evitare la base
            distDallaBase = Math.sqrt(posX ** 2 + posZ ** 2);
        } while (distDallaBase < margineSicurezza);

        nuovaPallina.position.set(posX, raggioVariato, posZ);

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
        
        // Nasconde lo STOP e ripristina lo START al termine del tempo
        if (elBtnStop) elBtnStop.classList.add('hidden');

        // Mostra la schermata finale di Game Over e mostra i punti
        const elGameOverUi = document.getElementById('game-over-ui');
        const elPuntiFinali = document.getElementById('txt-punti-finali');
        
        if (elPuntiFinali) elPuntiFinali.innerText = punteggio;
        if (elGameOverUi) elGameOverUi.classList.remove('hidden');
        
        return;
    }


    // Movimenti del braccio e della base
    // Salviamo le rotazioni attuali per il rollback in caso di collisione col tavolo
    const vRotBase = gruppoBase.rotation.y;
    const vRotInf = braccioInferiore.rotation.x;
    const vRotSup = braccioSuperiore.rotation.x;

    // Rotazione della base a destra e sinistra (Asse Y globale)
    if (tasti.ArrowRight)  gruppoBase.rotation.y += 0.04;
    if (tasti.ArrowLeft) gruppoBase.rotation.y -= 0.04;
    
    // Piegamento delle braccia avanti e indietro (Asse X locale dei perni)
    if (tasti.ArrowUp)    braccioInferiore.rotation.x += 0.03;
    if (tasti.ArrowDown)  braccioInferiore.rotation.x -= 0.03;
    if (tasti.KeyW)       braccioSuperiore.rotation.x += 0.04;
    if (tasti.KeyS)       braccioSuperiore.rotation.x -= 0.04;

    // Limiti di inclinazione
    braccioInferiore.rotation.x = Math.max(-1.8, Math.min(1.8, braccioInferiore.rotation.x));
    braccioSuperiore.rotation.x = Math.max(-2.4, Math.min(2.4, braccioSuperiore.rotation.x));

    // Calcolo esatto del punto di presa
    // Calcolo della posizione della mano e dello snodo per far si che non possano oltrepassare la superfice del tavolo
    posizioneCalamitaMondo.set(0, 0.85, 0); 
    calamita.localToWorld(posizioneCalamitaMondo);
    snodoCentrale.getWorldPosition(posizioneSnodoMondo);
    
    // Siccome ora le dita sporgono verso l'alto, abbasso la soglia del tavolo per non far bloccare il braccio troppo presto
    if (posizioneCalamitaMondo.y < 0.20 || posizioneSnodoMondo.y < 0.30 ) {
        gruppoBase.rotation.y = vRotBase;
        braccioInferiore.rotation.x = vRotInf;
        braccioSuperiore.rotation.x = vRotSup;
    }

    const tempoAttuale = clock.getElapsedTime();

    if (giocoAvviato) {
        // Movimento sul tavolo delle palline libere
        bersagli.forEach(b => {
            b.position.x += b.userData.velocita * b.userData.dirX;
            b.position.z += b.userData.velocita * b.userData.dirZ;
            
            if (Math.abs(b.position.x) > 4.5) b.userData.dirX *= -1;
            if (Math.abs(b.position.z) > 4.5) b.userData.dirZ *= -1;

            const distDallaBase = Math.sqrt(b.position.x ** 2 + b.position.z ** 2);
            if (distDallaBase < 0.9 + b.userData.raggioCollisione) {
                // Inverte la direzione della pallina (rimbalzo)
                b.userData.dirX *= -1;
                b.userData.dirZ *= -1;

                // Sposta leggermente la pallina fuori per non farla incastrare nel frame successivo
                b.position.x += b.userData.velocita * b.userData.dirX * 1.5;
                b.position.z += b.userData.velocita * b.userData.dirZ * 1.5;
            }
        });

        // Controllo della presa e pulizia globale
        if (bersagliPresi.length === 0) {
            for (let i = bersagli.length - 1; i >= 0; i--) {
                const b = bersagli[i];
                const distanza = posizioneCalamitaMondo.distanceTo(b.position);
                
                if (distanza < (b.userData.raggioCollisione + 0.35)) {
                    punteggio++;
                    tempoRimasto = Math.min(30.0, tempoRimasto + 6.0);

                    // La pallina presa andrà verso le dita
                    b.userData.faseAnimazione = 'attrazione';
                    
                   // Tutte le altre si fermano e aspettano per svanire contemporaneamente
                    bersagli.forEach(altraPallina => {
                        if (altraPallina !== b) {
                            altraPallina.userData.faseAnimazione = 'attesa_sparizione'; 
                        }
                        bersagliPresi.push(altraPallina);
                    });
                    
                    // Svuoto l'array delle palline in movimento
                    bersagli = [];

                    dita.forEach(d => {
                        // Apertura morbida verso l'esterno
                        new TWEEN.Tween(d.position, true).to({ x: 0.2, y: 0.025}, 70).easing(TWEEN.Easing.Quadratic.Out).start();
                        new TWEEN.Tween(d.rotation, true).to({ z: -Math.PI / 1.2 }, 70).easing(TWEEN.Easing.Quadratic.Out).start();


                        setTimeout(() => {
                            new TWEEN.Tween(d.position, true).to({ x: 0.08, y: 0.05 }, 70).easing(TWEEN.Easing.Quadratic.Out).start();
                            new TWEEN.Tween(d.rotation, true).to({ z: -Math.PI / 2.75 }, 70).easing(TWEEN.Easing.Quadratic.Out).start();
                        }, 400);
                        
                        // Chiusura morbida (ritorno alla posizione base)
                        setTimeout(() => {
                            new TWEEN.Tween(d.position, true).to({ x: 0.12, y: 0.05 }, 70).easing(TWEEN.Easing.Quadratic.Out).start();
                            new TWEEN.Tween(d.rotation, true).to({ z: -Math.PI / 1.5 }, 70).easing(TWEEN.Easing.Quadratic.Out).start();
                        }, 1000);
                    });

        
                    
                    break; // Uscita dal loop per evitare di prendere due palline nello stesso istante
                }
            }
        }

        // Animazione di assorbimento e sparizione sincronizzata
        let ricaricaTavolo = false;

        for (let i = bersagliPresi.length - 1; i >= 0; i--) {
            const b = bersagliPresi[i];
            
            if (b.userData.faseAnimazione === 'attesa_sparizione') {
                // Le palline non catturate restano immobili sul posto aspettando il loro turno
            } 
            else if (b.userData.faseAnimazione === 'sparizione' || b.userData.faseAnimazione === 'assorbimento') {
                
                // Solo la pallina catturata si muove seguendo la mano, le altre svaniscono ferme
                if (b.userData.faseAnimazione === 'assorbimento') {
                    b.position.copy(posizioneCalamitaMondo);
                }
                
                // Rimpicciolimento simultaneo per tutte le palline
                b.scale.multiplyScalar(0.9);
                
                if (b.scale.x < 0.05) {
                    scene.remove(b);
                    bersagliPresi.splice(i, 1);
                    if (b.userData.faseAnimazione === 'assorbimento') {
                        ricaricaTavolo = true; 
                    }
                }
            } 
            else if (b.userData.faseAnimazione === 'attrazione') {
                // Vola dritta fra le dita
                b.position.lerp(posizioneCalamitaMondo, 0.4);
                if (b.position.distanceTo(posizioneCalamitaMondo) < 0.1) {
                    b.userData.faseAnimazione = 'incollata';
                    b.userData.tempoIncollatura = tempoAttuale;
                }
            } 
            else if (b.userData.faseAnimazione === 'incollata') {
                // Rimane incollata in mezzo alla pinza
                b.position.copy(posizioneCalamitaMondo);
                
                if (tempoAttuale - b.userData.tempoIncollatura > 0.3) {
                    b.userData.faseAnimazione = 'assorbimento';
                    
                    // Nello stesso esatto momento in cui la pallina presa viene assorbita le altre iniziano a svanire
                    bersagliPresi.forEach(p => {
                        if (p.userData.faseAnimazione === 'attesa_sparizione') {
                            p.userData.faseAnimazione = 'sparizione';
                        }
                    });
                }
            } 
        }
        // Rigenera le palline per continuare a giocare
        if (ricaricaTavolo) {
            generaBersaglio();
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();