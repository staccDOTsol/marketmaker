// requires, etc
var RestClient = require("deribit-api").RestClient;
const express = require('express');
const app = express();
var request = require("request")
var bodyParser = require('body-parser')
app.set('view engine', 'ejs');
app.listen(process.env.PORT || 8080, function() {});
var restClient = new RestClient('', '', 'https://test.deribit.com');

var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

//vars

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

//var doc = new GoogleSpreadsheet('');

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

startBtc = 72.66528194;

// add info to gsheet every 60s

setInterval(function() {
    sheetaddrow();
}, 60000);

// and once 10s after load

setTimeout(function() {
    sheetaddrow();
}, 10000);

// a failsafe that triggers if we use too much margin

setInterval(async function() {
    if (avail / btcNow < 0.55) {

        liq += ' margin > 66%'
        restClient.positions().then((result) => {
            for (var r in result) {
                for (var a in result[r]) {
                    if (result[r][a].direction == 'sell') {
                        restClient.buy('BTC-PERPETUAL', -1 * result[r][a].size, lb).then((result) => {

                        });
                    } else {
                        restClient.sell('BTC-PERPETUAL', 1 * result[r][a].size, lb).then((result) => {

                        });
                    }
                }
            }
        });
    }
}, 7500)

// a failsafe that triggers if portfolio loses a certan %

setInterval(async function() {
    if (oldPerc != 0) {
        if (-1 * (100 * (1 - (btcNow / startBtc))).toPrecision(4) - oldPerc < -0.015) {

            liq += ' portfolio > 1.5% loss in 30s'
            restClient.positions().then((result) => {
                for (var r in result) {
                    for (var a in result[r]) {
                        if (result[r][a].direction == 'sell') {
                            restClient.buy('BTC-PERPETUAL', -1 * result[r][a].size, lb).then((result) => {

                            });
                        } else {
                            restClient.sell('BTC-PERPETUAL', 1 * result[r][a].size, lb).then((result) => {

                            });
                        }
                    }
                }
            });
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

setInterval(async function() {
    restClient.positions().then((result) => {
        for (var r in result) {
            for (var a in result[r]) {
                pnl = result[r][a].profitLoss;
                if (result[r][a].profitLoss < -0.050) {
                    liq += 'pos < 5%'
                    if (result[r][a].direction == 'sell') {
                        restClient.buy('BTC-PERPETUAL', -1 * result[r][a].size, lb - 2).then((result) => {

                        });
                    } else {
                        restClient.sell('BTC-PERPETUAL', 1 * result[r][a].size, ha + 2).then((result) => {

                        });
                    }
                }
            }
        }
    });
}, 7500)

// update our margin avail and btcnow values

setInterval(function() {

    restClient.account().then((result) => {
        //console.log('1sec');
        ////console.log(result);
        avail = result.result.availableFunds;
        btcNow = (result.result.equity);
        //console.log(btcNow);

    });
}, 1000)

// update our tar value based on a fraction of balance

setInterval(function() {

    tar = (btcNow * ha) / 4;
}, 60000)

// sometimes orders get stuck. .. cancel them all!

setInterval(function() {
    restClient.cancelall().then((result) => {

    })
}, 60 * 5 * 60 * 5);

// a failsafe that triggers two possibilities based on a functino of the tar variable

setInterval(async function() {
    //console.log('interval')
    //console.log(tar)
    restClient.positions().then((result) => {
        for (var r in result) {
            for (var a in result[r]) {
                //console.log(result[r][a].direction);
                if (result[r][a].size > ((tar * 3.5)) || result[r][a].size < (-1 * (tar * 3.5))) {
                    var s = result[r][a].size;
                    //console.log('20000')
                    if (result[r][a].direction == 'sell') {
                        //console.log('buybuy')
                        restClient.buy('BTC-PERPETUAL', -1 * Math.floor(s / 4), ha - 1.5).then((result) => {
                            //console.log(result);
                        });
                        restClient.buy('BTC-PERPETUAL', -1 * Math.floor(s / 4), ha - 1.0).then((result) => {
                            //console.log(result);
                        });

                        restClient.buy('BTC-PERPETUAL', -1 * Math.floor(s / 4), ha).then((result) => {
                            //console.log(result);
                        });

                        //console.log(result);
                    } else {
                        //console.log('sellsell')
                        restClient.sell('BTC-PERPETUAL', Math.floor(s / 4), lb + 1.5).then((result) => {
                            //console.log(result);
                        });

                        restClient.sell('BTC-PERPETUAL', Math.floor(s / 4), lb + 1.0).then((result) => {
                            //console.log(result);
                        });

                        restClient.sell('BTC-PERPETUAL', Math.floor(s / 4), lb).then((result) => {
                            //console.log(result);
                        });
                    }
                }
                if (result[r][a].size < ((tar * 7)) || result[r][a].size > (-1 * (tar * 7))) {
                    done3x = false;
                }
                if (done3x == false && result[r][a].size > ((tar * 7)) || result[r][a].size < (-1 * (tar * 7))) {
                    done3x = true;
                    liq += 'double outter bounds'
                    var s = result[r][a].size;
                    //console.log('20000')
                    if (result[r][a].direction == 'sell') {
                        //console.log('buybuy')
                        restClient.buy('BTC-PERPETUAL', -1 * Math.floor(s / 4), lb - 1.5).then((result) => {
                            //console.log(result);
                            //console.log(result);
                        });
                        restClient.buy('BTC-PERPETUAL', -1 * Math.floor(s / 4), lb - 1.0).then((result) => {
                            //console.log(result);
                            //console.log(result);
                        });
                        restClient.buy('BTC-PERPETUAL', -1 * Math.floor(s / 4), lb - 0.5).then((result) => {
                            //console.log(result);
                            //console.log(result);
                        });
                    } else {
                        //console.log('sellsell')
                        restClient.sell('BTC-PERPETUAL', Math.floor(s / 4), ha + 1.5).then((result) => {
                            //console.log(result);
                        });
                        restClient.sell('BTC-PERPETUAL', Math.floor(s / 4), ha + 1.0).then((result) => {
                            //console.log(result);
                        });
                        restClient.sell('BTC-PERPETUAL', Math.floor(s / 4), ha + 0.5).then((result) => {
                            //console.log(result);
                        });
                    }
                }

            }
        }
    })


}, 2500);

// if price has moved more than a certain number $, cancel all orders

setInterval(function() {
    restClient.getopenorders('BTC-PERPETUAL').then((result) => {
        var go = true;
        for (var a in result) {
            for (var o in result[a]) {
                //console.log(result[a][o])
                if (result[a][o].direction == 'sell' && result[a][o].price < ha - 2) {
                    restClient.cancel(result[a][o].orderId).then((result) => {

                    })

                } else if (result[a][o].direction == 'buy' && result[a][o].price > lb + 2) {
                    restClient.cancel(result[a][o].orderId).then((result) => {

                    })
                }
            }
        }
    })
}, 2000)

// buy or sell if no other buy/sell order exists

setInterval(function() {
    restClient.getopenorders('BTC-PERPETUAL').then((result) => {
        var go = true;
        for (var a in result) {
            for (var o in result[a]) {
                if (result[a][o].direction == 'sell') {

                    go = false;

                } else if (result[a][o].direction == 'buy') {
                    go = false;
                }
            }
        }
        restClient.positions().then((result) => {
            for (var r in result) {
                for (var a in result[r]) {
                    pos = (result[r][a].size)
                }
            }
        });
        if (go) {
            if (gogoFour < 10 && av > 3000) {
                gogoFour++;
                restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {});
            }
            if (gogoFour < 10 && bv > 3000) {
                gogoFour++;
                restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {});

            }
        }
    });

}, 5000);

// calculate ha, lb, etc, increase tar or reset, enter buy or sell

setInterval(function() {
    restClient.getorderbook('BTC-PERPETUAL').then((result) => {
        ha = 5000000000000000000000000000;
        lb = 0;
        bv = 0;
        av = 0;
        for (var a in result.result.bids) {
            if (result.result.bids[a].price > lb) {
                lb = result.result.bids[a].price;
                bv = (result.result.bids[a].quantity);
                lbOld = lb;
                if (lbs.length == 10) {
                    lbs.shift();
                }
            }
        }
        for (var a in result.result.asks) {
            if (result.result.asks[a].price < ha) {
                ha = result.result.asks[a].price
                av = (result.result.asks[a].quantity);
                haOld = ha
            }
        }
        if (lb != buying) {
            tar = (btcNow * ha) / 4;

        }
        if (gogo == true && gogoFour < 10 && bv > 3000) {
            if (avail / btcNow < 0.75) {
                tar = tar + btcNow * 400
            }
            gogoFour++;
            can = true;
            setTimeout(function() {
                restClient.buy('BTC-PERPETUAL', tar, lb).then((result) => {
                    buying = lb;
                    count++;
                });
            }, 800);
        }
        if (gogo == true && gogoFour < 10 && av > 3000) {
            if (avail / btcNow < 0.75) {
                tar = tar + btcNow * 400
            }
            gogoFour++;
            can = true;
            setTimeout(function() {
                restClient.sell('BTC-PERPETUAL', tar, ha).then((result) => {
                    selling = ha;
                });
            }, 800);
        }

    });
}, 4250);
setInterval(function() {
    restClient.getopenorders('BTC-PERPETUAL').then((result) => {
        gogoFour = 0;
        for (var a in result) {
            for (var o in result[a]) {
                gogoFour++;
            }
        }
    })
}, 5000)

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
}, 8000)
