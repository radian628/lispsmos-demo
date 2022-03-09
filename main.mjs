import { compiler, utilityMacros, compilerUtils } from "lispsmos";
import * as fs from "node:fs/promises";
import * as http from "node:http";

async function build() {
  //Create the lispsmos compiler.
  let lc = new compiler.LispsmosCompiler();
  
  //Register some useful utility macros
  utilityMacros.register(lc);

  //Register an "importer function" that tells LISPsmos how to get external source files.
  //In this case, it's getting them from the filesystem.
  lc.registerImporter(async (lc, location) => {
    try {
      let sourceCode = await fs.readFile(location);
      return { payload: sourceCode.toString(), success: true };
    } catch (err) {
      return { payload: undefined, success: false };
    }
  }); 

  //The file main.lisp is our entry point. We're starting the compilation process from there.
  let sourceCode = await fs.readFile("./main.lisp");

  //Compile the LISPsmos into a Desmos graph state object.
  let result = await lc.compile(sourceCode.toString());

  //Return the graph.
  return result;
}


let server = http.createServer(async (req, res) => {
    //Set headers so we can receive an HTTP request in Desmos.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    //Send the LISPsmos code to the requester.
    res.end(JSON.stringify(await build()));
});


//Run the web server on port 8081.
server.listen("8081", "localhost"); 