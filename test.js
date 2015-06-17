<html><head>
<title>SpaceShip</title>
<meta http-equiv="content-type" content="text/html; charset=windows-1252">

<script type="text/javascript" src="gl-matrix.js"></script>
<script type="text/javascript" src="webgl-utils.js"></script>
<script type="text/javascript" src="game-utils.js"></script>
<script type="text/javascript" src="fbo.js"></script>
<script type="text/javascript" src="heightfield.js"></script>
<script type="text/javascript" src="background.js"></script>
<script type="text/javascript" src="spaceship.js"></script>
<script type="text/javascript" src="enemy.js"></script>
<script type="text/javascript" src="shoot.js"></script>


<script id="heightfield-vs" type="x-shader/x-vertex">
    // *** le vertex shader ***
    attribute vec3 aVertexPosition; // la position du sommet
    attribute vec2 aVertexCoord; // sa coordonnee de texture

    varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee

    void main(void) {
        // projection de la position
        gl_Position = vec4(aVertexPosition, 1.0);

        // stockage de la coordonnee de texture
        vTextureCoord = aVertexCoord;
    }
</script>

<script id="heightfield-fs" type="x-shader/x-fragment">  // fragment : Calcule le champ de hauteur
// *** le fragment shader ***
precision highp float; // precision des nombres flottant

uniform vec2 uOffset;
uniform float uAmplitude; // amplitude du bruit
uniform float uFrequency; // frequence du bruit
uniform float uPersistence; // persistence du bruit

varying vec2 vTextureCoord; // recuperation de la coord rasterisee

float hash(vec2 p) {
    // pseudo random fonction
    float h = dot(mod(p,vec2(100.0)),vec2(127.1,311.7));
    return -1.0 + 2.0*fract(sin(h)*43758.5453123);
}

float vnoise(in vec2 p) { // calcul bruit
    // genere une valeur random sur une position spécifique d'une grille
    // pris sur shadertoy
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( hash( i + vec2(0.0,0.0) ),
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ),
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

float fractalNoise(in vec2 p) {
    const int nb = 5; // nb octave
    float f = uFrequency; // frequency
    float a = uAmplitude; // amplitude
    float e = uPersistence; // persistence

    float n = 0.0;
    for(int i=0;i<nb;++i) {
        n = n + a*vnoise(p*f);
        f = 2.0*f;
        a = a*e;
    }
    return n;
}

void main(void) {
    vec2 p = vTextureCoord*2.0-vec2(1.0); // coordonnees
    float n = fractalNoise(p+uOffset)*0.5+0.5; // bruit

    gl_FragColor = vec4(vec3(n),1.0);

}
</script>

<script id="background-vs" type="x-shader/x-vertex">
    // *** le vertex shader ***
    attribute vec3 aVertexPosition; // la position du sommet
    attribute vec2 aVertexCoord; // sa coordonnee de texture

    varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee

    void main(void) {
        // projection de la position
        gl_Position = vec4(aVertexPosition, 1.0);

        // stockage de la coordonnee de texture
        vTextureCoord = aVertexCoord;
    }
</script>

<script id="background-fs" type="x-shader/x-fragment">
// *** le fragment shader ***
precision highp float; // precision des nombres flottant

uniform sampler2D uHeightfield; // la texture de hauteurs
uniform vec2 uTextureSize; // la taille de la texture
varying vec2 vTextureCoord; // recuperation de la coord rasterisee

vec3 shade(in vec3 n,in float d) {
    vec2 xy = vTextureCoord.xy*2.0-vec2(1.0);
    vec3 v = -normalize(vec3(xy.x,xy.y,1.0)); // vecteur vue
    vec3 l = normalize(vec3(-0.3,0.0,1.0)); // vecteur lumière (pourrait varier au cours du temps pour de meilleurs effets)

    // TODO : le shading !
    // la fonction prend en entrée la normale du terrain et sa profondeur

        // TODO: implementer Phong
        vec3 Kd = vec3(0.3515625, 0.2734375, 0.99609375); //couleur d'ambiance
        vec3 Ka = vec3(0.0, 0.0, 0.0);
        vec3 Ks = vec3(0.3515625, 0.2734375, 0.99609375); //couleur spéculaire
        vec3 kt = texture2D(uHeightfield, vTextureCoord).xyz;

        vec3 li = vec3(0.8, 0.2, 0.8);

        vec3 r = reflect(l,n);

        float q = 0.2;

        vec3 diff = Kd * max(dot(n,l),0.0);
        vec3 s = Ks * pow(max(dot(v,r), 0.0), q);
        //vec3 Tmp = vPosition.xyz;
        d = max(d, 0.000001);

        //vec3 var1 = Kd * (dot(normal, l)) * Ka * pow(dot(v, r), 30.0) + (li);
        vec3 var1 = li*((Ka + diff + s)/d);

    return var1;
}

vec3 computeNormal() { // calcule la normale
    const float scale = 20.0;

    vec2 ps = 1.0/uTextureSize;
    float xp = texture2D(uHeightfield,vTextureCoord+vec2( ps.x,0.0)).x;
    float xm = texture2D(uHeightfield,vTextureCoord+vec2(-ps.x,0.0)).x;
    float yp = texture2D(uHeightfield,vTextureCoord+vec2(0.0, ps.y)).x;
    float ym = texture2D(uHeightfield,vTextureCoord+vec2(0.0,-ps.y)).x;

    float gx = 0.5*(xp-xm)*scale;
    float gy = 0.5*(yp-ym)*scale;

    vec3 v1 = normalize(vec3(1.0,0.0,gx));
    vec3 v2 = normalize(vec3(0.0,1.0,gy));

    return cross(v1,v2);
}

void main(void) { // carré rouge
    float d = texture2D(uHeightfield,vTextureCoord).x;
    vec3 n = computeNormal();
    vec3 s = shade(n,d);
    gl_FragColor = vec4(s,1.0);

}
</script>
<!-- ===========================================================================================
                SPACESHIP
 ===========================================================================================  -->

<script id="spaceship-vs" type="x-shader/x-vertex">
    // *** le vertex shader ***
    attribute vec3 aVertexPosition; // la position du sommet
    attribute vec2 aVertexCoord; // sa coordonnee de texture

    uniform vec2 uPosition; // position du vaisseau
    varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee

    void main(void) {
        // projection de la position
        gl_Position = vec4(aVertexPosition+vec3(uPosition,0.0), 1.0);

        // stockage de la coordonnee de texture
        vTextureCoord = aVertexCoord;
    }
</script>
<script id="spaceship-fs" type="x-shader/x-fragment"> // met du rouge dans le carré
// *** le fragment shader ***
precision highp float; // precision des nombres flottant

varying vec2 vTextureCoord; // recuperation de la coord rasterisee
uniform sampler2D uMaTexture; // la texture du vaisseau en entree

void main(void) {
    // couleur par defaut du vaisseau... a changer
    //gl_FragColor = vec4(1.0,1.0,0.0,1.0);
     // la couleur est attribuee au fragment courant
    gl_FragColor = texture2D(uMaTexture,vTextureCoord);
}
</script>

<!-- ===========================================================================================
                ENEMY
 ===========================================================================================  -->

<script id="enemy-vs" type="x-shader/x-vertex">
    // *** le vertex shader ***
    attribute vec3 aVertexPosition; // la position du sommet
    attribute vec2 aVertexCoord; // sa coordonnee de texture

    uniform vec2 uPosition; // position du vaisseau
    varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee

    void main(void) {
        // projection de la position
        gl_Position = vec4(aVertexPosition+vec3(uPosition,0.0), 1.0);

        // stockage de la coordonnee de texture
        vTextureCoord = aVertexCoord;
    }
</script>
<script id="enemy-fs" type="x-shader/x-fragment"> // met du rouge dans le carré
// *** le fragment shader ***
precision highp float; // precision des nombres flottant

varying vec2 vTextureCoord; // recuperation de la coord rasterisee
uniform sampler2D uMaTexture; // la texture du vaisseau en entree

void main(void) {
    // couleur par defaut du vaisseau... a changer
    //gl_FragColor = vec4(1.0,1.0,0.0,1.0);
     // la couleur est attribuee au fragment courant
    gl_FragColor = texture2D(uMaTexture,vTextureCoord);
}
</script>

<!-- ========================================================================================
                SHOOT
 =========================================================================================== -->
<script id="shoot-vs" type="x-shader/x-vertex">
    // *** le vertex shader ***
    attribute vec3 aVertexPosition; // la position du sommet
    attribute vec2 aVertexCoord; // sa coordonnee de texture

    uniform vec2 uPosition; // position du vaisseau
    varying vec2 vTextureCoord; // on souhaite rasteriser la coordonnee

    void main(void) {
        // projection de la position
        gl_Position = vec4(aVertexPosition+vec3(uPosition,0.0), 1.0);

        // stockage de la coordonnee de texture
        vTextureCoord = aVertexCoord;
    }
</script>
<script id="shoot-fs" type="x-shader/x-fragment"> // met du rouge dans le carré
// *** le fragment shader ***
precision highp float; // precision des nombres flottant

varying vec2 vTextureCoord; // recuperation de la coord rasterisee
uniform sampler2D uMaTextureShoot; // la texture du shoot en entree

void main(void) {
    // couleur par defaut du vaisseau... a changer
    //gl_FragColor = vec4(1.0,1.0,0.0,1.0);
    // la couleur est attribuee au fragment courant
   gl_FragColor = texture2D(uMaTextureShoot,vTextureCoord);
}
</script>

<script type="text/javascript">

    var fbo; // le FBO utilisé pour rendre la texture de hauteur
    var heightfield; // l'objet heightfield, sa géométrie, son shader
    var background; // l'objet background, sa géométrie, son shader
    var spaceship; // l'objet spaceship, sa géométrie, son shader
    var enemy = new Array(); // l'objet enemy, sa géométrie, son shader
    var shoot = new Array(); //l'objet shoot dans un tableau, son shader

    function drawScene() {
        // initialisation du viewport
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        // efface les buffers de couleur et de profondeur
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // active le FBO (a partie de la, on dessine dans la texture associée)
        // dessine dans la texture et non l'écran
        gl.bindFramebuffer(gl.FRAMEBUFFER,fbo.id());

        // dessin du heightfield
        gl.useProgram(heightfield.shader());
        heightfield.sendUniformVariables();
        heightfield.draw();

        // desactivation du FBO (on dessine sur l'ecran maintenant)
        // Permet de dessiner sur l'écran et non seulement dans la texture
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // dessin du background (utilise la texture dessinée précédemment)
        gl.useProgram(background.shader());
        background.sendUniformVariables();
        background.draw();

        gl.enable(gl.BLEND); //Activation de gl.Blend

        // dessin du vaisseau (shader par defaut ici)
        gl.useProgram(spaceship.shader());
        spaceship.sendUniformVariables();
        spaceship.draw();

        // dessin de l'enemy
        gl.useProgram(enemyShader);
        for (var i = 0; i < enemy.length; i++) {
            enemy[i].sendUniformVariables();
            enemy[i].draw();
        };

        // dessin du shoot
        gl.useProgram(shootShader);
        for (var i = 0; i < shoot.length; i++) {
            shoot[i].sendUniformVariables();
            shoot[i].draw();
        };

        gl.disable(gl.BLEND);
    }

    // une bonne manière de gerer les evenements claviers
    // permet d'avoir plusieurs touches appuyées simultanément
    var currentlyPressedKeys = {};

    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }


    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }

    function handleKeys() {
        if (currentlyPressedKeys[33]) {
            // Page Up (par exemple)
            // faire quelque chose...
        }
    }

    function mouseMove(event) {
        // controle de la position du vaisseau en fonction de la souris
        // la position est remappée entre -1 et 1 pour cela
        var newx = 2.0*(event.clientX/gl.viewportWidth)-1.0;
        var newy = -(2.0*(event.clientY/gl.viewportHeight)-1.0);
        spaceship.setPosition(newx,newy);
    }

    function mouseCLick(event) {
        var shootTemporaire = new Shoot();

        shootTemporaire.setPosition(spaceship.getX(), spaceship.getY());

        shoot.push(shootTemporaire);

        drawScene();
    }

    // animation (ex : explosion)
    var lastTime = 0;
    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            // chaque objet est susceptible de s'animer
            var elapsed = timeNow - lastTime;
            heightfield.setParameters(elapsed);
            spaceship.setParameters(elapsed);
            background.setParameters(elapsed);
        }
        lastTime = timeNow;
    }

    function tick() {
        requestAnimFrame(tick);
        handleKeys();
        drawScene();
        animate();
        for (var i = 0; i < shoot.length; i++) {
            shoot[i].setPosition(shoot[i].getX(), shoot[i].getY()+0.075);
        }

        for (var i = 0; i < enemy.length; i++) {
            enemy[i].setPosition(enemy[i].getX(), enemy[i].getY()-0.0035);
        }
    }

    function displayEnemy() {
        //requestAnimFrame(displayEnemy);
        var interval = Math.random() * 3000;
        
        setInterval(function(){ 
            var enemyTemporaire = new Enemy();
            var abscisse = (Math.random() * 1.8) -0.9;
            console.log(abscisse);
            enemyTemporaire.setPosition(abscisse, 1.5);
            enemy.push(enemyTemporaire);
        }, interval);
        
    }


    function webGLStart() {
        // initialisation du canvas et des objets OpenGL
        var canvas = document.getElementById("SpaceShip");
        initGL(canvas);

        // init FBO
        // Construit un objet
        // largeur, hauteur, nombre et pronfondeur
        fbo = new FBO(canvas.width,canvas.height,1,false);

        // init de tous les shaders
        initHeightfieldShader();
        initBackgroundShader();
        initSpaceshipShader();
        initEnemyShader();
        initShootShader();

        // init de tous les objets
        heightfield = new Heightfield();
        background = new Background(fbo.texture(0));
        spaceship = new Spaceship();

        var enemyTemporaire = new Enemy();
        enemyTemporaire.setPosition(0.0, 0.6);
        enemy.push(enemyTemporaire);

        displayEnemy();
        /*setInterval(function(){ 
            var enemyTemporaire = new Enemy();
            enemyTemporaire.setPosition(0.0, 0.6);
            enemy.push(enemyTemporaire);
        }, 1000);*/

        // la couleur de fond sera noire
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // active le teste de profondeur
        //gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); //Active la transparance

        /* Mouse and keyboard interaction functions */
        //canvas.addEventListener('mousedown', tbMouseDown, true);
        canvas.addEventListener('mousemove', mouseMove, true);
        canvas.addEventListener('click', mouseCLick, true);
        //canvas.addEventListener('mouseup', tbMouseUp, true);

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        // dessine la scene
        tick();
    }


</script>


</head>


<body onload="webGLStart();">
    <canvas id="SpaceShip" style="border: none;" width="800" height="800"></canvas>
</body></html>