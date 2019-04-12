//Para trabajar el DOM//
// console.log("Hola")
window.onload = initialize;
document.getElementById("login").addEventListener("click", login)
function login(){
    let email2 = document.getElementById('email2').value;
    let password2 = document.getElementById('password2').value;

    firebase.auth().signInWithEmailAndPassword(email2, password2).then(function(){
        let refmessage=firebase.database().ref().child("users");
        refmessage.on("value",function(snap){
        let datos=snap.val();
            let existe=false;
            for(let key in datos){
                if(datos[key].email===document.getElementById("email2").value){
                    if(!datos[key].Nombre){
                        existe=false;
                    }
                    else
                    {
                        existe=true;
                        document.getElementById("welcomeuser").innerHTML=datos[key].Nombre;
                        showImage(datos[key].extension);//foto
                        document.getElementById("userLogin").style.display = "none";
                        document.getElementById("userWall").style.display = "block";
                        document.getElementById("perfilUser").style.display = "block";
                    }   
                }
            }
            if(!existe){
                alert("Sus datos no estan actualizados, favor completar perfil para poder utilizar el sitio");
                document.getElementById("divEdition").style.display="Block";
                document.getElementById("userLogin").style.display = "none";
                document.getElementById("userWall").style.display = "none";
                document.getElementById("perfilUser").style.display = "none";
            }
        });
    })
    // si no se cumple alguna condición se ejecutara un error//
    .catch(function(error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
        alert("Combinación de Usuario y Contraseña incorrecta!");
        // ...
      });
    
}
//inicializa la conección entre base de datos y javascript
function initialize(){
    initializeFirebase();
    showMessageFromFirebase();


}
document.getElementById("sendMessage").addEventListener("click",sendDataToFirebase)
//mostrando mensaje de base de datos, ref=referencia
function showMessageFromFirebase(){
    let refmessage = firebase.database().ref().child("mensaje");
    refmessage.on("value",function(snap){
        let todosLosMensajes = "";
        document.getElementById("messageBackground").innerHTML ="";
        let datos = snap.val();
        //aqui se dibujan los padres, mensaje que escribe usuario es el padre y el comentario el hijo(child)
        let key;
        for(key in datos){
            if(datos[key].Eliminado === 0){
             todosLosMensajes += "<div class='divWallMessage'><div class='divHeaderMuro'>" + datos[key].Nombre + "</div><div class='divBodyWall'><br></br>" + datos[key].Mensaje+"<br></br></div>";
             //ahora que dibujamos los padres, dibujaremos a los hijos
             let refMessageChild=firebase.database().ref().child("mensaje").child(key);
             refMessageChild.on("value",function(snap){
                 let datoChild=snap.val();
                 for(let keyChild in datoChild){
                    if(datoChild[keyChild].Eliminado === 0){
                        todosLosMensajes += "<div class='divBodyResWall'><a class='aMuro'>" + datoChild[keyChild].Nombre + " : " + datoChild[keyChild].Mensaje+"</a> <img src='imagenes/borrar.png' class='imgMuroBorrar' onclick=updateDeleteChild('"+key+"','"+keyChild+"','"+datoChild[keyChild].Email+"')> <img src='imagenes/editvegan.png' class='imgMuroBorrar' onclick=editMessageChild('"+key+"','"+keyChild+"')></br></div>";
                    }
               } 
             });
             todosLosMensajes+="<div class='divFooterWall'><div class='divSelect'><img src='imagenes/palta.png' class='imgMuro' onclick=sumLike('"+key+"')>" + datos[key].Like +"</div><div class='divSelect'><img src='imagenes/comm.png' class='imgMuro' onclick=answerMessage('"+key+"')></div><div class='divSelect'><img src='imagenes/borrar.png' class='imgMuro' onclick=updateDelete('"+key+"','"+datos[key].Email+"')></div><div class='divSelect'><img src='imagenes/editvegan.png' class='imgMuro' onclick=editMessage('"+key+"')></div></div>"
             todosLosMensajes+="</div></br>";
            }
        }
      //  messageBackground.innerHTML = todosLosMensajes;

     document.getElementById("messageBackground").innerHTML += todosLosMensajes;
    })
}
//para cerrar el modal
  document.getElementById("cerrarModalEdit").addEventListener("click", closeModalEdit)
  function closeModalEdit()
  {
    let modal = document.getElementById('modalEdit');
    modal.style.display = "none";
    document.getElementById('mesageResponseEdit').value="";

  }
  //esta key es para pasar el valor al modal
  let keyEdit;
  //funcion que recive y busca el mensaje
function editMessage(key){
    let refmessage = firebase.database().ref().child("mensaje").child(key);
    refmessage.on("value",function(snap){
    let datos = snap.val();
    if(datos.Email===document.getElementById("email2").value){
        document.getElementById('mesageResponseEdit').value=datos.Mensaje;
        document.getElementById("modalEdit").style.display = "block";
        keyEdit=key;
    }
    else{
        alert("usted no puede modificar este mensaje");
        document.getElementById("modalEdit").style.display = "none";

    }
});
}
//funcion para modificar el mensaje
document.getElementById("btnModalEdit").addEventListener("click", updateComment)
function updateComment(){
    let msg=document.getElementById("mesageResponseEdit").value;
    if(msg != null && msg !=""){
        refmessage = firebase.database().ref().child("mensaje").child(keyEdit);
        refmessage.update({
            Mensaje:msg
        });

    }
    document.getElementById("modalEdit").style.display="none";
    document.getElementById("mesageResponseEdit").value="";
}

//cambia estado del mensaje(actualiza si la persona borra)
function updateDelete(valor,email){
    if(email === document.getElementById("email2").value){
        if(confirm("Desea eliminar mensaje")){
            refmessage = firebase.database().ref().child("mensaje").child(valor);
            refmessage.update({
            Eliminado:1
            });
        }
    }
    else
    {
        alert("Solo el usuario propietario puede eliminar el mensaje");
    }
}
//funcion para editar hijo (comentarios de mensaje principal usuario)
let keyEditChild;
let keyEditChildTwo;
function editMessageChild(key,keyChild){
    let refmessage = firebase.database().ref().child("mensaje").child(key).child(keyChild);
    refmessage.on("value",function(snap){
        let datos = snap.val();
        if(datos.Email === document.getElementById("email2").value){
            document.getElementById('ModalEditChild').style.display="block";
            document.getElementById("editTextAreaChild").value=datos.Mensaje;
            keyEditChild=key;
            keyEditChildTwo=keyChild;
        }else{
            alert("Sólo puede modificar el dueño del mensaje");
            document.getElementById('ModalEditChild').style.display="none";
            document.getElementById("editTextAreaChild").value="";
        }
    });
}
//cambia edición de comentarios (child)
document.getElementById("btnModalEditChild").addEventListener("click", updateCommentChild)
function updateCommentChild(){
    let msg=document.getElementById("editTextAreaChild").value;
    if(msg != null && msg !=""){
        let refmessage = firebase.database().ref().child("mensaje").child(keyEditChild).child(keyEditChildTwo);
        refmessage.update({
            Mensaje:msg
        });
    }
    document.getElementById('ModalEditChild').style.display="none";
    document.getElementById("editTextAreaChild").value="";
}
document.getElementById("cerrarModalEditChild").addEventListener("click", closeModalEditChild)
  function closeModalEditChild()
  {
    document.getElementById('ModalEditChild').style.display="none";
  }
//cambia estado del mensaje del mensaje hijo(actualiza si la persona borra)
function updateDeleteChild(valor,valorChild,email){
    if(email === document.getElementById("email2").value){
        if(confirm("Desea eliminar mensaje")){
            let refmessage = firebase.database().ref().child("mensaje").child(valor).child(valorChild);
            refmessage.update({
            Eliminado:1
            });
        }
        document.getElementById('ModalEditChild').style.display="none";
    }
    else
    {
        alert("Solo el usuario propietario puede eliminar el mensaje");
    }

 }
 //sumatoria de me gusta
function sumLike(keySum){
    let addLike = 0;
    let refmessageLike = firebase.database().ref().child("mensaje").child(keySum);
    refmessageLike.on("value",function(snap){
        addLike = snap.val().Like;
    });
    refmessageLike.update({
    Like:addLike+1
    });
}
//para que el modal se cierre
window.onclick = function(event) {
    let modal = document.getElementById('myModal');
    if (event.target === modal) {
      modal.style.display = "none";
    }
    let modal2 = document.getElementById('modalEdit');
    if (event.target === modal2) {
      modal2.style.display = "none";
    }
    let modal3 = document.getElementById('ModalEditChild');
    if (event.target === modal3) {
      modal3.style.display = "none";
    }
  }
  document.getElementById("cerrarModal").addEventListener("click", closeModal)
  function closeModal()
  {
    document.getElementById('myModal').style.display="none";
    modal.style.display = "none";
  }
  document.getElementById("btnModal").addEventListener("click", cerrarModal)
  function cerrarModal(){
    let usuario=document.getElementById("nameResponse").innerHTML;
    let mensaje=document.getElementById("mesageResponse").value;
    if(usuario != "" && usuario != null && mensaje != "" && mensaje != null)
    {
        let email=document.getElementById("email2").value;
        let refmessageAnswer= firebase.database().ref().child("mensaje").child(keyAnswerMessage);
        refmessageAnswer.push({Mensaje:mensaje, Nombre:usuario, Eliminado:0,Principal:0,Like:0,Email:email});
        keyAnswerMessage="";
        document.getElementById("mesageResponse").value="";
    }
    else
    {
        modal.style.display = "none";
        alert("El mensaje o el usuario no puede estar en blanco");
    }
    document.getElementById("myModal").style.display = "none";
  }
//usuario será el nombre y correo de usuario registrado
let keyAnswerMessage;
function answerMessage(keyAnswer){
    //let messageAnswer = prompt("Respuesta");
    keyAnswerMessage=keyAnswer;
    let usuario= document.getElementById("welcomeuser").innerHTML;
    document.getElementById("nameResponse").innerHTML = usuario;
    document.getElementById("myModal").style.display = "block";

}
//Envía datos a Firebase
function sendDataToFirebase(){
    let email=document.getElementById("email2").value;
    let usuario= document.getElementById("welcomeuser").innerHTML;
    let message=document.getElementById("mensaje").value;
    if(message != null && message != "" ){
       let refmessage= firebase.database().ref().child("mensaje");
        refmessage.push({Mensaje: message, Nombre:usuario, Eliminado:0,Principal:0,Like:0,Email:email});
    }
    else
    {
        alert("Mensaje y/o Usuario no puede estar en blanco");
    }
    document.getElementById("mensaje").value="";
}
  //función para actualizar los datos del usuario
  document.getElementById("updateEdit").addEventListener("click", updateUser);
  function updateUser(){
    let updateName = document.getElementById('nameEdit').value;
       let updateMail = document.getElementById('mailEdit').value;
       let updateImg = document.getElementById('imagEdit').files[0];
      let validate = 2;
      let existe=false;
       if(updateName === null || updateName ===""){
        alert("Ingrese nombre");
        validate=1;
       }
       if(updateMail === null || updateMail ===""){
        alert("Ingrese correo");
        validate=1;
       }
       if(updateImg === null || updateImg ===""){
        alert("Ingrese imagen");
        validate=1;
       }
       if(validate === 2 ){
        let ext=[];//se usa para obtener la extencion del archivo
        ext=String(updateImg.name).split('.');
        let refmessage = firebase.database().ref().child("users");
        refmessage.on("value",function(snap){
            let datos = snap.val();
            for(var key in datos){
                if(datos[key].email === updateMail){
                 let refmessageChild = firebase.database().ref().child("users").child(key);
                 refmessageChild.update({
                 Nombre:updateName, extension:ext[1]
                });
                //se carga la imagen
              let storageRef= firebase.storage().ref();
               storageRef.child('images/'+updateMail+'.'+ext[1]).put(updateImg);/*sube imagen a firebase */
               existe=true;
            }
        }
        });
        if(!existe){
            let saveUser = firebase.database().ref().child("users");
            saveUser.push({
                 Nombre:updateName, extension:ext[1],email:document.getElementById("email2").value
                });
        }
        alert("Datos actualizados");
        showImage(ext[1]);
        document.getElementById("userWallPerfil").style.display = "block";
        document.getElementById("divEdition").style.display = "none";
        //limpiando los controles
        document.getElementById('nameEdit').value="";
        document.getElementById('mailEdit').value="";
        document.getElementById('imagEdit').files[0]="";
       }
  }
  //muestra la imagen que sube el usuario
  function showImage(extension){
    let storageRef= firebase.storage().ref();
    let starsRef = storageRef.child('images/'+document.getElementById("email2").value+"."+extension);

    starsRef.getDownloadURL().then(function(url) {
        // Insert url into an <img> tag to "download"
        let imgMuro=document.getElementById("imgWall");
        imgMuro.src=url;
        let img=document.getElementById("imagenPerfil");
        img.src=url;
      
      });
}

//mostrando mensaje de base de datos solo del usuario dueño del perfil, ref=referencia
function showMessagePerfilFirebase(){
    let extension;
    //vamos a buscar la informacion del usuario por medio del correo
    let refmessage=firebase.database().ref().child("users");
    refmessage.on("value",function(snap){
        let datos=snap.val();
        for(key in datos){
            if(datos[key].email===document.getElementById("email2").value){
                document.getElementById("namePerfil").innerHTML=datos[key].Nombre;
                extension=datos[key].extension;
            }
        }
    });
    showImage(extension);
    refmessage = firebase.database().ref().child("mensaje");
    refmessage.on("value",function(snap){
        let todosLosMensajes = "";
        document.getElementById("messagePerfil").innerHTML ="";
        let datos = snap.val();
        //aqui se dibujan los padres, mensaje que escribe usuario es el padre y el comentario el hijo(child)
        let key;
        for(key in datos){
            if(datos[key].Eliminado === 0 && datos[key].Email === document.getElementById("email2").value){
             todosLosMensajes += "<div class='divWallMessage'><div class='divHeaderMuro'>" + datos[key].Nombre + "</div><div class='divBodyWall'><br></br>" + datos[key].Mensaje+"<br></br></div>";
             //ahora que dibujamos los padres, dibujaremos a los hijos
             let refMessageChild=firebase.database().ref().child("mensaje").child(key);
             refMessageChild.on("value",function(snap){
                 let datoChild=snap.val();
                 
                 for(let keyChild in datoChild){
                    if(datoChild[keyChild].Eliminado === 0){
                        todosLosMensajes += "<div class='divBodyResWall'><a class='aMuro'>" + datoChild[keyChild].Nombre + " : " + datoChild[keyChild].Mensaje+"</a> <img src='imagenes/borrar.png' class='imgMuroBorrar' onclick=updateDeleteChild('"+key+"','"+keyChild+"','"+datoChild[keyChild].Email+"')> <img src='imagenes/editvegan.png' class='imgMuroBorrar' onclick=editMessageChild('"+key+"','"+keyChild+"')></br></div>";
                    }
               }
             });
             todosLosMensajes+="<div class='divFooterWall'><div class='divSelect'><img src='imagenes/palta.png' class='imgMuro' onclick=sumLike('"+key+"')>" + datos[key].Like +"</div><div class='divSelect'><img src='imagenes/comm.png' class='imgMuro' onclick=answerMessage('"+key+"')></div><div class='divSelect'><img src='imagenes/borrar.png' class='imgMuro' onclick=updateDelete('"+key+"','"+datos[key].Email+"')></div><div class='divSelect'><img src='imagenes/editvegan.png' class='imgMuro' onclick=editMessage('"+key+"')></div></div>"
             todosLosMensajes+="</div></br>";
            }
        }
      //  messageBackground.innerHTML = todosLosMensajes;

     document.getElementById("messagePerfil").innerHTML += todosLosMensajes;
    })
}
//botón perfil usuario
document.getElementById("callPerfil").addEventListener("click", callPerfil);
function callPerfil(){
    document.getElementById("userWallPerfil").style.display = "block";
    document.getElementById("userWall").style.display = "none";
    showMessagePerfilFirebase();
}
document.getElementById("sendMessagePerfil").addEventListener("click",sendDataToFirebasePerfil);
function sendDataToFirebasePerfil(){
    let refmessage = firebase.database().ref().child("mensaje");
    let email=document.getElementById("email2").value;
    let usuario=document.getElementById("namePerfil").innerHTML;
    let messagePerfil=document.getElementById("mensajePerfil").value;
    if(messagePerfil != null && messagePerfil != "" ){
        refmessage.push({Mensaje:messagePerfil , Nombre:usuario , Eliminado:0,Principal:0,Like:0,Email:email});
        document.getElementById("mensajePerfil").value="";
   }
    else
    {
        alert("Mensaje y/o Usuario no puede estar en blanco");
    }
}
//boton editar perfil usuario
document.getElementById("edit").addEventListener("click",editPerfil);
function editPerfil(){
    document.getElementById("userWallPerfil").style.display = "none";
    document.getElementById("divEdition").style.display = "block";

}
//aparece tabla nutricional
document.getElementById("tableNut").addEventListener("click",tableVisible);
function tableVisible(){
    document.getElementById("userWallPerfil").style.display="none";
    document.getElementById("tablaNut").style.display="block";
}

//desaparece tabla nutricional
document.getElementById("returnButtonP").addEventListener("click",tableInVisible);
function tableInVisible(){
    document.getElementById("userWallPerfil").style.display="block";
    document.getElementById("tablaNut").style.display="none";
}
document.getElementById("returnWall").addEventListener("click",wallVisible);
function wallVisible(){
    document.getElementById("userWallPerfil").style.display="none";
    document.getElementById("userWall").style.display="block";
}

document.getElementById("recetasVeg").addEventListener("click",recetaVisible);
function recetaVisible(){
   document.getElementById("userWallPerfil").style.display="none";
   document.getElementById("recetas").style.display="block";
}

document.getElementById("returnButton").addEventListener("click",recetaInVisible);
function recetaInVisible(){
    document.getElementById("userWallPerfil").style.display="block";
    document.getElementById("recetas").style.display="none";
}

 //Parámetros para conexión de base de datos
function initializeFirebase(){
  // Initialize Firebase
	let config = {
		apiKey: 'AIzaSyB-jbfNQ2raBjBe0Y8iDER0k1VVQIYx01M',
		authDomain: 'social-network-a15f8.firebaseapp.com',
		databaseURL: 'https://social-network-a15f8.firebaseio.com',
        projectId: 'social-network-a15f8',
        storageBucket: 'social-network-a15f8.appspot.com',
        messagingSenderId: '994003009333'
	};
	// eslint-disable-next-line no-undef
    firebase.initializeApp(config);
}