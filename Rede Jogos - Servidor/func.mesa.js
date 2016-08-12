//////////////////////////////////////////////
//// Objetos                                //
//////////////////////////////////////////////

var Mesa = function () {
    // Status
    /////////////
    // - 0 - Mesa Livre
    // - 1 - Montando a mesa
    // - 2 - Aguardando Jogadores
    // - 3 - Jogando

    this.status = 0;
    this.statusText = "";
    this.rankeada = 0;
    this.playerAdmin = 4;
    this.mesaPrivada = false;
    
    this.player = new Array(new Array(), new Array(), new Array(), new Array());
}

var verMesa = function () {
    var Status = true;
    var MsgStatus = "";
    var MesaIndefinida = false;
    var cadVaga = false;
    var password = false;
}

//////////////////////////////////////////////
//// VARIÁVEIS DO JOGO                      //
//////////////////////////////////////////////

var jLobby = {};
var jMesaSenha = {};

//////////////////////////////////////////////
//// Funções                                //
//////////////////////////////////////////////

function criaMesa(mesa, optPrivado, txtSenha) {
    jLobby[mesa].mesaPrivada = optPrivado;
    jLobby[mesa].status = 2;
    jLobby[mesa].statusText = "Esperando Jogadores";
    if (txtSenha != "") {
        jMesaSenha[mesa] = txtSenha;
    }
}

function retornaMesaAdmin(SocketId) 
{
    for (var x in jLobby) {
        if (jLobby[x].playerAdmin != 4) {
            if (jLobby[x].player[jLobby[x].playerAdmin].socket == SocketId) { 
                return x;
            }
        }
    }
    return false;
}

function verificaMesa(mesa, cadeira, callback) 
{
    var objMesa = new verMesa();

    if (jLobby[mesa] === undefined) {
        objMesa.MesaIndefinida = true;
    } else {
        
        if (jLobby[mesa].status == 1) {
            objMesa.MsgMesa = "Aguarde o administrador montar a mesa!";
            objMesa.Status = false;
        }
        
        if (jLobby[mesa].status == 3) {
            objMesa.MsgMesa = "Aguarde a partida terminar para se sentar na mesa!";
            objMesa.Status = false;
        }
        
        if (jLobby[mesa].player[cadeira] !== undefined) {
            objMesa.Status = true;
            objMesa.cadVaga = true;
        }

        if (jMesaSenha[mesa] !== undefined) { 
            objMesa.password = true;
        }
    }

    callback(objMesa);
}

function retornaLugarVago(mesa) {
    for(var x in jLobby[mesa].player) {
        if (jLobby[mesa].player[x].length == 0) { 
            return x; 
        }
    }
    return false;
}

function verificaMesaPass(pass, mesa, user, callback) {
    if (jMesaSenha[mesa] === undefined) { 
        callback("Está mesa não possui senha!");
    }
    
    if(jMesaSenha[mesa] != pass) {
        callback("Senha incorreta!");
    }
    
    var lugar = retornaLugarVago(mesa);
    
    if (lugar) {
        jLobby[mesa].player[lugar] = user;
        callback("");
    } else { 
        callback("Está mesa não possui lugar vago!");
    }
}

function entraMesaAdmin(mesa_user, cadeira, user) 
{
    var objMesa = new Mesa();
    objMesa.status = 1;
    objMesa.statusText = "(configurando)";
    objMesa.rankeada = 0;
    objMesa.playerAdmin = cadeira;
    objMesa.player[cadeira] = user;
    jLobby[mesa_user] = objMesa;
}

function retornaLobby(callback) { 
    callback(jLobby);
}

//////////////////////////////////////////////
//// DEFINE OS RETORNOS                     //
//////////////////////////////////////////////

module.exports.verificaMesaPass = verificaMesaPass;
module.exports.verificaMesa = verificaMesa;
module.exports.entraMesaAdmin = entraMesaAdmin;
module.exports.retornaLobby = retornaLobby;
module.exports.retornaMesaAdmin = retornaMesaAdmin;
module.exports.criaMesa = criaMesa;