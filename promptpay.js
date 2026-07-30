/* ==========================================================
24WASH PromptPay Engine V1
========================================================== */

console.log("PromptPay Engine Loaded");

// รอให้หน้าเว็บโหลดเสร็จ
window.addEventListener("DOMContentLoaded", () => {

    const qrBox = document.getElementById("qrContainer");

    if (!qrBox) {
        console.log("ไม่พบ qrContainer");
        return;
    }

    qrBox.innerHTML = "";

    new QRCode(qrBox, {
        text: "24WASH TEST",
        width: 260,
        height: 260
    });

    console.log("QR Created");

});
