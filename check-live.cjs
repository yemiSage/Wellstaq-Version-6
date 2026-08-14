const fs = require("fs");
const ts = require("typescript");
const files = process.argv.slice(2);
let failed = false;
for (const file of files) {
  const result = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
    fileName: file,
  });
  const errors = (result.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    failed = true;
    console.error(file, errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n")));
  }
}
if (failed) process.exit(1);
console.log(`Syntax checked ${files.length} TypeScript files.`);
