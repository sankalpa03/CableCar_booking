// ================= SWIPER =================
var swiper = new Swiper('.swiper-container', {
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    autoplay: { delay: 4000, disableOnInteraction: false }
});

// ================= NUMBER INPUT VALIDATION =================
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
        input.value = Math.max(0, parseInt(input.value) || 0);
    });
});

// ================= DOM ELEMENTS =================
const numAdultsInput = document.getElementById("numPeople");
const numChildrenInput = document.getElementById("numChildren");
const numStudentsInput = document.getElementById("numStudents");
const numSeniorsInput = document.getElementById("numSeniors");
const numAbledInput = document.getElementById("numAbled");
const phoneInput = document.getElementById("phone");
const bookDateInput = document.getElementById("BookDate");

// ================= CHILDREN VALIDATION =================
numChildrenInput.addEventListener("input", function () {
    const numAdults = parseInt(numAdultsInput.value) || 0;
    let numChildren = parseInt(this.value) || 0;
    if (numChildren > numAdults) {
        this.value = numAdults;
        alert("Children must be accompanied by at least one adult!");
    }
});

// ================= PHONE VALIDATION =================
phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, '');
});

// ================= BOOKING DATE LIMITS =================
function setBookingDateLimits() {
    const today = new Date();
    bookDateInput.setAttribute("min", today.toISOString().split("T")[0]);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 10);
    bookDateInput.setAttribute("max", maxDate.toISOString().split("T")[0]);
}

// ================= TOTAL SEATS VALIDATION =================
function validateTotalSeats() {
    const numAdults = parseInt(numAdultsInput.value) || 0;
    const numChildren = parseInt(numChildrenInput.value) || 0;
    const numStudents = parseInt(numStudentsInput.value) || 0;
    const numSeniors = parseInt(numSeniorsInput.value) || 0;
    const numAbled = parseInt(numAbledInput.value) || 0;

    const totalSeats = numAdults + numChildren + numStudents + numSeniors + numAbled;

    if (totalSeats <= 0) {
        alert("At least one seat must be booked!");
        return false;
    }

    if (totalSeats > 20) {
        alert("Cannot book more than 20 seats at a time!");
        return false;
    }

    return true;
}

// ================= EMAIL VALIDATION =================
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

// ================= PDF GENERATION =================
function downloadPDF() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const country = document.getElementById("country").value;
    const tripType = document.getElementById("tripType").value;
    const bookingDate = bookDateInput.value;
    const numAdults = parseInt(numAdultsInput.value) || 0;
    const numChildren = parseInt(numChildrenInput.value) || 0;
    const numStudents = parseInt(numStudentsInput.value) || 0;
    const numSeniors = parseInt(numSeniorsInput.value) || 0;
    const numAbled = parseInt(numAbledInput.value) || 0;
    const goodsWeight = parseInt(document.getElementById("goodsWeight").value) || 0;

    if (!name || !email || !phone || !bookingDate) { alert("Please fill all required fields!"); return; }
    if (!isValidEmail(email)) { alert("Invalid Email!"); return; }
    if (phone.length < 10 || phone.length > 15) { alert("Phone must be 10-15 digits!"); return; }
    if (!validateTotalSeats()) return;

    const rates = {
        Nepali: {
            Adult: { "One Way": 410, "Two Way": 700 },
            Child: { "One Way": 245, "Two Way": 420 },
            Student: { "One Way": 305, "Two Way": 525 },
            Senior: { "One Way": 285, "Two Way": 490 },
            Abled: { "One Way": 205, "Two Way": 350 }
        },
        Foreigner: {
            Adult: { "One Way": 600, "Two Way": 1000 },
            Child: { "One Way": 400, "Two Way": 750 }
        },
        GoodsPerKg: { "One Way": 17, "Two Way": 35 }
    };

    const userType = country === "Nepal" ? "Nepali" : "Foreigner";
    let total = 0;
    total += (rates[userType].Adult[tripType] || 0) * numAdults;
    total += (rates[userType].Child[tripType] || 0) * numChildren;

    if (userType === "Nepali") {
        total += rates.Nepali.Student[tripType] * numStudents;
        total += rates.Nepali.Senior[tripType] * numSeniors;
        total += rates.Nepali.Abled[tripType] * numAbled;
    }

    total += rates.GoodsPerKg[tripType] * goodsWeight;
    
    const jsPDF = window.jspdf.jsPDF;

    const doc = new jsPDF();

    // HEADER
    doc.setFillColor(30, 61, 89); 
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Cable Car Ticket", 105, 17, null, null, "center");

    // USER INFO
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Name: ${name}`, 15, 40);
    doc.text(`Email: ${email}`, 15, 50);
    doc.text(`Phone: ${phone}`, 15, 60);
    doc.text(`Country: ${country}`, 120, 40);
    doc.text(`Trip Type: ${tripType}`, 120, 50);
    doc.text(`Booking Date: ${bookingDate}`, 120, 60);

    // TABLE HEADER
    let y = 80;
    doc.setFontSize(13);
    doc.setFillColor(30, 61, 89);
    doc.setTextColor(255, 255, 255);
    doc.rect(10, y, 190, 10, "F");
    doc.text("Item", 15, y + 7);
    doc.text("Qty", 105, y + 7);
    doc.text("Price", 150, y + 7);

    // TABLE ITEMS
    y += 15;
    doc.setTextColor(0, 0, 0);

    function addItem(label, qty, price) {
        if (qty > 0) {
            doc.text(label, 15, y);
            doc.text(String(qty), 105, y);
            doc.text(String(price), 150, y);
            y += 10;
        }
    }

    addItem("Adult", numAdults, rates[userType].Adult[tripType] * numAdults);
    addItem("Child", numChildren, rates[userType].Child[tripType] * numChildren);

    if (userType === "Nepali") {
        addItem("Student", numStudents, rates.Nepali.Student[tripType] * numStudents);
        addItem("Senior Citizen", numSeniors, rates.Nepali.Senior[tripType] * numSeniors);
        addItem("Differently Abled", numAbled, rates.Nepali.Abled[tripType] * numAbled);
    }

    addItem("Goods (kg)", goodsWeight, rates.GoodsPerKg[tripType] * goodsWeight);

    // TOTAL
    doc.setFontSize(14);
    doc.setTextColor(243, 156, 18);
    doc.text(`TOTAL: Rs. ${total}`, 105, y + 10, null, null, "center");

    // SAVE
    doc.save("CableCarTicket.pdf");

    alert("Ticket generated successfully!");
}

// ================= CONTACT FORM =================
function initContactFormValidation() {
    const contactForm = document.querySelector(".contact-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageInput = contactForm.querySelector('textarea');

        let valid = true;

        contactForm.querySelectorAll(".error").forEach(el => el.textContent = "");

        if (!nameInput.value.trim()) {
            contactForm.querySelector('input[type="text"] + .error').textContent = "Please enter your name";
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
            contactForm.querySelector('input[type="email"] + .error').textContent = "Please enter a valid email";
            valid = false;
        }

        if (!messageInput.value.trim()) {
            contactForm.querySelector('textarea + .error').textContent = "Please type your message";
            valid = false;
        }

        if (valid) {
            showToast(`Thank you, ${nameInput.value.trim()}! We will get back to you soon.`, "green");
            contactForm.reset();
        }
    });
}

// ================= TOAST =================
function showToast(message, color = "#1e3d59") {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.padding = "15px 25px";
        toast.style.borderRadius = "8px";
        toast.style.color = "#fff";
        toast.style.fontSize = "14px";
        toast.style.zIndex = "9999";
        toast.style.transition = "0.3s ease";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.style.opacity = "1";

    setTimeout(() => { toast.style.opacity = "0"; }, 3000);
}

// ================= INITIALIZE =================
window.addEventListener("DOMContentLoaded", () => {
    setBookingDateLimits();
    initContactFormValidation();
});
