import { compiler, utilityMacros, compilerUtils } from "lispsmos";
import * as fs from "node:fs/promises";
import * as http from "node:http";

async function build() {
  let lc = new compiler.LispsmosCompiler();
  utilityMacros.register(lc);
  lc.registerImporter(async (lc, location) => {
    try {
      let sourceCode = await fs.readFile(location);
      return { payload: sourceCode.toString(), success: true };
    } catch (err) {
      return { payload: undefined, success: false };
    }
  }); 
  let sourceCode = await fs.readFile("./main.lisp");
  let result = await lc.compile(sourceCode.toString());
  return result;
}


let server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.end(JSON.stringify(await build()));
    return;
});

server.listen("8081", "localhost"); 