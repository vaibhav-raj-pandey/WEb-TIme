var UPDATE_INTERVAL = 3;
var TYPE = {
  today: "today",
  all: "all"
};



var mode = TYPE.today;
var first=0;
var state 
setDefaults();
function setDefaults() {

if(!localStorage["id"]){
 fetch('http://157.245.101.182:3000/enter',{
  method:'post',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
  })
})
  .then(response=>response.json())
  .then(id=>{
localStorage["id"]=id
if(!localStorage["blacklist"]){
  localStorage["blacklist"]= JSON.stringify(["example.com"]);


  fetch('http://157.245.101.182:3000/upload',{
  method:'put',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    id:id,
    num_days:1,
      domains:{},
      domain_data:{},
      total:{},
      date:new Date().toLocaleDateString()
  })
})
  .then(response=>response.json())
  .then(user=>{
    console.log(user)
  })

}
})
}
}








function load_user(){
  fetch('http://157.245.101.182:3000/load',{
  method:'put',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    id:localStorage["id"]
  }) 
})
  .then(response=>response.json())
.then(user=>{
    state={
      date:user.date,
      num_days:user.num_days,
      domains:user.domains,
      domain_data:user.domain_data,
      total:user.total

      }
  })
return state;
}

function checkDate(state) {
  var todayStr = new Date().toLocaleDateString();
  var saved_day = state.date;
  if (saved_day !== todayStr.toString()) {
    var domains = state.domains;
       for (var domain in domains) {
      var domain_data = state.domain_data;
      domain_data[domain].today = 0;
      fetch('http://157.245.101.182:3000/add_domain_data',{
  method:'put',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    id:localStorage['id'],
    domain_data:domain_data
  }) 
})
      
    }

    fetch('http://157.245.101.182:3000/add_num_days',{
  method:'put',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    id:localStorage['id']
  }) 
})


    var date = todayStr.toString();
    fetch('http://157.245.101.182:3000/add_date',{
  method:'put',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    id:localStorage['id'],
    value:date
  }) 
})

  }
}


function extractDomain(url) {
  var re = /:\/\/(www\.)?(.+?)\//;
  return url.match(re)[2];
}

function inBlacklist(url) {
  if (!url.match(/^http/)) {
    return true;
  }
  var blacklist = JSON.parse(localStorage["blacklist"]);
  for (var i = 0; i < blacklist.length; i++) {
    if (url.match(blacklist[i])) {
      return true;
    }
  }
  return false;
}





function updateData() {
  var status=load_user()
  if(status){
  
  chrome.idle.queryState(30, function (state) {
    if (state === "active") {
      chrome.tabs.query({ 'lastFocusedWindow': true, 'active': true }, function (tabs) {
        if (tabs.length === 0) {
          return;
        }
        var tab = tabs[0];
        checkDate(status);
        if (!inBlacklist(tab.url)) {
          var domain = extractDomain(tab.url);
          var domains = status.domains;
          if (!(domain in domains)) {
            domains[domain]=1;
           fetch('http://157.245.101.182:3000/add_domain',{
  method:'put',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    id:localStorage['id'],
    domains:domains
  }) 
})
          }
          var domain_data = status.domain_data
          if (status.domain_data[domain]) {
            domain_data[domain] = status.domain_data[domain];
          } else {
            domain_data[domain] = {
              today: 0,
              all: 0
            };
          }
          domain_data[domain].today += UPDATE_INTERVAL;
          domain_data[domain].all += UPDATE_INTERVAL;
          fetch('http://157.245.101.182:3000/add_domain_data',{
  method:'put',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    id:localStorage['id'],
    domain_data:domain_data
  }) 
})

          var num_min = Math.floor(domain_data[domain].today / 60).toString();
          if (num_min.length < 4) {
            num_min += "m";
          }
          chrome.browserAction.setBadgeText({
            text: num_min
          });
        } else {
          chrome.browserAction.setBadgeText({
            text: ""
          });
        }
      });
    }
  });
}
}
setInterval(updateData, UPDATE_INTERVAL * 1000);
