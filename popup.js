var bg = chrome.extension.getBackgroundPage();

function timeString(numSeconds) {
  if (numSeconds === 0) {
    return "0 seconds";
  }
  var remainder = numSeconds;
  var timeStr = "";
  var timeTerms = {
    hour: 3600,
    minute: 60,
    second: 1
  };
 
  if (remainder >= timeTerms.hour) {
    remainder = remainder - (remainder % timeTerms.minute);
    delete timeTerms.second;
  }
  
  for (var term in timeTerms) {
    var divisor = timeTerms[term];
    if (remainder >= divisor) {
      var numUnits = Math.floor(remainder / divisor);
      timeStr += numUnits + " " + term;
      
      if (numUnits > 1) {
        timeStr += "s";
      }
      remainder = remainder % divisor;
      if (remainder) {
        timeStr += " and ";
      }
    }
  }
  return timeStr;
}
var state;



   document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#today').addEventListener('click', function() { show(bg.TYPE.today,bg.state); });
   document.querySelector('#all').addEventListener('click', function() { show(bg.TYPE.all,bg.state); });

})


function displayData(type, state) {
  
  var domains = state.domains;
  var data = [];
  for (var domain in domains) {
    var domain_data = state.domain_data;
    var numSeconds = 0;
    if (type === bg.TYPE.today) {
      numSeconds = domain_data[domain].today;
    }  else if (type === bg.TYPE.all) {
      numSeconds = domain_data[domain].all;
    } else {
      console.error("No such type: " + type);
    }
    if (numSeconds > 0) {
      data.push([domain, {
        v: numSeconds,
        f: timeString(numSeconds),
      }]);
    }
  }



if (data.length === 0) {
    document.getElementById("nodata").style.display = "inline";
  } else {
    document.getElementById("nodata").style.display = "none";
  }


 data.sort(function (a, b) {
    return b[1].v - a[1].v;
  });


  var limited_data = [];
  var limit;

  limit = 10;

  for (var i = 0; i <limit && i < data.length; i++) {
    limited_data.push(data[i]);
  }

  var sum = 0;
  for (var i = limit; i < data.length; i++) {
    sum += data[i][1].v;
  }
  
console.log(data)
  drawTable(data);
}

function drawTable(data){
var table = document.getElementById("tb");
  for (const [index, element] of data.entries()) {
  var row = table.insertRow(index);
   var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  cell1.innerHTML = element[0];
   cell2.innerHTML = element[1].f;
   if(index>10){
    data={}
    break;
  }
}

}



function updateNav(type) {
  document.getElementById('today').className = '';
  document.getElementById('all').className = '';
  document.getElementById(type).className = 'active';
}

function show(mode, state) {
   var table = document.getElementById("tb");
for(var i = table.rows.length -1; i >= 0; i--)
{
    table.deleteRow(i);
}
  bg.mode = mode;
  displayData(mode,state);
  updateNav(mode, state);
}







