import express from 'express';
import fs, { PathLike } from "fs";
import { printedModel } from "./print";


const router = express.Router();

type awardModel = {
  filId: string,
  title: string,
  content: string
};

type printedWithFileName = {
  fileName: string,
  printed: printedModel
}

function ReadFiles(dir: PathLike): printedWithFileName[] {
  const printeds: printedWithFileName[] = [];
  fs.readdirSync(dir).forEach(file => {
    const fileName = `${dir}/${file}`;
    // const fileId = file.replace(".", "_");
    try {
      // const stats = fs.statSync(fileName);
      const printedTxt = fs.readFileSync(fileName, 'utf8');

      const printed: printedModel = JSON.parse(printedTxt);

      printeds.push({ fileName: file, printed });

    } catch (error) {
      console.log(`Error opening file "${fileName}"`, error);
      // yet ignore
    }


  });

  return printeds;
}

/* GET home page. */
router.get('/', (req, res, next) => {

  const awards = ReadFiles(`${__dirname}/printSrc`);
  const printeds = ReadFiles(`${__dirname}/prints`);

  res.render('index', { title: 'Печать', awards, printeds });
});

router.delete('/', (req, res, next) => {
  // console.log(req.body);
  try {

    const fileName = req.body.fileName;
    if (!/\w+/.test(fileName)) {
      res.json({
        success: false,
        message: `File name error`
      });
      return;
    }

    const filePath = `${__dirname}/prints/${fileName}`;

    fs.unlinkSync(filePath);
    res.json({
      success: true,
      fileName
    });
  } catch (error) {
    res.json({
      success: false,
      message: error
    });
  }

});

export default router;