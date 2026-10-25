// =====================================================
// عناصر الصفحة (بنجيبها مرة واحدة)
// =====================================================
const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");
const invoiceList = document.getElementById("invoiceList");
const emptyState = document.getElementById("emptyState");
const invoiceCount = document.getElementById("invoiceCount");

const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");
const backBtn = document.getElementById("backBtn");

const dId = document.getElementById("dId");
const dDescription = document.getElementById("dDescription");
const dFromStreet = document.getElementById("dFromStreet");
const dFromCity = document.getElementById("dFromCity");
const dFromPost = document.getElementById("dFromPost");
const dFromCountry = document.getElementById("dFromCountry");
const dDate = document.getElementById("dDate");
const dDue = document.getElementById("dDue");
const dToName = document.getElementById("dToName");
const dToEmail = document.getElementById("dToEmail");
const dToStreet = document.getElementById("dToStreet");
const dToCity = document.getElementById("dToCity");
const dToPost = document.getElementById("dToPost");
const dToCountry = document.getElementById("dToCountry");
const detailStatus = document.getElementById("detailStatus");
const detailStatusText = document.getElementById("detailStatusText");
const dItemsBody = document.getElementById("dItemsBody");
const dTotal = document.getElementById("dTotal");

const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const markPaidBtn = document.getElementById("markPaidBtn");

const deleteModal = document.getElementById("deleteModal");
const delId = document.getElementById("delId");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const themeToggle = document.getElementById("themeToggle");
const iconSun = document.querySelector(".icon-sun");
const iconMoon = document.querySelector(".icon-moon");

const newInvoiceBtn = document.getElementById("newInvoiceBtn");
const overlay = document.getElementById("overlay");
const formPanel = document.getElementById("formPanel");
const formTitle = document.getElementById("formTitle");
const invoiceForm = document.getElementById("invoiceForm");
const itemRows = document.getElementById("itemRows");
const addItemBtn = document.getElementById("addItemBtn");
const formActions = document.getElementById("formActions");

// =====================================================
// الحالة (state)
// =====================================================
let allInvoices = [];
let activeFilters = ["draft", "pending", "paid"];
let currentInvoice = null;

// =====================================================
// دوال مساعدة
// =====================================================
const STORAGE_KEY = "invoices";

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allInvoices));
}
// "2021-08-19" ← "19 Aug 2021"
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// 1800.9 ← "£ 1,800.90"
function formatMoney(n) {
  const number = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return "£ " + number;
}

// يحوّل رموز HTML الخاصة لنص عادي (حماية من XSS)
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// حرفين كبيرين + 4 أرقام، مثل AB1234
function createId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 2; i++) id += letters[Math.floor(Math.random() * 26)];
  for (let i = 0; i < 4; i++) id += Math.floor(Math.random() * 10);
  return id;
}

// "2021-08-21" + 30 ← "2021-09-20"
function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

// =====================================================
// بناء HTML
// =====================================================

// بطاقة فاتورة في القائمة
function cardHTML(inv) {
  return `
    <li class="invoice-card" data-id="${escapeHTML(inv.id)}">
      <span class="invoice-card__id"><span>#</span>${escapeHTML(inv.id)}</span>
      <span class="invoice-card__due">Due ${formatDate(inv.paymentDue)}</span>
      <span class="invoice-card__name">${escapeHTML(inv.clientName)}</span>
      <span class="invoice-card__amount">${formatMoney(inv.total)}</span>
      <div class="status status--${inv.status}">
        <span class="status__dot"></span>${capitalize(inv.status)}
      </div>
    </li>`;
}

// صف بند في جدول التفاصيل
function itemRowHTML(item) {
  return `
    <tr>
      <td>${escapeHTML(item.name)}</td>
      <td>${item.quantity}</td>
      <td>${formatMoney(item.price)}</td>
      <td>${formatMoney(item.total)}</td>
    </tr>`;
}

// صف بند داخل النموذج
function formRowHTML(item) {
  return `
    <div class="item-row">
      <input class="i-name" type="text" value="${escapeHTML(item.name)}" />
      <input class="i-qty" type="number" min="1" value="${item.quantity}" />
      <input class="i-price" type="number" min="0" step="0.01" value="${item.price}" />
      <span class="i-total">${Number(item.total).toFixed(2)}</span>
      <button type="button" class="i-delete" aria-label="Delete item">
        <svg width="13" height="16" viewBox="0 0 13 16">
          <path d="M11.583 3.556v10.666c0 .982-.795 1.778-1.777 1.778H2.694a1.777 1.777 0 01-1.777-1.778V3.556h10.666zM8.473 0l.888.889h3.111v1.778H.028V.889h3.11L4.029 0h4.444z" fill="#888EB0" fill-rule="nonzero"/>
        </svg>
      </button>
    </div>`;
}

// =====================================================
// الرسم
// =====================================================
function renderList() {
  const visible = allInvoices.filter((inv) =>
    activeFilters.includes(inv.status),
  );

  invoiceList.innerHTML = visible.map(cardHTML).join("");
  emptyState.hidden = visible.length > 0;
  invoiceCount.textContent =
    visible.length === 0
      ? "No invoices"
      : "There are " + visible.length + " total invoices";
}

// يملا صفحة التفاصيل ببيانات فاتورة
function showDetail(invoice) {
  currentInvoice = invoice;

  dId.textContent = invoice.id;
  dDescription.textContent = invoice.description;

  dFromStreet.textContent = invoice.senderAddress.street;
  dFromCity.textContent = invoice.senderAddress.city;
  dFromPost.textContent = invoice.senderAddress.postCode;
  dFromCountry.textContent = invoice.senderAddress.country;

  dDate.textContent = formatDate(invoice.createdAt);
  dDue.textContent = formatDate(invoice.paymentDue);

  dToName.textContent = invoice.clientName;
  dToEmail.textContent = invoice.clientEmail;
  dToStreet.textContent = invoice.clientAddress.street;
  dToCity.textContent = invoice.clientAddress.city;
  dToPost.textContent = invoice.clientAddress.postCode;
  dToCountry.textContent = invoice.clientAddress.country;

  detailStatus.className = "status status--" + invoice.status;
  detailStatusText.textContent = capitalize(invoice.status);

  dItemsBody.innerHTML = invoice.items.map(itemRowHTML).join("");
  dTotal.textContent = formatMoney(invoice.total);

  markPaidBtn.hidden = invoice.status !== "pending";

  listView.hidden = true;
  detailView.hidden = false;
}

// =====================================================
// الوضع الداكن
// =====================================================
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  iconSun.hidden = !isDark;
  iconMoon.hidden = isDark;
}

// =====================================================
// النموذج: فتح وإغلاق
// =====================================================
function showNewInvoiceButtons() {
  formActions.innerHTML = `
    <button type="button" class="btn-ghost btn-discard" data-action="discard">Discard</button>
    <button type="button" class="btn-dark" data-action="draft">Save as Draft</button>
    <button type="button" class="btn-new" data-action="send">Save &amp; Send</button>`;
}

function showEditButtons() {
  formActions.innerHTML = `
    <button type="button" class="btn-ghost" data-action="cancel">Cancel</button>
    <button type="button" class="btn-new" data-action="save">Save Changes</button>`;
}

function clearErrors() {
  invoiceForm
    .querySelectorAll(".has-error")
    .forEach((el) => el.classList.remove("has-error"));
}

function showPanel() {
  overlay.hidden = false;
  formPanel.hidden = false;
  formPanel.classList.add("open");
}

function openForm() {
  formTitle.textContent = "New Invoice";
  invoiceForm.elements.invoiceDate.disabled = false;

  invoiceForm.reset();
  itemRows.innerHTML = "";
  clearErrors();
  invoiceForm.elements.invoiceDate.value = new Date()
    .toISOString()
    .slice(0, 10);

  showNewInvoiceButtons();
  showPanel();
}

function closeForm() {
  formPanel.classList.remove("open");
  formPanel.hidden = true;
  overlay.hidden = true;
}

// يكتب قيم فاتورة في حقول النموذج
function fillForm(inv) {
  const f = invoiceForm.elements;
  f.fromStreet.value = inv.senderAddress.street;
  f.fromCity.value = inv.senderAddress.city;
  f.fromPost.value = inv.senderAddress.postCode;
  f.fromCountry.value = inv.senderAddress.country;
  f.toName.value = inv.clientName;
  f.toEmail.value = inv.clientEmail;
  f.toStreet.value = inv.clientAddress.street;
  f.toCity.value = inv.clientAddress.city;
  f.toPost.value = inv.clientAddress.postCode;
  f.toCountry.value = inv.clientAddress.country;
  f.invoiceDate.value = inv.createdAt;
  f.paymentTerms.value = inv.paymentTerms;
  f.description.value = inv.description;
  itemRows.innerHTML = inv.items.map(formRowHTML).join("");
}

function openEditForm(inv) {
  invoiceForm.reset();
  clearErrors();
  fillForm(inv);

  formTitle.textContent = "Edit #" + inv.id;
  invoiceForm.elements.invoiceDate.disabled = true;

  showEditButtons();
  showPanel();
}

// =====================================================
// النموذج: التحقق والحفظ
// =====================================================
function validateForm() {
  let isValid = true;

  invoiceForm
    .querySelectorAll(".form-field input[required]")
    .forEach(function (input) {
      const isEmpty = input.value.trim() === "";
      input.closest(".form-field").classList.toggle("has-error", isEmpty);
      if (isEmpty) isValid = false;
    });

  itemRows.querySelectorAll(".i-name").forEach(function (input) {
    const isEmpty = input.value.trim() === "";
    input.classList.toggle("has-error", isEmpty);
    if (isEmpty) isValid = false;
  });
  const noItems = itemRows.querySelectorAll(".item-row").length === 0;
  addItemBtn.classList.toggle("has-error", noItems);
  if (noItems) isValid = false;
  return isValid;
}

function buildInvoice(status) {
  const f = invoiceForm.elements;
  const createdAt =
    f.invoiceDate.value || new Date().toISOString().slice(0, 10);
  const terms = Number(f.paymentTerms.value);

  const items = Array.from(itemRows.querySelectorAll(".item-row")).map(
    function (row) {
      const quantity = Number(row.querySelector(".i-qty").value);
      const price = Number(row.querySelector(".i-price").value);
      return {
        name: row.querySelector(".i-name").value,
        quantity: quantity,
        price: price,
        total: quantity * price,
      };
    },
  );

  return {
    id: createId(),
    createdAt: createdAt,
    paymentDue: addDays(createdAt, terms),
    description: f.description.value,
    paymentTerms: terms,
    clientName: f.toName.value,
    clientEmail: f.toEmail.value,
    status: status,
    senderAddress: {
      street: f.fromStreet.value,
      city: f.fromCity.value,
      postCode: f.fromPost.value,
      country: f.fromCountry.value,
    },
    clientAddress: {
      street: f.toStreet.value,
      city: f.toCity.value,
      postCode: f.toPost.value,
      country: f.toCountry.value,
    },
    items: items,
    total: items.reduce((sum, item) => sum + item.total, 0),
  };
}

function saveInvoice(status) {
  allInvoices.push(buildInvoice(status));
  persist();
  closeForm();
  renderList();
}

// Save Changes: يحدّث الفاتورة المفتوحة (المسودة تتحول Pending)
function saveChanges() {
  if (!validateForm()) return;

  const newStatus =
    currentInvoice.status === "draft" ? "pending" : currentInvoice.status;
  const updated = buildInvoice(newStatus);
  updated.id = currentInvoice.id;

  Object.assign(currentInvoice, updated);
  persist();
  closeForm();
  renderList();
  showDetail(currentInvoice);
}

// =====================================================
// الأحداث
// =====================================================

// --- الفلتر ---
filterBtn.addEventListener("click", function () {
  filterMenu.hidden = !filterMenu.hidden;
});

filterMenu.addEventListener("change", function () {
  const checked = document.querySelectorAll("#filterMenu input:checked");
  activeFilters = Array.from(checked).map((box) => box.value);
  renderList();
});

// --- فتح فاتورة / الرجوع ---
invoiceList.addEventListener("click", function (event) {
  const card = event.target.closest(".invoice-card");
  if (!card) return;

  const invoice = allInvoices.find((inv) => inv.id === card.dataset.id);
  showDetail(invoice);
});

backBtn.addEventListener("click", function () {
  listView.hidden = false;
  detailView.hidden = true;
});

// --- الوضع الداكن ---
themeToggle.addEventListener("click", function () {
  applyTheme(!document.body.classList.contains("dark"));
});

// --- Mark as Paid ---
markPaidBtn.addEventListener("click", function () {
  currentInvoice.status = "paid";
  detailStatus.className = "status status--paid";
  detailStatusText.textContent = "Paid";
  markPaidBtn.hidden = true;
  persist();
  renderList();
});

// --- الحذف ---
deleteBtn.addEventListener("click", function () {
  delId.textContent = currentInvoice.id;
  deleteModal.hidden = false;
});

cancelDeleteBtn.addEventListener("click", function () {
  deleteModal.hidden = true;
});

confirmDeleteBtn.addEventListener("click", function () {
  allInvoices = allInvoices.filter((inv) => inv.id !== currentInvoice.id);
  deleteModal.hidden = true;
  detailView.hidden = true;
  listView.hidden = false;
  persist();
  renderList();
});

// --- النموذج ---
newInvoiceBtn.addEventListener("click", openForm);
overlay.addEventListener("click", closeForm);

editBtn.addEventListener("click", function () {
  openEditForm(currentInvoice);
});

addItemBtn.addEventListener("click", function () {
  addItemBtn.classList.remove("has-error");
  const emptyItem = { name: "", quantity: 1, price: 0, total: 0 };
  itemRows.insertAdjacentHTML("beforeend", formRowHTML(emptyItem));
});

itemRows.addEventListener("click", function (event) {
  const deleteButton = event.target.closest(".i-delete");
  if (!deleteButton) return;
  deleteButton.closest(".item-row").remove();
});

// المجموع يتحسب لحظياً
itemRows.addEventListener("input", function (event) {
  const row = event.target.closest(".item-row");
  if (!row) return;

  const qty = Number(row.querySelector(".i-qty").value);
  const price = Number(row.querySelector(".i-price").value);
  row.querySelector(".i-total").textContent = (qty * price).toFixed(2);
});

// يشيل علامة الخطأ أول ما المستخدم يكتب
invoiceForm.addEventListener("input", function (event) {
  event.target.classList.remove("has-error");
  const field = event.target.closest(".form-field");
  if (field) field.classList.remove("has-error");
});

// أزرار أسفل النموذج
formActions.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;

  if (action === "discard" || action === "cancel") {
    closeForm();
  }

  if (action === "draft") {
    saveInvoice("draft");
  }

  if (action === "send") {
    if (!validateForm()) return;
    saveInvoice("pending");
  }

  if (action === "save") {
    saveChanges();
  }
});

// =====================================================
// البداية
// =====================================================
async function start() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved !== null) {
    allInvoices = JSON.parse(saved);
  } else {
    const response = await fetch("data.json");
    allInvoices = await response.json();
  }

  renderList();
}
applyTheme(false);
start();
