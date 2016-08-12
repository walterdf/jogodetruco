var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

///////////////////////////////
// IMPORTA OUTROS DOCUMENTOS //
///////////////////////////////

var db = require('./db');
var mesas = require('./func.mesa.js');

///////////////////////////////
// FUNÇÕES ÚTEIS             //
///////////////////////////////

Array.prototype.sortByProp = function (p) {
    return this.sort(function (a, b) {
        return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
    });
}

var existUser = function(array, login) {
    for (var i in array) {
        if (array[i].login == login) {
            return true;
        }
    }
    return false;
}

var returnUser = function(id) 
{
    for (var i in jUsuarios) {
        if (jUsuarios[i].socket == id) {
            return jUsuarios[i];
        }
    }
    return false;
}

///////////////////////////////
// VARIÁVEIS DO JOGO         //
///////////////////////////////

var jUsuarios = new Array();

///////////////////////////////

io.sockets.on('connection', function(socket){
    
    //chama o método acessa
    socket.emit('acessa');

    //valida login
    socket.on('valida', function (hash) {
        var objUser = db.returnFindUser(hash, function (user) {
            if (user != null && user.login != "") { 
                if (!existUser(jUsuarios, user.login)) {
                    user["socket"] = socket.id;
                    socket.join('lobby');
                    jUsuarios.push(user);
                    for (var x in jUsuarios) {
                        console.log("Usuário Conectado: " + jUsuarios[x].login);
                    }
                    console.log(jUsuarios.length);
                    console.log("----------------");
                }
                    //jUsuarios.sortByProp("login");
                }
                socket.emit('my-config', user);
                io.sockets.in('lobby').emit('load-user', jUsuarios);
        }); 
    });

    socket.on('msg-chat', function (msg) {
        var user = returnUser(socket.id);
        if (user) {
            var msgHtml = "<p class=\"c_msg_user\"><span> " + user.login + ": </span> " + msg + "</p>";
            socket.broadcast.to('lobby').emit('msg-chat-load', msgHtml);
        } else { 
            socket.emit('msg-do-sistema', 'Usuário não encontrado!');
        }
    });

    socket.on('disconnect', function () {
        for (var i in jUsuarios) {
            if (jUsuarios[i].socket == socket.id) {
                console.log("Removido:"+ jUsuarios[i].login);
                jUsuarios.splice(i, 1);
            }
        }
        io.sockets.emit('load-user', jUsuarios);
    });

    socket.on('entra-sala', function (mesa, cadeira) {
        mesas.verificaMesa(mesa, cadeira, function (data) {

            if (data.MesaIndefinida) {
                
                //Cria a mesa como admin
                var user = returnUser(socket.id);
                mesas.entraMesaAdmin(mesa, cadeira, user);
                
                mesas.retornaLobby(function (data) {
                    socket.emit('load-admin', mesa);
                    io.sockets.in('lobby').emit('load-lobby', data);
                });

            } else if (!data.Status) { 
                socket.emit('msg-do-sistema', data.MsgMesa);
            } else if (data.cadVaga) {
                
                if (data.password) {
                    
                    mesas.retornaLobby(function (data) {
                        //Chama o Modal de Senha!
                        socket.emit('entra-senha', mesa);
                        io.sockets.in('lobby').emit('load-lobby', data);
                    });

                } else { 
                    //Chama o Modal de Usuário Comum!
                    socket.emit('msg-do-sistema', 'Cadeira ocupada!');
                }

            } else { 
                socket.emit('msg-do-sistema', 'Não foi possível se sentar na mesa!');
            }

        });
    });
    
    socket.on('entra-sala-pass', function (pass, mesa) { 
        var user = returnUser(socket.id);
        if (user) {
            var mesa = mesas.verificaMesaPass(pass, mesa, user, function (msg) { 
                
                switch (msg){
                    case "":
                            socket.emit('resultado-pass', 0);                
                            break;
                    case "Senha incorreta!":
                            socket.emit('resultado-pass', 1);
                            break;
                    case "Está mesa não possui lugar vago!":
                            socket.emit('resultado-pass', 2);
                            break;
                    case "Está mesa não possui senha!":
                            socket.emit('resultado-pass', 3);
                            break;
                }

            });
        } else { 
            socket.emit('msg-do-sistema', 'Usuário não encontrado!');
        }
    });

    socket.on('cria-sala', function (optPrivado, txtSenha) { 
        var user = returnUser(socket.id);
        if (user) {
            var mesa = mesas.retornaMesaAdmin(user.socket)
            if (mesa) {
                mesas.criaMesa(mesa, optPrivado, txtSenha);
                mesas.retornaLobby(function (data) {
                    socket.emit('monta-equipe');
                    io.sockets.in('lobby').emit('load-lobby', data);
                });
            } else { 
                socket.emit('msg-do-sistema', 'Mesa não encontrada!');
            }
        } else {
            socket.emit('msg-do-sistema', 'Usuário não encontrado!');
        }
    });

});

http.listen(3000, function(){
    console.log('Rodando na porta 3000');
});

/////////////////////////////

