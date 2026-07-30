/* ==========================================================
24WASH ROJANA
Version 2.0
Part 1
========================================================== */

const WEBHOOK_URL =
"https://n8n-production-994c.up.railway.app/webhook/24wash-order";

/* ==========================================================
GLOBAL
========================================================== */

let washPrice = 0;
let dryerPrice = 0;
let total = 0;

/* ==========================================================
PAYMENT SESSION
========================================================== */

let orderId = "";
let paymentId = "";
let sessionId = "";

let paymentAmount = 0;

let createdAt = null;
let expireAt = null;

const QR_EXPIRE_MINUTES = 30;

/* ==========================================================
HELPER
========================================================== */

const $ = (id) => document.getElementById(id);

function randomString(length){

    const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for(let i=0;i<length;i++){

        result += chars.charAt(

            Math.floor(

                Math.random()*chars.length

            )

        );

    }

    return result;

}

/* ==========================================================
ID GENERATOR
========================================================== */

function generateOrderId(){

    const now = new Date();

    const yy =
    String(now.getFullYear()).slice(-2);

    const mm =
    String(now.getMonth()+1)
    .padStart(2,"0");

    const dd =
    String(now.getDate())
    .padStart(2,"0");

    return `24WASH-${yy}${mm}${dd}-${randomString(6)}`;

}

function generatePaymentId(){

    return `PAY-${randomString(10)}`;

}

function generateSessionId(){

    return `SES-${randomString(16)}`;

}

/* ==========================================================
PAYMENT SESSION
========================================================== */

function createPaymentSession(){

    orderId = generateOrderId();

    paymentId = generatePaymentId();

    sessionId = generateSessionId();

    createdAt = new Date();

    expireAt = new Date(
        createdAt.getTime() +
        QR_EXPIRE_MINUTES * 60000
    );

    // ใช้ยอดจริง ไม่มีการสุ่มทศนิยม
    paymentAmount = total;

    const qrFingerprint = btoa([
        orderId,
        paymentId,
        sessionId,
        String(paymentAmount),
        createdAt.toISOString()
    ].join("|"));

    localStorage.setItem(
        "qrFingerprint",
        qrFingerprint
    );

    localStorage.setItem(
        "paymentSession",
        JSON.stringify({
            orderId,
            paymentId,
            sessionId,
            paymentAmount,
            createdAt,
            expireAt
        })
    );

    console.log({
        orderId,
        paymentId,
        sessionId,
        paymentAmount,
        createdAt,
        expireAt
    });

}

/* ==========================================================
DATE
========================================================== */

const pickupDate =
$("pickupDate");

const today =
new Date();

for(let i=0;i<14;i++){

    const d =
    new Date();

    d.setDate(

        today.getDate()+i

    );

    const day =

    String(d.getDate())
    .padStart(2,"0");

    const month =

    String(d.getMonth()+1)
    .padStart(2,"0");

    const year =
    d.getFullYear();

    const formatted =

    `${day}/${month}/${year}`;

    const option =

    document.createElement("option");

    option.value =
    formatted;

    option.textContent =
    formatted;

    pickupDate.appendChild(option);

}

/* ==========================================================
ACTIVE BUTTON
========================================================== */

function getActiveValue(groupId){

    const active =

    document.querySelector(

        `#${groupId} .active`

    );

    return active
        ? active.dataset.value
        : "";

}

function clearActive(group){

    group
    .querySelectorAll(".touch-btn")
    .forEach(btn=>{

        btn.classList.remove("active");

    });

}

function setupTouchGroup(groupId){

    const group =

    $(groupId);

    if(!group) return;

    const buttons =

    group.querySelectorAll(

        ".touch-btn"

    );

    buttons.forEach(button=>{

        button.addEventListener(

            "click",

            function(){

                clearActive(group);

                this.classList.add(

                    "active"

                );

                setTimeout(

                    calculateTotal,

                    10

                );

            }

        );

    });

}

setupTouchGroup("washGroup");
setupTouchGroup("waterGroup");
setupTouchGroup("dryerGroup");
setupTouchGroup("extraGroup");

/* ==========================================================
CALCULATE TOTAL
========================================================== */

const WASH_PRICE = {
    9:  { cold:40, warm:50, hot:60 },
    14: { cold:50, warm:60, hot:70 },
    18: { cold:60, warm:70, hot:80 },
    27: { cold:80, warm:100, hot:120 }
};

const WATER_NAME = {
    cold:"น้ำเย็น",
    warm:"น้ำอุ่น",
    hot:"น้ำร้อน"
};

function calculateTotal(){

    const washSize = getActiveValue("washGroup");
    const water = getActiveValue("waterGroup");
    const dryer = getActiveValue("dryerGroup");
    const extra = Number(getActiveValue("extraGroup") || 0);

    const detergent =
    Number($("detergentQty").value) || 0;

    const softener =
    Number($("softenerQty").value) || 0;

    const fold =
    Number($("foldQty").value) || 0;

    const waterDisplay =
    WATER_NAME[water] || "";

    /* ==========================
       WASH PRICE
    ========================== */

    washPrice =
        WASH_PRICE[washSize]?.[water] || 0;

    /* ==========================
       DRYER PRICE
    ========================== */

    dryerPrice = 0;

    if(dryer==="14"){

        dryerPrice = 40;

    }

    if(dryer==="25"){

        dryerPrice = 70;

    }

    if(dryer!=="0"){

        dryerPrice +=

        (extra/6)*10;

    }

    /* ==========================
       EXTRA
    ========================== */

    const detergentTotal =
    detergent*5;

    const softenerTotal =
    softener*5;

    const foldTotal =
    fold*20;

    total =

        washPrice

        +

        dryerPrice

        +

        detergentTotal

        +

        softenerTotal

        +

        foldTotal;

    /* ==========================
       LIVE TOTAL
    ========================== */

    $("washTotalDisplay").innerText =
    `${washPrice} บาท`;

    $("totalPrice").innerText =
    `${total} บาท`;

    /* ==========================
       SUMMARY
    ========================== */

    $("summaryList").innerHTML = `

<div class="summary-item">

<span>

🧺 ซัก ${washSize} kg (${waterDisplay})

</span>

<strong>

${washPrice} บาท

</strong>

</div>

<div class="summary-item">

<span>

${
dryer==="0"

?

"❌ ไม่อบ"

:

`🔥 อบ ${dryer} kg + ${extra} นาที`

}

</span>

<strong>

${dryerPrice} บาท

</strong>

</div>

<div class="summary-item">

<span>

🧴 น้ำยาซัก x${detergent}

</span>

<strong>

${detergentTotal} บาท

</strong>

</div>

<div class="summary-item">

<span>

🧴 ปรับผ้านุ่ม x${softener}

</span>

<strong>

${softenerTotal} บาท

</strong>

</div>

<div class="summary-item">

<span>

🧺 พับผ้า x${fold}

</span>

<strong>

${foldTotal} บาท

</strong>

</div>

`;

}

/* ==========================================================
INPUT EVENT
========================================================== */

[
    "detergentQty",
    "softenerQty",
    "foldQty"
].forEach(id=>{

    $(id).addEventListener(

        "input",

        calculateTotal

    );

});

/* ==========================================================
DEFAULT
========================================================== */

calculateTotal();

/* ==========================================================
SHOW PAYMENT
========================================================== */

function validateOrder(){

    const wash = getActiveValue("washGroup");
    const water = getActiveValue("waterGroup");

    const pickupDate = $("pickupDate").value;
    const pickupTime = $("pickupTime").value;

    const phone = $("phone").value.trim();

    if(!wash){

        alert("กรุณาเลือกถังซัก");

        return false;

    }

    if(!water){

        alert("กรุณาเลือกอุณหภูมิน้ำ");

        return false;

    }

    if(!pickupDate){

        alert("กรุณาเลือกวันที่รับผ้า");

        return false;

    }

    if(!pickupTime){

        alert("กรุณาเลือกเวลารับผ้า");

        return false;

    }

    if(!/^0\d{9}$/.test(phone)){

        alert("กรุณากรอกเบอร์โทรให้ถูกต้อง");

        return false;

    }

    return true;

}

/* ==========================================================
SAVE ORDER
========================================================== */

function saveOrderData(){

    const orderData = {

        total,

        pickupDate:$("pickupDate").value,

        pickupTime:$("pickupTime").value,

        phone:$("phone").value.trim(),

        note:$("note").value.trim(),

        wash:getActiveValue("washGroup"),

        water:getActiveValue("waterGroup"),

        dryer:getActiveValue("dryerGroup"),

        extra:getActiveValue("extraGroup"),

        detergent:Number($("detergentQty").value),

        softener:Number($("softenerQty").value),

        fold:Number($("foldQty").value)

    };

    localStorage.setItem(

        "orderData",

        JSON.stringify(orderData)

    );

}

/* ==========================================================
SHOW QR PAYMENT
========================================================== */

function showPayment(){

    if(!validateOrder()){
        return;
    }

    createPaymentSession();

    saveOrderData();

    $("orderSection").style.display = "none";

    $("paymentSection").style.display = "block";

    $("orderIdText").innerText = orderId;

    // ===== สร้าง QR =====
 const qrBox = $("qrContainer");

qrBox.innerHTML = "";

const img = document.createElement("img");

img.className = "qr-image";
img.width = 260;
img.height = 260;
img.alt = "PromptPay QR";
img.src = `https://promptpay.io/0816202466/${paymentAmount}.png`;

$("paymentAmountText").innerText =
    Number(paymentAmount).toFixed(2);

qrBox.appendChild(img);

img.onload = function () {

    $("qrStatus").innerText =
        "✅ QR พร้อมสำหรับชำระเงิน";

};

img.onerror = () => {
    $("qrStatus").innerText = "❌ ไม่สามารถสร้าง QR ได้";
};

// ===== ดาวน์โหลด QR =====
$("downloadQR").onclick = () => {

    window.open(img.src, "_blank");

};

$("qrStatus").innerText =
    "✅ QR พร้อมสำหรับชำระเงิน";

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

    console.log({

        orderId,

        paymentId,

        sessionId,

        paymentAmount

    });

}

/* ==========================================================
CONFIRM BUTTON
========================================================== */

$("confirmBtn").addEventListener(

    "click",

    showPayment

);

/* ==========================================================
LOADING
========================================================== */

function showLoading(){

    $("loadingOverlay").classList.add(

        "show"

    );

}

function hideLoading(){

    $("loadingOverlay").classList.remove(

        "show"

    );

}

/* ==========================================================
SAVE RECEIPT IMAGE
========================================================== */

async function saveReceiptImage(data){

    if(/Line/i.test(navigator.userAgent)){
        return;
    }

    const receipt = $("receiptContent");

    receipt.innerHTML = `

<h3>24WASH ROJANA</h3>

<p><strong>Order ID :</strong> ${data.orderId}</p>

<hr>

<div class="receipt-row">
    <span>🧺 ซัก ${data.washSize} kg (${data.waterDisplay})</span>
    <strong>${data.washPrice} บาท</strong>
</div>

<div class="receipt-row">
    <span>${
        data.dryer === "0"
        ? "❌ ไม่อบ"
        : `🔥 อบ ${data.dryer} kg`
    }</span>
    <strong>${data.dryerPrice} บาท</strong>
</div>

<div class="receipt-row">
    <span>🧴 น้ำยาซัก x${data.detergent}</span>
    <strong>${data.detergent * 5} บาท</strong>
</div>

<div class="receipt-row">
    <span>🧴 ปรับผ้านุ่ม x${data.softener}</span>
    <strong>${data.softener * 5} บาท</strong>
</div>

<div class="receipt-row">
    <span>🧺 พับผ้า x${data.fold}</span>
    <strong>${data.fold * 20} บาท</strong>
</div>

<hr>

<div class="receipt-row">
    <strong>รวมทั้งหมด</strong>
    <strong>${data.total} บาท</strong>
</div>

<hr>

<p><strong>วันที่รับ :</strong> ${data.pickupDate}</p>

<p><strong>เวลา :</strong> ${data.pickupTime}</p>

`;

 const canvas = await html2canvas(
        $("receiptImage"),
        {
            scale:2,
            backgroundColor:"#ffffff"
        }
    );

    const image = canvas.toDataURL("image/png");

    const isLine = /Line/i.test(navigator.userAgent);

    if(!isLine){

        const link = document.createElement("a");

        link.href = image;

        link.download = `${data.orderId}.png`;

        link.click();

    }

}

/* ==========================================================
SUBMIT ORDER
========================================================== */

async function submitOrder(){

    const submitBtn = $("submitBtn");

    if(submitBtn.disabled){

        return;

    }

    const paymentSlip = $("paymentSlip").files[0];

    const basketImage = $("basketImage").files[0];

    if(!paymentSlip){

        alert("กรุณาอัปโหลดสลิปการโอน");

        return;

    }

    const washSize = getActiveValue("washGroup");

    const water = getActiveValue("waterGroup");

    const dryer = getActiveValue("dryerGroup");

    const extra = getActiveValue("extraGroup");

    const detergent =
    Number($("detergentQty").value)||0;

    const softener =
    Number($("softenerQty").value)||0;

    const fold =
    Number($("foldQty").value)||0;

    const pickupDate =
    $("pickupDate").value;

    const pickupTime =
    $("pickupTime").value;

    const phone =
    $("phone").value.trim();

    const note =
    $("note").value.trim();

    const waterDisplay =
    WATER_NAME[water];

    const formData =
    new FormData();

    formData.append("orderId",orderId);
    formData.append("paymentId",paymentId);
    formData.append("sessionId",sessionId);

    formData.append(
        "paymentAmount",
         String(paymentAmount)
    );

    formData.append(
        "createdAt",
        createdAt.toISOString()
    );

    formData.append(
        "expireAt",
        expireAt.toISOString()
    );

    formData.append(
        "qrFingerprint",
        localStorage.getItem("qrFingerprint")
    );

    formData.append(
        "receiverAccount",
        "0816202466"
    );

    formData.append(
        "clientTime",
        new Date().toISOString()
    );

    formData.append("washSize",washSize);
    formData.append("water",water);
    formData.append("waterDisplay",waterDisplay);

    formData.append("dryer",dryer);
    formData.append("extra",extra);

    formData.append("detergent",detergent);
    formData.append("softener",softener);
    formData.append("fold",fold);

    formData.append("pickupDate",pickupDate);
    formData.append("pickupTime",pickupTime);

    formData.append("phone",phone);
    formData.append("note",note);

    formData.append("total",total);

    formData.append(
        "paymentSlip",
        paymentSlip
    );

    if(basketImage){

        formData.append(

            "basketImage",

            basketImage

        );

    }

    submitBtn.disabled = true;

    submitBtn.innerText = "กำลังส่ง...";

    showLoading();

    const controller = new AbortController();

    const timeout = setTimeout(()=>{

        controller.abort();

    },30000);

    try{

        const response = await fetch(

            WEBHOOK_URL,

            {

                method:"POST",

                body:formData,

                signal:controller.signal

            }

        );

        clearTimeout(timeout);

        if(!response.ok){

            throw new Error(

                "Webhook Error"

            );

        }

        await saveReceiptImage({

    orderId,

    paymentId,

    sessionId,

    paymentAmount,

    washSize,

    waterDisplay,

    dryer,

    total,

    pickupDate,

    pickupTime,

    washPrice,

    dryerPrice,

    detergent,

    softener,

    fold

});

        alert("ส่งรายการสำเร็จ");

        localStorage.removeItem("orderData");

        localStorage.removeItem("paymentSession");

        localStorage.removeItem("qrFingerprint");

        window.location.href =
        window.location.pathname;

    }

    catch(error){

        console.error(error);

        if(error.name==="AbortError"){

            alert(

                "การเชื่อมต่อหมดเวลา"

            );

        }

        else{

            alert(

                "ไม่สามารถส่งข้อมูลได้"

            );

        }

    }

    finally{

        hideLoading();

        submitBtn.disabled = false;

        submitBtn.innerText = "ส่งรายการ";

    }

}

/* ==========================================================
FILE NAME
========================================================== */

$("paymentSlip").addEventListener("change",function(){

    $("slipName").innerText =
        this.files.length
        ? this.files[0].name
        : "ยังไม่ได้เลือกไฟล์";

});

$("basketImage").addEventListener("change",function(){

    $("basketName").innerText =
        this.files.length
        ? this.files[0].name
        : "ยังไม่ได้เลือกไฟล์";

});

/* ==========================================================
SUBMIT BUTTON
========================================================== */

$("submitBtn").addEventListener(

    "click",

    submitOrder

);

/* ==========================================================
RESTORE ORDER
========================================================== */

window.addEventListener("load",()=>{

    const savedOrder =
    localStorage.getItem("orderData");

    const savedSession =
    localStorage.getItem("paymentSession");

    /* ==========================
       RESTORE ORDER DATA
    ========================== */

    if(savedOrder){

        const data =
        JSON.parse(savedOrder);

        $("pickupDate").value =
        data.pickupDate || "";

        $("pickupTime").value =
        data.pickupTime || "";

        $("phone").value =
        data.phone || "";

        $("note").value =
        data.note || "";

        $("detergentQty").value =
        data.detergent || 0;

        $("softenerQty").value =
        data.softener || 0;

        $("foldQty").value =
        data.fold || 0;

        restoreTouchButton(
            "washGroup",
            data.wash
        );

        restoreTouchButton(
            "waterGroup",
            data.water
        );

        restoreTouchButton(
            "dryerGroup",
            data.dryer
        );

        restoreTouchButton(
            "extraGroup",
            data.extra
        );

    }

    /* ==========================
       RESTORE PAYMENT SESSION
    ========================== */

    if(savedSession){

        const session =
        JSON.parse(savedSession);

        const now =
        new Date();

        const expire =
        new Date(session.expireAt);

        if(now < expire){

            orderId =
            session.orderId;

            paymentId =
            session.paymentId;

            sessionId =
            session.sessionId;

            paymentAmount =
            Number(session.paymentAmount);

            createdAt =
            new Date(session.createdAt);

            expireAt =
            expire;

            $("orderSection").style.display =
            "none";

            $("paymentSection").style.display =
            "block";

            $("orderIdText").innerText =
            orderId;

            $("qrImage").src =
    "https://promptpay.io/0816202466/"
    +
    paymentAmount
    +
    ".png";

            $("qrStatus").innerText =
"📌 กู้คืน QR Payment";

        }

        else{

            localStorage.removeItem(
                "paymentSession"
            );

            localStorage.removeItem(
                "qrFingerprint"
            );

        }

    }

    calculateTotal();

});

/* ==========================================================
RESTORE ACTIVE BUTTON
========================================================== */

function restoreTouchButton(

    groupId,

    value

){

    if(!value) return;

    const group =
    $(groupId);

    if(!group) return;

    group
    .querySelectorAll(".touch-btn")
    .forEach(btn=>{

        btn.classList.remove("active");

    });

    const button =
    group.querySelector(

        `.touch-btn[data-value="${value}"]`

    );

    if(button){

        button.classList.add("active");

    }

}

/* ==========================================================
CHECK QR EXPIRE
========================================================== */

setInterval(()=>{

    if(!expireAt) return;

    if(new Date()>expireAt){

        alert(

            "QR Payment หมดอายุ กรุณาสร้างรายการใหม่"

        );

        localStorage.removeItem("paymentSession");

        localStorage.removeItem("qrFingerprint");

        window.location.reload();

    }

},60000);

/* ==========================================================
CLICK QR IMAGE
========================================================== */

const qrImage = $("qrImage");

if(qrImage){

    qrImage.addEventListener("click", ()=>{

        if(qrImage.src){

            window.open(qrImage.src, "_blank");

        }

    });

}
/* ==========================================================
END
========================================================== */

console.log(

"24WASH ROJANA v2.0 Loaded"

);
