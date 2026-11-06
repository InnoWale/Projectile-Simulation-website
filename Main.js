
const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

const cannon = document.getElementById("cannon");

const ground = document.getElementById("ground");
const groundHeight = ground.getBoundingClientRect().top;

const LaunchBtn = document.getElementById("start-btn");
const SpeedValue = document.getElementById("Initial-speed-value");
const SpeedSlider = document.getElementById("speed-slider");
const AngleValue = document.getElementById("Initial-angle-value");
const AngleSlider = document.getElementById("angle-slider");

const VelocityXValue = document.getElementById("velocity-x");
const VelocityYValue = document.getElementById("velocity-y");
const heightValue = document.getElementById("height-value");
const angleValue = document.getElementById("angle-value");

const PeakHeight = [document.getElementById("peak-height"), document.getElementById("peak-height1")]
//const PeakHeight = document.getElementById("peak-height");
const TimeOfFlight = [document.getElementById("time-of-flight"), document.getElementById("time-of-flight1")]
//const TimeOfFlight = document.getElementById("time-of-flight");
const CurrentXVelocity = [document.getElementById("current-x-velocity"), document.getElementById("current-x-velocity1")]
//const CurrentXVelocity = document.getElementById("current-x-velocity");
const CurrentYVelocity = [document.getElementById("current-y-velocity"), document.getElementById("current-y-velocity1")]
//const CurrentYVelocity = document.getElementById("current-y-velocity");

SpeedValue.textContent = SpeedSlider.value;

var AngleInRadians = AngleSlider.value * Math.PI / 180;
heightValue.textContent = `0.00 m`;
angleValue.textContent = `${AngleSlider.value}°`;
VelocityXValue.textContent = `${(parseFloat(SpeedSlider.value * Math.cos(AngleInRadians))).toFixed(2)} m/s`;
VelocityYValue.textContent = `${(parseFloat(SpeedSlider.value * Math.sin(AngleInRadians))).toFixed(2)} m/s`;

SpeedSlider.addEventListener("input", () => {
    SpeedValue.textContent = SpeedSlider.value;

    var AngleInRadians = AngleSlider.value * Math.PI / 180;
    heightValue.textContent = "0m";
    angleValue.textContent = AngleSlider.value;
    VelocityXValue.textContent = `${(parseFloat(SpeedSlider.value * Math.cos(AngleInRadians))).toFixed(2)} m/s`;
    VelocityYValue.textContent = `${(parseFloat(SpeedSlider.value * Math.sin(AngleInRadians))).toFixed(2)} m/s`;
});

AngleSlider.addEventListener("input", () => {
    AngleValue.textContent = AngleSlider.value;
    cannon.style.transform = `rotate(-${AngleSlider.value}deg)`;

    var AngleInRadians = AngleSlider.value * Math.PI / 180;
    VelocityXValue.textContent = `${(parseFloat(SpeedSlider.value * Math.cos(AngleInRadians))).toFixed(2)} m/s`;
    VelocityYValue.textContent = `${(parseFloat(SpeedSlider.value * Math.sin(AngleInRadians))).toFixed(2)} m/s`;
});

const PixelsPerMeter = 20;
const gravity = 9.81 * PixelsPerMeter;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let Current_Projectiles = [];
let isSimulating = false

let no_Projectile = 0;

function CreateProjectile(){
    ctx.beginPath();
    
    let Projectile = document.createElement("div");
    document.body.appendChild(Projectile);
    Projectile.className = "projectile";
    Projectile.style.position = "fixed";

    let cannonRect = cannon.getBoundingClientRect();
    Projectile.style.left = `${cannonRect.left + cannon.offsetWidth - (Projectile.offsetWidth / 2)}px`;
    Projectile.style.top = `${cannonRect.top + (cannon.offsetHeight/2) - (Projectile.offsetHeight/2)}px`;

    Current_Projectiles.push({
        element: Projectile,
        PosX: 0,
        PosY: 0,
        AngleInRadians: AngleSlider.value * Math.PI / 180,
        xVelocity: parseFloat(SpeedSlider.value * Math.cos(AngleSlider.value * Math.PI / 180)) * PixelsPerMeter,
        yVelocity: -parseFloat(SpeedSlider.value * Math.sin(AngleSlider.value * Math.PI / 180)) * PixelsPerMeter,
        initialYVelocity: -parseFloat(SpeedSlider.value * Math.sin(AngleSlider.value * Math.PI / 180)) * PixelsPerMeter,
        flightTime: 0,
        peakHeight: 0,
        AtPeak: false,
        trails: [],
        place: no_Projectile,
    })

    if (!isSimulating) {
        isSimulating = true;
        requestAnimationFrame(SimulateProjectile)
    }
    PeakHeight[no_Projectile].parentNode.parentNode.parentNode.style.opacity = "0.7";
    no_Projectile += 1
}

let lastTime = 0;
function SimulateProjectile(currentTime){

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!lastTime){
        lastTime = currentTime
    }

    const deltaTime = currentTime - lastTime;
    if (deltaTime > 100) {
        if (Current_Projectiles.length > 0) {
            requestAnimationFrame(SimulateProjectile);
        }
        return;
    }

    for(let i = Current_Projectiles.length - 1; i >= 0; i--){
        let p = Current_Projectiles[i]
        var rect = p.element.getBoundingClientRect()

        p.flightTime += deltaTime/1000;
        TimeOfFlight[p.place].textContent = `${p.flightTime.toFixed(2)} seconds`;

        p.PosX += p.xVelocity * deltaTime/1000;

        p.yVelocity += (gravity * deltaTime/1000);
        p.PosY += (p.yVelocity * deltaTime/1000);

        p.element.style.transform = `translate(${p.PosX}px, ${p.PosY}px)`

        // Calculate the peak height when the projectile reaches its maximum height
        if (p.AtPeak){
                p.peakHeight = Math.pow(p.initialYVelocity, 2) / (2 * gravity);
                PeakHeight[p.place].textContent = `${(p.peakHeight/PixelsPerMeter).toFixed(2)} m`;

                console.log("peak")
        }else{
            if (p.yVelocity >= 0){
                p.AtPeak = true;
            }
            PeakHeight[p.place].textContent = `${(-p.PosY/PixelsPerMeter).toFixed(2)} m`;
        }

        CurrentXVelocity[p.place].textContent = `${(p.xVelocity/PixelsPerMeter).toFixed(2)} m/s`;
        CurrentYVelocity[p.place].textContent = `${(-p.yVelocity/PixelsPerMeter).toFixed(2)} m/s`;

        lastTime = currentTime;

        p.trails.push({
            x: p.element.getBoundingClientRect().left + p.element.offsetWidth / 2, 
            y: p.element.getBoundingClientRect().top + p.element.offsetHeight / 2
        })

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        if (p.trails.length > 0) {
            ctx.moveTo(p.trails[0].x, p.trails[0].y);
            for (let j = 1; j < p.trails.length; j++) {
                ctx.lineTo(p.trails[j].x, p.trails[j].y);
            }
            ctx.stroke();
        }

        if (rect.bottom >= groundHeight) {
            p.element.remove();
            PeakHeight[p.place].parentNode.parentNode.parentNode.style.opacity = "1";
            Current_Projectiles.splice(i, 1);
            no_Projectile -= 1 // Remove from array

            let formattedTime = (-p.initialYVelocity/gravity) * 2
            TimeOfFlight[p.place].textContent = `${formattedTime.toFixed(2)} seconds`;
        }
    }

    if (Current_Projectiles.length > 0) {
            requestAnimationFrame(SimulateProjectile);
        } else {
            isSimulating = false;
            lastTime = 0;
    }
}


LaunchBtn.addEventListener("click", () => {

    if (no_Projectile < 2 ){
        CreateProjectile();
    }
})
