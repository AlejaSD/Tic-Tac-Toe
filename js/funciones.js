var comodin = null;
var fn_loadData = function() {
    var registros = [];
    var jsonRegistros = localStorage.getItem("registros");
    if (jsonRegistros === null) {
        localStorage.setItem("registros", "[]");
    } else {
        registros = JSON.parse(jsonRegistros);
    }
    return registros;
};

var fn_saveData = function(r) {
    var jsonRegistros = JSON.stringify(r);
    localStorage.setItem("registros", jsonRegistros);
};

var fn_formatoHMS = function(s) {
    var r = "";
    var h = s / 3600;
    h = Math.floor(h);
    r += h < 10 ? "0" : "";
    r += h + ":";
    //*****
    s -= h * 3600;
    var m = s / 60;
    m = Math.floor(m);
    r += m < 10 ? "0" : "";
    r += m + ":";
    //*****
    s -= m * 60;
    r += s < 10 ? "0" : "";
    r += s;
    return r;
};

var loadHTTP = function(url, ck) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            try {
                console.log(xhttp.responseText);
                ck(xhttp.responseText);
            } catch (e) {
                console.log("Error CallBack " + e.message);
            }
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
};


var aleatorio = function(limite) {
    return Math.floor((Math.random() * limite) + 1);
};

var ordenar_arreglo = function(n) {
    for (var i = 0; i < n.length - 1; i++)
    {
        var temp = n[i + 1];
        var j = i + 1;
        while (j > 0 && temp.tiempo < n[j - 1].tiempo)
        {
            n[j] = n[j - 1];
            j--;
        }
        n[j] = temp;
    }
    return n;
};

