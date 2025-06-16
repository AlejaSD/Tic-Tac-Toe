var tiempo = 0;
var intervalo_tiempo = null;
var turno = null;
var posibilidades = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
var registros = [];
var juegoTerminado = false;

// **AGREGAR** - Cache para elementos DOM que se usan frecuentemente
var domElements = {};
var initDOMCache = function () {
  if (!domElements.cached) {
    domElements.jugador1 = document.getElementById("jugador1");
    domElements.jugador2 = document.getElementById("jugador2");
    domElements.btnSaveGamer1 = document.getElementById("btnSaveGamer1");
    domElements.btnSaveGamer2 = document.getElementById("btnSaveGamer2");
    domElements.iniciar = document.getElementById("iniciar");
    domElements.reiniciar = document.getElementById("reiniciar");
    domElements.timer = document.getElementById("timer");
    domElements.rol_gamer1 = document.getElementById("rol_gamer1");
    domElements.rol_gamer2 = document.getElementById("rol_gamer2");
    domElements.data = document.getElementById("data");
    domElements.tabla = document.getElementById("tabla");
    domElements.sortByTime = document.getElementById("sortByTime");
    domElements.resultado = document.getElementById("resultado");
    domElements.cerrar = document.getElementById("cerrar");
    domElements.zonas = document.querySelectorAll(".zona");
    domElements.cached = true;
  }
  return domElements;
};

// **AGREGAR** - Debounce para validación (evitar validaciones excesivas)
var debounce = function (func, delay) {
  var timeoutId;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      func.apply(context, args);
    }, delay);
  };
};

var guardar_resultado = function (esEmpate = false) {
  // **OPTIMIZAR** - Usar cache DOM
  var dom = domElements.cached ? domElements : initDOMCache();

  var o = Object();
  // **CORREGIR** - Siempre guardar ambos jugadores
  o.jugador1 = dom.jugador1.value.trim();
  o.jugador2 = dom.jugador2.value.trim();
  o.tiempo = tiempo;

  if (esEmpate) {
    o.nombre = "EMPATE";
    o.ganador = null; // **NUEVO** - No hay ganador
    o.rol = "EMPATE";
    o.tipo = "empate";
  } else {
    // **CORREGIR** - Determinar quién ganó basándose en el turno actual
    var ganadorElement = document.querySelector(".ganador input[type=text]");
    var rolElement = document.querySelector(".ganador .rol");

    o.nombre = ganadorElement ? ganadorElement.value : "";
    o.ganador = o.nombre; // **NUEVO** - Especificar quién ganó
    o.rol = rolElement ? rolElement.innerHTML : "";
    o.tipo = "victoria";

    // **NUEVO** - Determinar quién perdió
    o.perdedor = o.ganador === o.jugador1 ? o.jugador2 : o.jugador1;
  }

  registros.push(o);

  // **OPTIMIZAR** - Diferir guardado para no bloquear
  setTimeout(function () {
    fn_saveData(registros);
  }, 0);
};

var validar_jugada = function () {
  var gano = -1;
  var dom = domElements.cached ? domElements : initDOMCache();
  var zonas = dom.zonas;

  // **OPTIMIZAR** - Usar for tradicional (más rápido que forEach)
  for (var i = 0; i < posibilidades.length; i++) {
    var p = posibilidades[i];
    if (
      zonas[p[0]].innerHTML !== "" &&
      zonas[p[1]].innerHTML !== "" &&
      zonas[p[2]].innerHTML !== "" &&
      zonas[p[0]].innerHTML === zonas[p[1]].innerHTML &&
      zonas[p[0]].innerHTML === zonas[p[2]].innerHTML
    ) {
      // **OPTIMIZAR** - Usar requestAnimationFrame para cambios visuales
      if (window.requestAnimationFrame) {
        requestAnimationFrame(function () {
          zonas[p[0]].classList.add("jugada_ganadora");
          zonas[p[1]].classList.add("jugada_ganadora");
          zonas[p[2]].classList.add("jugada_ganadora");
        });
      } else {
        zonas[p[0]].classList.add("jugada_ganadora");
        zonas[p[1]].classList.add("jugada_ganadora");
        zonas[p[2]].classList.add("jugada_ganadora");
      }

      gano = 1;
      break;
    }
  }

  if (gano === -1) {
    var z_jugadas = document.querySelectorAll(".jugado");
    if (z_jugadas.length === 9) {
      gano = 0;

      // **OPTIMIZAR** - Usar requestAnimationFrame para mejor rendimiento
      if (window.requestAnimationFrame) {
        requestAnimationFrame(function () {
          for (var i = 0; i < z_jugadas.length; i++) {
            if (!z_jugadas[i].classList.contains("jugada_ganadora")) {
              z_jugadas[i].classList.add("jugada_perdedora");
            }
          }
        });
      } else {
        for (var i = 0; i < z_jugadas.length; i++) {
          if (!z_jugadas[i].classList.contains("jugada_ganadora")) {
            z_jugadas[i].classList.add("jugada_perdedora");
          }
        }
      }
    }
  }

  return gano;
};

var inicio_tiempo = function () {
  if (intervalo_tiempo === null) {
    var dom = domElements.cached ? domElements : initDOMCache();
    tiempo = 0;
    intervalo_tiempo = setInterval(function () {
      tiempo++;
      dom.timer.innerHTML = fn_formatoHMS(tiempo);
    }, 1000);
  }
};

var para_tiempo = function () {
  clearInterval(intervalo_tiempo);
  tiempo = 0;
  intervalo_tiempo = null;
};

var asignar_turno = function (b) {
  turno = b;
  var turnoAnterior = document.querySelector(".activo");
  if (turnoAnterior) {
    turnoAnterior.classList.remove("activo");
  }
  if (b !== null) {
    if (b) {
      // Buscar el jugador con rol X y agregar clase activo a su contenedor padre
      var gx = document.querySelector(".rolx");
      if (gx) {
        gx.classList.add("activo");
      }
    } else {
      // Buscar el jugador con rol O y agregar clase activo a su contenedor padre
      var go = document.querySelector(".rolo");
      if (go) {
        go.classList.add("activo");
      }
    }
  }
};

var deshabilitarTablero = function () {
  var dom = domElements.cached ? domElements : initDOMCache();
  var zonas = dom.zonas;

  // **OPTIMIZAR** - Usar requestAnimationFrame para cambios visuales
  if (window.requestAnimationFrame) {
    requestAnimationFrame(function () {
      for (var i = 0; i < zonas.length; i++) {
        var zona = zonas[i];
        zona.style.pointerEvents = "none";
        zona.style.cursor = "default";
        zona.style.opacity = "0.7";
      }
    });
  } else {
    for (var i = 0; i < zonas.length; i++) {
      var zona = zonas[i];
      zona.style.pointerEvents = "none";
      zona.style.cursor = "default";
      zona.style.opacity = "0.7";
    }
  }
};

var habilitarTablero = function () {
  var dom = domElements.cached ? domElements : initDOMCache();
  var zonas = dom.zonas;

  // **OPTIMIZAR** - Usar requestAnimationFrame
  if (window.requestAnimationFrame) {
    requestAnimationFrame(function () {
      for (var i = 0; i < zonas.length; i++) {
        var zona = zonas[i];
        zona.style.pointerEvents = "auto";
        zona.style.cursor = "pointer";
        zona.style.opacity = "1";
      }
    });
  } else {
    for (var i = 0; i < zonas.length; i++) {
      var zona = zonas[i];
      zona.style.pointerEvents = "auto";
      zona.style.cursor = "pointer";
      zona.style.opacity = "1";
    }
  }
};

// **OPTIMIZAR** - Validación con debounce
var validarCamposJugadores = debounce(function () {
  var dom = domElements.cached ? domElements : initDOMCache();
  var jd1 = dom.jugador1.value.trim();
  var jd2 = dom.jugador2.value.trim();

  if (jd1 !== "" && jd2 !== "") {
    dom.iniciar.disabled = false;
    dom.iniciar.style.opacity = "1";
  } else {
    dom.iniciar.disabled = true;
    dom.iniciar.style.opacity = "0.5";
  }
}, 300); // **OPTIMIZAR** - Solo validar cada 300ms

var click_jugada = function (e) {
  if (juegoTerminado) {
    return;
  }

  if (turno !== null) {
    if (e.target.innerHTML === "") {
      var turnoActual = turno; // **NUEVO** - Guardar el turno actual antes de validar
      
      if (turno) {
        e.target.innerHTML = "X";
        e.target.classList.add("jugadox");
      } else {
        e.target.innerHTML = "O";
        e.target.classList.add("jugadoo");
      }
      e.target.classList.add("jugado");
      var gano = validar_jugada();
      if (gano === -1) {
        asignar_turno(!turno);
      } else if (gano === 1) {
        juegoTerminado = true;
        deshabilitarTablero();
        asignar_turno(null);

        // **CORREGIR** - Usar el turno que acaba de jugar, no el turno actual
        if (turnoActual) {
          var ganador = document.querySelector(".gamer.rolx");
          ganador.classList.add("ganador");
        } else {
          var ganador = document.querySelector(".gamer.rolo");
          ganador.classList.add("ganador");
        }
        guardar_resultado(false);
        setTimeout(function () {
          var ng = document.querySelector(".ganador input[type=text]");
          alert("¡Ganaste " + ng.value + "!");
          fin_juego();
        }, 3000);
      } else {
        juegoTerminado = true;
        deshabilitarTablero();
        asignar_turno(null);

        guardar_resultado(true);
        setTimeout(function () {
          var dom = domElements.cached ? domElements : initDOMCache();
          alert(
            "¡EMPATE! No hay ganador en esta partida.\n" +
              "Jugadores: " +
              dom.jugador1.value.trim() +
              " vs " +
              dom.jugador2.value.trim()
          );
          fin_juego();
        }, 3000);
      }
    } else {
      if (!juegoTerminado) {
        alert("Ya fue jugado");
      }
    }
  } else {
    if (!juegoTerminado) {
      alert("No se ha iniciado el juego");
    }
  }
};

var inicio_juego = function () {
  juegoTerminado = false;
  var dom = domElements.cached ? domElements : initDOMCache();

  var rol = aleatorio(2);
  if (rol === 1) {
    document.querySelector(".gamer:nth-child(1)").classList.add("rolx");
    document.querySelector(".gamer:nth-child(3)").classList.add("rolo");
    dom.rol_gamer1.innerHTML = "X";
    dom.rol_gamer2.innerHTML = "O";
  } else {
    document.querySelector(".gamer:nth-child(1)").classList.add("rolo");
    document.querySelector(".gamer:nth-child(3)").classList.add("rolx");
    dom.rol_gamer1.innerHTML = "O";
    dom.rol_gamer2.innerHTML = "X";
  }
  asignar_turno(true);
  inicio_tiempo();
  habilitarTablero();
};

var fin_juego = function () {
  juegoTerminado = true;
  var dom = domElements.cached ? domElements : initDOMCache();

  para_tiempo();
  dom.timer.innerHTML = "00:00:00";
  asignar_turno(null);

  var rolx = document.querySelector(".rolx");
  var rolo = document.querySelector(".rolo");
  if (rolx) rolx.classList.remove("rolx");
  if (rolo) rolo.classList.remove("rolo");

  dom.rol_gamer1.innerHTML = "";
  dom.rol_gamer2.innerHTML = "";

  dom.jugador1.value = "";
  dom.jugador2.value = "";
  dom.jugador1.readOnly = false;
  dom.jugador2.readOnly = false;
  dom.jugador1.classList.remove("error");
  dom.jugador2.classList.remove("error");

  dom.btnSaveGamer1.classList.remove("oculto");
  dom.btnSaveGamer2.classList.remove("oculto");
  dom.btnSaveGamer1.disabled = false;
  dom.btnSaveGamer2.disabled = false;
  dom.btnSaveGamer1.style.backgroundColor = "";
  dom.btnSaveGamer2.style.backgroundColor = "";
  dom.btnSaveGamer1.innerHTML = "Guardar";
  dom.btnSaveGamer2.innerHTML = "Guardar";

  dom.iniciar.classList.remove("oculto");
  dom.reiniciar.classList.add("oculto");

  validarCamposJugadores();

  var g = document.querySelector(".ganador");
  if (g) {
    g.classList.remove("ganador");
  }

  // **OPTIMIZAR** - Usar requestAnimationFrame para limpiar tablero
  if (window.requestAnimationFrame) {
    requestAnimationFrame(function () {
      for (var i = 0; i < dom.zonas.length; i++) {
        var z = dom.zonas[i];
        z.classList.remove("jugado");
        z.classList.remove("jugadox");
        z.classList.remove("jugadoo");
        z.classList.remove("jugada_ganadora");
        z.classList.remove("jugada_perdedora");
        z.innerHTML = "";
        z.style.pointerEvents = "auto";
        z.style.cursor = "pointer";
        z.style.opacity = "1";
      }
    });
  } else {
    for (var i = 0; i < dom.zonas.length; i++) {
      var z = dom.zonas[i];
      z.classList.remove("jugado");
      z.classList.remove("jugadox");
      z.classList.remove("jugadoo");
      z.classList.remove("jugada_ganadora");
      z.classList.remove("jugada_perdedora");
      z.innerHTML = "";
      z.style.pointerEvents = "auto";
      z.style.cursor = "pointer";
      z.style.opacity = "1";
    }
  }

  juegoTerminado = false;
};

var guardarJugador = function (e) {
  var dom = domElements.cached ? domElements : initDOMCache();
  var txtJugador = null;
  var nombreJugador = "";

  if (e.target === dom.btnSaveGamer1) {
    txtJugador = dom.jugador1;
    nombreJugador = "Jugador 1";
  } else {
    txtJugador = dom.jugador2;
    nombreJugador = "Jugador 2";
  }

  txtJugador.classList.remove("error");

  if (txtJugador.value.trim() === "") {
    txtJugador.classList.add("error");
    alert("Por favor ingrese un nombre válido para " + nombreJugador);
  } else {
    var key = txtJugador.id;
    var value = txtJugador.value.trim();

    // **OPTIMIZAR** - Diferir localStorage para no bloquear
    setTimeout(function () {
      localStorage.setItem(key, value);
    }, 0);

    alert(
      "¡Nickname de " +
        nombreJugador +
        " (" +
        value +
        ") registrado correctamente!"
    );

    e.target.style.backgroundColor = "rgba(72, 187, 120, 0.8)";
    e.target.innerHTML = "✓ Guardado";
    e.target.disabled = true;

    setTimeout(function () {
      e.target.disabled = false;
      e.target.style.backgroundColor = "";
      e.target.innerHTML = "Guardar";
    }, 2000);

    validarCamposJugadores();
  }
};

// **OPTIMIZAR** - Renderizado con paginación para grandes datasets
var renderScore = function (vr) {
  var dom = domElements.cached ? domElements : initDOMCache();

  // **OPTIMIZAR** - Limitar elementos mostrados para evitar lag
  var maxItems = 100;
  var displayData = vr.length > maxItems ? vr.slice(0, maxItems) : vr;

  var html = "<table>";
  html += "<thead><tr>";
  html +=
    "<th>#</th><th>Jugador 1</th><th>Jugador 2</th><th>Ganador</th><th>Rol</th><th>Resultado</th><th>Tiempo</th>"; // **MODIFICADO** - Mejorar headers
  html += "</tr></thead>";
  html += "<tbody>";

  // **OPTIMIZAR** - Procesar en chunks para evitar bloqueo
  var processInChunks = function (data, chunkSize) {
    var index = 0;
    var htmlChunk = "";

    function processChunk() {
      var chunk = Math.min(chunkSize, data.length - index);

      for (var i = 0; i < chunk; i++) {
        var jugador = data[index];
        htmlChunk += "<tr>";
        htmlChunk += "<td>" + (index + 1) + "</td>";

        if (jugador.tipo === "empate") {
          htmlChunk +=
            "<td style='font-weight: bold; color: #ff6b35;'>" +
            (jugador.jugador1 || "N/A") +
            "</td>";
          htmlChunk +=
            "<td style='font-weight: bold; color: #ff6b35;'>" +
            (jugador.jugador2 || "N/A") +
            "</td>";
          htmlChunk += "<td style='font-weight: bold; color: #ff6b35;'>-</td>";
          htmlChunk += "<td style='font-weight: bold; color: #ff6b35;'>-</td>";
          htmlChunk +=
            "<td style='font-weight: bold; color: #ff6b35; background-color: rgba(255, 107, 53, 0.1);'>EMPATE</td>";
        } else {
          // **CORREGIR** - Mostrar ambos jugadores y destacar ganador
          var j1Style =
            jugador.ganador === jugador.jugador1
              ? "font-weight: bold; color: #28a745;"
              : "color: #6c757d;";
          var j2Style =
            jugador.ganador === jugador.jugador2
              ? "font-weight: bold; color: #28a745;"
              : "color: #6c757d;";

          htmlChunk +=
            "<td style='" +
            j1Style +
            "'>" +
            (jugador.jugador1 || "N/A") +
            "</td>";
          htmlChunk +=
            "<td style='" +
            j2Style +
            "'>" +
            (jugador.jugador2 || "N/A") +
            "</td>";
          htmlChunk +=
            "<td style='font-weight: bold; color: #28a745;'>" +
            (jugador.ganador || jugador.nombre) +
            "</td>";
          htmlChunk += "<td>" + (jugador.rol || "-") + "</td>";
          htmlChunk +=
            "<td style='font-weight: bold; color: #28a745;'>VICTORIA</td>";
        }

        htmlChunk += "<td>" + fn_formatoHMS(jugador.tiempo) + "</td>";
        htmlChunk += "</tr>";
        index++;
      }

      if (index < data.length) {
        // **OPTIMIZAR** - Usar setTimeout para no bloquear
        setTimeout(processChunk, 0);
      } else {
        // Finalizar tabla
        html += htmlChunk + "</tbody></table>";

        // **MEJORAR** - Estadísticas más detalladas
        var totalPartidas = vr.length;
        var victorias = vr.filter(function (r) {
          return r.tipo === "victoria";
        }).length;
        var empates = vr.filter(function (r) {
          return r.tipo === "empate";
        }).length;

        // **NUEVO** - Estadísticas por jugador
        var jugadoresStats = {};
        for (var i = 0; i < vr.length; i++) {
          var partida = vr[i];

          if (partida.jugador1) {
            if (!jugadoresStats[partida.jugador1]) {
              jugadoresStats[partida.jugador1] = {
                partidas: 0,
                victorias: 0,
                empates: 0,
              };
            }
            jugadoresStats[partida.jugador1].partidas++;
            if (partida.tipo === "empate") {
              jugadoresStats[partida.jugador1].empates++;
            } else if (partida.ganador === partida.jugador1) {
              jugadoresStats[partida.jugador1].victorias++;
            }
          }

          if (partida.jugador2) {
            if (!jugadoresStats[partida.jugador2]) {
              jugadoresStats[partida.jugador2] = {
                partidas: 0,
                victorias: 0,
                empates: 0,
              };
            }
            jugadoresStats[partida.jugador2].partidas++;
            if (partida.tipo === "empate") {
              jugadoresStats[partida.jugador2].empates++;
            } else if (partida.ganador === partida.jugador2) {
              jugadoresStats[partida.jugador2].victorias++;
            }
          }
        }

        html +=
          "<div style='margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;'>";
        html +=
          "<h4 style='margin: 0 0 10px 0; color: #3B310A;'>Estadísticas Generales</h4>";
        html +=
          "<p style='margin: 5px 0;'><strong>Total de partidas:</strong> " +
          totalPartidas +
          "</p>";
        html +=
          "<p style='margin: 5px 0;'><strong>Victorias:</strong> " +
          victorias +
          "</p>";
        html +=
          "<p style='margin: 5px 0;'><strong>Empates:</strong> " +
          empates +
          "</p>";
        if (totalPartidas > 0) {
          var porcentajeEmpates = ((empates / totalPartidas) * 100).toFixed(1);
          html +=
            "<p style='margin: 5px 0;'><strong>Porcentaje de empates:</strong> " +
            porcentajeEmpates +
            "%</p>";
        }

        // **NUEVO** - Mostrar estadísticas por jugador
        html +=
          "<h5 style='margin: 15px 0 5px 0; color: #3B310A;'>Estadísticas por Jugador</h5>";
        for (var jugador in jugadoresStats) {
          var stats = jugadoresStats[jugador];
          var derrotas = stats.partidas - stats.victorias - stats.empates;
          var porcentajeVictorias =
            stats.partidas > 0
              ? ((stats.victorias / stats.partidas) * 100).toFixed(1)
              : 0;

          html +=
            "<div style='margin: 5px 0; padding: 8px; background-color: #fff; border-left: 3px solid #28a745;'>";
          html += "<strong>" + jugador + ":</strong> ";
          html += stats.partidas + " partidas, ";
          html +=
            "<span style='color: #28a745;'>" +
            stats.victorias +
            " victorias</span>, ";
          html +=
            "<span style='color: #ff6b35;'>" +
            stats.empates +
            " empates</span>, ";
          html +=
            "<span style='color: #dc3545;'>" + derrotas + " derrotas</span> ";
          html += "(" + porcentajeVictorias + "% efectividad)";
          html += "</div>";
        }

        if (vr.length > maxItems) {
          html +=
            "<p style='margin: 10px 0; font-style: italic; color: #666;'>";
          html +=
            "Mostrando primeros " +
            maxItems +
            " de " +
            vr.length +
            " registros para mejor rendimiento";
          html += "</p>";
        }

        html += "</div>";

        // **OPTIMIZAR** - Usar requestAnimationFrame para actualizar DOM
        if (window.requestAnimationFrame) {
          requestAnimationFrame(function () {
            dom.data.innerHTML = html;
          });
        } else {
          dom.data.innerHTML = html;
        }
      }
    }

    processChunk();
  };

  // **OPTIMIZAR** - Procesar datos
  if (displayData.length > 20) {
    processInChunks(displayData, 10); // Procesar de 10 en 10
  } else {
    // Para pocos elementos, procesar directamente
    for (var i = 0; i < displayData.length; i++) {
      var jugador = displayData[i];
      html += "<tr>";
      html += "<td>" + (i + 1) + "</td>";

      if (jugador.tipo === "empate") {
        html +=
          "<td style='font-weight: bold; color: #ff6b35;'>" +
          (jugador.jugador1 || "N/A") +
          "</td>";
        html +=
          "<td style='font-weight: bold; color: #ff6b35;'>" +
          (jugador.jugador2 || "N/A") +
          "</td>";
        html += "<td style='font-weight: bold; color: #ff6b35;'>-</td>";
        html += "<td style='font-weight: bold; color: #ff6b35;'>-</td>";
        html +=
          "<td style='font-weight: bold; color: #ff6b35; background-color: rgba(255, 107, 53, 0.1);'>EMPATE</td>";
      } else {
        // **CORREGIR** - Mostrar ambos jugadores y destacar ganador
        var j1Style =
          jugador.ganador === jugador.jugador1
            ? "font-weight: bold; color: #28a745;"
            : "color: #6c757d;";
        var j2Style =
          jugador.ganador === jugador.jugador2
            ? "font-weight: bold; color: #28a745;"
            : "color: #6c757d;";

        html +=
          "<td style='" +
          j1Style +
          "'>" +
          (jugador.jugador1 || "N/A") +
          "</td>";
        html +=
          "<td style='" +
          j2Style +
          "'>" +
          (jugador.jugador2 || "N/A") +
          "</td>";
        html +=
          "<td style='font-weight: bold; color: #28a745;'>" +
          (jugador.ganador || jugador.nombre) +
          "</td>";
        html += "<td>" + (jugador.rol || "-") + "</td>";
        html += "<td style='font-weight: bold; color: #28a745;'>VICTORIA</td>";
      }

      html += "<td>" + fn_formatoHMS(jugador.tiempo) + "</td>";
      html += "</tr>";
    }
    html += "</tbody></table>";

    // Estadísticas inmediatas (mismo código que arriba)
    var totalPartidas = vr.length;
    var victorias = vr.filter(function (r) {
      return r.tipo === "victoria";
    }).length;
    var empates = vr.filter(function (r) {
      return r.tipo === "empate";
    }).length;

    // Estadísticas por jugador (mismo código que arriba)
    var jugadoresStats = {};
    for (var i = 0; i < vr.length; i++) {
      var partida = vr[i];

      if (partida.jugador1) {
        if (!jugadoresStats[partida.jugador1]) {
          jugadoresStats[partida.jugador1] = {
            partidas: 0,
            victorias: 0,
            empates: 0,
          };
        }
        jugadoresStats[partida.jugador1].partidas++;
        if (partida.tipo === "empate") {
          jugadoresStats[partida.jugador1].empates++;
        } else if (partida.ganador === partida.jugador1) {
          jugadoresStats[partida.jugador1].victorias++;
        }
      }

      if (partida.jugador2) {
        if (!jugadoresStats[partida.jugador2]) {
          jugadoresStats[partida.jugador2] = {
            partidas: 0,
            victorias: 0,
            empates: 0,
          };
        }
        jugadoresStats[partida.jugador2].partidas++;
        if (partida.tipo === "empate") {
          jugadoresStats[partida.jugador2].empates++;
        } else if (partida.ganador === partida.jugador2) {
          jugadoresStats[partida.jugador2].victorias++;
        }
      }
    }

    html +=
      "<div style='margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;'>";
    html +=
      "<h4 style='margin: 0 0 10px 0; color: #3B310A;'>Estadísticas Generales</h4>";
    html +=
      "<p style='margin: 5px 0;'><strong>Total de partidas:</strong> " +
      totalPartidas +
      "</p>";
    html +=
      "<p style='margin: 5px 0;'><strong>Victorias:</strong> " +
      victorias +
      "</p>";
    html +=
      "<p style='margin: 5px 0;'><strong>Empates:</strong> " + empates + "</p>";
    if (totalPartidas > 0) {
      var porcentajeEmpates = ((empates / totalPartidas) * 100).toFixed(1);
      html +=
        "<p style='margin: 5px 0;'><strong>Porcentaje de empates:</strong> " +
        porcentajeEmpates +
        "%</p>";
    }

    // Estadísticas por jugador
    html +=
      "<h5 style='margin: 15px 0 5px 0; color: #3B310A;'>Estadísticas por Jugador</h5>";
    for (var jugador in jugadoresStats) {
      var stats = jugadoresStats[jugador];
      var derrotas = stats.partidas - stats.victorias - stats.empates;
      var porcentajeVictorias =
        stats.partidas > 0
          ? ((stats.victorias / stats.partidas) * 100).toFixed(1)
          : 0;

      html +=
        "<div style='margin: 5px 0; padding: 8px; background-color: #fff; border-left: 3px solid #28a745;'>";
      html += "<strong>" + jugador + ":</strong> ";
      html += stats.partidas + " partidas, ";
      html +=
        "<span style='color: #28a745;'>" +
        stats.victorias +
        " victorias</span>, ";
      html +=
        "<span style='color: #ff6b35;'>" + stats.empates + " empates</span>, ";
      html += "<span style='color: #dc3545;'>" + derrotas + " derrotas</span> ";
      html += "(" + porcentajeVictorias + "% efectividad)";
      html += "</div>";
    }
    html += "</div>";

    dom.data.innerHTML = html;
  }
};

// **OPTIMIZAR** - Window.onload diferido para mejor rendimiento
window.onload = function () {
  // **OPTIMIZAR** - Inicializar cache DOM primero
  initDOMCache();

  // **OPTIMIZAR** - Cargar datos de forma asíncrona
  setTimeout(function () {
    registros = fn_loadData();
  }, 0);

  var dom = domElements;

  var nj1 = localStorage.getItem("jugador1");
  if (nj1 !== null) {
    dom.jugador1.value = nj1;
  }

  var nj2 = localStorage.getItem("jugador2");
  if (nj2 !== null) {
    dom.jugador2.value = nj2;
  }

  validarCamposJugadores();
  dom.jugador1.oninput = validarCamposJugadores;
  dom.jugador2.oninput = validarCamposJugadores;

  dom.btnSaveGamer1.onclick = guardarJugador;
  dom.btnSaveGamer2.onclick = guardarJugador;

  dom.sortByTime.onchange = function (e) {
    if (e.target.checked) {
      // **OPTIMIZAR** - Procesar ordenamiento de forma asíncrona
      setTimeout(function () {
        var vr = JSON.parse(JSON.stringify(registros));
        vr = ordenar_arreglo(vr);
        renderScore(vr);
      }, 0);
    } else {
      renderScore(registros);
    }
  };

  dom.iniciar.onclick = function (e) {
    var jd1 = dom.jugador1.value.trim();
    var jd2 = dom.jugador2.value.trim();

    if (jd1 === "" || jd2 === "") {
      alert("Debe ingresar los nombres de ambos jugadores antes de iniciar");
      return;
    }

    if (jd1.toLowerCase() === jd2.toLowerCase()) {
      alert("Los nombres de los jugadores deben ser diferentes");
      return;
    }

    dom.btnSaveGamer1.classList.add("oculto");
    dom.btnSaveGamer2.classList.add("oculto");
    dom.jugador1.readOnly = true;
    dom.jugador2.readOnly = true;
    dom.iniciar.classList.add("oculto");
    dom.reiniciar.classList.remove("oculto");
    inicio_juego();
  };

  dom.reiniciar.onclick = function (e) {
    fin_juego();
  };

  dom.resultado.onclick = function (e) {
    dom.sortByTime.checked = false;
    renderScore(registros);
    dom.tabla.classList.add("show");
  };

  dom.cerrar.onclick = function () {
    dom.tabla.classList.remove("show");
  };

  // **OPTIMIZAR** - Asignar eventos usando cache
  for (var i = 0; i < dom.zonas.length; i++) {
    dom.zonas[i].onclick = click_jugada;
  }
};
