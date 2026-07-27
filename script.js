const app=document.querySelector("#app"),
matrix=document.querySelector("#matrix"),
fx=document.querySelector("#fx");

let level=0;
let seconds=420;
let timer;
let startTime;
let locked=false;
let ctx;
let won=false;
let mistakes=0;

const missions=[
  [
    "PHISHING",
    "assets/phishing.svg",
    "Un atacante utiliza mensajes falsos para engañar a las personas y obtener información confidencial.",
    "¿Qué es el phishing?",
    [
      "Un antivirus",
      "Un programa para proteger equipos",
      "Una técnica para engañar y robar información",
      "Un tipo de respaldo de información"
    ],
    2
  ],
  [
    "CORREO SOSPECHOSO",
    "assets/phishing.svg",
    "Recibes un correo con un enlace urgente y un archivo adjunto desconocido.",
    "¿Qué debes hacer?",
    [
      "Abrir el enlace inmediatamente",
      "Descargar todos los archivos adjuntos",
      "Reenviarlo a un compañero",
      "Reportarlo a TI y no abrir enlaces ni archivos"
    ],
    3
  ],
  [
    "MALWARE",
    "assets/ransomware.svg",
    "Los atacantes aprovechan archivos y programas sospechosos para infectar los equipos.",
    "¿Qué ayuda a prevenir un ataque de malware?",
    [
      "Desactivar el antivirus",
      "No actualizar el sistema",
      "Mantener el sistema actualizado y no abrir archivos sospechosos",
      "Compartir archivos con cualquier persona"
    ],
    2
  ],
  [
    "EQUIPO DESBLOQUEADO",
    "assets/lock.svg",
    "Vas a levantarte de tu puesto de trabajo y dejarás el computador sin supervisión.",
    "¿Qué debes hacer?",
    [
      "Apagar el computador",
      "Cerrar el navegador",
      "Desconectar el teclado",
      "Bloquear el equipo para evitar accesos no autorizados"
    ],
    3
  ],
  [
    "JEFE FINAL: RANSOMWARE",
    "assets/ransomware.svg",
    "Los servidores muestran una alerta y los archivos ya no se pueden abrir. El atacante exige un pago.",
    "¿Qué hace un ransomware?",
    [
      "Aumenta la velocidad del computador",
      "Elimina el antivirus",
      "Cifra la información y solicita un rescate",
      "Mejora la seguridad del sistema"
    ],
    2
  ],
  [
    "DEFENSA DE CUENTAS",
    "assets/lock.svg",
    "Un atacante obtuvo una contraseña; necesitas una capa adicional de protección para la cuenta.",
    "¿Qué medida aumenta la seguridad de una cuenta?",
    [
      "Compartir la contraseña",
      "Usar la misma contraseña en todas las cuentas",
      "Escribir la contraseña en un papel",
      "Utilizar autenticación multifactor (MFA)"
    ],
    3
  ]
];

function audio(type){
  try{
    ctx??=new AudioContext();

    const oscillator=ctx.createOscillator();
    const gain=ctx.createGain();
    const now=ctx.currentTime;

    let frequency=440;

    if(type==="bad") frequency=120;
    if(type==="win") frequency=660;
    if(type==="alarm") frequency=180;

    oscillator.frequency.setValueAtTime(frequency,now);

    if(type==="alarm"){
      oscillator.frequency.linearRampToValueAtTime(520,now+.45);
    }

    if(type==="win"){
      oscillator.frequency.linearRampToValueAtTime(990,now+.5);
    }

    gain.gain.setValueAtTime(.001,now);
    gain.gain.exponentialRampToValueAtTime(.15,now+.03);
    gain.gain.exponentialRampToValueAtTime(.001,now+.55);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(now+.58);
  }catch(error){}
}

function start(){
  level=0;
  seconds=420;
  won=false;
  mistakes=0;
  startTime=Date.now();

  audio("alarm");
  clearInterval(timer);

  timer=setInterval(()=>{
    seconds--;

    if(seconds<0){
      clearInterval(timer);
      fail();
    }else{
      renderMission();
    }
  },1000);

  renderMission();
}

function intro(){
  app.innerHTML=`
    <section class="screen terminal">
      <div class="eyebrow">E2 ENERGÍA EFICIENTE // SISTEMA SEGURO</div>
      <h1>OPERACIÓN<br>FIREWALL</h1>
      <p id="type"></p>
      <div class="prompt" id="prompt"></div>
      <button class="btn" id="go">INICIAR MISIÓN</button>
    </section>
  `;

  const text=`Se detectó un intento de ransomware.

Un atacante intenta robar información de la empresa.

Solo el equipo de TI puede detener el ataque.

Dispones de 7 minutos.`;

  let i=0;
  const paragraph=document.querySelector("#type");

  const writer=setInterval(()=>{
    paragraph.textContent+=text[i++]||"";

    if(i>text.length){
      clearInterval(writer);
      document.querySelector("#prompt").textContent="> LISTO PARA DEFENDER";
    }
  },18);

  document.querySelector("#go").onclick=start;
}

function renderMission(){
  if(won||seconds<0) return;

  const mission=missions[level];
  const percent=Math.round((level/6)*100);
  const minutes=String(Math.floor(seconds/60)).padStart(2,"0");
  const secs=String(seconds%60).padStart(2,"0");

  app.innerHTML=`
    <section class="screen">
      <div class="hud">
        <b>NIVEL ${level+1} DE 6 · ${percent}%</b>
        <div class="bar">
          <i style="width:${percent}%"></i>
        </div>
        <span class="timer">⏱ ${minutes}:${secs}</span>
      </div>

      <article class="card">
        <div class="tag">MISIÓN ${level+1} // ${mission[0]}</div>

        <div class="art">
          <img src="${mission[1]}" alt="${mission[0]}">
        </div>

        <p class="scenario">${mission[2]}</p>

        <h2>${mission[3]}</h2>

        <div class="options">
          ${mission[4].map((option,index)=>`
            <button class="option" data-index="${index}">
              ${option}
            </button>
          `).join("")}
        </div>

        <div class="feedback"></div>
      </article>
    </section>
  `;

  document.querySelectorAll(".option").forEach(button=>{
    button.onclick=()=>{
      answer(
        Number(button.dataset.index),
        mission[5],
        button
      );
    };
  });
}

function answer(choice,correct,button){
  if(locked) return;

  locked=true;

  if(choice!==correct){
    mistakes++;
  }

  setTimeout(()=>{
    level++;
    locked=false;

    if(level===6){
      victory();
    }else{
      renderMission();
    }
  },180);
}

function fail(){
  app.innerHTML=`
    <section class="screen end">
      <h2 style="color:var(--r);text-shadow:0 0 18px var(--r)">
        MISIÓN FALLIDA
      </h2>
      <p>El ransomware cifró los servidores.</p>
      <button class="btn" id="retry">INTENTAR NUEVAMENTE</button>
    </section>
  `;

  document.querySelector("#retry").onclick=start;
}

function victory(){
  won=true;
  clearInterval(timer);
  audio("win");
  confetti();

  const used=Math.ceil((Date.now()-startTime)/1000);
  const minutes=Math.floor(used/60);
  const secs=String(used%60).padStart(2,"0");
  const score=Math.round(((6-mistakes)/6)*100);
  const correctAnswers=6-mistakes;

  app.innerHTML=`
    <section class="screen end">
      <img src="assets/certificate.svg" alt="Certificado">

      <h2>MISIÓN COMPLETADA</h2>

      <p>Has protegido la información de la empresa.</p>

      <div class="tag">DEFENSOR DE LA CIBERSEGURIDAD</div>

      <div class="score">${score}%</div>

      <p class="muted">Respuestas correctas: ${correctAnswers} de 6</p>
      <p class="muted">Errores cometidos: ${mistakes}</p>
      <p class="muted">Tiempo utilizado: ${minutes}:${secs}</p>

      <button class="btn" id="again">JUGAR NUEVAMENTE</button>
    </section>
  `;

  document.querySelector("#again").onclick=start;
}

function rain(){
  const context=matrix.getContext("2d");
  let columns;
  let drops=[];

  function resize(){
    matrix.width=innerWidth;
    matrix.height=innerHeight;
    columns=Math.floor(innerWidth/16);
    drops=Array(columns).fill(1);
  }

  resize();
  addEventListener("resize",resize);

  setInterval(()=>{
    context.fillStyle="rgba(5,5,5,.09)";
    context.fillRect(0,0,matrix.width,matrix.height);

    context.fillStyle="#00ff88";
    context.font="13px monospace";

    drops.forEach((y,index)=>{
      const character=String.fromCharCode(
        0x30a0+Math.random()*96
      );

      context.fillText(character,index*16,y*16);

      if(y*16>matrix.height&&Math.random()>.975){
        drops[index]=0;
      }

      drops[index]++;
    });
  },50);
}

function confetti(){
  const context=fx.getContext("2d");

  const pieces=Array.from({length:140},()=>({
    x:innerWidth/2,
    y:innerHeight/3,
    vx:(Math.random()-.5)*12,
    vy:Math.random()*-9-2,
    alpha:1,
    color:Math.random()>.5?"#00ff88":"#00d9ff"
  }));

  let frames=0;

  fx.width=innerWidth;
  fx.height=innerHeight;

  function draw(){
    context.clearRect(0,0,fx.width,fx.height);

    pieces.forEach(piece=>{
      piece.x+=piece.vx;
      piece.y+=piece.vy;
      piece.vy+=.19;
      piece.alpha-=.008;

      context.globalAlpha=piece.alpha;
      context.fillStyle=piece.color;
      context.fillRect(piece.x,piece.y,5,9);
    });

    context.globalAlpha=1;

    if(frames++<170){
      requestAnimationFrame(draw);
    }else{
      context.clearRect(0,0,fx.width,fx.height);
    }
  }

  draw();
}

addEventListener("mousemove",event=>{
  const cursor=document.querySelector("#cursor");
  cursor.style.left=event.clientX+"px";
  cursor.style.top=event.clientY+"px";
});

rain();
intro();