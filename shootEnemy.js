var shootEnemyShader;

function initShootEnemyShader() {
	shootEnemyShader = initShaders("shootEnemy-vs","shootEnemy-fs");

    // active ce shader
    gl.useProgram(shootEnemyShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    shootEnemyShader.vertexPositionAttribute = gl.getAttribLocation(shootEnemyShader, "aVertexPosition");
    gl.enableVertexAttribArray(shootEnemyShader.vertexPositionAttribute); // active cet attribut

    // pareil pour les coordonnees de texture
    shootEnemyShader.vertexCoordAttribute = gl.getAttribLocation(shootEnemyShader, "aVertexCoord");
    gl.enableVertexAttribArray(shootEnemyShader.vertexCoordAttribute);

     // adresse de la variable uniforme uOffset dans le shader
    shootEnemyShader.positionUniform = gl.getUniformLocation(shootEnemyShader, "uPosition");

    //  Texture du missile
    spaceshipShader.textureShootEnemy = gl.getUniformLocation(spaceshipShader, "uMaTextureShootEnemy");

    //console.log("shootEnemy shader initialized");
}

function ShootEnemy() {
	this.initParameters();

	// cree un nouveau buffer sur le GPU et l'active
	this.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

	// un tableau contenant les positions des sommets (sur CPU donc)
	var wo2 = 0.5*this.width;
	var ho2 = 0.5*this.height;

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

    //console.log("shootEnemy initialized");
}

ShootEnemy.prototype.initParameters = function() {
	this.width = 0.2;
	this.height = 0.2;
	this.position = [0.0,-0.7];
	// Initialise la texture du missile
           this.maTextureShootEnemy = initTexture("./img/missile_enemy.png");
}

ShootEnemy.prototype.setParameters = function(elapsed) {
	// on pourrait animer des choses ici

}

ShootEnemy.prototype.setPosition = function(x,y) {
	this.position = [x,y];
}

ShootEnemy.prototype.getX = function() {
	return this.position[0];
}

ShootEnemy.prototype.getY = function() {
	return this.position[1];
}

ShootEnemy.prototype.shader = function() {
	return shootEnemyShader;
}

ShootEnemy.prototype.sendUniformVariables = function() {
	gl.activeTexture(gl.TEXTURE0);
           gl.bindTexture(gl.TEXTURE_2D,this.maTextureShootEnemy);
           gl.uniform1i(shootEnemyShader.textureShootEnemy, 0);
	gl.uniform2fv(shootEnemyShader.positionUniform,this.position);
}

ShootEnemy.prototype.draw = function() {
	// active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(shootEnemyShader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// active le buffer de coords
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
	gl.vertexAttribPointer(shootEnemyShader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// dessine les buffers actifs
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}