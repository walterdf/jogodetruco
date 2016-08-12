var socket = io("http://localhost:3000");
var login = "";
var myMesa = 0;

var modalAdmin;

var modalVisitante = new jBox('Modal', {
    title: 'Aguarde outros usuários',
    draggable: 'title',
    closeButton: 'title',
    overlay: true,
    width: 400,
    height: 300,
    //onOpen: function () {
    //    alert("Nasceu!");
    //},
    //onClose: function () {
    //    alert("Morreu!");
    //},
    content: $('#modalVisitante')
});

socket.on('acessa', function () {
    socket.emit('valida', decodeURI(getUrlParameters("hash", "", false)));
});

socket.on('my-config', function (data) {
    login = data.login;
});

socket.on('load-user', function (data) {
    $('.players p').text(data.length);
    var cod = "<ul>";
    for(var i in data) {
            cod += "<li><span class=\"" + (data[i].cenario == "lobby" ? "disable" : "enable") + "\"></span><a class=\"c_user_sys\" href=\"#\">" + data[i].login + "</a></li>";
    }
    cod += "</ul>";
    $(".c_msg_hat_user").html(cod);
});

//Carrega msg no chat
socket.on('msg-chat-load', function (data) {
    $("#mCSB_1_container").append(data);
    $(".c_msg").mCustomScrollbar("scrollTo", "bottom", { scrollInertia: 0 });
});

//Msg do sistema
socket.on('msg-do-sistema', function(data){
        alert(data);
});

//Carrega o lobby
socket.on('load-lobby', function (data) {
    for(var x in data)
    {
        $(".boxSala:eq(" + (x - 1) + ")").html(function () {
            $(this).find(".st1").text(data[x].statusText);
            if (data[x].rankeada == 1) $(this).find("h4").text("Mesa Rankeada");
            /////
            if (data[x].status == 2) { $(this).find(".boxCad").css('visibility', 'visible'); }
            /////
            var userArr = data[x].player;
            
            for (var y in userArr) {
                if(userArr[y].length != 0){
                    $(this).find(".boxCad:eq(" + y + ") .btnEntra").css("display", "none");
                    $(this).find(".boxCad:eq(" + y + ") .cadAvatar").attr("src", returnAvatar(userArr[y].tipoAvatar, userArr[y].urlAvatar)).addClass("showAvatar");

                    if (data[x].status == 1) {
                        $(this).find(".boxCad:not(.boxCad:eq(" + y + "))").css("visibility", "hidden");
                    }
                }
            }

            if (x == myMesa)
            {
                for (var y in userArr) {
                    if (userArr[y].length != 0) {
                        $(".boxCadAdmin:eq(" + y + ") .btnStyleEntra").css("display", "none");
                        $(".boxCadAdmin:eq(" + y + ") .cadAvatar").attr("src", returnAvatar(userArr[y].tipoAvatar, userArr[y].urlAvatar)).addClass("showAvatar");
                    } else {
                        $(".boxCadAdmin:eq(" + y + ") .btnStyleEntra").css("display", "block");
                        $(".boxCadAdmin:eq(" + y + ") .cadAvatar").removeAttr("src").removeClass("showAvatar");
                    }
                }

                if ($("#modalConfigSelect").css("display") == "block") {

                    $("#comboEquipe").html("<option>Selecione..</option>");

                    for (var y in userArr) {
                        if (userArr[y].length != 0) {
                            if(userArr[y].login != login){
                                $("#comboEquipe").append("<option value='" + userArr[y].login + "'>" + userArr[y].login + "</option>");
                            }           
                        }
                    }
                    
                }
            }
        });
    }
});

//Carrega o Box Admin
socket.on('load-admin', function (mesa) {
    myMesa = mesa;
    $(".modalConfig").css("display", "none");
    $("#modalConfigAdmin").css("display", "block");

    modalAdmin = new jBox('Modal', {
        title: 'Configure sua Mesa!',
        draggable: 'title',
        closeButton: 'title',
        overlay: true,
        width: 380,
        height: 240,
        //onOpen: function () {
        //    alert("Nasceu!");
        //},
        //onClose: function () {
        //    alert("Morreu!");
        //},
        content: $('#modalAdmin')
    });
    modalAdmin.open();
});

socket.on('monta-equipe', function (mesa) {
    $(".modalConfig").css("display", "none");
    $("#modalConfigSelect").css("display", "block");
    $(".jBox-title div:first-child").text("Monte sua equipe!");
});

socket.on('entra-senha', function (mesa) {
    myMesa = mesa;

    $(".modalConfig").css("display", "none");
    $("#modalConfigSenha").css("display", "block");

    modalAdmin = new jBox('Modal', {
        title: 'Entre com a senha!',
        draggable: 'title',
        closeButton: 'title',
        overlay: true,
        width: 380,
        height: 240,
        //onOpen: function () {
        //    alert("Nasceu!");
        //},
        //onClose: function () {
        //    alert("Morreu!");
        //},
        content: $('#modalAdmin')
    });

    modalAdmin.open();
});

socket.on('resultado-pass', function (data) {
    switch(data)
    {
        case 0:
            $(".modalConfig").css("display", "none");
            $("#modalConfigUsuario").css("display", "block");
            break;
        case 1:
            alert("Senha incorreta!");
            break;
        case 2:
            alert("Está mesa não possui lugar vago!");
            break;
        case 3:
            alert("Senha incorreta!");
            break;
    }
});
