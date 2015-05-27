(function() {

  var socket = io.connect();

  socket.emit('online');

  socket.on('online', function(data) {

    colorElem.style.backgroundColor = data.color;
  })

  socket.on('color', function(data) {

    colorElem.style.backgroundColor = data.color;
  });


  function randomColor() {

    var COLOR_DEGREE = 256;

    var red = Math.floor( Math.random() * COLOR_DEGREE );

    var green = Math.floor( Math.random() * COLOR_DEGREE );

    var blue = Math.floor( Math.random() * COLOR_DEGREE );

    return 'rgb(' + red + ',' + blue + ',' + green + ')';
  }


  var colorElem = document.querySelector('.color');

  var changeBtn = document.querySelector('.change-btn');


  changeBtn.addEventListener('tap', function(e) {

    colorElem.style.backgroundColor = randomColor();
  });

  changeBtn.addEventListener('click', function(e) {

    var color = randomColor();

    colorElem.style.backgroundColor = color;

    socket.emit('color', {color: color});
  });


}());