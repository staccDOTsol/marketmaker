var RestClient = require("deribit-api").RestClient;
const express = require('express');
const app = express();
var request = require("request")
var bodyParser = require('body-parser')
app.set('view engine', 'ejs');
const ccxt = require ('ccxt')
let exchange = new ccxt.deribit ({  'apiKey': 'HYhnLyH9qEvs', 'secret':'YC5OQQH7ECTQTORNALOPSVSPMSFXYWC7' })
exchange.urls['api'] = exchange.urls['test'];
app.listen(process.env.PORT || 8080, function() {});
var restClient = new RestClient('HYhnLyH9qEvs','YC5OQQH7ECTQTORNALOPSVSPMSFXYWC7', 'https://test.deribit.com');
var startBtc;
var btcNow;
var tw = require( './trendyways.min.js')

var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet('1pN7RECRznPYKGgpyJdkfTacEX-OxjQyo9YyDLhIRB5M');

var async = require('async');
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
var sheet;
var count = 0;
var gogo = true;
var gogoFour = 0;
app.get('/update', (req, res) => {

	doPost(req, res)

})

app.get('/', (req, res) => {
	doPost(req, res)


	});
async function doPost(req, res)
{
	/*
	addRow({
                'Time': new Date().toLocaleString(),
                'Pos': pos,
                'HA': ha,
                'tar': tar,
                'tar 1.5': tar * 2,
                'last liquidation' : liq,
                'neg tar 1.5': tar * 2	 * -1,
                'Avail': avail,
                'btcNow': btcNow,
                'PNL Current Pos': pnl * 100 + '%',
                'Difference': btcNow - avail,
                'Percent': -1*(100*(1-( btcNow / startBtc) )).toPrecision(4) + '%'
*/
if (req.query.name){
	console.log('name');
				res.json({percent: -1*(100*(1-( btcNow / startBtc) )).toPrecision(4),
					difference: btcNow - avail,
					btcNow: btcNow,
					avail: btcNow - avail,
					tar: tar,
					ha: ha,
					pos: pos,
					time: new Date().getTime()});	
			
			} else {
				res.render('index.ejs', {
					percent: -1*(100*(1-( btcNow / startBtc) )).toPrecision(4),
					difference: btcNow - avail,
					btcNow: btcNow,
					avail: btcNow- avail,
					tar: tar,
					ha: ha,
					pos: pos,
					time: new Date().getTime()
				})
}
}
restClient.account().then((result) => {
  startBtc=5.927977973;
});
var pos;
setInterval(function(){
sheetaddrow();
}, 60000);
setTimeout(function(){
sheetaddrow();
},10000);
var oldPerc = 0;
async function currencies(){
var curr = await exchange.fetchMarkets();
for (var c in curr){
	if(curr[c].symbol.includes('BTC-PERPETUAL')){
		console.log(curr[c])
	}
}
}
currencies();
async function buy(size){
					var buy = await exchange.createMarketBuyOrder ('BTC-PERPETUAL',size)
				console.log(buy)
}
async function sell(size){
					var sell = await exchange.createMarketSellOrder ('BTC-PERPETUAL',size)
				console.log(sell)
}
setInterval(async function(){
	console.log(avail / btcNow);
		if (avail / btcNow > 0.66){

					liq = 'margin > 66%'
			restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
			if (result[r][a].direction == 'sell'){
				buy(-1 * result[r][a].size);
			} else {
				sell(result[r][a].size);
			}
		}
		}
	});
		}
}, 1500)
setInterval(async function(){
	if (oldPerc != 0){
		if (-1*(100*(1-( btcNow / startBtc) )).toPrecision(4) - oldPerc < -0.015){

					liq = 'portfolio > 1.5% loss in 30s'
			restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
			if (result[r][a].direction == 'sell'){
				buy(-1 * result[r][a].size)
			} else {
				sell(result[r][a].size)
			}
		}
		}
	});
		}
	}
	oldPerc = -1*(100*(1-( btcNow / startBtc) )).toPrecision(4);
}, 30000)
var liq;
function sheetaddrow(){
	console.log('addrow')
	try {
	sheet
            .addRow({
                'Time': new Date().toLocaleString(),
                'Pos': pos,
                'HA': ha,
                'tar': tar,
                'tar 1.5': tar * 2,
                'last liquidation' : liq,
                'neg tar 1.5': tar * 2	 * -1,
                'Avail': avail,
                'btcNow': btcNow,
                'PNL Current Pos': pnl * 100 + '%',
                'Difference': btcNow - avail,
                'Percent': -1*(100*(1-( btcNow / startBtc) )).toPrecision(4) + '%'

            }, function (result) {
            	liq = ''
            })
}
catch(err){console.log(err);}
}
var pnl;
setInterval(async function(){
restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
  pnl = result[r][a].profitLoss;
				if(result[r][a].profitLoss < -0.030 ){
					liq = 'pos < 3%'
			if (result[r][a].direction == 'sell'){
				buy(-1 * result[r][a].size)
			} else {
				sell(result[r][a].size)
			}
		}
		}
		}
	});
}, 1500)
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
var tar;
setInterval(function(){

tar = (btcNow * ha) / 4;
}, 60000)
var done3x = false;
setInterval(async function(){
	console.log('interval')
		console.log(tar)
	restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
				console.log(result[r][a].direction);
				if (result[r][a].size > ((tar * 1.5)) || result[r][a].size < (-1 * (tar * 1.5))){
				var s = result[r][a].size;	
				console.log('20000')
			if (result[r][a].direction == 'sell'){
				console.log('buybuy')
				restClient.cancelall().then((result) => {
		restClient.buy('BTC-PERPETUAL',  -1 *Math.floor(s/3), ha).then((result) => {
			console.log(result);
					});
			console.log(result);
					});
			} else {
				console.log('sellsell')
				restClient.cancelall().then((result) => {
		restClient.sell('BTC-PERPETUAL', Math.floor(s/3), lb).then((result) => {
			console.log(result);
					});	     	
	});
			}
		}
		if (done3x == false result[r][a].size > ((tar * 3 )						) || result[r][a].size < (-1 * (tar * 3) )){
done3x = true;
					liq = 'double outter bounds'
				var s = result[r][a].size;
				console.log('20000')
			if (result[r][a].direction == 'sell'){
				console.log('buybuy')
		restClient.buy('BTC-PERPETUAL',  -1 *Math.floor(s/2), lb).then((result) => {
			console.log(result);
			console.log(result);
					});
			} else {
				console.log('sellsell')
		restClient.sell('BTC-PERPETUAL', Math.floor(s/2), ha).then((result) => {
			console.log(result);
					});
			}
		}
			}
		} else {
			done3x = false;
		}
	}
		}
	});

}, 2500);
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
	tar = tar + ((equity * ha) / 128);
	if (gogoFour < 4){
		gogoFour++;
		restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {
					});
	}
	if (gogoFour < 4){
		gogoFour++;
		restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {
					});
	
	}
}
	});

}, 5000);
setInterval(function(){
restClient.getorderbook('BTC-PERPETUAL').then((result) => {
ha = 5000000000000000000000000000;
lb = 0;
for (var a in result.result.bids){
if (result.result.bids[a].price > lb){
	lb = result.result.bids[a].price;
	lbOld = lb;
	if (lbs.length == 10){
		lbs.shift();
	}
}
}
for(var a in result.result.asks){
if (result.result.asks[a].price < ha){
	ha = result.result.asks[a].price
	haOld = ha
}
}
var can = false;
if (gogo == true && buying != lbOld && gogoFour < 4 ){
	gogoFour++;
can = true;
tar = (btcNow * ha) / 4;
setTimeout(function(){
restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {
buying = lb;
count++;
	});
}, 800);
}
if (gogo == true && selling != haOld && gogoFour < 4 ){
	gogoFour++;
	tar = (btcNow * ha) / 4;
can = true;
setTimeout(function(){
restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {
selling = ha;
	});
}, 800);
}
if (can == true){	
	restClient.getopenorders('BTC-PERPETUAL').then((result) => {
	gogoFour = 0;
	for (var a in result){	
for (var o in result[a]){
	gogoFour++;
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
}, 250);

setInterval(function(){
if (count>3){

	liq = 'not actually liquidating, but there were 4+ buys/sells at new prices so we took a 20s break'
	gogo = false;
	setTimeout(function(){
		gogo = true;
	}, 20000)
}
count = 0;
}, 8000)