const students = [
    "MUHAMMAD FARHAN BIN IBRAHIM",
  "MUHAMMAD HAMZAH BIN FAIRULZAMLY",
  "MUHAMMAD IDHAM BIN MAD SHATAL",
  "MUHAMMAD IQBAL BIN SABRI",
  "MUHAMMAD NADIR BIN KHAIRULDEEN",
  "MUHAMMAD SYAFIQ HASIF BIN NORASHID",
  "MUHAMMAD ZULHILMI BIN ARRAZIB",
  "NABIHAH NATASHAH BIN MOHD SHAH",
  "NOR ALYA NABILA BINTI MOHD AZHAR",
  "NUR EMYLIA SYUHAILA BINTI M. NORZIT",
  "NUR LIYANA BINTI MOHD HAFIDZ",
  "NUR NIDA NATASYA BINTI RIZUAN",
  "NUR SUHAIDA BINTI AHMAD HISHAM",
  "NUR ZULIATI BINTI ZAINUDDIN",
  "NURFATIHA BINTI NOORAZMAN",
  "NURQURSYIA FAKHIRAH BINTI MOHD AFFENDY",
  "NURUL HADHIRAH BNITI MOHD SUZAIMI",
  "NURUL SAIF SYAZWEENA BINTI MUHAMMAD FAAIZ",
  "PUTRA ARIFQI HAKIMI BIN ABDUL RAHMAN",
  "RYANFEDRICK BERON YESKEL JUNIOR",
  "SITI NUR ZULAIQAH BINTI RUZAINOL HILMI",
  "SYAZRIN BIN SUAIDI",
  "TOHIR ARIFIN BIN MOHD KHARIS",
  "VANASRI A/P MUNISAMY",
  "WAN AZRIQ IRFAN BIN WAN AZLI"
];

const studentListDiv = document.getElementById("student-list");
const absentReasons = {};

students.forEach(name => {
  const div = document.createElement("div");
  div.className = "student present";

  div.innerHTML = `
    <span>${name}</span>
    <label class="switch">
      <input type="checkbox" checked>
      <span class="slider"></span>
    </label>
  `;

  const checkbox = div.querySelector("input");

  checkbox.addEventListener("change", async () => {
  if (!checkbox.checked) {
    const { value: reason } = await Swal.fire({
      title: `Kenapa ${name} tidak hadir?`,
      input: 'text',
      inputLabel: 'Sila tulis sebab',
      inputPlaceholder: 'Masukkan sebab ketidakhadiran',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonText: 'Simpan',
      inputValidator: (value) => {
        if (!value) {
          return 'Sebab tidak boleh kosong!'
        }
      }
    });

    if (!reason) {
      checkbox.checked = true;  // kalau batal atau kosong, tak jadi tukar
      return;
    }

    div.classList.remove("present");
    div.classList.add("absent");
    absentReasons[name] = reason;
  } else {
    div.classList.remove("absent");
    div.classList.add("present");
    delete absentReasons[name];
  }
});


  studentListDiv.appendChild(div);
});

document.getElementById("submit-attendance").addEventListener("click", () => {
  const present = [];
  const absent = [];

  document.querySelectorAll(".student").forEach(div => {
    const name = div.querySelector("span").textContent;
    const checkbox = div.querySelector("input");
    if (checkbox.checked) {
      present.push(name);
    } else {
      const reason = absentReasons[name] || "Tiada sebab";
      absent.push(`${name} (${reason})`);
    }
  });
// Hantar ke Google Sheets
fetch("https://script.google.com/macros/s/PASTE_DEPLOYMENT_URL_AWAK_HERE/exec", {
  method: "POST",
  body: JSON.stringify({
    date: new Date().toLocaleString(),
    present,
    absent
  }),
  headers: {
    "Content-Type": "application/json"
  }
})
.then(res => res.text())
.then(res => console.log("Response Google Sheet:", res))
.catch(err => console.error("Ralat semasa hantar ke Google Sheet:", err));


const html = `
<html>
<head>
  <title>Hasil Kehadiran</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body { font-family: sans-serif; padding: 20px; }
    h2 { margin-top: 30px; }
    ol { margin-left: 20px; }

    button {
      margin-top: 20px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 600;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>



  <h1>Hasil Kehadiran</h1>
  <h2>Hadir (${present.length})</h2>
  <ol id="present-list">${present.map(n => `<li>${n}</li>`).join("")}</ol>

  <h2>Tak Hadir (${absent.length})</h2>
  <ol id="absent-list">${absent.map(n => `<li>${n}</li>`).join("")}</ol>

  <button id="copy-present">Copy Hadir</button>
  <button id="copy-absent">Copy Tak Hadir</button>

  <script>
    function copyList(id) {
      const items = Array.from(document.querySelectorAll('#' + id + ' li'));
      const text = items.map(function(li, index) {
        return (index + 1) + ". " + li.textContent;
      }).join("\\n");
      navigator.clipboard.writeText(text).then(() => {
        Swal.fire("Berjaya Disalin!", "Senarai telah disalin ke clipboard.", "success");
      }).catch(function(err) {
        Swal.fire("Ralat!", "Gagal salin: " + err, "error");
      });
    }

    document.getElementById("copy-present").addEventListener("click", function() {
      copyList("present-list");
    });
    document.getElementById("copy-absent").addEventListener("click", function() {
      copyList("absent-list");
    });
  </script>
</body>
</html>
`;

const resultTab = window.open("", "_blank");
resultTab.document.write(html);
resultTab.document.close();


});
