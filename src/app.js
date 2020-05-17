var THREE = require("three");
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { Refractor } from 'three/examples/jsm/objects/Refractor.js';

import { WaterRefractionShader } from 'three/examples/jsm/shaders/WaterRefractionShader.js';

import { Fire } from 'three/examples/jsm/objects/Fire.js';

import particleFire from 'three-particle-fire';
particleFire.install({ THREE: THREE });

import {SPE} from '../src/SPE';

// import { Mesh, Sphere, RedIntegerFormat } from 'three';

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

// import { THREEx} from "../dis/threex.atmospherematerial"
//  require( "../dis/threex.geometricglowmesh")


var scene, camera, renderer, orbit;
var perspective_camera;
var ball;
var pointLight;
var earth2;
var glowMesh2;
var backgroundTexture;

var composer, mixer;
const earthRadius = 10;
var candleFire;
var refractor, refractorWaterSmall;
var clock;

var particleGroup, waterRropParticleGroup, waterRropEndGroup;
var fire;
var params;
var waterSmCup;

function init() {
    var view_3d = document.getElementById("view-3d");

    var body = document.body,
        html = document.documentElement;

    var height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);

    view_3d.style.width = 100 + "%"
    view_3d.style.height = height + "px";

    var position_info = view_3d.getBoundingClientRect();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.canvas = view_3d;
    renderer.setSize(position_info.width, position_info.height);
    // renderer.context.disable(renderer.context.DEPTH_TEST);

    // renderer.autoClear = false;

    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor(0x20252f);
    renderer.setClearColor(0x000000);
    renderer.autoClear = false;


    // renderer.setClearColor(0x444444);
    // renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.setClearColor(0x008800)
    view_3d.appendChild(renderer.domElement);

    perspective_camera = new THREE.PerspectiveCamera(45, position_info.width / position_info.height, .01, 1000);

    camera = perspective_camera;
    camera.position.set(earthRadius * 3, 10, earthRadius * 3)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    scene = new THREE.Scene();

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.maxPolarAngle = Math.PI * 0.55;
    orbit.minDistance = 5;
    orbit.maxDistance = 100;

    // orbit.enableRotate = false; 
    // orbit.addEventListener("change", render)
    orbit.saveState();

    scene.add(new THREE.AxesHelper(4))

    // var backgroundTextureLoader = new THREE.TextureLoader();

    // backgroundTextureLoader.load( 'textures/2294472375_24a3b8ef46_o.jpg', function ( texture ) {

    //     texture.mapping = THREE.UVMapping;
    //     backgroundTexture = texture;

    //     scene.background = new THREE.WebGLCubeRenderTarget( 1024, optionsBackground ).fromEquirectangularTexture( renderer, backgroundTexture );

    // } );
    // var optionsBackground = {
    //     generateMipmaps: true,
    //     minFilter: THREE.LinearMipmapLinearFilter,
    //     magFilter: THREE.LinearFilter
    // };

    var matGroundPlane = new THREE.MeshLambertMaterial({color : 0xaaaaaa, side : THREE.DoubleSide, wireframe : false})

    var groundPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 70, 70 ), matGroundPlane );
    groundPlane.rotateX( - Math.PI / 2 );
    groundPlane.position.set( 0, - 12.3, 0 );
    scene.add( groundPlane );

    var matCeiling = new THREE.MeshLambertMaterial({color : 0xeeeeee, side : THREE.BackSide, wireframe : false})

    var ceiling = new THREE.Mesh( new THREE.PlaneBufferGeometry( 70, 70 ), matCeiling );
    ceiling.rotateX( - Math.PI / 2 );
    ceiling.position.set( 0, 22.6, 0 );
    scene.add( ceiling );

    var loaderTextureWall = new THREE.TextureLoader();

    loaderTextureWall.load( 'textures/floor1.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 7, 7 );
        matGroundPlane.map = texture;
        matGroundPlane.needsUpdate = true;
    }, undefined, function(err){ console.log(err) } ); 


    loaderTextureWall.load( 'textures/ceiling_texture.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 15, 15 );
        matCeiling.map = texture;
        matCeiling.needsUpdate = true;
    }, undefined, function(err){ console.log(err) } ); 

    loaderTextureWall.load( 'textures/brick_diffuse.jpg', function (texture) {

        var wallMat = new THREE.MeshLambertMaterial( {
            color : 0xaaaaaa,
            map: texture,
            // bumpMap: bumpTex,
            // bumpScale: 0.3,
            // wireframe : true
        } );
    
        var planeGeo = new THREE.PlaneBufferGeometry( 35, 35 );

        var planeBack1 = new THREE.Mesh( planeGeo, wallMat );
        planeBack1.position.z = - 35 ;
        planeBack1.position.x = - 35 / 2;
        planeBack1.position.y = 5.1;
        scene.add( planeBack1 );

        var planeBack2 = new THREE.Mesh( planeGeo, wallMat );
        planeBack2.position.z = - 35;
        planeBack2.position.x = 35 / 2;
        planeBack2.position.y = 5.1;
        scene.add( planeBack2 );

        var planeRight1 = new THREE.Mesh( planeGeo, wallMat );
        planeRight1.rotateY(Math.PI / 2)
        planeRight1.position.z = - 35 / 2;
        planeRight1.position.x = - 35;
        planeRight1.position.y = 5.1;
        scene.add( planeRight1 );

        var planeRight2 = new THREE.Mesh( planeGeo, wallMat );
        planeRight2.rotateY(Math.PI / 2)
        planeRight2.position.z =  35 / 2;
        planeRight2.position.x = - 35 ;
        planeRight2.position.y = 5.1;
        scene.add( planeRight2 );

        var planeFront1 = new THREE.Mesh( planeGeo, wallMat );
        planeFront1.rotateY(-Math.PI )
        planeFront1.position.z =  35 ;
        planeFront1.position.x = - 35 / 2;
        planeFront1.position.y = 5.1;
        scene.add( planeFront1 );

        var planeFront2 = new THREE.Mesh( planeGeo, wallMat );
        planeFront2.rotateY(-Math.PI )
        planeFront2.position.z =  35;
        planeFront2.position.x = 35 / 2;
        planeFront2.position.y = 5.1;
        scene.add( planeFront2 );

        var planeLeft1 = new THREE.Mesh( planeGeo, wallMat );
        planeLeft1.rotateY(-Math.PI / 2)
        planeLeft1.position.z = - 35 / 2;
        planeLeft1.position.x =  35;
        planeLeft1.position.y = 5.1;
        scene.add( planeLeft1 );

        var planeLeft2 = new THREE.Mesh( planeGeo, wallMat );
        planeLeft2.rotateY(-Math.PI / 2)
        planeLeft2.position.z =  35 / 2;
        planeLeft2.position.x =  35 ;
        planeLeft2.position.y = 5.1;
        scene.add( planeLeft2 );

    }, undefined, function(err){ console.log(err) } ); 

    // scene.add(new THREE.AmbientLight(0x404040));

    // var pointLight = new THREE.PointLight(0xffffff, 1);
    // camera.add(pointLight);

    // scene.add(spotLight1)


    /// from here

    // var params = {
    //     exposure: 1,
    //     bloomStrength: 1.5,
    //     bloomThreshold: 0,
    //     bloomRadius: 0
    // };

    // var gui = new GUI();


    // var geom = new THREE.PlaneGeometry(3, 1, 100, 10)
    // geom.rotateY(Math.PI)

    // // geom.rotateX(.2)

    // var rev = true;

    // var cols = [{
    //     stop: 0,
    //     color: new THREE.Color(0xFF0000)
    // }, {
    //     stop: 0.166666666667,
    //     color: new THREE.Color(0xFF7F00)
    // }, {
    //     stop: 0.333333333333,
    //     color: new THREE.Color(0xFFFF00)
    // }, {
    //     stop: 0.5,
    //     color: new THREE.Color(0x00FF00)
    // }, {
    //     stop: 0.666666666667,
    //     color: new THREE.Color(0x0000FF)
    // }, {
    //     stop: 0.833333333333,
    //     color: new THREE.Color(0x2E2B5F)
    // }, {
    //     stop: 1,
    //     color: new THREE.Color(0x8B00FF)
    // }];


    // // setGradient(geom, cols, 'z', rev);

    // // function setGradient(geometry, colors, axis, reverse) {

    // //     geometry.computeBoundingBox();

    // //     var bbox = geometry.boundingBox;
    // //     var size = new THREE.Vector3().subVectors(bbox.max, bbox.min);

    // //     var vertexIndices = ['a', 'b', 'c'];
    // //     var face, vertex, normalized = new THREE.Vector3(),
    // //         normalizedAxis = 0;

    // //     for (var c = 0; c < colors.length - 1; c++) {

    // //         var colorDiff = 0.1666666666669999
    // //         console.log("colorDiff " + colorDiff )

    // //         for (var i = 0; i < geometry.faces.length; i++) {
    // //             face = geometry.faces[i];
    // //             for (var v = 0; v < 3; v++) {
    // //                 vertex = geometry.vertices[face[vertexIndices[v]]];
    // //                 normalizedAxis = normalized.subVectors(vertex, bbox.min).divide(size)[axis];
    // //                 if (reverse) {
    // //                     normalizedAxis = 1 - normalizedAxis;
    // //                 }
    // //                 if (normalizedAxis >= colors[c].stop && normalizedAxis <= colors[c + 1].stop) {
    // //                     var localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff;
    // //                     face.vertexColors[v] = colors[c].color.clone().lerp(colors[c + 1].color, localNormalizedAxis);
    // //                 }
    // //             }
    // //         }
    // //     }
    // // }

    // var mat = new THREE.MeshBasicMaterial({
    //     vertexColors: THREE.VertexColors,
    //     side: THREE.DoubleSide,
    //     wireframe : false
    // });
    // var obj = new THREE.Mesh(geom, mat);
    // // obj.layers.enable(0);
    // // scene.add(obj);

    // // var renderScene = new RenderPass(scene, camera);
    // // var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    // // bloomPass.threshold = params.bloomThreshold;
    // // bloomPass.strength = params.bloomStrength;
    // // bloomPass.radius = params.bloomRadius;
    // // bloomPass.renderToScreen = true;


    // // composer = new EffectComposer(renderer);
    // // composer.addPass(renderScene);
    // // composer.addPass(bloomPass);


    // var geoCanvas = new THREE.SphereGeometry(earthRadius, 80, 80);

    // // var geoCanvas = new THREE.RingGeometry( 4, 6, 32 );
    // // var geoCanvas = new THREE.TorusKnotGeometry(1-0.25, 0.25, 32*3, 32);
    // // var geoCanvas = new THREE.CubeGeometry(1,1,1, 10, 10, 10);

    // var matCanvas = new THREE.MeshBasicMaterial({color : 0xffffff});
    // var earth = new THREE.Mesh(geoCanvas, matCanvas);

    // var textureLoader = new THREE.TextureLoader();
    // textureLoader.load("../textures/earth_texture.jpg", function(texture){
    //     matCanvas.map = texture;
    //     matCanvas.needsUpdate = true;
    // }, undefined, function(err){ console.log(err)});

    // var glowTropo1 = new THREEx.GeometricGlowMesh(earth)
    // var glowTropo2 = new THREEx.GeometricGlowMesh(earth)

    // glowTropo1.outsideMesh.material.uniforms.glowColor.value.set(0x00613e)
    // glowTropo2.outsideMesh.material.uniforms.glowColor.value.set(0xff613e)

    // new THREEx.addAtmosphereMaterial2DatGui(glowTropo1.outsideMesh.material, gui)	
    // new THREEx.addAtmosphereMaterial2DatGui(glowTropo2.outsideMesh.material, gui)	

    // scene.add(glowTropo1.object3d)
    // scene.add(glowTropo2.object3d)

    // // stratosphere..

    // var geoStratoEarth = new THREE.SphereGeometry(earthRadius + 1.5, 80, 80)
    // var earthStrato = new THREE.Mesh(geoStratoEarth, matCanvas);

    // var glowStrato1 = new THREEx.GeometricGlowMesh(earthStrato)
    // var glowStrato2 = new THREEx.GeometricGlowMesh(earthStrato)

    // glowStrato1.outsideMesh.material.uniforms.glowColor.value.set(0xf2312e)
    // glowStrato2.outsideMesh.material.uniforms.glowColor.value.set(0xf161fe)

    // scene.add(glowStrato1.object3d)
    // scene.add(glowStrato2.object3d)

    // glowStrato1.outsideMesh.material.uniforms.coeficient.value	= 0.09
    // glowStrato1.outsideMesh.material.uniforms.power.value		= 1.9

    // glowStrato2.outsideMesh.material.uniforms.coeficient.value	= 0.0
    // glowStrato2.outsideMesh.material.uniforms.power.value		= 1.2


    // // new THREEx.addAtmosphereMaterial2DatGui(glowStrato1.outsideMesh.material, gui)	
    // // new THREEx.addAtmosphereMaterial2DatGui(glowStrato2.outsideMesh.material, gui)	


    // // Mesosphere

    // var geoMesoEarth = new THREE.SphereGeometry(earthRadius + 2.5, 80, 80);
    // var earthMeso = new THREE.Mesh(geoMesoEarth, matCanvas);

    // var glowMeso1 = new THREEx.GeometricGlowMesh(earthMeso);
    // var glowMeso2 = new THREEx.GeometricGlowMesh(earthMeso);

    // glowMeso1.outsideMesh.material.uniforms.glowColor.value.set(0x123f2e);
    // glowMeso2.outsideMesh.material.uniforms.glowColor.value.set(0x412fff);

    // scene.add(glowMeso1.object3d);
    // scene.add(glowMeso2.object3d);

    // glowMeso1.outsideMesh.material.uniforms.coeficient.value = 0.09;
    // glowMeso1.outsideMesh.material.uniforms.power.value	= 1.9

    // glowMeso2.outsideMesh.material.uniforms.coeficient.value = 0.0;
    // glowMeso2.outsideMesh.material.uniforms.power.value	= 1.2;

    // // new THREEx.addAtmosphereMaterial2DatGui(glowStrato1.outsideMesh.material, gui)	
    // // new THREEx.addAtmosphereMaterial2DatGui(glowStrato2.outsideMesh.material, gui)	

    // // Thermosphere

    // var geoThermalEarth = new THREE.SphereGeometry(earthRadius + 3.5, 80, 80);
    // var earthThermo = new THREE.Mesh(geoThermalEarth, matCanvas);

    // var glowThermo1 = new THREEx.GeometricGlowMesh(earthThermo);
    // var glowThermo2 = new THREEx.GeometricGlowMesh(earthThermo);

    // glowThermo1.outsideMesh.material.uniforms.glowColor.value.set(0xff0000);
    // glowThermo2.outsideMesh.material.uniforms.glowColor.value.set(0x412fff);

    // scene.add(glowThermo1.object3d);
    // scene.add(glowThermo2.object3d);

    // glowThermo1.outsideMesh.material.uniforms.coeficient.value = 0.09;
    // glowThermo1.outsideMesh.material.uniforms.power.value	= 1.9

    // glowThermo2.outsideMesh.material.uniforms.coeficient.value = 0.0;
    // glowThermo2.outsideMesh.material.uniforms.power.value	= 1.2;

    // new THREEx.addAtmosphereMaterial2DatGui(glowThermo1.outsideMesh.material, gui)	
    // new THREEx.addAtmosphereMaterial2DatGui(glowThermo2.outsideMesh.material, gui)	


    // // var geoStratoEarth = new THREE.SphereGeometry(earthRadius + 2, 80, 80)
    // // var earthStrato = new THREE.Mesh(geoStratoEarth, matCanvas);

    // // var glowStrato1 = new THREEx.GeometricGlowMesh(earthStrato)
    // // var glowStrato2 = new THREEx.GeometricGlowMesh(earthStrato)

    // // glowStrato1.outsideMesh.material.uniforms.glowColor.value.set(0xf2312e)
    // // glowStrato2.outsideMesh.material.uniforms.glowColor.value.set(0xf161fe)

    // // scene.add(glowStrato1.object3d)
    // // scene.add(glowStrato2.object3d)


    // // var geoEarth2  = new THREE.SphereGeometry(6, 30, 30);
    // // var mat2 = new THREE.MeshBasicMaterial({color : 0xff3302});
    // // // var geoEarth2 = new THREE.TorusGeometry( 8, .1, 16, 100 );

    // // earth2 = new THREE.Mesh(geoEarth2, mat2);
    // // glowMesh2 = new THREEx.GeometricGlowMesh(earth2)


    // // scene.add(glowMesh3.object3d)
    // // scene.add(glowMesh2.object3d)

    // // var outsideUniforms2	= glowMesh2.outsideMesh.material.uniforms
    // // outsideUniforms2.glowColor.value.set(0x0016bb)
    // // var outsideUniforms3	= glowMesh3.outsideMesh.material.uniforms
    // // outsideUniforms3.glowColor.value.set(0xe52525)

    // // new THREEx.addAtmosphereMaterial2DatGui(glowTropo1.outsideMesh.material, gui)	
    // // new THREEx.addAtmosphereMaterial2DatGui(glowMesh2.outsideMesh.material, gui)	
    // // new THREEx.addAtmosphereMaterial2DatGui(glowMesh3.outsideMesh.material, gui)	

    // // canvas.visible = false;
    // scene.add(earth);

    // to here

    var paramsForCupMat = {
        color: 0x93d9ff,
        transparency: 1,
        envMapIntensity: 1,
        lightIntensity: 1,
        exposure: 1
    };

    // scene.background = textureCube;
    // var material1 = new THREE.MeshPhysicalMaterial( {
    //     color: params.color,
    //     metalness: 0,
    //     roughness: 0,
    //     alphaMap: texture,
    //     alphaTest: 0.5,
    //     // envMap: hdrCubeRenderTarget.texture,
    //     envMap: textureCube,
    //     envMapIntensity: params.envMapIntensity,
    //     depthWrite: false,
    //     transparency: params.transparency, // use material.transparency for glass materials
    //     opacity: 1,                        // set material.opacity to 1 when material.transparency is non-zero
    //     transparent: true,
    //     refractionRatio: 0.98,
    // } );

    // var material1 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 } );

    var material1 = new THREE.MeshLambertMaterial({
        color: paramsForCupMat.color,
        // metalness: 0,
        // roughness: 0,
        // alphaMap: texture,
        // alphaTest: 0.5,
        // envMap: hdrCubeRenderTarget.texture,
        // envMapIntensity: params.envMapIntensity,
        // depthWrite: false,
        // transparency: params.transparency, // use material.transparency for glass materials
        opacity: .75,                        // set material.opacity to 1 when material.transparency is non-zer   o
        transparent: true,
        // refractionRatio: 0.98,
        //  reflectivity: 0.9

        // reflectivity : 1
        // wireframe : true
    });

    // material1.envMap.mapping = THREE.CubeRefractionMapping
    // var material1 = new THREE.MeshPhongMaterial( { color: 0xccddff, roughness : 0, refractionRatio: 0.98, reflectivity: 0.9 } );

    var gltf_loader = new GLTFLoader();
    gltf_loader.load("models/cup.glb",
        function (gltf) {
            var model = gltf.scene;
            model.scale.set(200, 200, 200)
            model.position.set(0, 2.22, 0)

            model.children[0].material = material1;

            scene.add(model);

            var smallCup = new THREE.Mesh(model.children[0].geometry.clone(), model.children[0].material.clone());
            smallCup.scale.set(120, 120, 120)
            smallCup.material.color.setRGB(255 / 255, 80 / 255, 31 / 255)
            smallCup.position.set(-6.4, 1.25, 0);
            scene.add(smallCup);

            var geoWaterSm = new THREE.CylinderBufferGeometry(1.9 * (120 / 200), 1.9 * (120 / 200), 1.2 * (120 / 200), 20, 2);
            geoWaterSm.openEnded = true;
            var matWaterSm = new THREE.MeshLambertMaterial({
                color: 0x63c8ff, transparent: true, opacity: .3,
                // side: THREE.DoubleSide,
                // depthWrite: false
            })
            var waterSm = new THREE.Mesh(geoWaterSm, matWaterSm);
            // water.frustumCulled = false;
            waterSm.position.set(-6.4, .5, 0);
            scene.add(waterSm);

            render();

        }, undefined,  function (err) {   console.error(err);    }
    )

    var stove_loader = new GLTFLoader();
    stove_loader.load("models/stove.glb",
        function (gltf) {

            var matStove = new THREE.MeshLambertMaterial({ color: 0x8e8e8e, wireframe: false });

            var stove = gltf.scene;
            stove.scale.set(200, 200, 200)
            stove.position.set(0, 4.14, 0)
            stove.children[0].material = matStove;

            scene.add(stove);

            render();

        }, undefined,
        function (err) { console.error(err); }
    )

    // scene.background = 0x009900;
    // scene.add(earth2);

    // var matRod = new THREE.MeshBasicMaterial({ color: 0xffff2b, transparent: true, opacity: 5 });
    // var geoRod = new THREE.BoxBufferGeometry(.1, .1, 10, 2, 2, 2);
    // var rod = new THREE.Mesh(geoRod, matRod);
    // scene.add(rod);

    // animate();

    // var spotLight1 = new THREE.SpotLight( 0xffffff, 2 );
    // spotLight1.position.set( 4,  4, 4);
    // // spotLight1.angle = Math.PI / 6;
    // scene.add( spotLight1 );

    // var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    // // hemiLight.color.setHSL(0.6, 1, 0.6);
    // hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    // hemiLight.position.set(4, 4, 4);

    // scene.add(hemiLight)

    // var spotLight1 = new THREE.SpotLight( 0xffffff, params.lightIntensity );
    // spotLight1.position.set( 50, 100, 50 );
    // spotLight1.angle = Math.PI / 4;
    // scene.add( spotLight1 );

    // var spotLight2 = new THREE.SpotLight( 0xffffff, params.lightIntensity );
    // spotLight2.position.set( -50, -100, -50 );
    // spotLight2.angle = Math.PI / 4;
    // scene.add( spotLight2 );

    var light = new THREE.HemisphereLight(0xffffee, 0xa5a5a5, 1);
    light.position.set(0, 0, 3)
    scene.add(light);

    // var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    // scene.add(ambientLight);

    // var pointLight = new THREE.PointLight(0xffffff, 0.8);
    // // camera.add(pointLight);
    // scene.add(pointLight);

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("textures/wood_texture_2.jpg",
        function (texture) {

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            texture.repeat.set(3, 2);

            var tableLoader = new GLTFLoader();

            //   a resource
            tableLoader.load(
                'models/simple_table.glb',
                function (gltf) {
                    var table = gltf.scene;
                    table.scale.set(6, 6, 5.5);

                    var materialTable = new THREE.MeshLambertMaterial({ color: 0xcccccc, map: texture, wireframe: false });

                    var tableMesh = table.children[0]

                    tableMesh.material = materialTable;

                    var materialForLegs = new THREE.MeshLambertMaterial({ color: 0x999999, map: texture, wireframe: false });
                    tableMesh.children[0].material = materialForLegs;
                    tableMesh.children[1].material = materialForLegs;
                    tableMesh.children[2].material = materialForLegs;
                    tableMesh.children[3].material = materialForLegs;
                    tableMesh.children[4].material = materialForLegs;

                    table.translateZ(-1.7)
                    table.translateY(-12.2)

                    scene.add(table);

                }, undefined, function (error) { console.log('An error happened'); }
            );
        });

    var fireRadius = 0.2;
    var fireHeight = 5;
    var particleCount = 800;

    var geometry0 = new particleFire.Geometry(fireRadius, fireHeight, particleCount);
    var material0 = new particleFire.Material({ color: 0xff2200, depthWrite: false });
    material0.setPerspective(camera.fov, height);
    candleFire = new THREE.Points(geometry0, material0);
    candleFire.position.set(0, 1, 0)
    scene.add(candleFire);

    // water

    var geoWater = new THREE.CylinderBufferGeometry(1.9, 1.9, 1.2, 20, 2);
    geoWater.openEnded = true;
    var matWater = new THREE.MeshLambertMaterial({
        color: 0x63c8ff, transparent: true, opacity: .3,
        // side: THREE.DoubleSide,
        // depthWrite: false
    })
    var water = new THREE.Mesh(geoWater, matWater);
    // water.frustumCulled = false;
    water.position.set(0, 5, 0);
    scene.add(water);

    clock = new THREE.Clock();

    var refractorGeometry = new THREE.CircleBufferGeometry(1.9, 20);

    refractor = new Refractor(refractorGeometry, {
        color: 0x63c8ff,
        textureWidth: 512,
        textureHeight: 512,
        shader: WaterRefractionShader,
        // transparent: true, 
        // alphaTest: 0.4,
        depthWrite: true,
        // wireframe : true
        side: THREE.DoubleSide,
    });
    // refractor.frustumCulled = false;

    var refractorGeometrySm = new THREE.CircleBufferGeometry(1.9 * (120 / 200), 20);
    refractorWaterSmall = new Refractor(refractorGeometrySm, {
        color: 0x63c8ff,
        textureWidth: 512,
        textureHeight: 512,
        shader: WaterRefractionShader,
        // transparent: true, 
        // alphaTest: 0.4,
        depthWrite: true,
        // wireframe : true
        side: THREE.DoubleSide,
    });


    refractor.position.set(0, 5.62, 0);
    refractor.rotateX(-Math.PI / 2)

    // refractorWaterSmall.scale.set(  120/ 200,120/ 200, 0)
    refractorWaterSmall.position.set(-6.4, .89, 0)
    refractorWaterSmall.rotateX(-Math.PI / 2)

    var dudvMap = new THREE.TextureLoader().load('textures/waterdudv.jpg', function () {
        animate();
    });

    dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

    refractor.material.uniforms["tDudv"].value = dudvMap;
    refractorWaterSmall.material.uniforms["tDudv"].value = dudvMap;
    // refractor.material.needsUpdate = true;

    scene.add(refractor);
    scene.add(refractorWaterSmall);

    var candleBaseLoader = new GLTFLoader();
    candleBaseLoader.load("models/candle_base.glb",
        function (gltf) {

            var matCandleBase = new THREE.MeshLambertMaterial({ color: 0xbbbbbb, wireframe: false });

            var candleBase = gltf.scene;
            candleBase.scale.set(200, 200, 200)
            // candleBase.position.set(0, 4.14, 0)
            candleBase.children[0].material = matCandleBase;
            scene.add(candleBase);

        }, undefined, function (err) { console.error(err); }
    )

    var plateLoader = new GLTFLoader();
    plateLoader.load("models/plate.glb",
        function (gltf) {
            var matPlate = new THREE.MeshLambertMaterial({ color: 0x9e9480, wireframe: false });

            var plate = gltf.scene;
            plate.scale.set(200, 200, 230)
            plate.position.set(-.5, 4.4, 0)
            plate.children[0].material = matPlate;

            scene.add(plate);

        }, undefined, function (err) { console.error(err); }
    )

    params = {
        color1: '#ffffff',
        color2: '#ffa000',
        color3: '#000000',
        colorBias: 0.8,
        burnRate: 0.35,
        diffuse: 1.33,
        viscosity: 0.25,
        expansion: - 0.25,
        swirl: 50.0,
        drag: 0.35,
        airSpeed: 12.0,
        windX: 0.0,
        windY: 0.75,
        speed: 500.0,
        massConservation: false
    };

    params.color1 = 0xd2d2d2;
    params.color2 = 0xd7d7d7;
    params.color3 = 0x000000;
    params.windX = - 0.05;
    params.windY = 0.15;
    params.colorBias = 0.95;
    params.burnRate = 0.0;
    params.diffuse = 1.5;
    params.viscosity = 0.25;
    params.expansion = 0.2;
    params.swirl = 3.75;
    params.drag = 0.4;
    params.airSpeed = 18.0;
    params.speed = 500.0;
    params.massConservation = false;

    var plane = new THREE.PlaneBufferGeometry(3, 3);

    fire = new Fire(plane, {
        textureWidth: 512,
        textureHeight: 512,
        debug: false
    });
    fire.position.z = - 2;
    fire.position.y = 3;

    fire.clearSources();
    fire.addSource(0.5, 0.1, 0.1, 1.0, 0.0, 1.0);


    updateAll();
    // scene.add( fire );


    // water vapour
    particleGroup = new SPE.Group({
        texture: {
            value: THREE.ImageUtils.loadTexture('textures/smokeparticle.png')
        }
    });

    var emitter = new SPE.Emitter({

        maxAge: {
            value: 1
        },

        position: {
            value: new THREE.Vector3(0, 7, 0),
            spread: new THREE.Vector3(2, 0, 2)
        },

        acceleration: {
            value: new THREE.Vector3(0, .2, 0),
            spread: new THREE.Vector3(1, 0, 1)
        },

        velocity: {
            value: new THREE.Vector3(0, 2.8, 0),
            spread: new THREE.Vector3(1, 1, 1)
        },

        color: {
            value: [new THREE.Color(.7, .7, .7)]
        },

        size: {
            value: 4
        },

        particleCount: 40,
        opacity: { value: [0, 0, 0.2, 0] },

    });

    particleGroup.addEmitter(emitter);
    scene.add(particleGroup.mesh);

    waterRropParticleGroup = new SPE.Group({
        texture: {
            value: THREE.ImageUtils.loadTexture('textures/raindrop.png')
        }
    });


    var waterDropEmitter = new SPE.Emitter({
        maxAge: {
            value: 7
        },
        position: {
            value: new THREE.Vector3(4, 12.73, .2),
            spread: new THREE.Vector3( 0, 0 , 4  )
        },

        acceleration: {
            value: new THREE.Vector3(0, 0, 0),
            spread: new THREE.Vector3( 0, 0, 0 )
        },

        velocity: {
            value: new THREE.Vector3(-4.5 / 3 , -2.1 / 3, 0),
            spread: new THREE.Vector3(0, 0, 0)
        },

        color: {
            value: [ new THREE.Color( 0xffffff ) ]
        },

        size: {
            value: .7
        },

        particleCount: 15,
        activeMultiplier: 1,
        opacity: { value: [0, 0, 0.5, 0] },
    }); 

    waterRropEndGroup = new SPE.Group({
        texture: {
            value: THREE.ImageUtils.loadTexture('textures/raindrop2.png')
        }
    });


    var waterDropEndEmitter = new SPE.Emitter({
        maxAge: {
            value: 2
        },
        position: {
            value: new THREE.Vector3(-6.2, 10, 0),
            spread: new THREE.Vector3( .5, 0 , 2  )
        },

        acceleration: {
            value: new THREE.Vector3(0, -1.5, 0),
            spread: new THREE.Vector3( 0, 0, 0 )
        },

        velocity: {
            value: new THREE.Vector3(0, -2, 0),
            spread: new THREE.Vector3(0, 0, 0)
        },

        color: {
            value: [ new THREE.Color( 0xffffff ) ]
        },

        size: {
            value: 1
        },

        particleCount: 15,
        activeMultiplier: 1,
        opacity: { value: [0, 0, 0.5, 0] },
    }); 

    waterRropParticleGroup.addEmitter( waterDropEmitter );
    waterRropEndGroup.addEmitter( waterDropEndEmitter );

    waterRropParticleGroup.mesh.frustumCulled = false;
    waterRropEndGroup.mesh.frustumCulled = false;
    scene.add(waterRropParticleGroup.mesh);
    scene.add(waterRropEndGroup.mesh);


    window.addEventListener( 'resize', onWindowResized, false );

}

function updateAll() {

    updateColor1(params.color1);
    updateColor2(params.color2);
    updateColor3(params.color3);
    updateColorBias(params.colorBias);
    updateBurnRate(params.burnRate);
    updateDiffuse(params.diffuse);
    updateViscosity(params.viscosity);
    updateExpansion(params.expansion);
    updateSwirl(params.swirl);
    updateDrag(params.drag);
    updateAirSpeed(params.airSpeed);
    updateWindX(params.windX);
    updateWindY(params.windY);
    updateSpeed(params.speed);
    updateMassConservation(params.massConservation);

}

function updateColor1(value) {

    fire.color1.set(value);

}

function updateColor2(value) {

    fire.color2.set(value);

}

function updateColor3(value) {

    fire.color3.set(value);

}

function updateColorBias(value) {

    fire.colorBias = value;

}

function updateBurnRate(value) {

    fire.burnRate = value;

}

function updateDiffuse(value) {

    fire.diffuse = value;

}

function updateViscosity(value) {

    fire.viscosity = value;

}

function updateExpansion(value) {

    fire.expansion = value;

}

function updateSwirl(value) {

    fire.swirl = value;

}

function updateDrag(value) {

    fire.drag = value;

}

function updateAirSpeed(value) {

    fire.airSpeed = value;

}

function updateWindX(value) {

    fire.windVector.x = value;

}

function updateWindY(value) {

    fire.windVector.y = value;

}

function updateSpeed(value) {

    fire.speed = value;

}

function updateMassConservation(value) {

    fire.massConservation = value;

}


function animate() {
    renderer.clear();

    requestAnimationFrame(animate);

    var delta = clock.getDelta();
    refractor.material.uniforms["time"].value += delta;
    refractorWaterSmall.material.uniforms["time"].value += delta;

    candleFire.material.update(delta);
    particleGroup.tick(delta);
    waterRropParticleGroup.tick(delta);
    waterRropEndGroup.tick(delta);


    




    renderer.render(scene, camera);
}

function render() {
    // pointLight.position.copy(camera.position);
    renderer.render(scene, camera);


}


var THREEx = THREEx || {}

THREEx.dilateGeometry = function (geometry, length) {
    // gather vertexNormals from geometry.faces
    var vertexNormals = new Array(geometry.vertices.length);
    geometry.faces.forEach(function (face) {
        if (face instanceof THREE.Face4) {
            vertexNormals[face.a] = face.vertexNormals[0];
            vertexNormals[face.b] = face.vertexNormals[1];
            vertexNormals[face.c] = face.vertexNormals[2];
            vertexNormals[face.d] = face.vertexNormals[3];
        } else if (face instanceof THREE.Face3) {
            vertexNormals[face.a] = face.vertexNormals[0];
            vertexNormals[face.b] = face.vertexNormals[1];
            vertexNormals[face.c] = face.vertexNormals[2];
        } else console.assert(false);
    });
    // modify the vertices according to vertextNormal
    geometry.vertices.forEach(function (vertex, idx) {
        var vertexNormal = vertexNormals[idx];
        vertex.x += vertexNormal.x * length;
        vertex.y += vertexNormal.y * length;
        vertex.z += vertexNormal.z * length;
    });
};


THREEx.createAtmosphereMaterial = function () {
    var vertexShader = [
        'varying vec3	vVertexWorldPosition;',
        'varying vec3	vVertexNormal;',

        'varying vec4	vFragColor;',

        'void main(){',
        '	vVertexNormal	= normalize(normalMatrix * normal);',

        '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

        '	// set gl_Position',
        '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}',

    ].join('\n')
    var fragmentShader = [
        'uniform vec3	glowColor;',
        'uniform float	coeficient;',
        'uniform float	power;',

        'varying vec3	vVertexNormal;',
        'varying vec3	vVertexWorldPosition;',

        'varying vec4	vFragColor;',

        'void main(){',
        '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
        '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
        '	viewCameraToVertex	= normalize(viewCameraToVertex);',
        '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
        '	gl_FragColor		= vec4(glowColor, intensity);',
        '}',
    ].join('\n')

    // create custom material from the shader code above
    //   that is within specially labeled script tags
    var material = new THREE.ShaderMaterial({
        uniforms: {
            coeficient: {
                type: "f",
                value: 1.0
            },
            power: {
                type: "f",
                value: 2
            },
            glowColor: {
                type: "g",
                value: new THREE.Color('pink')
            },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        // color : 0xf00ff3,
        blending: THREE.AdditiveBlending,
        // transparent	: true,
        // opacity : .4,
        depthWrite: true,

    });
    return material
}

THREEx.GeometricGlowMesh = function (mesh) {
    var object3d = new THREE.Object3D

    // var geometry = new THREE.RingGeometry( 3, 5, 32 );

    // mesh.scale.set(1.2, 1.2, 1.2);
    var geometry = mesh.geometry.clone()
    // geometry.scale.set(1.2, 1.2, 1.2)

    THREEx.dilateGeometry(geometry, .1)
    var material = THREEx.createAtmosphereMaterial()
    material.uniforms.glowColor.value = new THREE.Color('cyan')
    material.uniforms.coeficient.value = 1
    material.uniforms.power.value = 2
    var insideMesh = new THREE.Mesh(geometry, material);
    insideMesh.scale.set(1.2, 1.2, 1.2)
    // object3d.add( insideMesh );

    // var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );

    var geometry = mesh.geometry.clone()

    // var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );

    THREEx.dilateGeometry(geometry, 0.7)
    var material = THREEx.createAtmosphereMaterial()
    material.uniforms.glowColor.value = new THREE.Color()
    material.uniforms.coeficient.value = 0.1
    material.uniforms.power.value = 1.2
    material.side = THREE.BackSide
    var outsideMesh = new THREE.Mesh(geometry, material);
    outsideMesh.scale.set(1.1, 1.1, 1.1)

    object3d.add(outsideMesh);


    // expose a few variable
    this.object3d = object3d
    this.insideMesh = insideMesh
    this.outsideMesh = outsideMesh
}


THREEx.addAtmosphereMaterial2DatGui = function (material, datGui) {
    datGui = datGui || new dat.GUI()
    var uniforms = material.uniforms
    // options
    var options = {
        coeficient: uniforms['coeficient'].value,
        power: uniforms['power'].value,
        glowColor: '#' + uniforms.glowColor.value.getHexString(),
        presetFront: function () {
            options.coeficient = 1
            options.power = 2
            onChange()
        },
        presetBack: function () {
            options.coeficient = 0.5
            options.power = 4.0
            onChange()
        },
    }
    var onChange = function () {
        uniforms['coeficient'].value = options.coeficient
        uniforms['power'].value = options.power
        uniforms.glowColor.value.set(options.glowColor);
    }
    onChange()

    // config datGui
    datGui.add(options, 'coeficient', 0.0, 2)
        .listen().onChange(onChange)
    datGui.add(options, 'power', 0.0, 5)
        .listen().onChange(onChange)
    datGui.addColor(options, 'glowColor')
        .listen().onChange(onChange)
    datGui.add(options, 'presetFront')
    datGui.add(options, 'presetBack')
}


function onWindowResized() {

    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}


init()

