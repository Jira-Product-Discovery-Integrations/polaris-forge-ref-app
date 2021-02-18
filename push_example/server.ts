
import * as ngrok from "ngrok";
import * as http from "http";
import * as url from "url";

export const createServer = async (port, onRequest, onSuccess) => {
    const tunnelUrl = await ngrok.connect(port);
    http
      .createServer(async function (req, res) {
        const requestUrl = url.parse(req.url, true);
        switch (requestUrl.pathname) {
          case "/":
            await onRequest(tunnelUrl, requestUrl.query);
            res.writeHead(200, { "Content-Type": "text/html" });
            onSuccess(res);
            return;
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");
      })
      .listen(port);
    return tunnelUrl;
}
