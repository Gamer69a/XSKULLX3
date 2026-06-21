var http = require("http");
var https = require("https");
var url = require("url");

var PORT = process.env.PORT || 5000;

function addCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

var server = http.createServer(function (req, res) {
  addCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  var parsed = url.parse(req.url, true);
  var target = parsed.query.url;

  if (!target) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing ?url= parameter" }));
    return;
  }

  var isHttps = target.indexOf("https://") === 0;
  var transport = isHttps ? https : http;

  var options = url.parse(target);
  options.method = req.method;
  options.headers = {};
  options.rejectUnauthorized = false;

  if (req.headers["user-agent"]) options.headers["user-agent"] = req.headers["user-agent"];
  if (req.headers["accept"]) options.headers["accept"] = req.headers["accept"];
  if (req.headers["cookie"]) options.headers["cookie"] = req.headers["cookie"];

  var proxyReq = transport.request(options, function (proxyRes) {
    res.statusCode = proxyRes.statusCode;
    var skipHeaders = { "transfer-encoding": true, "content-encoding": true };
    for (var k in proxyRes.headers) {
      if (!skipHeaders[k]) {
        try { res.setHeader(k, proxyRes.headers[k]); } catch (e) {}
      }
    }
    addCorsHeaders(res);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", function (err) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain");
    res.end("Proxy error: " + err.message);
  });

  if (req.method !== "GET" && req.method !== "HEAD") {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, function () {
  console.log("xskullx proxy running on http://localhost:" + PORT);
});
