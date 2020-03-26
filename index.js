const { Client } = require("whatsapp-web.js");
const coba_lah = require("./help/1");
const fs = require("fs");

const SESSION_FILE_PATH = "./session.json";
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}
const client = new Client({
  puppeteer: {
    headless: true
  },
  session: sessionCfg
});
client.initialize();

client.on("qr", qr => {
  // Generate and scan this code with your phone
  console.log("Buka Menu WhatsApp Web Di Apkmu Lalu Scan");
  console.log("Menunggu Di Scan!");
});

client.on("authenticated", session => {
  console.log("AUTHENTICATED", session);
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
    //jika session belum tersimpan maka akan membuat session baru
    if (err) {
      console.error(err);
    }
  });
});

client.on("auth_failure", msg => {
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async msg => {
  const crindo = await coba_lah.corona();
  const a = await msg.getChat();
  if (a.isGroup) {
    if (msg.body == "!corona") {
      if (
        msg.author == "6281317485939@c.us" ||
        msg.author == "6285210723474@c.us" ||
        msg.author == "6281229970131@c.us"
      ) {
        const pesan = `*[BOT BUCIN AREA]*\n\n🇮🇩 Negara : ${crindo.negara}\n😧 Total Kasus : ${crindo.total} Orang\n👩‍⚕️ Dalam Perawatan : ${crindo.penanganan} Orang\n😍 Sembuh : ${crindo.sembuh} Orang\n😢 Meninggal : ${crindo.meninggal} Orang\n\n*TERUS JAGA KEBERSIHAN*\n*DAN RAJIN RAJIN CUCI TANGAN!*\nTerakhir Update : ${crindo.terakhir} (+7 Jam jadi WIB)\n\n*_#DiRumahAja_*\n*#YukLawanCOVID19*\n*[DONASI Untuk _COVID19_]* : sgbcovid19.com\n*#RamaXVjXRobby*`;
        msg.reply(pesan);
        console.log(
          "Membalas " +
            msg.body +
            " Dari > " +
            msg.author +
            "\nDengan Isi\n" +
            pesan +
            "\n\n"
        );
        //   console.log(msg);
      }
    }
  } else {
    if (msg.body == "!corona") {
      const crindo = await coba_lah.corona();
      const pesan = `*[CORONA INDONESIA]*\n\n🇮🇩 Negara : ${crindo.negara}\n😧 Total Kasus : ${crindo.total} Orang\n👩‍⚕️ Dalam Perawatan : ${crindo.penanganan} Orang\n😍 Sembuh : ${crindo.sembuh} Orang\n😢 Meninggal : ${crindo.meninggal} Orang\n\n*TERUS JAGA KEBERSIHAN*\n*DAN RAJIN RAJIN CUCI TANGAN!*\nTerakhir Update : ${crindo.terakhir} (+7 Jam jadi WIB)\n\n*_#DiRumahAja_*\n*#YukLawanCOVID19*\n*[DONASI Untuk _COVID19_]* : sgbcovid19.com`;
      msg.reply(pesan);
      console.log(
        "Membalas " +
          msg.body +
          " Dari > " +
          msg.from +
          "\nDengan Isi\n" +
          pesan +
          "\n\n"
      );
    }
  }
});
//   .catch(err => console.log(err));
