var enemyShader;
var estVivant;
var tempsMort;

function initEnemyShader() {
	enemyShader = initShaders("enemy-vs","enemy-fs");

    // active ce shader
    gl.useProgram(enemyShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    enemyShader.vertexPositionAttribute = gl.getAttribLocation(enemyShader, "aVertexPosition");
    gl.enableVertexAttribArray(enemyShader.vertexPositionAttribute); // active cet attribut

    // pareil pour les coordonnees de texture
    enemyShader.vertexCoordAttribute = gl.getAttribLocation(enemyShader, "aVertexCoord");
    gl.enableVertexAttribArray(enemyShader.vertexCoordAttribute);

     // adresse de la variable uniforme uOffset dans le shader
    enemyShader.positionUniform = gl.getUniformLocation(enemyShader, "uPosition");

    //  Texture du vaisseau
    spaceshipShader.textureEnemy = gl.getUniformLocation(enemyShader, "uMaTextureEnemy");

    //console.log("enemy shader initialized");
}

function Enemy() {
	this.initParameters();
	estVivant = true;
	tempsMort = 0;

	// cree un nouveau buffer sur le GPU et l'active
	this.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

	// un tableau contenant les positions des sommets (sur CPU donc)
	var wo2 = 0.4*this.width;
	var ho2 = 0.4*this.height;

	var vertices = [
		-wo2,-ho2, -0.5,
		 wo2,-ho2, -0.5,
		 wo2, ho2, -0.5,
		-wo2, ho2, -0.5
	];

	// on envoie ces positions au GPU ici (et on se rappelle de leur nombre/taille)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vertexBuffer.itemSize = 3;
	this.vertexBuffer.numItems = 4;

	// meme principe pour les couleurs
	this.coordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
	var coords = [
		 0.0, 0.0,
		 1.0, 0.0,
		 1.0, 1.0,
		 0.0, 1.0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
	this.coordBuffer.itemSize = 2;
	this.coordBuffer.numItems = 4;

	// creation des faces du cube (les triangles) avec les indices vers les sommets
	this.triangles = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	var tri = [0,1,2,0,2,3];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
    this.triangles.numItems = 6;

    //console.log("enemy initialized");
}

Enemy.prototype.initParameters = function() {
	this.width = 0.2;
	this.height = 0.2;
	this.position = [-0.3,0.7];

   	// Initialise la texture de l'enemy
    this.maTextureEnemy = initTexture("./img/enemy.png");
}

Enemy.prototype.changeImage = function(elapsed) {
	this.maTextureEnemy = initTexture("./img/explosion.png");
	estVivant = false;
	tempsMort = new Date().getTime();
}

Enemy.prototype.setParameters = function(elapsed) {
	if(elapsed > 1000 && tempsMort != 0) {
		return true;
	} else {
		return false;
	}
}

Enemy.prototype.getTempsMort = function() {
	return tempsMort;
}

Enemy.prototype.getEstVivant = function() {
	return estVivant;
}

Enemy.prototype.setEstVivant = function(statut) {
        estVivant = statut;
}

Enemy.prototype.setPosition = function(x,y) {
	this.position = [x,y];
}

Enemy.prototype.getX = function() {
	return this.position[0];
}

Enemy.prototype.getY = function() {
	return this.position[1];
}

Enemy.prototype.shader = function() {
	return enemyShader;
}

Enemy.prototype.sendUniformVariables = function() {
   	gl.activeTexture(gl.TEXTURE0);
   	gl.bindTexture(gl.TEXTURE_2D,this.maTextureEnemy);
   	gl.uniform1i(enemyShader.textureEnemy, 0);
	gl.uniform2fv(enemyShader.positionUniform,this.position);
}

Enemy.prototype.draw = function() {
	// active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(enemyShader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// active le buffer de coords
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
	gl.vertexAttribPointer(enemyShader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// dessine les buffers actifs
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);

}