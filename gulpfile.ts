import {dest, series, src, watch} from "gulp"

const browserSync = require("browser-sync").create()
const sass = require("gulp-sass")(require("sass"))
const p = require("puppeteer")


const pdf = async () => {
  try {
    const browser = await p.launch();
    const page = await browser.newPage();
    await page.goto("file:" + process.cwd() + "/src/document.html",
        {
          // networkidle0 - consider navigation to be finished when there 
          // are no more than 0 network connections for at least 500 ms.
          waitUntil: 'networkidle0',
          timeout: 0
        });
    await page.pdf({
      format: "a4",
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      path: process.cwd() + "/document.pdf"
    });
    await browser.close();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};


const scss = () => {
  return src('./src/css/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(dest("./src/css"))
      // ensures that the updated files will be reloaded
      .pipe(browserSync.stream())
}

const serve = () => {
  browserSync.init({
    server: {
      baseDir: './src',
      index: 'document.html'
    }
  })

  watch('src/*.html').on('change', browserSync.reload)
  watch('src/css/**/*.scss', scss)
}

exports.pdf = series(scss, pdf)
exports.scss = scss
exports.serve = series(scss, serve)
