window.addEventListener('load', eventWindowLoaded, false);

$(document).ready(function() {
  $(".languages-tools").hover(
    function() {
      $(this).addClass("show");
    },
    function() {
      $(this).removeClass("show");
    }
  );
});

function eventWindowLoaded() {
  canvasApp(); // Including the entire Canvas application
}

function canvasSupport(e) {
  return !!e.getContext;
}

function canvasApp() {
  var canvas = document.getElementById('perampokgoogle');

  if (!canvasSupport(canvas)) {
    return;
  }

  var ctx = canvas.getContext('2d');
  var w = canvas.width = window.innerWidth;
  var h = canvas.height = window.innerHeight;
  var yPositions = Array(300).join(0).split('');

  function runMatrix() {
    if (typeof Game_interval !== 'undefined') clearInterval(Game_interval);
    Game_interval = setInterval(drawScreen, 33);
  }

  function drawScreen() {
    ctx.fillStyle = 'rgba(0,0,0,.05)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0f0';
    ctx.font = '10px Georgia';
    yPositions.map(function(y, index) {
      var text = String.fromCharCode(1e2 + Math.random() * 33);
      var x = (index * 10) + 10;
      ctx.fillText(text, x, y);
      if (y > 100 + Math.random() * 1e4) {
        yPositions[index] = 0;
      } else {
        yPositions[index] = y + 10;
      }
    });
  }

  runMatrix();
}
