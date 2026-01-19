require("dotenv").config();
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
// const keys = Object.keys(priceMap);
// keys.slice(0, 5).forEach((key) => {
//   console.log(key, "=>", priceMap[key]);
// });

//=========================================
// LOAD XML
//=========================================

async function processXml() {
  try {
    console.log("XML_URL", XML_URL); //check url
    const response = await axios.get(XML_URL, {
      responseType: "text",
      timeout: 15000,
    });

    const xmlContent = response.data;
    //=========================================
    // check XML
    //=========================================
    console.log("XML LOAD");
    console.log(xmlContent.slice(0, 500));

    //=========================================
    // parsing XML
    //=========================================
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlContent);
    const offers = result.yml_catalog.shop[0].offers[0].offer;
    //=========================================
    // check XML parsing
    //=========================================
    console.log("First 5 offers:");
    offers.slice(0, 5).forEach((offer) => {
      console.log({
        id: offer.$.id, // атрибут id
        available: offer.$.available, // атрибут available
        name: offer.name[0],
        url: offer.url[0],
        currency: offer.currency[0],
        price: offer.price[0],
        categoryId: offer.categoryId[0],
        vendorCode: offer.vendorCode[0],
        vendor: offer.vendor[0],
        stock_quantity: offer.stock_quantity[0],
        pictures: offer.picture.map((p) => p), // массив картинок
      });
    });
    //=========================================
    // UPDATE PRICE
    //=========================================

    offers.forEach((offer) => {
      const key = offer.vendorCode?.[0];
      if (priceMap[key] !== undefined) {
        offer.price[0] = priceMap[key].toString();
      }
    });

    //=========================================
    // GENERATE NEW XML
    //=========================================
    const builder = new xml2js.Builder({
      xmldec: { version: "1.0", encoding: "UTF-8" },
      renderOpts: { pretty: true },
    });
    const updateXML = builder.buildObject(result);
    fs.writeFileSync("result.xml", updateXML, "utf-8");

    // ==============================
  } catch (error) {
    console.error("Error loading XML:", error.message);
  }
}

processXml();
