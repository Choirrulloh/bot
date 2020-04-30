const {
  Client,
  MessageMedia
} = require("whatsapp-web.js");
const coba_lah = require("./help/1");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const SESSION_FILE_PATH = "./session.json";
const delay = require("delay");
let urlen = require("urlencode");
let moment = require("moment");
moment.locale("id");
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
  puppeteer: {
    headless: true,
  },
  session: sessionCfg,
});
// You can use an existing session and avoid scanning a QR code by adding a "session" object to the client options.
// This object must include WABrowserId, WASecretBundle, WAToken1 and WAToken2.

client.initialize();

client.on("qr", (qr) => {
  // NOTE: This event will not be fired if a session is specified.
  let scan = qrcode(qr);
  console.log("SCAN!", scan);
});

client.on("authenticated", (session) => {
  console.log(
    `[${moment().format(
      "hh:mm:ss"
    )}] BERHASIL LOGIN SOB!\n---------------------------------`
  );
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    if (err) {
      console.error(err);
    }
  });
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessfull
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log(
    `[${moment().format(
      "hh:mm:ss"
    )}] BOT SUDAH SIAP DIGUNAKAN SOB!\n---------------------------------`
  );
});

client.on("message", async (msg) => {
  if (msg.body == "!imsak") {
    let day = "";
    let imsak_kab = "";
    let subuh_kab = "";
    let dzuhur_kab = "";
    let ashar_kab = "";
    let maghrib_kab = "";
    let isya_kab = "";
    fetch("https://www.detik.com/ramadan/jadwal-imsak/jawa-barat/kab-sukabumi")
      .then((res) => res.text())
      .then((rest) => {
        const $ = cheerio.load(rest);
        day = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(1)"
        ).text();
        imsak_kab = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(2)"
        ).text();
        subuh_kab = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(3)"
        ).text();
        dzuhur_kab = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(4)"
        ).text();
        ashar_kab = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(5)"
        ).text();
        maghrib_kab = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(6)"
        ).text();
        isya_kab = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(7)"
        ).text();
      });
    await delay(2000);
    fetch("https://www.detik.com/ramadan/jadwal-imsak/jawa-barat/kota-sukabumi")
      .then((res) => res.text())
      .then((rest) => {
        const $ = cheerio.load(rest);
        let imsak = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(2)"
        ).text();
        let subuh = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(3)"
        ).text();
        let dzuhur = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(4)"
        ).text();
        let ashar = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(5)"
        ).text();
        let maghrib = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(6)"
        ).text();
        let isya = $(
          "#scheduleTable > table > tbody > tr.selected > td:nth-child(7)"
        ).text();
        console.log(
          `[${moment().format("hh:mm:ss")}][!imsak][${
            msg.from
          }] > Berhasil Dilakukan`
        );
        msg.reply(
          `*🌕JADWAL IMSAKIYAH🌕*\n*🌆KAB. & KOTA SUKABUMI*\nHARI KE : *${day}*\n\n*_Daerah Kab._*\n_Imsak_ : ${imsak_kab}\n_Subuh_ : ${subuh_kab}\n_Dzuhur_ : ${dzuhur_kab}\n_Ashar_ : ${ashar_kab}\n_Maghrib_ : ${maghrib_kab}\n_Isya_ : ${isya_kab}\n\n*_Daerah KOTA_*\n_Imsak_ : ${imsak}\n_Subuh_ : ${subuh}\n_Dzuhur_ : ${dzuhur}\n_Ashar_ : ${ashar}\n_Maghrib_ : ${maghrib}\n_Isya_ : ${isya}\n\n*Sumber :* https://www.detik.com/ramadan/jadwal-imsak`
        );
      });
  } else if (msg.body.startsWith("!fb ")) {
    msg.reply(`*Hai, Kita Proses Dulu Ya . . .*`);
    let link = msg.body.split(" ")[1];
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
    const page = await browser.newPage();
    await page
      .goto("https://id.savefrom.net", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
        await page.type("#sf_url", `${link}`);
        await page.click("#sf_submit");
        msg.reply(
          "Mendownload Video!\nTIDAK ADA RESPON DALAM 1 MENIT?\nCoba *!fb2 link videonya*"
        );
        try {
          await page.waitForSelector(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const element = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const text = await (await element.getProperty("href")).jsonValue();
          const judul = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.meta > div"
          );
          const judul1 = await (await judul.getProperty("title")).jsonValue();
          let nih = urlen.encode(text);
          fetch(
              `https://terhambar.com/url/yourls-api.php?username=admin&password=ramaganteng12&action=shorturl&url=${nih}&format=json`
            )
            .then((results) => results.json())
            .then((rests) => {
              msg.reply(
                "*BERHASIL!!*\n\n" +
                "_Judul :_ " +
                judul1 +
                "\n_Download :_ " +
                rests.shorturl +
                "\n\nLink tidak bisa diakses?\ncoba *!fb2 link video*"
              );
              console.log(
                `[${moment().format("hh:mm:ss")}][!fb][${
                  msg.from
                }] > Berhasil Dilakukan`
              );
            });
          browser.close();
        } catch (error) {
          console.log(
            `[${moment().format("hh:mm:ss")}][!fb][${
              msg.from
            }] > GAGAL Dilakukan`
          );
          msg.reply(
            `[GAGAL] PASTIKAN LINK VIDEO BERSIFAT PUBLIK DAN DAPAT DIAKSES OLEH SEMUA ORANG!\nTetap Gagal? Coba *!fb2 _link video fb_*`
          );
          browser.close();
        }
      })
      .catch((err) => {
        console.log(
          `[${moment().format("hh:mm:ss")}][!fb][${msg.from}] > GAGAL Dilakukan`
        );
        msg.reply(
          `[GAGAL] Server Sedang Down!\n\nSilahkan Coba Beberapa Saat Lagi!`
        );
        browser.close();
      });
  } else if (msg.body.startsWith("!fb2 ")) {
    msg.reply(`*Hai, Kita Proses Dulu Ya . . .*`);
    let link = msg.body.split(" ")[1];
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
    const page = await browser.newPage();
    await page
      .goto("https://id.savefrom.net", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
        await page.type("#sf_url", `${link}`);
        await page.click("#sf_submit");
        try {
          msg.reply("Mendownload Video!");
          await page.waitForSelector(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const element = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const text = await (await element.getProperty("href")).jsonValue();
          const judul = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.meta > div"
          );
          const judul1 = await (await judul.getProperty("title")).jsonValue();
          console.log(
            `[${moment().format("hh:mm:ss")}][!fb][${
              msg.from
            }] > Berhasil Dilakukan`
          );
          msg.reply(
            `*BERHASIL!!!*\n\nJudul : ${judul1}\nDownload : ${text}\n\n_Utamakan Pakai *!fb*_\n_Karena Ini Hanya Server Cadangan_`
          );
          browser.close();
        } catch (error) {
          console.log(
            `[${moment().format("hh:mm:ss")}][!fb][${
              msg.from
            }] > GAGAL Dilakukan`
          );
          msg.reply(
            `[GAGAL] PASTIKAN LINK VIDEO BERSIFAT PUBLIK DAN DAPAT DIAKSES OLEH SEMUA ORANG!*`
          );
          browser.close();
        }
      })
      .catch((err) => {
        console.log(
          `[${moment().format("hh:mm:ss")}][!fb][${msg.from}] > GAGAL Dilakukan`
        );
        msg.reply(
          `[GAGAL] Server Sedang Down!\n\nSilahkan Coba Beberapa Saat Lagi!`
        );
        browser.close();
      });
  } else if (msg.body.startsWith("!resi ")) {
    let kurir = msg.body.split(" ")[1];
    let resi = msg.body.split(" ")[2];
    console.log(kurir + resi);
    if (kurir.length != 2 || resi.length != 6) {
      fetch(`https://api.terhambar.com/resi?resi=${resi}&kurir=${kurir}`)
        .then((resss) => resss.json())
        .then((resst) => {
          if (resst.status != "OK") {
            msg.reply("*Maaf Server Mencapai Batas Harian! Coba Lagi Besok!*");
          } else {
            let ar = [];
            let sem = "";
            for (let i = 0; i < Object.keys(resst.lacak.stats).length; i++) {
              let sendlah =
                "moment().format('hh:mm:ss') : " +
                resst.lacak.stats[i].moment().format("hh:mm:ss") +
                "\nKeterangan : " +
                resst.lacak.stats[i].keterangan +
                "\nKota : " +
                resst.lacak.stats[i].kota +
                "\n\n";
              ar.push(sendlah);
              sem = ar.join("");
            }
            console.log(
              `[${moment().format("hh:mm:ss")}][!fb][${
                msg.from
              }] > Berhasil Dilakukan`
            );
            msg.reply(
              "*Berhasil Melacak*\n\n" +
              "Nama Penerima : " +
              resst.name +
              "\nKurir : " +
              resst.kurir +
              "\nmoment().format('hh:mm:ss') Input Resi : " +
              resst.tlg_input +
              `\n\n*Pelacakan* :\n${sem}`
            );
          }
        });
    } else {
      console.log(
        `[${moment().format("hh:mm:ss")}][!resi][${msg.from}] > GAGAL Dilakukan`
      );
      msg.reply("*DATA TIDAK BISA DILACAK!*");
    }
  } else if (msg.body == "!resi") {
    let balas = `_CEK RESI VIA WHATSAPP_\n\nformat cek resi *_!resi kurir nomor resi_*\n\ncontoh > *!resi jnt 6969696969*\n`;
    msg.reply(balas);
    console.log(
      `[${moment().format("hh:mm:ss")}][!resi][${
        msg.from
      }] > Berhasil Dilakukan`
    );
  } else if (msg.body.startsWith("!yt ")) {
    msg.reply(`*Hai, Kita Proses Dulu Ya . . .*`);
    let yt = msg.body.split(" ")[1];
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
    const page = await browser.newPage();
    await page
      .goto("https://id.savefrom.net", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
        await page.type("#sf_url", `${yt}`);
        await page.click("#sf_submit");
        msg.reply("Mendownload Video!");
        try {
          await page.waitForSelector(
            "#sf_result > div > div.result-box.video > div.info-box"
          );
          await page.click(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box > div.drop-down-box"
          );
          await page.waitForSelector(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.expand > div.drop-down-box > div.list > div > div > div > a:nth-child(1)"
          );
          const link1 = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.expand > div.drop-down-box > div.list > div > div.main > div:nth-child(1) > a"
          );
          const link2 = await (await link1.getProperty("text")).jsonValue();
          if (link2.split(" ")[0] == "WebM") {
            const rubah = await page.$(
              "#sf_result > div > div.result-box.video > div.info-box > div.link-box.expand > div.drop-down-box > div.list > div > div.main > div:nth-child(2) > a"
            );
            const rubah1 = await (await rubah.getProperty("href")).jsonValue();
            let ur = urlen.encode(rubah1);
            fetch(
                `https://terhambar.com/url/yourls-api.php?username=admin&password=ramaganteng12&action=shorturl&url=${ur}&format=json`
              )
              .then((res1) => res1.json())
              .then((res2) => {
                msg.reply(
                  `*[BERHASIL]*\n\nVideo Di Download Dengan Kualitas Terbaik\nLink : ${res2.shorturl}`
                );
                console.log(
                  `[${moment().format("hh:mm:ss")}][!yt][${
                    msg.from
                  }] > Berhasil Dilakukan`
                );
              });
            browser.close();
          } else {
            const dwn = await (await link1.getProperty("href")).jsonValue();
            let ar = urlen.encode(dwn);
            fetch(
                `https://terhambar.com/url/yourls-api.php?username=admin&password=ramaganteng12&action=shorturl&url=${ar}&format=json`
              )
              .then((res1) => res1.json())
              .then((res2) => {
                msg.reply(
                  `*[BERHASIL]*\n\nVideo Di Download Dengan Kualitas Terbaik\nLink : ${res2.shorturl}`
                );
                console.log(
                  `[${moment().format("hh:mm:ss")}][!yt][${
                    msg.from
                  }] > Berhasil Dilakukan`
                );
              });
            browser.close();
          }
        } catch (error) {
          console.log(
            `[${moment().format("hh:mm:ss")}][!yt][${
              msg.from
            }] > GAGAL Dilakukan`
          );
          msg.reply(
            `*[GAGAL] COBA SEKALI LAGI!*\n*PASTIKAN VIDEO MASIH ADA DAN TIDAK COPYRIGHT!*\n*MASIH GAGAL? BERARTI VIDEO ANDA TIDAK BISA DIDOWNLOAD!*`
          );
        }
      })
      .catch((err) => {
        console.log(
          `[${moment().format("hh:mm:ss")}][!fb][${msg.from}] > GAGAL Dilakukan`
        );
        msg.reply(
          `[GAGAL] Server Sedang Down!\n\nSilahkan Coba Beberapa Saat Lagi!`
        );
        browser.close();
      });
  } else if (msg.body == "!corona") {
    const crindo = await coba_lah.corona();
    const pesan = `*[CORONA INDONESIA]*\n*!prov_corona* untuk data perprovinsi\n\n🇮🇩 Negara : ${crindo.negara}\n😧 Total Kasus : ${crindo.total} Orang\n👩‍⚕️ Dalam Perawatan : ${crindo.penanganan} Orang\n😍 Sembuh : ${crindo.sembuh} Orang\n😢 Meninggal : ${crindo.meninggal} Orang\n\n*!prov_corona* untuk data perprovinsi\n*TERUS JAGA KEBERSIHAN*\n*DAN RAJIN RAJIN CUCI TANGAN!*\nTerakhir Update : ${crindo.terakhir} (+7 Jam jadi WIB)\n\n*_#DiRumahAja_*\n*#YukLawanCOVID19*\n*[DONASI Untuk _COVID19_]* : sgbcovid19.com`;
    msg.reply(pesan);
    console.log(
      `[${moment().format("hh:mm:ss")}][!corona][${
        msg.from
      }] > Berhasil Dilakukan`
    );
  } else if (msg.body == "!prov_corona") {
    fetch(
        "https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/arcgis/rest/services/COVID19_Indonesia_per_Provinsi/FeatureServer/0/query?f=json&where=(Provinsi%20<>%20%27Indonesia%27)%20AND%20(Kasus_Posi%20<>%200)&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Kasus_Posi%20desc&outSR=102100&resultOffset=0&resultRecordCount=34&cacheHint=true", {
          method: "GET",
        }
      )
      .then((rest) => rest.json())
      .then((ress) => {
        let arr = [];
        for (let i = 0; i < Object.keys(ress.features).length; i++) {
          let prov = ress.features[i].attributes.Provinsi;
          let positif = ress.features[i].attributes.Kasus_Posi;
          let sembuh = ress.features[i].attributes.Kasus_Semb;
          let mati = ress.features[i].attributes.Kasus_Meni;
          let data = `Prov : ${prov}\nPositif: ${positif}\nSembuh : ${sembuh}\nMeninggal : ${mati}\n\n\n`;
          arr.push(data);
        }
        arr.join("");
        let aa = "";
        for (let i = 0; i < Object.keys(ress.features).length; i++) {
          aa += arr[i];
        }
        msg.reply("*[DATA CORONA PROVINSI]*\n\n" + aa);
        console.log(
          `[${moment().format("hh:mm:ss")}][!prov_corona][${
            msg.from
          }] > Berhasil Dilakukan`
        );
      });
  } else if (msg.body.startsWith("!spam ")) {
    let nomor = msg.body.split(" ")[1];
    let jmlh = msg.body.split(" ")[2];
    let panjang_pesan = Object.keys(msg.body.split(" ")).length;
    let pesan = "";
    for (let i = 3; i < panjang_pesan; i++) {
      pesan += msg.body.split(" ")[i] + " ";
    }
    nomor = nomor.includes("@c.us") ? nomor : `${nomor}@c.us`;
    if (jmlh >= 500) {
      msg.reply("DOSA SOB SPAM BANYAK BANYAK!");
    } else {
      if (jmlh >= 50 && jmlh <= 500) {
        if (pesan == "") {
          for (let i = 1; i < jmlh; i++) {
            client.sendMessage(nomor, "P");
            await delay(1500);
          }
          client.sendMessage(
            nomor,
            `[${moment().format(
              "hh:mm:ss"
            )}][BOT] Spam Request by https://wa.me/${
              msg.from.split("@c.us")[0]
            }`
          );
          msg.reply(
            `*[SUKSES]* ${jmlh} Pesan ke ${
              nomor.split("@c.us")[0]
            } (Dengan Memberitahu Bahwa Anda Pengirimnya!)`
          );
          console.log(
            `[${moment().format("hh:mm:ss")}][!spam][${
              msg.from
            }] > Berhasil Dilakukan ke ${nomor.split("@c.us")[0]}`
          );
        } else {
          for (let i = 0; i < jmlh; i++) {
            client.sendMessage(nomor, pesan);
            await delay(1500);
          }
          client.sendMessage(
            nomor,
            `[${moment().format(
              "hh:mm:ss"
            )}][BOT] Spam Request by https://wa.me/${
              msg.from.split("@c.us")[0]
            }`
          );
          msg.reply(
            `*[SUKSES]* ${jmlh} Pesan ke ${
              nomor.split("@c.us")[0]
            } (Dengan Memberitahu Bahwa Anda Pengirimnya!)`
          );
          console.log(
            `[${moment().format("hh:mm:ss")}][!spam][${
              msg.from
            }] > Berhasil Dilakukan ke ${nomor.split("@c.us")[0]}`
          );
        }
      } else {
        if (pesan == "") {
          for (let i = 1; i < jmlh; i++) {
            client.sendMessage(nomor, "P");
            await delay(1500);
          }
          msg.reply(
            `*[SUKSES]* ${jmlh} Pesan ke ${
              nomor.split("@c.us")[0]
            } (Tanpa Memberitahu Bahwa Anda Pengirimnya!)`
          );
          console.log(
            `[${moment().format("hh:mm:ss")}][!spam][${
              msg.from
            }] > Berhasil Dilakukan ke ${nomor.split("@c.us")[0]}`
          );
        } else {
          for (let i = 0; i < jmlh; i++) {
            client.sendMessage(nomor, pesan);
            await delay(1500);
          }
          msg.reply(
            `*[SUKSES]* ${jmlh} Pesan ke ${
              nomor.split("@c.us")[0]
            } (Tanpa Memberitahu Bahwa Anda Pengirimnya!)`
          );
          console.log(
            `[${moment().format("hh:mm:ss")}][!spam][${
              msg.from
            }] > Berhasil Dilakukan ke ${nomor.split("@c.us")[0]}`
          );
        }
      }
    }
  }
});

client.on("change_battery", (batteryInfo) => {
  const {
    battery,
    plugged
  } = batteryInfo;
  let stts = "";
  if (plugged == true) {
    stts = "Sedang Mengisi Daya";
  } else {
    stts = "Tidak Mengisi Daya";
  }
  console.log(
    `[${moment().format("hh:mm:ss")}][Battery][${stts}] > ${battery}%`
  );
});

client.on("disconnected", (reason) => {
  console.log(
    `[${moment().format("hh:mm:ss")}][SAMBUNGAN TERPUTUS] > ${reason}`
  );
});