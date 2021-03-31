import * as http from "http";
import { ParsedUrlQuery } from "querystring";
import * as url from "url";
import { PolarisInsight } from "./polaris/types";
export const createServer = async (
  port: number,
  onRequest: (query: ParsedUrlQuery) => Promise<PolarisInsight[]>,
  onSuccess: (
    polarisInsights: PolarisInsight[],
    res: http.ServerResponse
  ) => void
): Promise<void> => {
  http
    .createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      const requestUrl = url.parse(req.url || "", true);
      switch (requestUrl.pathname) {
        case "/":
          onRequest(requestUrl.query)
            .then((polarisInsights) => {
              res.writeHead(200, { "Content-Type": "text/html" });
              onSuccess(polarisInsights, res);
              return;
            })
            .catch(console.error);
          break;
        default:
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Something wrong. Check logs.");
      }
    })
    .listen(port);
};
