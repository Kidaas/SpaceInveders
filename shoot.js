var shootShader;

function initShootShader() {
	shootShader = initShaders("shoot-vs","shoot-fs");

    // active ce shader
    gl.useProgram(shootShader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    shootShader.vertexPositionAttribute = gl.getAttribLocation(shootShader, "aVertexPosition");
    gl.enableVertexAttribArray(shootShader.vertexPositionAttribute); // active cet attribut

    // pareil pour les coordonnees de texture
    shootShader.vertexCoordAttribute = gl.getAttribLocation(shootShader, "aVertexCoord");
    gl.enableVertexAttribArray(shootShader.vertexCoordAttribute);

     // adresse de la variable uniforme uOffset dans le shader
    shootShader.positionUniform = gl.getUniformLocation(shootShader, "uPosition");

    console.log("shoot shader initialized");
}

function Shoot() {
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
		 0.0, 1.0,
		 0.0, 0.0,
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

    console.log("shoot initialized");
}

Shoot.prototype.initParameters = function() {
	this.width = 0.2;
	this.height = 0.2;
	this.position = [0.0,-0.7];
}

Shoot.prototype.setParameters = function(elapsed) {
	// on pourrait animer des choses ici

}

Shoot.prototype.setPosition = function(x,y) {
	this.position = [x,y];
}

Shoot.prototype.getX = function() {
	return this.position[0];
}

Shoot.prototype.getY = function() {
	return this.position[1];
}

Shoot.prototype.shader = function() {
	return shootShader;
}

Shoot.prototype.sendUniformVariables = function() {
	gl.uniform2fv(shootShader.positionUniform,this.position);
}

Shoot.prototype.draw = function() {
	// active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(shootShader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// active le buffer de coords
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
	gl.vertexAttribPointer(shootShader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// dessine les buffers actifs
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}


