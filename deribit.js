var RestClient = require("deribit-api").RestClient;

var restClient = new RestClient('HYhnLyH9qEvs','YC5OQQH7ECTQTORNALOPSVSPMSFXYWC7', 'https://test.deribit.com');
var startBtc;
var btcNow;
var tw = require( './trendyways.min.js')

var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var sheet;
var count = 0;
var gogo = true;
var doc = new GoogleSpreadsheet('1pN7RECRznPYKGgpyJdkfTacEX-OxjQyo9YyDLhIRB5M');
restClient.account().then((result) => {
  startBtc=10.22920249;
});
async.series([
    function setAuth(step) {
        var creds = require('./googlesheets.json');

        doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
        doc
            .getInfo(function (err, info) {
                console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
                sheet = info.worksheets[0];
                console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
                step();
            });
    },
    function workingWithRows(step) {

    }
    ]
    );
var pos;
setInterval(function(){
sheetaddrow();
}, 60000);
setTimeout(function(){
sheetaddrow();
},10000);
var oldPerc = 0;
setInterval(function(){
	if (oldPerc != 0){
		if (-1*(100*(1-( btcNow / startBtc) )).toPrecision(4) - oldPerc < -0.015){
			restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
			if (result[r][a].direction == 'sell'){
				restClient.buy(result[r][a].instrument, -1 * result[r][a].size, lb, 'safe').then((result) => {
					});
			} else {
				restClient.sell(result[r][a].instrument, result[r][a].size, ha, 'safe').then((result) => {
					});
			}
		}
		}
	});
		}
	}
	oldPerc = -1*(100*(1-( btcNow / startBtc) )).toPrecision(4);
}, 30000)
function sheetaddrow(){
	console.log('addrow')
	try {
	sheet
            .addRow({
                'Time': new Date().toLocaleString(),
                'Pos': pos,
                'Avail': avail,
                'btcNow': btcNow,
                'PNL Current Pos': pnl * 100 + '%',
                'Difference': btcNow - avail,
                'Percent': -1*(100*(1-( btcNow / startBtc) )).toPrecision(4) + '%'

            }, function (result) {
            })
}
catch(err){console.log(err);}
}
var pnl;
setInterval(function(){
restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
  pnl = result[r][a].profitLoss;
				if(result[r][a].profitLoss < -0.030 ){
			if (result[r][a].direction == 'sell'){
				restClient.buy(result[r][a].instrument, -1 * result[r][a].size, ha, 'safe').then((result) => {
					});
			} else {
				restClient.sell(result[r][a].instrument, result[r][a].size, lb, 'safe').then((result) => {
					});
			}
		}
		}
		}
	});
}, 2000)
var avail;
setInterval(function(){

restClient.account().then((result) => {
	console.log('1sec');
	//console.log(result);
  avail = result.result.availableFunds;
  btcNow=(result.result.equity);
  console.log(btcNow);

});
}, 1000)
var buying;
var haOld;
var lbOld;
var selling;
var ha = 5000000000000000000000000000;
var lb = 0;
var has = []
var lbs = []
var roc2;
var tar;
setTimeout(function(){

tar = (btcNow * ha) / 6;
})
setInterval(function(){
	console.log('interval')
		console.log(tar)
	restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
				console.log(result[r][a].direction);
				if (result[r][a].size > 10000 || result[r][a].size < -10000){
				var s = result[r][a].size;
				console.log('20000')
			if (result[r][a].direction == 'sell'){
				console.log('buybuy')
				restClient.cancelall().then((result) => {
		restClient.buy('BTC-PERPETUAL',  -1 *Math.floor(s/4), ha).then((result) => {
			console.log(result);
					});
			console.log(result);
					});
			} else {
				console.log('sellsell')
				restClient.cancelall().then((result) => {
		restClient.sell('BTC-PERPETUAL', Math.floor(s/4), lb).then((result) => {
			console.log(result);
					});
	});
			}
		}
	}
		}
	});

}, 10000);
setInterval(function(){
	restClient.getopenorders('BTC-PERPETUAL').then((result) => {
	var go = true;
	for (var a in result){	
for (var o in result[a]){
	if(result[a][o].direction == 'sell'){

		go = false;

	}else if(result[a][o].direction == 'buy'){
		go = false;
	}
}
}
	restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
				pos=(result[r][a].size)
			}
		}
	});
if (go){
	tar = tar + 1500;
		restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {
					});
		restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {
					});
}
	});

	if (roc2[roc2.length-1].roc > 0.01 || roc2[roc2.length-1].roc < -0.01){
	restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
			if (result[r][a].direction == 'sell'){
				restClient.buy(result[r][a].instrument, -1 * result[r][a].size, lb).then((result) => {
					});
			} else {
				restClient.sell(result[r][a].instrument, result[r][a].size, ha).then((result) => {
					});
			}
		}
		}
	});

	}
}, 5000);
setInterval(function(){
restClient.getorderbook('BTC-PERPETUAL').then((result) => {
ha = 5000000000000000000000000000;
lb = 0;
for (var a in result.result.bids){
if (result.result.bids[a].price > lb){
	lb = result.result.bids[a].price;
	lbs.push(lb);
	lbOld = lb;
	if (lbs.length == 10){
		lbs.shift();
	}
}
}
for(var a in result.result.asks){
if (result.result.asks[a].price < ha){
	ha = result.result.asks[a].price
	has.push({c:ha});
	haOld = ha
	if (has.length ==10){
		has.shift();
	}
	roc2 = roc(has, 1);
}
}
var can = false;
if (gogo == true && buying != lbOld && (roc2[roc2.length-1].roc < 0.01 || roc2[roc2.length-1].roc > -0.01)){
can = true;
tar = (btcNow * ha) / 6;
setTimeout(function(){
restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {
buying = lb;
count++;
	});
}, 800);
}
if (gogo == true && selling != haOld && (roc2[roc2.length-1].roc < 0.01 || roc2[roc2.length-1].roc > -0.01)){
	tar = (btcNow * ha) / 6;
can = true;
setTimeout(function(){
restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {
selling = ha;
	});
}, 800);
}
if (can == true){	
	restClient.getopenorders('BTC-PERPETUAL').then((result) => {
	for (var a in result){	
for (var o in result[a]){
	if(result[a][o].label != 'safe'){

		restClient.cancel(resula[a][o].orderId).then((result) => {
			console.log(result);
		})
	}
}
}
})
}
});
}, 1000);

setInterval(function(){
if (count>3){
	gogo = false;
	setTimeout(function(){
		gogo = true;
	}, 20000)
}
count = 0;
}, 8000)