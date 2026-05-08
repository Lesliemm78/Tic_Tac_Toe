import http from "http";
import fs from "fs";
import path from "path";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function resolveFilePath(urlPath = "/"): string {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  let decodedPath = "/index.html";

  try {
    decodedPath = decodeURIComponent(requestedPath.split("?")[0]);
  } catch {
    return path.join(PUBLIC_DIR, "index.html");
  }

  const filePath = path.resolve(PUBLIC_DIR, `.${decodedPath}`);
  const relativePath = path.relative(PUBLIC_DIR, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return path.join(PUBLIC_DIR, "index.html");
  }

  return filePath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveFilePath(request.url);
  const extension = path.extname(filePath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
    });
    response.end(content);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Tic Tac Toe is running at http://${HOST}:${PORT}`);
});
