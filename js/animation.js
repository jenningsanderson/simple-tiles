//Animation
document.getElementById('step').addEventListener('click',timeline.stepBrush);

var animation, playing;
document.getElementById('Play').addEventListener('click',function(){
  var btn = this;
  if (playing){
    window.clearInterval(animation);
    btn.innerHTML = "Play"
    playing=false;
  }else{
    var outOfBounds;
    animation = setInterval(function(){
      outOfBounds = timeline.stepBrush()
      if(outOfBounds){
        window.clearInterval(animation)
        playing = false
        btn.innerHTML = "Play"
      }
    },1000);
    playing=true;
    this.innerHTML = "Stop";
  }
});