// requires, etc
var ccxt = require("ccxt");
const express = require('express');
const app = express();
var request = require("request")
var bodyParser = require('body-parser')
app.set('view engine', 'ejs');
app.listen(process.env.PORT || 8080, function() {});
let bitmex  = new ccxt.bitmex ({ 'enableRateLimit': true, apiKey: "Ms4cyS253RTZhaKCafZVQVpE", secret: "ctKAsJMbc3ExP78OjOfp5_t74bdelu4PnagUZkNukGSMn8Zp" })
bitmex.urls['api'] = bitmex.urls['test'];
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

//vars
var selldo = true;
var buydo = true;

// the amount BTC we begin the script with
var startBtc;

// our current BTC amount
var btcNow;

// sheet is the gsheet to add data to
var sheet;

// count is how many times we've entered a new order in the last x ms 
var count = 0;

// gogo is whether to create a new order
var gogo = true;

// gogoFour is another counter, to keep new orders under x threshold
var gogoFour = 0;

// pos is how large our position is
var pos;

// oldPerc is our old percent performance, to use when comparing to the new one after x ms
var oldPerc = 0;

// liq includes the recent reasons why we liquidated at market or limit, for gsheet
var liq;

// pnl is our profit and loss of a pos
var pnl;

// avail is our available margin
var avail;

// buying is the price we've bought
var buying;

// haOld is a previous value for highest ask
var haOld;

// lbOld is a previous value for lowest bid
var lbOld;

// selling is the price we've sold at
var selling;

// ha is the highest ask
var ha = 5000000000000000000000000000;

// lb is the lowest bid
var lb = 0;

// has is an array of highest asks (might be deprecated)
var has = []

// lbs is an array of lowest bids (might be deprecated)
var lbs = []

// tar is how big of a position to enter into
var tar;

// done3x is whether the most upper / most lower thresholds, bsaed on a multiplier of tar, have been hit or false if we're within acceptable ranges
var done3x = false;

// bv is the volume of contracts at lowest bid
var bv = 0;

// av s the volume of contracts at highest ask
var av = 0;

// can is whether to cancel certain orders (might be deprecated)
var can = false;

// our google doc

var doc = new GoogleSpreadsheet('1dK3ao8P9ne7Yr3U0SkRYm1S9Tyty9Cl35rbzmbk7GYo');

// function for providing views/index.ejs with more data

app.get('/update', (req, res) => {

    doPost(req, res)

})

// initially load views/index.ejs

app.get('/', (req, res) => {
    doPost(req, res)


});

// set up our gsheets connection

async.series([
    function setAuth(step) {
        var creds = require('./googlesheets.json');

        doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
        doc
            .getInfo(function(err, info) {
                //console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
                sheet = info.worksheets[0];
                //console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
                step();
            });
    },
    function workingWithRows(step) {

    }
]);

// logic to send info to the view

async function doPost(req, res) {

    if (req.query.name) {
        //console.log('name');
        res.json({
            percent: -1 * (100 * (1 - (btcNow / startBtc))).toPrecision(4),
            difference: btcNow - avail,
            btcNow: btcNow,
            avail: btcNow - avail,
            tar: tar,
            ha: ha,
            pos: pos,
            time: new Date().getTime()
        });

    } else {
        res.render('index.ejs', {
            percent: -1 * (100 * (1 - (btcNow / startBtc))).toPrecision(4),
            difference: btcNow - avail,
            btcNow: btcNow,
            avail: btcNow - avail,
            tar: tar,
            ha: ha,
            pos: pos,
            time: new Date().getTime()
        })
    }
}

// initially set our startBtc (static)

startBtc = 0.09009517;

// add info to gsheet every 60s

setInterval(function() {
    sheetaddrow();
}, 60000);

// and once 10s after load
// a failsafe that triggers if we use too much margin

setInterval(async function() {
    if (avail / btcNow < 0.55) {

        liq += ' margin > 66%'
        let result = await bitmex.private_get_position({'symbol':'XBTUSD'})
        for (var r in result) {
        if (result[r].currentQty < 0) {
            selldo = false;
            buydo = true;
            bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty, lb);
        } else {
            buydo = false;
            selldo = true;
            bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty, lb);
    
        }
    }
}else {

            buydo = true;
            selldo = true;
}
}, 17500)
// a failsafe that triggers if portfolio loses a certan %

setInterval(async function() {
    if (oldPerc != 0) {
        if (-1 * (100 * (1 - (btcNow / startBtc))).toPrecision(4) - oldPerc < -0.015) {

            liq += ' portfolio > 1.5% loss in 30s'
            let result = await bitmex.private_get_position({'symbol':'XBTUSD'})
            for (var r in result) {
                if (result[r].currentQty < 0) {
                    bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty, lb);
                } else {
                    bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty, lb);
            
                }
            }
        }
    }
    oldPerc = -1 * (100 * (1 - (btcNow / startBtc))).toPrecision(4);
}, 30000)
// helper for our gsheet date (broken at the moment)

Number.prototype.padLeft = function(base, chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
}

// add info to gsheet (date is broken at the moment)

function sheetaddrow() {
    //console.log('addrow')
    try {
        var d = new Date,
            dformat = [(
                    d.getDate().padLeft(),
                    d.getMonth() + 1).padLeft(),
                d.getFullYear()
            ].join('/') + ' ' + [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft()
            ].join(':');
        sheet
            .addRow({
                'Time': dformat,
                'Pos': pos,
                'HA': ha,
                'tar': tar,
                'tar 1.5': tar * 2,
                'last liquidation': liq,
                'neg tar 1.5': tar * 2 * -1,
                'Avail': avail,
                'btcNow': btcNow,
                'PNL Current Pos': pnl * 100 + '%',
                'Difference': btcNow - avail,
                'Percent': -1 * (100 * (1 - (btcNow / startBtc))).toPrecision(4) + '%'

            }, function(result) {
                liq = ''
            })
    } catch (err) { //console.log(err);}
    }
}

// failsafe for if our position loses a % value
//unrealisedPnlPcnt
setInterval(async function() {
    let result = await bitmex.private_get_position({'symbol':'XBTUSD'})
    for (var r in result) {
             pnl = result[r].unrealisedPnlPcnt

        if (result[r].profitLoss < -0.050) {
            liq += 'pos < 5%'
            if (result[r].currentQty < 0) {
                bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty, lb);
            } else {
                bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty, lb);
        
            }
        }
    }

            
}, 17500)

// update our margin avail and btcnow values

setInterval(async function() {

    var result = await bitmex.fetchBalance();
    console.log(result.BTC.free);
    console.log(result.BTC.total);
        //console.log('1sec');
        ////console.log(result);
        avail = result.BTC.free;
        btcNow = (result.BTC.total);
        //console.log(btcNow);

}, 20000)
// update our tar value based on a fraction of balance

setInterval(function() {

    tar = (btcNow * ha) / .4;
}, 5000)

// sometimes orders get stuck. .. cancel them all!

setTimeout(async function() {
    let since = bitmex.milliseconds () - 86400000 
    let limit = 10;
    let orders = await bitmex.fetchOpenOrders('BTC/USD', since, limit)
    for (var o in orders){
        if (orders[o].amount > 0 || orders[o].amount < 0){
            let cancel = await bitmex.cancelOrder(orders[o].info.orderID)
        }
    }

}, 60 * 5 * 60 * 5);

// a failsafe that triggers two possibilities based on a functino of the tar variable

setInterval(async function() {
    //console.log('interval')
    //console.log(tar)
            let result = await bitmex.private_get_position({'symbol':'XBTUSD'})
            for (var r in result) {
                if  (result[r].currentQty > ((tar * 3.5)) || result[r].currentQty < (-1 * (tar * 3.5))) {
                    var s = result[r].currentQty;
                    if (result[r].currentQty < 0) {
                        bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty / 8, ha - 1.5);
                        bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty / 8, ha - 1.0);
                        bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty / 8, ha);
                    } else {
                        bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty / 8, lb + 1.5);
                        bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty / 8, lb + 1.0);
                        bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty / 8, lb);
                
                    }
                if (result[r].currentQty < ((tar * 7)) || result[r].currentQty > (-1 * (tar * 7))) {
                    done3x = false;
                }
                if (done3x == false && result[r].currentQty > ((tar * 3)) || result[r].currentQty < (-1 * (tar * 3))) {
                    done3x = true;
                    liq += 'double outter bounds'
                    if (result[r].currentQty < 0) {
                                    bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty / 4, ha - 1.5);
                                    bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty / 4, ha - 1.0);
                                    bitmex.createLimitBuyOrder('BTC/USD', -1 * result[r].currentQty / 4, ha);
                                } else {
                                    bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty / 4, lb + 1.5);
                                    bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty / 4, lb + 1.0);
                                    bitmex.createLimitSellOrder('BTC/USD', result[r].currentQty / 4, lb);
                            
                                }
                            }
                        }
                    }


}, 12500);

// if price has moved more than a certain number $, cancel all orders

setInterval( async function() {
        let since = bitmex.milliseconds () - 86400000 
    let limit = 10;
        var go = true;
    let orders = await bitmex.fetchOpenOrders('BTC/USD', since, limit)
    for (var o in orders){
        console.log(orders[o])
        if (orders[o].amount < 0& orders[o].price < ha + 2){
            let cancel = await bitmex.cancelOrder(orders[o].info.orderID)
        }
        else if (orders[o].amount > 0& orders[o].price > lb - 2){
            let cancel = await bitmex.cancelOrder(orders[o].info.orderID)
        }
    }
}, 242000)

// buy or sell if no other buy/sell order exists

setInterval(async function() {
 let since = bitmex.milliseconds () - 86400000 
    let limit = 10;
        var go = true;
    let orders = await bitmex.fetchOpenOrders('BTC/USD', since, limit)
    for (var o in orders){
        if (orders[o].amount > 0){
            go = false;
        }
        else if (orders[o].amount < 0){
            go = false;
        }
    }
            let result = await bitmex.private_get_position({'symbol':'XBTUSD'})
        for (var r in result) {
            pos = result[r].currentQty;

        }
        if (go) {
            if (gogoFour < 10 && av > 3000) {
                gogoFour++;
                console.log(3)
                console.log(Math.floor( tar))
                if (tar >= 1 && selldo){
              let o = await   bitmex.createLimitSellOrder('BTC/USD', Math.floor(tar), ha);
           console.log(o)
           }
       }
            if (gogoFour < 10 && bv > 3000) {
                gogoFour++;
                console.log(4)
                console.log(Math.floor( tar))
                if (tar >= 1 && buydo){
let o = await bitmex.createLimitBuyOrder('BTC/USD', Math.floor(tar), lb);

console.log(o)
}
            }
        }

}, 35000);


// calculate ha, lb, etc, increase tar or reset, enter buy or sell

setInterval(async function() {
    let result = await bitmex.fetchOrderBook('BTC/USD', 10);
        ha = 5000000000000000000000000000;
        lb = 0;
        bv = 0;
        av = 0;
        for (var a in result.bids) {
            if (result.bids[a][0] > lb) {
                lb = result.bids[a][0];
                bv = (result.bids[a][1]);
                lbOld = lb;
            }
        }
        for (var a in result.asks) {
            if (result.asks[a][0] < ha) {
                ha = result.asks[a][0]
                av = (result.asks[a][1]);
                haOld = ha
            }
        }
        if (lb != buying) {
            tar = (btcNow * ha) / .4;

        }
        if (gogo == true && gogoFour < 10 && bv > 3000) {
            if (avail / btcNow > 0.75) {
                tar = tar + btcNow * 40
            }
            gogoFour++;
            can = true;
            setTimeout(async function() {
                console.log(1)
                console.log(Math.floor( tar))
                if (tar >= 1 && buydo){
          let o = await bitmex.createLimitBuyOrder('BTC/USD', Math.floor(tar), lb);
          console.log(o);
      }
                    buying = lb;
                    count++;
            }, 800);
        }
        if (gogo == true && gogoFour < 10 && av > 3000) {
            if (avail / btcNow > 0.75) {
                tar = tar + btcNow * 40
            }
            gogoFour++;
            can = true;
            setTimeout(async function() {
                console.log(2)
                if (tar >= 1 && selldo){
                console.log(Math.floor( tar))
                         let o = await bitmex.createLimitSellOrder('BTC/USD',Math.floor( tar), ha);
console.log(o)
}
                    selling = ha;
            }, 800);
        }

}, 33813);


setInterval(async function() {

    let since = bitmex.milliseconds () - 86400000 
    let limit = 10;
    let orders = await bitmex.fetchOpenOrders('BTC/USD', since, limit)
    gogoFour = 0;   
    for (var o in orders){
        gogoFour++;
    }
}, 15000)

// pause new orders if too many occur within x ms

setInterval(function() {
    if (count > 3) {

        liq += 'not actually liquidating, but there were 4+ buys/sells at new prices so we took a 20s break'
        gogo = false;
        setTimeout(function() {
            gogo = true;
        }, 20000)
    }
    count = 0;
}, 8 * bitmex.rateLimit)

console.log(bitmex.rateLimit)