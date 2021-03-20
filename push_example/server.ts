import * as http from "http";
import { ParsedUrlQuery } from "querystring";
import * as url from "url";

export const createServer = async (
  port: number,
  onRequest: (query: ParsedUrlQuery) => Promise<void>,
  onSuccess: (res: http.ServerResponse) => void
): Promise<void> => {
  http
    .createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      const requestUrl = url.parse(req.url || "", true);
      switch (requestUrl.pathname) {
        case "/":
          onRequest(requestUrl.query)
            .then(() => {
              res.writeHead(200, { "Content-Type": "text/html" });
              onSuccess(res);
              return;
            })
            .catch(console.error);
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
    })
    .listen(port);
};
