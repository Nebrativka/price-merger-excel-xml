const fs = require("fs");
const xlsx = require("xlsx");
const axios = require("axios");
const xml2js = require("xml2js");

const XML_URL = process.env.XML_URL; // ссылка на xml

//=========================================
// READ EXCEL FILE
//=========================================
const workBook = xlsx.readFile("C:Users/Иван/Desktop/mc.xlsx");
const sheet = workBook.Sheets[workBook.SheetNames[0]];
const excelData = xlsx.utils.sheet_to_json(sheet);
// console.log("Листы в файле:", workBook.SheetNames);

const priceMap = {};
excelData.forEach((row) => {
  //
  const key = String(row.barcode).trim();
  priceMap[key] = Number(String(row.price).replace(",", "."));
});
//=========================================
// check excel
//=========================================
const keys = Object.keys(priceMap);
keys.slice(0, 5).forEach((key) => {
  console.log(key, "=>", priceMap[key]);
});
