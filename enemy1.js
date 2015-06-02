var enemy1Shader;

function initEnemy1Shader() {
	enemy1Shader = initShaders("enemy1-vs","enemy1-fs");

    // active ce shader
    gl.useProgram(enemy1Shader);

    // recupere la localisation de l'attribut dans lequel on souhaite acceder aux positions
    enemy1Shader.vertexPositionAttribute = gl.getAttribLocation(enemy1Shader, "aVertexPosition");
    gl.enableVertexAttribArray(enemy1Shader.vertexPositionAttribute); // active cet attribut

    // pareil pour les coordonnees de texture
    enemy1Shader.vertexCoordAttribute = gl.getAttribLocation(enemy1Shader, "aVertexCoord");
    gl.enableVertexAttribArray(enemy1Shader.vertexCoordAttribute);

     // adresse de la variable uniforme uOffset dans le shader
    enemy1Shader.positionUniform = gl.getUniformLocation(enemy1Shader, "uPosition");

    console.log("enemy1 shader initialized");
}

function Enemy1() {
	this.initParameters();

	// cree un nouveau buffer sur le GPU et l'active
	this.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

	// un tableau contenant les positions des sommets (sur CPU donc)
	var wo2 = 0.1*this.width;
	var ho2 = 0.1*this.height;

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

    console.log("enemy1 initialized");
}

Enemy1.prototype.initParameters = function() {
	this.width = 0.2;
	this.height = 0.2;
	this.position = [0.0,-0.7];
           //this.maTextureVaisseau
}

Enemy1.prototype.setParameters = function(elapsed) {
	// on pourrait animer des choses ici
}

Enemy1.prototype.setPosition = function(x,y) {
	this.position = [x,y];
}

Enemy1.prototype.shader = function() {
	return enemy1Shader;
}

Enemy1.prototype.sendUniformVariables = function() {
	gl.uniform2fv(enemy1Shader.positionUniform,this.position);
}

Enemy1.prototype.draw = function() {
	// active le buffer de position et fait le lien avec l'attribut aVertexPosition dans le shader
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(enemy1Shader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// active le buffer de coords
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
	gl.vertexAttribPointer(enemy1Shader.vertexCoordAttribute, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// dessine les buffers actifs
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
	gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0);
}


