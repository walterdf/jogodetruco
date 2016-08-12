var mongoose = require('mongoose');
var mongoosedb = mongoose.connection;

//// Metódos de Conexão
mongoosedb.on('error', function () {
    console.log("Erro ao conectar!");
});

mongoosedb.once('open', function () {
    console.log("Conectado!");
});

////////////////////////

var conn = mongoose.connect('mongodb://localhost/redejogos');

//////////////////////////////////////////////
//// Objetos                                //
//////////////////////////////////////////////

var obj = function(){
    this.socket = "";
    this.cenario = "";
    this.login = "";
    this.tipoAvatar = 1;
    this.urlAvatar = "";
}

//////////////////////////////////////////////
//// MODELOS                                //
//////////////////////////////////////////////

var Schema_usuarios = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    hash: String,
    login: String,
    senha: String,
    tipoAvatar: Number,
    urlAvatar: String,
    email: String,
    dataCad: Date,
    dataAcesso: Date
});

//////////////////////////////////////////////
//// FUNÇÃO DE RETORNO                      //
//////////////////////////////////////////////

function returnStatusConexao() 
{
    return statusConexao;
}


function returnFindUser(hash_id, callback) 
{
    var baseUsuarios = conn.model('usuarios', Schema_usuarios);
    hash_id = hash_id+'=';
    baseUsuarios.findOne({ 'hash': hash_id }, function (err, user) {
        if (user != null) {
            obj_user = new obj();
            obj_user.login = user.login;
            obj_user.cenario = "lobby";
            obj_user.tipoAvatar = user.tipoAvatar;
            obj_user.urlAvatar = user.urlAvatar;
        }
        
        callback(obj_user);
    });
}

//////////////////////////////////////////////
//// DEFINE OS RETORNOS                     //
//////////////////////////////////////////////

module.exports.statusConexao = returnStatusConexao;
module.exports.returnFindUser = returnFindUser;