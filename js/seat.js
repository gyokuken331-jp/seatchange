let mode = "use"; // 最初から使用席配置
let groups = ["A", "B", "C"];
let usedSeats = [];
let usedNumbers = new Set();

const groupColors = [
  "#F6C000", "#78C8E6", "#A3D977", "#F4A7B9", "#C9A0DC",
  "#F2B66D", "#9ED0E6", "#B7E3A8", "#E8A6A1", "#A7B8E8"
];

let groupColorMap = {
  "A": groupColors[0],
  "B": groupColors[1],
  "C": groupColors[2],
};

let selectedSeat = null;

/* ボタン active */
function setActiveButton(buttonId) {
  document.querySelectorAll(".mode-buttons button, .group-area button").forEach(btn => {
    btn.classList.remove("active");
  });
  document.getElementById(buttonId).classList.add("active");
}

/* グループ選択更新 */
function updateGroupSelect() {
  const select = document.getElementById("groupSelect");
  select.innerHTML = "";
  groups.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    select.appendChild(option);
  });

  select.value = "A"; // 初期グループ
}
updateGroupSelect();

/* グループ追加 */
document.getElementById("addGroup").onclick = () => {
  const name = prompt("追加するグループ名を入力");
  if (!name) return;

  groups.push(name);
  const color = groupColors[(groups.length - 1) % groupColors.length];
  groupColorMap[name] = color;

  updateGroupSelect();
};

/* グループ削除 */
document.getElementById("deleteGroup").onclick = () => {
  const select = document.getElementById("groupSelect");
  const g = select.value;
  if (!g) return;

  groups = groups.filter(x => x !== g);
  delete groupColorMap[g];

  updateGroupSelect();
};

/* モード切替 */
document.getElementById("modeUse").onclick = () => {
  mode = "use";
  setActiveButton("modeUse");
  clearMoveSelection();
};
document.getElementById("modeErase").onclick = () => {
  mode = "erase";
  setActiveButton("modeErase");
  clearMoveSelection();
};
document.getElementById("modeRename").onclick = () => {
  mode = "rename";
  setActiveButton("modeRename");
  clearMoveSelection();
};
document.getElementById("modeMove").onclick = () => {
  mode = "move";
  setActiveButton("modeMove");
  clearMoveSelection();
};

/* 空いている最小の番号を返す */
function getNextAvailableNumber() {
  let n = 1;
  while (usedNumbers.has(n)) n++;
  return n;
}

/* 席表生成 */
document.getElementById("updateGrid").onclick = () => {
  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const grid = document.getElementById("seatGrid");
  grid.style.setProperty("--cols", cols);
  grid.innerHTML = "";

  usedSeats = [];
  usedNumbers = new Set();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seat = document.createElement("div");
      seat.className = "seat";
      seat.dataset.row = r;
      seat.dataset.col = c;
      seat.innerText = "";
      seat.dataset.group = "";

      seat.onclick = () => handleSeatClick(seat);

      grid.appendChild(seat);
    }
  }

  mode = "use";
  setActiveButton("modeUse");
  document.getElementById("groupSelect").value = "A";
};

/* 場所変更モード：クリックで入れ替え */
function clearMoveSelection() {
  if (selectedSeat) {
    selectedSeat.classList.remove("selected");
    selectedSeat = null;
  }
}

function swapSeats(seatA, seatB) {
  const temp = {
    text: seatA.innerText,
    used: seatA.classList.contains("used"),
    group: seatA.dataset.group,
    color: seatA.style.backgroundColor
  };

  seatA.innerText = seatB.innerText;
  seatA.dataset.group = seatB.dataset.group;
  seatA.style.backgroundColor = seatB.style.backgroundColor;

  if (seatB.classList.contains("used")) seatA.classList.add("used");
  else seatA.classList.remove("used");

  seatB.innerText = temp.text;
  seatB.dataset.group = temp.group;
  seatB.style.backgroundColor = temp.color;

  if (temp.used) seatB.classList.add("used");
  else seatB.classList.remove("used");
}

/* 席クリック処理 */
function handleSeatClick(seat) {

  /* 場所変更 */
  if (mode === "move") {
    if (!selectedSeat) {
      selectedSeat = seat;
      seat.classList.add("selected");
      return;
    }
    if (selectedSeat !== seat) swapSeats(selectedSeat, seat);
    selectedSeat.classList.remove("selected");
    selectedSeat = null;
    return;
  }

  /* 使用席配置（番号＋グループ色＋グループ名） */
  if (mode === "use") {

    const g = document.getElementById("groupSelect").value;
    seat.dataset.group = g;
    seat.style.backgroundColor = groupColorMap[g];

    if (!usedSeats.includes(seat)) {
      seat.classList.add("used");

      const num = getNextAvailableNumber();
      seat.innerText = num;

      usedSeats.push(seat);
      usedNumbers.add(num);
    }

    return;
  }

  /* 使用席取り消し */
  if (mode === "erase") {

    if (usedSeats.includes(seat)) {
      const num = Number(seat.innerText);
      usedNumbers.delete(num);
      usedSeats = usedSeats.filter(s => s !== seat);
    }

    seat.classList.remove("used");
    seat.style.backgroundColor = "";
    seat.dataset.group = "";
    seat.innerText = "";

    return;
  }

  /* 席名変更（番号席だけ変更可能） */
  if (mode === "rename") {

    if (!seat.classList.contains("used")) {
      return;
    }

    const name = prompt("席名を入力");
    if (name) {

      const num = Number(seat.innerText);
      usedNumbers.delete(num);
      usedSeats = usedSeats.filter(s => s !== seat);

      seat.innerText = name;
      seat.classList.remove("used");

      const g = seat.dataset.group;
      if (g) seat.style.backgroundColor = groupColorMap[g];
    }
    return;
  }
}

/* ページ読み込み時に自動生成 */
window.onload = () => {
  document.getElementById("updateGrid").click();
  document.getElementById("groupSelect").value = "A";
  mode = "use";
  setActiveButton("modeUse");
};

/* 席データ収集 */
function collectSeatData() {
  const seats = Array.from(document.querySelectorAll(".seat"));

  return seats.map(seat => ({
    row: Number(seat.dataset.row),
    col: Number(seat.dataset.col),
    text: seat.innerText,
    group: seat.dataset.group || "",
    used: seat.classList.contains("used")
  }));
}

/* シャッフル（PHP → JS に移植） */
function shuffleSeats(seats) {
  const groups = {};

  seats.forEach(seat => {
    const g = seat.group || "";
    if (!groups[g]) groups[g] = [];
    groups[g].push(seat);
  });

  Object.keys(groups).forEach(g => {
    groups[g].sort(() => Math.random() - 0.5);
  });

  const result = seats.map(seat => {
    const g = seat.group || "";
    return groups[g].shift();
  });

  return result;
}

/* シャッフル結果を反映 */
function applySeatData(newData) {
  const seats = Array.from(document.querySelectorAll(".seat"));

  newData.forEach((d, i) => {
    const seat = seats[i];

    seat.innerText = d.text;
    seat.dataset.group = d.group;
    seat.style.backgroundColor = d.group ? groupColorMap[d.group] : "";

    if (d.used) seat.classList.add("used");
    else seat.classList.remove("used");
  });
}

/* シャッフルボタン */
document.getElementById("shuffle").onclick = () => {

  let count = 3;
  const countdownEl = document.getElementById("countdown");

  countdownEl.style.display = "block";
  countdownEl.innerText = count;

  const timer = setInterval(() => {
    count--;
    countdownEl.innerText = count;

    if (count === 0) {
      clearInterval(timer);
      countdownEl.style.display = "none";

      const seatData = collectSeatData();
      const newSeatData = shuffleSeats(seatData);
      applySeatData(newSeatData);
    }
  }, 1000);
};

/* CSV 出力（PHP → JS に移植） */
document.getElementById("exportCsv").onclick = () => {
  const seats = collectSeatData();

  const rows = seats.map(s => [
    s.row, s.col, s.text, s.group, s.used ? 1 : 0
  ]);

  const csvContent = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "seats.csv";
  a.click();
};

/* CSV 読み込み（PHP → JS に移植） */
document.getElementById("importCsv").onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const lines = reader.result.split("\n");
    const seats = lines.map(line => {
      const [row, col, text, group, used] = line.split(",");
      return {
        row: Number(row),
        col: Number(col),
        text,
        group,
        used: used === "1"
      };
    });

    applySeatData(seats);
  };

  reader.readAsText(file);
};

/* PDF 出力（Laravel → JS に移植） */
document.getElementById('exportPdf').onclick = async () => {
  const grid = document.getElementById('seatGrid');

  const seats = grid.querySelectorAll('.seat');
  const originalColors = [];

  seats.forEach((seat, i) => {
    originalColors[i] = seat.style.backgroundColor;
    seat.style.backgroundColor = "";
  });

  const canvas = await html2canvas(grid);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jspdf.jsPDF("landscape", "mm", "a4");
  pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
  pdf.save("seats.pdf");

  seats.forEach((seat, i) => {
    seat.style.backgroundColor = originalColors[i];
  });
};
