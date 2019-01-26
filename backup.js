var RestClient = require("deribit-api").RestClient;
const express = require('express');
const app = express();
var request = require("request")
var bodyParser = require('body-parser')
var stats = require("stats-lite")
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.set('view engine', 'ejs');

app.listen(process.env.PORT || 8080, function() {});
var restClient = new RestClient('HwjG9hsiYvLb','7G5RG3I3OCX74B77FGDO2AYTFRXUTTGR', 'https://test.deribit.com');
var startBtc;
var btcNow;
var tw = require( './trendyways.min.js')

var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var sheet;
var count = 0;
var gogo = true;
var doc = new GoogleSpreadsheet('1pN7RECRznPYKGgpyJdkfTacEX-OxjQyo9YyDLhIRB5M');

app.post('/', (req, res) => {
	if (req.body.pw == "w0rdp4ss"){

tar1 = parseFloat(req.body.tar1),
tar2 = parseFloat(req.body.tar2),
checkboundsinterval = parseFloat(req.body.checkboundsinterval),
tarmult= parseFloat(req.body.tarmult),
margin66interval = parseFloat(req.body.margin66interval),
margincheck = parseFloat(req.body.margincheck),
portfoliodrop = parseFloat(req.body.portfoliodrop),
portfoliocheckinterval = parseFloat(req.body.portfoliocheckinterval),
cancelallinterval = parseFloat(req.body.cancelallinterval),
posloss = parseFloat(req.body.posloss),
poslossinterval = parseFloat(req.body.poslossinterval),
tarincrease = parseFloat(req.body.tarincrease),
neworderinterval= parseFloat(req.body.neworderinterval);
}
	doPost(req, res)


	});

app.get('/update', (req, res) => {

	doPost(req, res)

})
app.get('/', (req, res) => {
	doPost(req, res)


	});
var neworderinterval = 500;
var prices = []
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
	//console.log('name');
				res.json({percent: -1*(100*(1-( btcNow / startBtc) )).toPrecision(4),
					difference: btcNow - avail,
					btcNow: btcNow,
					avail: btcNow - avail,
					tar: tar,
					ha: ha,
					pos: pos,
					time: new Date().getTime(),
				tar1 : tar1,
tar2 : tar2,
checkboundsinterval : checkboundsinterval,
tarmult: tarmult,
margin66interval : margin66interval,
margincheck : margincheck,
portfoliodrop : portfoliodrop,
portfoliocheckinterval : portfoliocheckinterval,
cancelallinterval : cancelallinterval,
posloss: posloss,
poslossinterval:poslossinterval,
tarincrease:tarincrease,
neworderinterval:neworderinterval});	
			
			} else {
				res.render('index.ejs', {
					percent: -1*(100*(1-( btcNow / startBtc) )).toPrecision(4),
					difference: btcNow - avail,
					btcNow: btcNow,
					avail: btcNow- avail,
					tar: tar,
					ha: ha,
					pos: pos,
					time: new Date().getTime(),
					tar1 : tar1,
tar2 : tar2,
checkboundsinterval : checkboundsinterval,
tarmult: tarmult,
margin66interval : margin66interval,
margincheck : margincheck,
portfoliodrop : portfoliodrop,
portfoliocheckinterval : portfoliocheckinterval,
cancelallinterval : cancelallinterval,
posloss: posloss,
poslossinterval:poslossinterval,
tarincrease:tarincrease,
neworderinterval:neworderinterval
				})
}
}
restClient.account().then((result) => {
  startBtc=105.036495569;
});
async.series([
    function setAuth(step) {
        var creds = require('./googlesheets.json');

        doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
        doc
            .getInfo(function (err, info) {
                //console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
                sheet = info.worksheets[0];
                //console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
                step();
            });
    },
    function workingWithRows(step) {

    }
    ]
    );
var pos;
var cancelallinterval = 5000;
var portfoliocheckinterval = 30000;
setInterval(function(){
sheetaddrow();
}, 60000);
setTimeout(function(){
sheetaddrow();
},10000);
var oldPerc = 0;
var margin66interval = 1500;
var margincheck = 0.66;
setInterval(function(){
	//console.log(avail / btcNow);
		if (avail / btcNow < margincheck){

					liq = 'margin > 66%'
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
}, margin66interval)
var portfoliodrop = -0.03;
setInterval(function(){
	if (oldPerc != 0){
		if (-1*(100*(1-( btcNow / startBtc) )).toPrecision(4) - oldPerc < portfoliodrop){

					liq = 'portfolio > 1.5% loss in 30s'
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
}, portfoliocheckinterval)
Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
setInterval(function(){
restClient.cancelall().then((result) => {

});
}, cancelallinterval)
var liq;
function sheetaddrow(){
	//console.log('addrow')
	try {
var d = new Date,
    dformat = [(
               d.getDate().padLeft(),
               d.getMonth()+1).padLeft(),
               d.getFullYear()].join('/') +' ' +
              [d.getHours().padLeft(),
               d.getMinutes().padLeft(),
               d.getSeconds().padLeft()].join(':');
	sheet
            .addRow({
                'Time': dformat,
                'Pos': pos,
                'HA': ha,
                'tar': tar,
                'tar 1.5': tar1 * tar,
                'last liquidation' : liq,
                'neg tar 1.5': tar * tar1	 * -1,
                'Avail': avail,
                'btcNow': btcNow,
                'PNL Current Pos': pnl * 100 + '%',
                'Difference': btcNow - avail,
                'Percent': -1*(100*(1-( btcNow / startBtc) )).toPrecision(4) + '%'

            }, function (result) {
            })
}
catch(err){}
}
var pnl;
var poslossinterval = 1500;
setInterval(function(){
restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
  pnl = result[r][a].profitLoss;
				if(result[r][a].profitLoss < posloss ){
					liq = 'pos < 3%'
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
}, poslossinterval)
var posloss = -0.10;
var avail;
setInterval(function(){

restClient.account().then((result) => {
	//console.log('1sec');
	////console.log(result);
  avail = result.result.availableFunds;
  btcNow=(result.result.equity);
  //console.log(btcNow);

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
var tar1 = 1.5;
var tar2 = 3;
setTimeout(function(){

tar = (btcNow * ha) / 8;
})
var checkboundsinterval = 2500;
setInterval(function(){
	//console.log('interval')
		//console.log(tar)
	restClient.positions().then((result) => {	
		for (var r in result){
			for (var a in result[r]){
				//console.log(result[r][a].direction);
				if (result[r][a].size > ((tar * tar1)) || result[r][a].size < (-1 * (tar * tar1))){
				var s = result[r][a].size;	
				//console.log('20000')
			if (result[r][a].direction == 'sell'){
				//console.log('buybuy')
				restClient.cancelall().then((result) => {
		restClient.buy('BTC-PERPETUAL',  -1 *Math.floor(s/3), ha).then((result) => {
			//console.log(result);
					});
			//console.log(result);
					});
			} else {
				//console.log('sellsell')
				restClient.cancelall().then((result) => {
		restClient.sell('BTC-PERPETUAL', Math.floor(s/3), lb).then((result) => {
			//console.log(result);
					});	     	
	});
			}
		}
		if (result[r][a].size > ((tar * tar2 )						) || result[r][a].size < (-1 * (tar * tar2) )){

					liq = 'double outter bounds'
				var s = result[r][a].size;
				//console.log('20000')
			if (result[r][a].direction == 'sell'){
				//console.log('buybuy')
				restClient.cancelall().then((result) => {
		restClient.buy('BTC-PERPETUAL',  -1 *Math.floor(s/2), lb).then((result) => {
			//console.log(result);
					});
			//console.log(result);
					});
			} else {
				//console.log('sellsell')
				restClient.cancelall().then((result) => {
		restClient.sell('BTC-PERPETUAL', Math.floor(s/2), ha).then((result) => {
			//console.log(result);
					});
	});
			}
		}
	}
		}
	});

}, checkboundsinterval);
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
if (go ){
	tar = tar + tarincrease;
		restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {
					});
		restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {
					});
}
	});

}, neworderinterval);
var tarincrease = 750;
var tarmult = 1;
setInterval(function(){
restClient.getorderbook('BTC-PERPETUAL').then((result) => {
ha = 5000000000000000000000000000;
lb = 0;
for (var a in result.result.bids){
if (result.result.bids[a].price > lb){
	lb = result.result.bids[a].price;
	lbOld = lb;
}
}
for(var a in result.result.asks){
if (result.result.asks[a].price < ha){
	ha = result.result.asks[a].price
	haOld = ha
}
}
var can = false;
if (gogo == true && buying != lbOld ){
can = true;
tar = tarmult * ((btcNow * ha) / 8);
setTimeout(function(){
restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {
buying = lb;
count++;
	});
}, 800);
}
if (gogo == true && selling != haOld ){
	tar = tarmult * (btcNow * ha) / 8;
can = true;
setTimeout(function(){
restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {
selling = ha;
	});
}, 800);
}
if (can == true){	
	restClient.cancelall().then((result) => {
		//console.log(result);
	})
}
});
}, neworderinterval);

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