// ==UserScript==
// @name        My Chatwork
// @namespace   Vin Scripts
// @match       https://www.chatwork.com/*
// @grant       none
// @version     1.0
// @author      VinhTT
// @description 7/13/2020, 1:34:31 PM
// ==/UserScript==

window.hms_room_id = "136424675";
window.hms_rooms = ["136424675", "143272855", "171691321", "182982140"];
window.hms_bpm = `[To:2343395]ThaoDTH, [To:4046665]PhuongNTD`;
window.hms_dev = `[To:3081641]VuongNQ,[To:5343141]NhanNV,[To:2031059]HuyNP,[To:3448959]HaoTH,[To:1368250]TanND,[To:1897024]CuongTT,[To:4242340]TuNQ,[To:5293785]AuPMH,[To:2512009]HangVTK`;

window.MyAppendText = function (text) {
  const area = document.querySelector("#_chatText");
  const startPos = area.selectionStart;
  const endPos = area.selectionEnd;

  // area.focus();
  // area.scrollTo(0,100);

  if (area.selectionStart || area.selectionStart === 0) {
    area.value =
      area.value.substring(0, startPos) +
      text +
      area.value.substring(endPos, area.value.length) +
      "\n";
    area.selectionStart = startPos + text.length;
    area.selectionEnd = startPos + text.length;
  } else {
    area.value += text + "\n";
  }
};

window.MyAppendHmsDev = function () {
  return MyAppendText(hms_dev);
};

window.MyAppendHmsBpm = function () {
  return MyAppendText(hms_bpm);
};


window.MyCheat = function () {
  const $myToolbar = document.querySelector("#my-toolbar");
  if ($myToolbar) {
    // existed
  } else {
    document.querySelector("#_chatSendTool").insertAdjacentHTML(
      "afterend",
      `
<div id="my-toolbar">
  <span onclick="return MyAppendHmsDev();">hms-dev</span>
  <span onclick="return MyAppendHmsBpm();">hms-bpm</span>
</div>
`
    );
  }
};


window.MyInitCss = function () {
  // Create our stylesheet
  var style = `<style>.profileShowDialog__editProfileButton{display:none!important;}#my-toolbar{color:chocolate;}#my-toolbar span{cursor:pointer;}</style>`;
  document.querySelector("body").insertAdjacentHTML("beforeend", style);
}

window.MyInitJs = function () {
  const roomId = location.hash.split("rid").pop();
  if (hms_rooms.includes(roomId)) {
    MyCheat();
  } else {
    console.log('Not room HMS');
  }
};

window.onhashchange = function () {
  setTimeout(MyInitJs, 200);
};

setTimeout(()=>{
  window.MyInitCss();
  window.MyInitJs();
}, 4000);
