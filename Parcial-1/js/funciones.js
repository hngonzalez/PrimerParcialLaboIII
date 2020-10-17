
var peticionHttp = new XMLHttpRequest();
var retorno = null;

window.addEventListener("load",function(){

    ejecutarAJAX("GET","http://localhost:3000/materias");

    var cerrar = getByID("cerrar");
    cerrar.addEventListener("click",function(){
        cerrarEdit();
    });

    var modif = getByID("modificar");
    modif.addEventListener("click",function(){
        modifEdit();
    });
    
    var elim = getByID("eliminar");
    elim.addEventListener("click",function(){
        elimEdit();
    });
});

function ejecutarAJAX(modo,ruta, json){
    switch (modo) {
        case 'GET':
            peticionHttp.onreadystatechange = respuesta;
            peticionHttp.open(modo,ruta,true);
            peticionHttp.send();
            break;
        case 'POST':
            peticionHttp.onreadystatechange = respuestaPost(json);
            peticionHttp.open(modo,ruta,true);
            peticionHttp.setRequestHeader("Content-Type","application/json");
            peticionHttp.send(JSON.stringify(json));
            break;
        default:
            break;
    }
}

function respuesta(){
    if (peticionHttp.readyState === 4) {
        if (peticionHttp.status === 200) {
            var respuesta = peticionHttp.responseText;   
            var json = JSON.parse(respuesta);  
            
            construirTabla(json);
        }   
        else {
            alert("Error en la respuesta STATUS");
        }
    }
}

function respuestaPost(json){
    if (peticionHttp.readyState === 4) {
        if (peticionHttp.status === 200) {
            return "ok";
        }   
        else {
            alert("Error en la respuesta STATUS");
        }
    }
}

function construirTabla(json){

    var rowHeadDatos = getByID("trHeadDatos");
    var tbodyDatos = getByID("tbodyDatos");
    var titCabecera = Object.keys(json[0]);

    titCabecera.forEach(element => {        
        if (element != 'id') {
            var theadTitCellTabla = document.createElement("td");
            theadTitCellTabla.setAttribute("class","rowTitTable");
            var txtNode = document.createTextNode(element);
            
            theadTitCellTabla.appendChild(txtNode);
            rowHeadDatos.appendChild(theadTitCellTabla);
        } else{
            var theadTitCellTabla = document.createElement("td");
            theadTitCellTabla.setAttribute("hidden", true);
            var txtNode = document.createTextNode(element);
            
            theadTitCellTabla.appendChild(txtNode);
            rowHeadDatos.appendChild(theadTitCellTabla);
        }
    });

    for (let i = 0; i < json.length; i++) {
        var obj = json[i];
        var colums = Object.keys(obj);
        var tbodyRowData = document.createElement("tr");
        tbodyRowData.setAttribute("class","rowDataTable");
        tbodyRowData.addEventListener("click",abrirEdit);

        for(var j=0;j<colums.length;j++){
            var text = obj[colums[j]];
                    
            if (colums[j] != 'id') {    
                var tbodyCellData = document.createElement("td");
                var txtNode = document.createTextNode(text);
                tbodyCellData.setAttribute("class","tdDataTable");

                tbodyCellData.appendChild(txtNode);                
                tbodyRowData.appendChild(tbodyCellData);
                tbodyDatos.appendChild(tbodyRowData);
            } else {
                var tbodyHiddenCellData = document.createElement("td");
                var txtNode = document.createTextNode(text);
                tbodyHiddenCellData.setAttribute("hidden", true);

                tbodyHiddenCellData.appendChild(txtNode);                
                tbodyRowData.appendChild(tbodyHiddenCellData);
                tbodyDatos.appendChild(tbodyRowData);
            }
        }        
    }
}

function abrirEdit(event){
    var editDiv = getByID("contentEdit");
    var filaEdit = event.target.parentNode;

    editDiv.style.display = "block";

    cargoEdit(filaEdit);
}

function cargoEdit(filaEdit){    
    var inputID = getByID("txtID");
    var inputNombre = getByID("txtNombre");
    var selCuatrimestre = getByID("selCuatrimestre");
    /*var inputFecha = getByID("txtFecha");*/
    var rTurno = document.getElementsByName("turno");

    var txtHidID = filaEdit.firstElementChild;
    var txtNombre = filaEdit.firstElementChild.nextElementSibling;
    var txtselCuatrimestre = filaEdit.firstElementChild.nextElementSibling.nextElementSibling;
    //var txtFecha = filaEdit.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling;
    var turno = filaEdit.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling;

    inputID.value = txtHidID.firstChild.nodeValue;
    inputNombre.value = txtNombre.firstChild.nodeValue;

    for ( var i = 0, len = selCuatrimestre.options.length; i < len; i++ ) {
        opt = selCuatrimestre.options[i]; 
        if ( opt.value === txtselCuatrimestre.firstChild.nodeValue ) {
            opt.selected = true;
            break;
        }
    }

    //inputFecha.value = txtFecha.firstChild.nodeValue;
    
    rTurno.forEach(turn => {
        if (turn.value == turno.firstChild.nodeValue) {
            turn.checked = "true";
        }
    });
}

function modifEdit(){
    
    var validado = validoEdit();

    if (validado) {
        var inputID = getByID("txtID");
        var inputNombre = getByID("txtNombre");
        var selCuatrimestre = getByID("selCuatrimestre");
        var inputFecha = getByID("txtFecha");
        var inputTurno = document.getElementsByName("turno");
        var chkTurno = "";
    
        inputTurno.forEach(Turno => {
            if (Turno.checked == true) {            
                chkTurno = getByID(Turno.id);
                
            }
        });
        
        
        var today = new Date(inputFecha.value);
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;

        var json = '{"id": "' + inputID.value + '", "nombre": "'+inputNombre.value+'", "cuatrimestre": "'+selCuatrimestre.value+'", "fechaFinal": "'+today+'", "turno": "'+chkTurno.value+'"}';
    
        json = JSON.parse(json);
        json = JSON.stringify(json);
        json = JSON.parse(json);
        
        
        var saved = ejecutarAJAX("POST","http://localhost:3000/editar", json);
        
        if (saved = "ok") 
            modifFileRow(json);  
        
    }      

}

function elimEdit(){
    var inputID = getByID("txtID");    

    var json = '{"id": "' + inputID.value + '", "nombre": "", "cuatrimestre": "", "fechaFinal": "", "turno": ""}';

    json = JSON.parse(json);
    json = JSON.stringify(json);
    json = JSON.parse(json);

    var deleted = ejecutarAJAX("POST","http://localhost:3000/eliminar", json);
    
    if (deleted = "ok")
        elimFileRowEdit(json);
}

function validoEdit(){
    var inputNombre = getByID("txtNombre");
    var inputFecha = getByID("txtFecha");
    var inputTurno = document.getElementsByName("turno");
    var dt = new Date().toISOString().split('T')[0];
    var chkFlag = 0;
    

    if (inputNombre.value.length < 6 && isNaN(inputNombre.value)) {
        alert("Nombre debe ser mayor a 6 caracteres");
        inputNombre.setAttribute("class","error");
        return false;
    }
    
    if (inputFecha.value < dt) {
        alert("La fecha debe ser mayor a la fecha de hoy");
        inputFecha.setAttribute("class","error");
        return false;
    }

    inputTurno.forEach(turno => {
        if (turno.checked == true) {            
            chkFlag = 1;     
        }
    });

    if (chkFlag == 0) {
        alert("Debe seleccionar un turno");
        return false;
    }
      
    return true;
}

 
function modifFileRow(json){
    var tbody = getByID("tbodyDatos");

        for (let i = 0; i < tbody.childElementCount; i++) {
            if (tbody.childNodes[i].nodeType != 3) {
                if (tbody.childNodes[i].firstChild.firstChild.nodeValue == json.id) {

                    tbody.childNodes[i].firstChild.nextElementSibling.firstChild.textContent = json.nombre;
                    tbody.childNodes[i].firstChild.nextElementSibling.nextElementSibling.firstChild.textContent = json.cuatrimestre;
                    tbody.childNodes[i].firstChild.nextElementSibling.nextElementSibling.nextElementSibling.firstChild.textContent = json.fechaFinal;
                    tbody.childNodes[i].firstChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.firstChild.textContent = json.turno;
                    
                }
            }
        }
    

}

function elimFileRowEdit(json){
    var tbody = getByID("tbodyDatos");
        for (let i = 0; i < tbody.childElementCount; i++) {
            if (tbody.childNodes[i].nodeType != 3) {
                if (tbody.childNodes[i].firstChild.firstChild.nodeValue == json.id) {
                    tbody.removeChild(tbody.childNodes[i]);
                }
            }
        }
}


function cerrarEdit(){
    var editDiv = getByID("contentEdit");

    editDiv.style.display = "none";
}

function getByID(dato){
    return document.getElementById(dato);
}

