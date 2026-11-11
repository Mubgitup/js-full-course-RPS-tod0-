let score =JSON.parse(localStorage.getItem('score'))||{
    win: 0,
    lose: 0,
    tie: 0
    };
udateScore();
function picComputerMove(){
    let randomNumber = Math.random();
    let computerMove = '';
    if (randomNumber >= 0 && randomNumber < 1/3){
      computerMove = 'Rock'
    } else if (randomNumber >= 1/3 && randomNumber < 2/3){
              computerMove  = 'paper'
    }
    if (randomNumber >= 2/3 && randomNumber < 1){
          computerMove = 'Scissors'
    }
     return  computerMove;
}
let isAutoplay=false;
let intervalId;
let soundEnabled = false;
let audioContext;
let audioMasterGain;
let audioWarningShown = false;

function playSound(soundName){
    if(!soundEnabled){
        return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if(!AudioContextClass){
        if(!audioWarningShown){
            console.warn('Sound effects are not supported in this browser.');
            audioWarningShown = true;
        }
        return;
    }

    try{
        audioContext = audioContext || new AudioContextClass();
        const context = audioContext;
        if(!audioMasterGain){
            audioMasterGain = context.createGain();
            audioMasterGain.gain.value = soundEnabled ? 1 : 0;
            audioMasterGain.connect(context.destination);
        }
        const soundPatterns = {
            click: [{frequency: 620, delay: 0, duration: 0.045, type: 'square', volume: 0.025}],
            'move-rock': [{frequency: 185, delay: 0, duration: 0.12, type: 'triangle', volume: 0.055}],
            'move-paper': [{frequency: 530, delay: 0, duration: 0.1, type: 'sine', volume: 0.045}],
            'move-scissors': [{frequency: 820, delay: 0, duration: 0.09, type: 'triangle', volume: 0.045}],
            'result-win': [
                {frequency: 660, delay: 0.14, duration: 0.12, type: 'sine', volume: 0.055},
                {frequency: 880, delay: 0.25, duration: 0.2, type: 'sine', volume: 0.055}
            ],
            'result-lose': [
                {frequency: 330, delay: 0.14, duration: 0.13, type: 'triangle', volume: 0.05},
                {frequency: 220, delay: 0.25, duration: 0.2, type: 'triangle', volume: 0.05}
            ],
            'result-tie': [
                {frequency: 440, delay: 0.14, duration: 0.12, type: 'sine', volume: 0.045},
                {frequency: 440, delay: 0.28, duration: 0.12, type: 'sine', volume: 0.045}
            ]
        };
        const pattern = soundPatterns[soundName];

        if(!pattern){
            return;
        }

        const schedulePattern = () => {
            if(!soundEnabled){
                return;
            }

            pattern.forEach((note) => {
                const oscillator = context.createOscillator();
                const volume = context.createGain();
                const startTime = context.currentTime + note.delay;

                oscillator.type = note.type;
                oscillator.frequency.setValueAtTime(note.frequency, startTime);
                volume.gain.setValueAtTime(0.0001, startTime);
                volume.gain.exponentialRampToValueAtTime(note.volume, startTime + 0.01);
                volume.gain.exponentialRampToValueAtTime(0.0001, startTime + note.duration);
                oscillator.connect(volume);
                volume.connect(audioMasterGain);
                oscillator.start(startTime);
                oscillator.stop(startTime + note.duration + 0.01);
            });
        };

        if(context.state === 'suspended'){
            context.resume().then(schedulePattern).catch((error) => {
                console.warn('Could not start sound effects.', error);
            });
        }else{
            schedulePattern();
        }
    }catch(error){
        console.warn('Could not play the sound effect.', error);
    }
}

function autoplay(){
    if (!isAutoplay){
        intervalId = setInterval(()=>{
              const playermove = picComputerMove();
              playgame(playermove);
        }, 2000);
        isAutoplay= true;
    }else {
        clearInterval(intervalId);
        isAutoplay= false;
    }
    
}
document.querySelector('.js-rock-button').addEventListener('click',()=>{
   playgame('Rock'); 
})
document.querySelector('.js-paper-button').addEventListener('click',()=>{
   playgame('paper'); 
});
document.querySelector('.js-sisers-button').addEventListener('click',()=>{
   playgame('scissors'); 
});
document.querySelector('.Reset').addEventListener('click',()=>{
    playSound('click');
});
document.querySelector('.auto-play-button').addEventListener('click',()=>{
    playSound('click');
});
document.querySelector('.js-sound-button').addEventListener('click',(event)=>{
    soundEnabled = !soundEnabled;
    const soundButton = event.currentTarget;
    if(audioMasterGain && audioContext){
        audioMasterGain.gain.setValueAtTime(soundEnabled ? 1 : 0,audioContext.currentTime);
    }
    soundButton.textContent = soundEnabled ? '🔊' : '🔇';
    soundButton.setAttribute('aria-label',soundEnabled ? 'Mute sound' : 'Enable sound');
    soundButton.setAttribute('aria-pressed',String(soundEnabled));
    if(soundEnabled){
        playSound('click');
    }
});

document.body.addEventListener('keydown',(event)=>{
    if(event.key ==='r'){
         playgame('Rock'); 
    }else if(event.key ==='p'){
         playgame('paper'); 
    }else if(event.key ==='s'){
         playgame('scissors'); 
    };
});
function playgame(usermove){
    const computerMove = picComputerMove();
    const playerMove = usermove.toLowerCase();
    let result='';
    if(usermove === 'Rock'){
        if(computerMove === 'Rock'){
                 result='tie.'
        }else if(computerMove === 'paper'){
                 result='You lose.'
        }else if(computerMove === 'Scissors'){
                  result='You win..'
            }
    } else if(usermove=='paper'){
        if(computerMove === 'Rock'){
            result= 'You win..' 
        }else if(computerMove === 'paper'){
               result= 'Tie.'
        }else if(computerMove === 'Scissors'){
              result='You lose.'
        }
            
    }else if(usermove ==='scissors'){
        if(computerMove === 'Rock'){
            result= 'You lose.' 
        } else if(computerMove === 'paper'){
             result= 'You win..' 
        }else if(computerMove === 'Scissors'){
              result='tie.'
             }    
    }
     
    if(result==='You win..' ){
       score.win++
    } else  if(result==='You lose.' ){
       score.lose++
    } else if(result==='tie.' ){
       score.tie++
    } 
    playSound(`move-${playerMove}`);
    if(result==='You win..'){
        playSound('result-win');
    }else if(result==='You lose.'){
        playSound('result-lose');
    }else{
        playSound('result-tie');
    }
    udateScore();
    localStorage.setItem("score" , JSON.stringify(score));
    const resultDisplay = {
        'You win..': {text: '🏆 You Win!', className: 'result-win'},
        'You lose.': {text: '😢 You Lose!', className: 'result-lose'},
        'tie.': {text: "🤝 It's a Draw!", className: 'result-draw'},
        'Tie.': {text: "🤝 It's a Draw!", className: 'result-draw'}
    }[result];
    const resultElement = document.querySelector('.js-result');
    resultElement.textContent = resultDisplay ? resultDisplay.text : result;
    resultElement.classList.remove('result-win', 'result-lose', 'result-draw', 'result-animate');
    if(resultDisplay){
        resultElement.classList.add(resultDisplay.className);
        void resultElement.offsetWidth;
        resultElement.classList.add('result-animate');
    }
    document.querySelector('.js-move').innerHTML=`You  <img class="move-imogi" src="pic/${usermove}-emoji.png">--<img class="move-imogi" src="pic/${computerMove}-emoji.png"> Computer`;
     
 }
function udateScore(){
    document.querySelector('.js-score')
      .innerHTML=`lose: <span class="lose">${score.lose}</span>   win: <span class="win">${score.win}</span>  Tie: <span class="Tie">${score.tie}</span>`;

}
       