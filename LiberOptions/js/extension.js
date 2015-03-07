/*
 * Author: jsCoin
 */

var ext = {};
ext.maxPayout = 0.5;
ext.maxBet = 0.01;


function createSettings(){
  var div = document.createElement('div');
  div.id = 'settings';
  div.className = 'col-xs-4';
  var label = document.createElement('label');
  label.innerHTML = 'Max Payout';
  label.for = 'maxPayout';
  label.className = 'control-label col-xs-6 text-right';
  var div2 = document.createElement('div');
  div2.className = 'col-xs-6';
  var input = document.createElement('input');
  input.name = 'maxPayout';
  input.id = 'maxPayout';
  input.className = 'form-control';
  input.style = 'padding: 0px;';
  input.type = 'number';
  input.value = ext.maxPayout;
  input.step = 0.00001;
  input.min = 0.01;
  input.max = 0.5;
  input.addEventListener('change',function(){
    ext.maxPayout = document.getElementById('maxPayout').value;
  });
  div.appendChild(label);
  div2.appendChild(input);
  div.appendChild(div2);

  label = label.cloneNode();
  input = input.cloneNode();
  div2 = div2.cloneNode();
  
  label.for = 'maxBet';
  label.innerHTML = 'Max Bet';
  div.appendChild(label);
  input.name = 'maxBet';
  input.id = 'maxBet';
  input.value = ext.maxBet;
  input.addEventListener('change',function(){
    ext.maxBet = document.getElementById('maxBet').value;
  });
  div2.appendChild(input);
  div.appendChild(div2);
  $('fieldset').append(div);

}

function minimizeBet(payoutPct){
	var bet = ext.maxPayout/(1+payoutPct);
  if(bet>ext.maxBet)
    bet = ext.maxBet;

  var event = document.createEvent("HTMLEvents");
  event.initEvent("change",true,true);
  $('fieldset .input-group .form-control')
    .val(bet)
    .get(0)
    .dispatchEvent(event);
}

/**
 *  Page key controls.
 **/
$(document).keydown(function(e){
  if(e.keyCode<48){
    if(e.keyCode===40){
      //down
      // open put trade window
      var $put = getPut();
      var pct = getPct($put);
      minimizeBet(pct);
      $put.click();
    }else if(e.keyCode===38){
      //up
      // open call trade window
      var $call = getCall();
      var pct = getPct($call);  
      minimizeBet(pct);
      $call.click();
    }else if(e.keyCode===27){
      //escape
      // close trade window
      $('.panel-danger,.panel-success').find('.panel-heading button').click();
    }else if(e.keyCode===13){
      //enter
      // execute trade
      $('.panel-danger,.panel-success').find('.col-xs-7 button').click();
    }
  }else if(e.keyCode>=49&&e.keyCode<=57){
    // 1 - 9
    // sell option in portfolio
    $('.panel-info .table button')[e.keyCode - 49].click();
  }else if(e.keyCode>=97&&e.keyCode<=105){
    // numpad 1-9
    // sell option in portfolio
    $('.panel-info .table button')[e.keyCode - 97].click();
  }
});

function getCall(){
  return $('.buy-button[value="call"]');
}

function getPut(){
  return $('.buy-button[value="put"]');
}

function getPct($from){
  var pct = $from
      .parents('.row[data-view="views/trading/inverse/pricepanel"]')
      .find('.col-xs-6:last-child')
      .find('div div:last-child').html();
  pct = pct.substring(0,pct.length-1);
  pct = ((pct*1)+1)/100;
  return pct;
}

ext.months = {
  Jan : 0,
  Feb : 1,
  Mar : 2,
  Apr : 3,
  May : 4,
  Jun : 5,
  Jul : 6,
  Aug : 7,
  Sep : 8,
  Oct : 9,
  Nov : 10,
  Dec : 11
};
function month(monthStr){
  return ext.months[monthStr];
}

/**
 *  Create markup and attach listeners.
 **/
function initTableObserver(){
  ext.observer = new MutationObserver(function(mutations){
  var date, time;
  var expires, now;
  var count;
  mutations.forEach(function(mutation){
    if(mutation.target.nodeName == "DIV" && mutation.target.className == 'small'){
      date = mutation.target.innerText;
      date = date.split("-");
      time = mutation.target.previousElementSibling.innerText;
      time = time.split(":");
      expires = new Date();
      expires.setUTCMilliseconds(0);
      now = new Date($('#miniStatus3 span').html());
      now.setFullYear('20'+date[2]);
      expires.setUTCDate(date[0]);
      expires.setUTCMonth(month(date[1]));
      expires.setUTCFullYear('20'+date[2]);
      expires.setUTCHours(time[0]);
      expires.setUTCMinutes(time[1]);
      expires.setUTCSeconds(time[2]);
      count = (expires.getTime() - now.getTime())/1000;
      $(mutation.target).parents('tr')
        .append("<td><span>"+count+"</span></td>");
    }else if(mutation.addedNodes[0] && mutation.addedNodes[0].nodeName == "THEAD")
      $(mutation.target).find('thead tr').append('<th>Remains</th>');
    });
  });
  ext.observer.observe($('.panel-info table').get(0),{
    childList: true,
    subtree: true
  });
}
ext.init = false;
ext.bodyObserver = new MutationObserver(function(mutations){
  mutations.forEach(function(mutation){      
    if(mutation.addedNodes[0] 
      && mutation.addedNodes[0].nodeName == "DIV"){
      if(mutation.addedNodes[0].id == 'pricesViewInverse'){
        createSettings();
        if(ext.init)
          ext.bodyObserver.disconnect();
        ext.init = true;
      }
      if(mutation.addedNodes[0].attributes[0].value=='views/trading/simplePortfolio'){
        initTableObserver();
        if(ext.init)
          ext.bodyObserver.disconnect();
        ext.init = true;
      }
    }     
   });
});
ext.bodyObserver.observe(document.body,{
  childList: true,
  subtree: true
});